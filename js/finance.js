import {initialExtensionScenarios,applyExtensionStep,validateExtensionScenarios,extensionScenarioSummary,extensionScenarioIds} from './finance-extension.js';
import {initialFundingScenarios,applyFundingStep,validateFundingScenarios,fundingScenarioSummary} from './finance-funding.js';
/* All money below is fictional. Six-decimal accounting, deterministic tapes,
 * independent snapshots, and an append-only, replayable event ledger. */
export const DAY = 86_400_000;
export const HOUR = 3_600_000;
const clone = value => JSON.parse(JSON.stringify(value));
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
export const roundAmount = n => Math.round((n + Number.EPSILON) * 1e6) / 1e6;

export function parseAmount(value, { positive = true, max = 1_000_000_000, decimals = 6 } = {}) {
  const text = String(value ?? '').trim();
  requireThat(new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`).test(text), '数字を入力しよう。小数は決められた桁まで使えます。');
  const n = Number(text);
  requireThat(Number.isFinite(n) && n <= max && (positive ? n > 0 : n >= 0), '数量が使える範囲をこえています。');
  return roundAmount(n);
}

export function cartTotals({ productPrice = 2000, coupon = 0, shipping = 0 } = {}) {
  const eligibleAmount = productPrice - coupon;
  return { eligibleAmount, payment: eligibleAmount + shipping, eligible: eligibleAmount >= 2000 };
}
export const offerValue = (points, extraCost) => points - extraCost;
export function cardProfit({ salePrice, purchasePrice = 2000, inboundShipping = 200, feeRate = .1, outboundShipping = 200, packagingCost = 50 }) {
  const fee = Math.round(salePrice * feeRate);
  const netPayout = salePrice - fee - outboundShipping;
  return { fee, netPayout, profit: netPayout - purchasePrice - inboundShipping - packagingCost };
}
export function fxPnl({ side, entryPrice, exitPrice, quantity = 1000 }) {
  requireThat(['buy', 'sell'].includes(side), '売買方向を確かめよう。');
  const entry = Math.round(parseAmount(entryPrice, { decimals: 2 }) * 100);
  const exit = Math.round(parseAmount(exitPrice, { decimals: 2 }) * 100);
  return (side === 'buy' ? 1 : -1) * (exit - entry) * quantity / 100;
}

export function hlpDeposit(snapshot, amount, now) {
  const s = clone(snapshot); amount = parseAmount(amount);
  requireThat(amount <= s.available, '手元の残高より多くは預けられません。');
  s.available = roundAmount(s.available - amount);
  s.units = roundAmount(s.units + amount / s.unitPrice);
  s.lastDepositAt = now;
  s.withdrawableAt = now + 4 * DAY;
  return s;
}
export function hlpWithdraw(snapshot, now) {
  const s = clone(snapshot);
  requireThat(s.units > 0, 'まだ預入がありません。');
  requireThat(now >= s.withdrawableAt, '最後に預けた日から4日になるまで待とう。');
  s.available = roundAmount(s.available + s.units * s.unitPrice); s.units = 0;
  return s;
}

/** C is allocated principal before costs: only C leaves free funds. */
export function openPerp({ available = 1000, collateral = 100, leverage = 2, entryPrice = 100, side = 1, feeRate = 0 } = {}) {
  available=parseAmount(available); collateral=parseAmount(collateral); entryPrice=parseAmount(entryPrice);
  leverage=parseAmount(leverage); side=Number(side);
  requireThat([1, 2, 5].includes(leverage) && [1, -1].includes(side), '方向と倍率を確かめよう。');
  requireThat(Number.isFinite(feeRate) && feeRate >= 0 && feeRate <= 1, '教材の手数料率を確かめよう。');
  requireThat(collateral <= available, '配分する証拠金が残高をこえています。');
  const notional = roundAmount(collateral * leverage), quantity = roundAmount(notional / entryPrice);
  requireThat(roundAmount(collateral-notional*feeRate)>roundAmount(notional*.05), '手数料を引いた証拠金が、教材の維持額を上回っていません。');
  return { available: roundAmount(available - collateral), position: { collateral, leverage, notional, quantity, entryPrice, side, markPrice: entryPrice, entryFee: roundAmount(notional * feeRate), fundingPaid: 0, fundingReceived: 0, exitFeeRate: feeRate, sl: null, tp: null }, realizedPnl: 0, history: [], fundingEventIds: [] };
}
export function perpMetrics(position, markPrice = position.markPrice, maintenanceRate = .05) {
  const unrealizedPnl = roundAmount(position.side * position.quantity * (markPrice - position.entryPrice));
  const equity = roundAmount(position.collateral + unrealizedPnl - position.entryFee - position.fundingPaid + position.fundingReceived);
  return { unrealizedPnl, equity, maintenance: roundAmount(position.quantity * markPrice * maintenanceRate) };
}
export function closePerp(snapshot, fillPrice, reason = 'manual') {
  const s = clone(snapshot); requireThat(s.position, 'この建玉は決済済みです。');
  fillPrice = parseAmount(fillPrice);
  const p = s.position, gross = roundAmount(p.side * p.quantity * (fillPrice - p.entryPrice));
  const closeFee = roundAmount(p.quantity * fillPrice * p.exitFeeRate);
  const net = roundAmount(gross - p.entryFee - closeFee - p.fundingPaid + p.fundingReceived);
  const returned = Math.max(0, roundAmount(p.collateral + net));
  s.available = roundAmount(s.available + returned); s.realizedPnl = net;
  s.history.push({ reason, fillPrice, grossPnl: gross, entryFee: p.entryFee, closeFee, fundingPaid: p.fundingPaid, fundingReceived: p.fundingReceived, returned, netPnl: net });
  s.position = null;
  return s;
}
/** Tick order: funding -> simplified liquidation -> surviving SL/TP. */
export function tickPerp(snapshot, { markPrice, oraclePrice = markPrice, fillPrice = markPrice, fundingRate = 0, fundingEventId, maintenanceRate = .05 }) {
  const s = clone(snapshot); if (!s.position) return s;
  requireThat(Number.isFinite(fundingRate) && Math.abs(fundingRate) <= 1 && Number.isFinite(maintenanceRate) && maintenanceRate >= 0 && maintenanceRate <= 1, '教材の計算率を確かめよう。');
  oraclePrice = parseAmount(oraclePrice);
  const p = s.position; p.markPrice = parseAmount(markPrice);
  if (fundingRate !== 0) {
    requireThat(typeof fundingEventId === 'string' && fundingEventId.length > 0, '資金調達料の記録番号が必要です。');
    if (!s.fundingEventIds.includes(fundingEventId)) {
      const signedPayment = roundAmount(p.side * p.quantity * oraclePrice * fundingRate);
      if (signedPayment >= 0) p.fundingPaid = roundAmount(p.fundingPaid + signedPayment);
      else p.fundingReceived = roundAmount(p.fundingReceived - signedPayment);
      s.fundingEventIds.push(fundingEventId);
    }
  }
  const metrics = perpMetrics(p, markPrice, maintenanceRate);
  if (metrics.equity <= metrics.maintenance) return closePerp(s, markPrice, 'liquidation');
  if (p.sl !== null && (p.side === 1 ? markPrice <= p.sl : markPrice >= p.sl)) return closePerp(s, fillPrice, 'sl');
  if (p.tp !== null && (p.side === 1 ? markPrice >= p.tp : markPrice <= p.tp)) return closePerp(s, fillPrice, 'tp');
  return s;
}

const definitions = new Map();
const questScenario = { 'PR-01': 'intro-phone', 'PO-01': 'points-shopping', 'PO-02': 'points-shopping', 'PO-03': 'points-shopping', 'PO-04': 'points-shopping', 'PO-05': 'points-shopping', 'PO-06': 'points-shopping', 'BK-01': 'bank-application', 'BK-02': 'bank-application', 'BK-02-R': 'bank-kyc-retake', 'TR-01': 'bank-transfer', 'FX-01': 'fx-order', 'FX-02': 'fx-order', 'FX-02-S': 'fx-sell-variant', 'FX-03': 'fx-offer', 'TC-01': 'cards-trade', 'TC-02': 'cards-trade', 'CR-01': 'journey', 'CR-02': 'journey', 'CR-03': 'journey', 'CR-04': 'journey', 'HY-SPOT': 'spot', 'HY-HLP': 'hlp', 'HY-STAKE': 'stake', 'HY-PERP': 'perp' };
const routes = ['journey', 'spot', 'hlp', 'stake', 'perp'];
function scenario(accounts, data = {}) {
  const base = { accounts, data, simulationTime: 0 };
  return { initialSnapshot: clone(base), ...clone(base), eventLog: [], phoneState: { formDrafts: {}, flags: {} } };
}
export function initialScenarios() {
  const out = {
    'intro-phone': scenario({}),
    'points-shopping': scenario({ cash: 5000, spent: 0, pendingPoints: 0, approvedPoints: 0, pendingGiftValue: 0, receivedGiftValue: 0 }, { orderId: null, exchangeId: null }),
    'bank-application': scenario({ cash: 0 }, { applicationStatus: 'not_started', applicationId: null, kycStatus: 'not_started', accountId: null, accountCount: 0 }),
    'bank-kyc-retake': scenario({}, { imageQuality: 'blurred' }),
    'bank-transfer': scenario({ sourceBalance: 10000, targetBalance: 0, feeExpense: 0 }, { transferStatus: 'not_started' }),
    'fx-order': scenario({ cashBalance: 100000, usedMargin: 0, unrealizedPnl: 0, realizedPnl: 0, equity: 100000, availableMargin: 100000 }, { position: null, fills: [], evidenceSaved: false }),
    'fx-sell-variant': scenario({ cashBalance: 100000, usedMargin: 0, unrealizedPnl: 0, realizedPnl: 0, equity: 100000, availableMargin: 100000 }, { position: null, fills: [], evidenceSaved: false }),
    'fx-offer': scenario({ pendingPoints: 0, approvedPoints: 0 }, { status: 'not_started' }),
    'cards-trade': scenario({ cashBalance: 10000, inventoryInTransitCost: 0, inventoryCost: 0, unsettledSales: 0, sales: 0, packagingPaid: 0, feeExpense: 0, shippingExpense: 0, netPayout: 0, realizedProfit: 0 }, { listingStatus: 'not_started', shipmentStatus: 'not_started', buyerReceiptApproved: false, settled: false }),
    journey: scenario({ walletUSDC: 1000, walletETH: .001, availableUSDC: 0, incomingUSDC: 0, depositFee: 0, withdrawalPending: 0, withdrawalFee: 0 }, { connected: false, enabled: false, depositStatus: 'not_started', exitStatus: 'not_started' }),
    spot: scenario({ availableUSDC: 1000, hype: 0, reservedUSDC: 0, realizedPnl: 0, walletUSDC: 0, withdrawalPending: 0, withdrawalFee: 0 }, { price: 100, exitStatus: 'not_started' }),
    'spot-limit': scenario({ availableUSDC: 1000, hype: 0, reservedUSDC: 0 }, { price: 100, orderStatus: 'not_started' }),
    hlp: scenario({ availableUSDC: 1000, hlpUnits: 0, hlpValue: 0, realizedPnl: 0, walletUSDC: 0, withdrawalPending: 0, withdrawalFee: 0 }, { unitPrice: 100, lastDepositAt: null, withdrawableAt: null, exitStatus: 'not_started' }),
    stake: scenario({ availableUSDC: 0, spotHYPE: 10, stakingHYPE: 0, delegatedHYPE: 0, waitingHYPE: 0, rewardHYPE: 0, walletUSDC: 0, withdrawalPending: 0, withdrawalFee: 0 }, { price: 100, delegationUnlockAt: null, arrivalAt: null, exitStatus: 'not_started' }),
    perp: scenario({ availableUSDC: 1000, collateral: 0, unrealizedPnl: 0, realizedPnl: 0, walletUSDC: 0, withdrawalPending: 0, withdrawalFee: 0 }, { perp: null, exitStatus: 'not_started' }),
    'perp-sl': scenario({ availableUSDC: 900, collateral: 100, unrealizedPnl: 0, realizedPnl: 0 }, { perp: openPerp() }),
    'perp-funding': scenario({ availableUSDC: 900, collateral: 100, unrealizedPnl: 0, realizedPnl: 0 }, { perp: openPerp() }),
    'perp-liquidation': scenario({ availableUSDC: 900, collateral: 100, unrealizedPnl: 0, realizedPnl: 0 }, { perp: openPerp() }),
    'chapter6-journey': scenario({availableUSDC:99,walletUSDC:0,withdrawalPending:0,withdrawalFee:0},{exitStatus:'not_started',chapterEntry:true}),
    'boss-ch5-transfer': scenario({ walletUSDC: 1000, walletETH: .001, availableUSDC: 0, incomingUSDC: 0, depositFee: 0 }, { depositStatus: 'not_started' })
  };
  for (const route of routes) {
    const accounts = { availableUSDC: route === 'journey' ? 100 : 0, walletUSDC: 0, withdrawalPending: 0, withdrawalFee: 0 };
    const data = { exitStatus: 'not_started', route, prepared: route === 'journey' };
    if (route === 'spot') accounts.hype = 1;
    if (route === 'hlp') { accounts.hlpValue = 100; data.withdrawableAt = 2 * DAY; }
    if (route === 'stake') { accounts.spotHYPE = 0; accounts.stakingHYPE = 0; accounts.delegatedHYPE = 1; accounts.waitingHYPE = 0; data.arrivalAt = null; }
    if (route === 'perp') { accounts.collateral = 50; data.perp = openPerp({ available: 50, collateral: 50, leverage: 1 }); }
    out[`boss-ch6-${route}`] = scenario(accounts, data);
  }
  return {...out,...initialFundingScenarios(),...initialExtensionScenarios()};
}
function addEvent(scenarioId, stepId, kind, run, guard) {
  const def = { scenarioId, stepId, kind, run, guard };
  definitions.set(`${scenarioId}|${kind}`, def);
  return def;
}
const actions = new Map();
function on(scenarioId, stepId, kind, run, guard) {
  const def = addEvent(scenarioId, stepId, kind, run, guard);
  const list = actions.get(stepId) || []; list.push(def); actions.set(stepId, list);
}
const needEvent = (s, kind) => requireThat(s.eventLog.some(e => e.kind === kind), '先に必要な操作を終えよう。');
const matching = (d, expected) => {
  for (const [key, value] of Object.entries(expected)) requireThat(String(d[key]) === String(value), `「${({ asset: '資産', network: 'ネットワーク', address: '宛先', quantity: '数量', transferAmount: '金額', salePrice: '販売価格', coupon: 'クーポン' })[key] || key}」を練習カードと比べて直そう。`);
};
function cashChange(s, changes) { for (const [key, value] of Object.entries(changes)) s.accounts[key] = roundAmount((s.accounts[key] || 0) + value); }
function exitRequest(s) {
  requireThat(!s.accounts.collateral && !s.accounts.hype && !s.accounts.hlpUnits && !s.accounts.delegatedHYPE && !s.accounts.stakingHYPE && !s.accounts.waitingHYPE && !s.accounts.spotHYPE && !s.accounts.reservedUSDC, 'まだ保有中・拘束中の資産があります。ラボで戻す操作をしよう。');
  const amount = s.accounts.availableUSDC;
  requireThat(amount > 1, '出金できる残高がありません。');
  cashChange(s, { availableUSDC: -amount, withdrawalPending: amount - 1, withdrawalFee: 1 });
  s.data.exitAmount = amount; s.data.expectedReceipt = amount - 1; s.data.exitStatus = 'processing';
}
function exitReceive(s) {
  requireThat(s.data.exitStatus === 'processing', '先に出金を確定しよう。');
  cashChange(s, { walletUSDC: s.accounts.withdrawalPending, withdrawalPending: -s.accounts.withdrawalPending });
  s.data.exitStatus = 'received'; s.simulationTime += HOUR;
}
function syncPerp(s, snapshot) {
  s.data.perp = snapshot; s.accounts.availableUSDC = snapshot.available;
  s.accounts.collateral = snapshot.position?.collateral || 0;
  s.accounts.unrealizedPnl = snapshot.position ? perpMetrics(snapshot.position).unrealizedPnl : 0;
  s.accounts.realizedPnl = snapshot.realizedPnl;
}

on('points-shopping', 'P045', 'purchase:order-001', s => { cashChange(s, { cash: -2000, spent: 2000, pendingPoints: 300 }); s.data.orderId = 'order-001'; }, (s, d) => { requireThat(s.phoneState.flags.participated && s.phoneState.flags.viaRecorded, 'ポイントサイトで参加登録し、ショップへ進もう。'); matching(d, { cartItem: 'daily-standard', coupon: 0 }); requireThat((d.shipping ?? 0) === 0 && (d.productPrice ?? 2000) === 2000, '今回は送料0円・標準セット2,000円に戻そう。'); });
on('points-shopping', 'P065', 'approve:order-001', s => { needEvent(s, 'purchase:order-001'); cashChange(s, { pendingPoints: -300, approvedPoints: 300 }); s.simulationTime = 16 * DAY; }, s => { requireThat(s.phoneState.flags.inquirySent && s.simulationTime >= 15 * DAY, '予定日を過ぎたことと問い合わせの内容を確かめよう。'); });
on('points-shopping', 'P073', 'exchange:exchange-001', s => { needEvent(s, 'approve:order-001'); cashChange(s, { approvedPoints: -300, pendingGiftValue: 300 }); s.data.exchangeId = 'exchange-001'; }, (s, d) => matching(d, { exchangeTarget: 'A', exchangePoints: 300 }));
on('points-shopping', 'P076', 'receive:exchange-001', s => { needEvent(s, 'exchange:exchange-001'); cashChange(s, { pendingGiftValue: -300, receivedGiftValue: 300 }); });
on('bank-application', 'BK-01-032', 'application:app-001', s => { s.data.applicationId = 'app-001'; s.data.applicationStatus = 'awaiting_kyc'; });
on('bank-application', 'BK-02-021', 'kyc:kyc-001', s => { needEvent(s, 'application:app-001'); s.data.kycStatus = 'submitted'; });
on('bank-application', 'BK-02-022', 'approve:bank-001', s => { needEvent(s, 'kyc:kyc-001'); s.data.kycStatus = 'approved'; s.data.applicationStatus = 'opened'; s.data.accountId = 'bank-001'; s.data.accountCount = 1; s.simulationTime += DAY; });
on('bank-transfer', 'TR-01-024', 'transfer:transfer-001', s => { cashChange(s, { sourceBalance: -3110, targetBalance: 3000, feeExpense: 110 }); s.data.transferStatus = 'settled'; }, (s, d) => matching(d, { bank: 'hoshi', branch: 'tabidachi', accountType: 'ordinary', accountNumber: '1234567', recipient: 'アサヒ ミナト', transferAmount: 3000, transferDate: 'today' }));

function fxOpen(s, side) {
  const sell = side === 'sell', price = sell ? 160 : 150, margin = sell ? 32000 : 30000;
  s.data.position = { id: sell ? 'fx-eurjpy-side-001' : 'fx-usdjpy-001', pair: sell ? 'EURJPY' : 'USDJPY', side, entryPrice: price, baseQuantity: 1000 };
  s.data.fills.push({ kind: 'new', ...s.data.position });
  s.accounts.usedMargin = margin; s.accounts.unrealizedPnl = sell ? -30 : -20;
  s.accounts.equity = s.accounts.cashBalance + s.accounts.unrealizedPnl; s.accounts.availableMargin = s.accounts.equity - margin;
}
function fxTick(s, sell) { requireThat(s.data.position, '建玉を開いてから価格を進めよう。'); s.accounts.unrealizedPnl = sell ? 70 : -120; s.accounts.equity = s.accounts.cashBalance + s.accounts.unrealizedPnl; s.accounts.availableMargin = s.accounts.equity - s.accounts.usedMargin; s.simulationTime += HOUR; }
function fxClose(s, sell) {
  requireThat(s.data.position, '決済する建玉がありません。');
  const p = s.data.position, price = sell ? 159.93 : 149.88, pnl = fxPnl({ side: p.side, entryPrice: p.entryPrice, exitPrice: price });
  s.data.fills.push({ kind: 'close', positionId: p.id, side: sell ? 'buy' : 'sell', baseQuantity: 1000, price }); s.data.position = null;
  cashChange(s, { cashBalance: pnl }); Object.assign(s.accounts, { usedMargin: 0, unrealizedPnl: 0, realizedPnl: pnl, equity: s.accounts.cashBalance, availableMargin: s.accounts.cashBalance });
}
on('fx-order', 'FX-02-004', 'open:fx-usdjpy-001', s => fxOpen(s, 'buy'), (s, d) => matching(d, { pair: 'USDJPY', lots: 1, side: 'buy' }));
on('fx-order', 'FX-02-009', 'tick:fx-usdjpy-001', s => fxTick(s, false));
on('fx-order', 'FX-02-014', 'close:fx-usdjpy-001', s => { needEvent(s, 'tick:fx-usdjpy-001'); fxClose(s, false); }, (s, d) => matching(d, { closeLots: 1 }));
on('fx-order', 'FX-02-020', 'evidence:fx-usdjpy-001', s => { needEvent(s, 'close:fx-usdjpy-001'); s.data.evidenceSaved = true; });
on('fx-sell-variant', 'FX-02-S-009', 'open:fx-eurjpy-side-001', s => fxOpen(s, 'sell'), (s, d) => matching(d, { pair: 'EURJPY', lots: 1, side: 'sell' }));
on('fx-sell-variant', 'FX-02-S-012', 'tick:fx-eurjpy-side-001', s => fxTick(s, true));
on('fx-sell-variant', 'FX-02-S-016', 'close:fx-eurjpy-side-001', s => { needEvent(s, 'tick:fx-eurjpy-side-001'); fxClose(s, true); }, (s, d) => matching(d, { closeLots: 1 }));
on('fx-sell-variant', 'FX-02-S-018', 'evidence:fx-eurjpy-side-001', s => { needEvent(s, 'close:fx-eurjpy-side-001'); s.data.evidenceSaved = true; });
on('fx-offer', 'FX-03-010', 'fx-offer-submit:fx-offer-001', s => { cashChange(s, { pendingPoints: 300 }); s.data.status = 'pending'; }, (s, d, state) => { requireThat(state.financialScenarios['fx-order'].data.evidenceSaved, 'USD/JPYの新規1,000通貨と全決済の記録を保存しよう。'); });
on('fx-offer', 'FX-03-011', 'fx-offer-approve:fx-offer-001', s => { needEvent(s, 'fx-offer-submit:fx-offer-001'); cashChange(s, { pendingPoints: -300, approvedPoints: 300 }); s.data.status = 'approved'; s.simulationTime += DAY; });

on('cards-trade', 'TC-01-021', 'purchase:card-purchase-001', s => cashChange(s, { cashBalance: -2200, inventoryInTransitCost: 2200 }), (s, d) => matching(d, { purchasePrice: 2000, inboundShipping: 200, expectedSalePrice: 3000, feeRate: .1, outboundShipping: 200, packagingCost: 50 }));
on('cards-trade', 'TC-02-001', 'arrive:card-purchase-001', s => { needEvent(s, 'purchase:card-purchase-001'); cashChange(s, { inventoryInTransitCost: -2200, inventoryCost: 2200 }); s.simulationTime += DAY; });
on('cards-trade', 'TC-02-022', 'listing:listing-card-001', s => { needEvent(s, 'arrive:card-purchase-001'); s.data.listingStatus = 'listed'; }, (s, d) => matching(d, { frontPhoto: 'card-front', backPhoto: 'card-back', edition: '星版2026', condition: 'minor-scratches', salePrice: 3000, delivery: 'tracked-200' }));
on('cards-trade', 'TC-02-023', 'purchase:card-sale-001', s => { needEvent(s, 'listing:listing-card-001'); s.data.listingStatus = 'sold'; cashChange(s, { unsettledSales: 3000, sales: 3000 }); s.simulationTime += DAY; });
on('cards-trade', 'TC-02-025', 'packaging:card-sale-001', s => { needEvent(s, 'purchase:card-sale-001'); cashChange(s, { cashBalance: -50, packagingPaid: 50 }); });
on('cards-trade', 'TC-02-028', 'ship:card-sale-001', s => { needEvent(s, 'packaging:card-sale-001'); s.data.shipmentStatus = 'shipped'; }, (s, d) => matching(d, { bendProtection: true, waterProtection: true }));
on('cards-trade', 'TC-02-029', 'deliver:card-sale-001', s => { needEvent(s, 'ship:card-sale-001'); s.data.shipmentStatus = 'delivered'; s.simulationTime += DAY; });
on('cards-trade', 'TC-02-029', 'approve:card-sale-001', s => { needEvent(s, 'deliver:card-sale-001'); s.data.buyerReceiptApproved = true; });
on('cards-trade', 'TC-02-029', 'settle:card-sale-001', s => { needEvent(s, 'approve:card-sale-001'); cashChange(s, { cashBalance: 2500, inventoryCost: -2200, unsettledSales: -3000, feeExpense: 300, shippingExpense: 200, netPayout: 2500, realizedProfit: 250 }); s.data.settled = true; });

on('journey', 'CR-02-S008', 'connect:demo-wallet', s => { s.data.connected = true; });
on('journey', 'CR-02-S013', 'enable:demo-trading', s => { needEvent(s, 'connect:demo-wallet'); s.data.enabled = true; });
on('journey', 'CR-03-S025', 'send:deposit-001', s => { needEvent(s, 'enable:demo-trading'); cashChange(s, { walletUSDC: -100, walletETH: -.0001, incomingUSDC: 99, depositFee: 1 }); s.data.depositStatus = 'processing'; }, (s, d) => { matching(d, { asset: 'USDC', network: 'Arbitrum', address: 'DEMO-VAULT-A', quantity: 100 }); requireThat(s.accounts.walletETH >= .0001, 'ガス用の練習ETHが足りません。'); });
on('journey', 'CR-03-S026', 'receive:deposit-001', s => { needEvent(s, 'send:deposit-001'); cashChange(s, { availableUSDC: 99, incomingUSDC: -99 }); s.data.depositStatus = 'received'; s.simulationTime += HOUR; });
on('spot', 'HY-SPOT-S012', 'buy:spot-001', s => { cashChange(s, { availableUSDC: -200, hype: 2 }); }, (s, d) => matching(d, { quantity: 2 }));
on('spot', 'HY-SPOT-S015', 'tick:spot-90', s => { needEvent(s, 'buy:spot-001'); s.data.price = 90; s.simulationTime += HOUR; });
on('spot', 'HY-SPOT-S022', 'sell:spot-001', s => { needEvent(s, 'tick:spot-90'); cashChange(s, { hype: -2, availableUSDC: 180, realizedPnl: -20 }); }, (s, d) => matching(d, { sellQuantity: 2 }));
on('spot-limit', 'HY-SPOT-S034', 'order:limit-001', s => { cashChange(s, { availableUSDC: -95, reservedUSDC: 95 }); s.data.orderStatus = 'pending'; }, (s, d) => matching(d, { limitPrice: 95, limitQuantity: 1 }));
on('spot-limit', 'HY-SPOT-S038', 'cancel:limit-001', s => { needEvent(s, 'order:limit-001'); cashChange(s, { availableUSDC: 95, reservedUSDC: -95 }); s.data.orderStatus = 'cancelled'; });
on('hlp', 'HY-HLP-S010', 'deposit:hlp-001', s => { cashChange(s, { availableUSDC: -300, hlpUnits: 3, hlpValue: 300 }); s.data.lastDepositAt = s.simulationTime; s.data.withdrawableAt = s.simulationTime + 4 * DAY; }, (s, d) => matching(d, { quantity: 300 }));
on('hlp', 'HY-HLP-S013', 'tick:hlp-97', s => { needEvent(s, 'deposit:hlp-001'); s.simulationTime += 2 * DAY; s.data.unitPrice = 97; s.accounts.hlpValue = 291; });
on('hlp', 'HY-HLP-S018', 'wait:hlp-unlock', s => { needEvent(s, 'tick:hlp-97'); s.simulationTime = s.data.withdrawableAt; });
on('hlp', 'HY-HLP-S024', 'withdraw:hlp-001', s => { needEvent(s, 'wait:hlp-unlock'); requireThat(s.simulationTime >= s.data.withdrawableAt, '出金可能日時までゲーム内時間を進めよう。'); cashChange(s, { availableUSDC: 291, hlpUnits: -3, hlpValue: -291, realizedPnl: -9 }); });
on('stake', 'HY-STAKE-S010', 'move:stake-001', s => cashChange(s, { spotHYPE: -10, stakingHYPE: 10 }), (s, d) => matching(d, { quantity: 10 }));
on('stake', 'HY-STAKE-S018', 'delegate:stake-001', s => { needEvent(s, 'move:stake-001'); cashChange(s, { stakingHYPE: -10, delegatedHYPE: 10 }); s.data.delegationUnlockAt = s.simulationTime + DAY; });
on('stake', 'HY-STAKE-S020', 'reward:stake-001', s => { needEvent(s, 'delegate:stake-001'); s.simulationTime += DAY; cashChange(s, { delegatedHYPE: .1, rewardHYPE: .1 }); });
on('stake', 'HY-STAKE-S022', 'tick:stake-80', s => { needEvent(s, 'reward:stake-001'); s.data.price = 80; });
on('stake', 'HY-STAKE-S026', 'undelegate:stake-001', s => { needEvent(s, 'reward:stake-001'); requireThat(s.simulationTime >= s.data.delegationUnlockAt, '委任から1日になるまで待とう。'); cashChange(s, { delegatedHYPE: -10.1, stakingHYPE: 10.1 }); });
on('stake', 'HY-STAKE-S031', 'withdraw-request:stake-001', s => { needEvent(s, 'undelegate:stake-001'); cashChange(s, { stakingHYPE: -10.1, waitingHYPE: 10.1 }); s.data.arrivalAt = s.simulationTime + 7 * DAY; });
on('stake', 'HY-STAKE-S033', 'arrive:stake-001', s => { needEvent(s, 'withdraw-request:stake-001'); s.simulationTime = s.data.arrivalAt; cashChange(s, { waitingHYPE: -10.1, spotHYPE: 10.1 }); });
on('stake', 'HY-STAKE-S039', 'sell:stake-001', s => { needEvent(s, 'arrive:stake-001'); needEvent(s, 'tick:stake-80'); cashChange(s, { spotHYPE: -10.1, availableUSDC: 808 }); });
on('perp', 'HY-PERP-S019', 'open:perp-001', s => syncPerp(s, openPerp()), (s, d) => matching(d, { collateral: 100, leverage: 2, side: 'long', marginMode: 'isolated', lossPlan: 'manual-95' }));
on('perp', 'HY-PERP-S021', 'tick:perp-95', s => { needEvent(s, 'open:perp-001'); syncPerp(s, tickPerp(s.data.perp, { markPrice: 95 })); s.simulationTime += HOUR; });
on('perp', 'HY-PERP-S026', 'close:perp-001', s => { needEvent(s, 'tick:perp-95'); syncPerp(s, closePerp(s.data.perp, 95)); });
on('perp-sl', 'HY-PERP-S034', 'sl:perp-demo', s => { s.data.perp.position.sl = 97; }, (s, d) => matching(d, { stopPrice: 97 }));
on('perp-sl', 'HY-PERP-S035', 'tick:perp-sl', s => { needEvent(s, 'sl:perp-demo'); syncPerp(s, tickPerp(s.data.perp, { markPrice: 97, fillPrice: 96.5 })); s.simulationTime += HOUR; });
on('perp-funding', 'HY-PERP-S041', 'funding:hour-001', s => { syncPerp(s, tickPerp(s.data.perp, { markPrice: 100, fundingRate: .0001, fundingEventId: 'hour-001' })); s.simulationTime += HOUR; });
on('perp-liquidation', 'HY-PERP-S045', 'liquidation:demo-001', s => { syncPerp(s, tickPerp(s.data.perp, { markPrice: 52 })); s.simulationTime += HOUR; });
for (const route of routes) {
  on(route, 'HY-EXIT-S018', `withdraw:exit-${route}-001`, exitRequest, (s, d) => matching(d, { asset: 'USDC', network: 'Arbitrum', address: 'DEMO-WALLET-A', quantity: 'all' }));
  on(route, 'HY-EXIT-S020', `receive:exit-${route}-001`, exitReceive);
}
on('chapter6-journey','HY-EXIT-S018','withdraw:exit-journey-001',exitRequest,(s,d)=>matching(d,{asset:'USDC',network:'Arbitrum',address:'DEMO-WALLET-A',quantity:'all'}));
on('chapter6-journey','HY-EXIT-S020','receive:exit-journey-001',exitReceive);
on('boss-ch5-transfer', 'boss:CH5-B4:send', 'send:boss-deposit-001', s => { cashChange(s, { walletUSDC: -50, walletETH: -.0001, incomingUSDC: 49, depositFee: 1 }); s.data.depositStatus = 'processing'; });
on('boss-ch5-transfer', 'boss:CH5-B4:receive', 'receive:boss-deposit-001', s => { needEvent(s, 'send:boss-deposit-001'); cashChange(s, { incomingUSDC: -49, availableUSDC: 49 }); s.data.depositStatus = 'received'; s.simulationTime += HOUR; });
on('boss-ch6-spot', 'boss:CH6-B1:spot:sell', 'prepare:spot', s => { cashChange(s, { hype: -1, availableUSDC: 105 }); s.data.prepared = true; });
on('boss-ch6-hlp', 'boss:CH6-B1:hlp:wait', 'wait:hlp', s => { s.simulationTime = 2 * DAY; });
on('boss-ch6-hlp', 'boss:CH6-B1:hlp:withdraw', 'prepare:hlp', s => { needEvent(s, 'wait:hlp'); cashChange(s, { hlpValue: -100, availableUSDC: 100 }); s.data.prepared = true; });
on('boss-ch6-stake', 'boss:CH6-B1:stake:undelegate', 'undelegate:stake', s => { cashChange(s, { delegatedHYPE: -1, stakingHYPE: 1 }); });
on('boss-ch6-stake', 'boss:CH6-B1:stake:request', 'request:stake', s => { needEvent(s, 'undelegate:stake'); cashChange(s, { stakingHYPE: -1, waitingHYPE: 1 }); s.data.arrivalAt = s.simulationTime + 7 * DAY; });
on('boss-ch6-stake', 'boss:CH6-B1:stake:wait', 'wait:stake', s => { needEvent(s, 'request:stake'); s.simulationTime = s.data.arrivalAt; cashChange(s, { waitingHYPE: -1, spotHYPE: 1 }); });
on('boss-ch6-stake', 'boss:CH6-B1:stake:sell', 'prepare:stake', s => { needEvent(s, 'wait:stake'); cashChange(s, { spotHYPE: -1, availableUSDC: 80 }); s.data.prepared = true; });
on('boss-ch6-perp', 'boss:CH6-B1:perp:close', 'prepare:perp', s => { s.data.perp = closePerp(s.data.perp, 100); s.accounts.collateral = 0; s.accounts.availableUSDC = s.data.perp.available; s.data.prepared = true; });
for (const route of routes) {
  on(`boss-ch6-${route}`, 'boss:CH6-B4:withdraw', `withdraw:boss-exit-${route}`, s => { requireThat(s.data.prepared, '先にこの練習の資金を戻そう。'); exitRequest(s); });
  on(`boss-ch6-${route}`, 'boss:CH6-B5:receive', `receive:boss-exit-${route}`, exitReceive);
}

function commit(s, def) {
  const eventId = `${def.scenarioId}:${def.kind}`;
  if (s.eventLog.some(e => e.id === eventId)) return false;
  def.run(s);
  s.eventLog.push({ id: eventId, scenarioId: def.scenarioId, kind: def.kind, stepId: def.stepId, at: s.simulationTime });
  return true;
}
function draftFor(state, scenarioId, questId) {
  const s = state.financialScenarios[scenarioId], merged = {};
  for (const d of Object.values(s.phoneState.formDrafts)) Object.assign(merged, d);
  // Read only quests belonging to this snapshot; cross-lab drafts never leak.
  for (const [q, d] of Object.entries(state.phoneState?.formDrafts || {})) if (questScenario[q] === scenarioId || q === questId) Object.assign(merged, d);
  return merged;
}
export function scenarioForStep(step, context = {}, state = {}) {
  const questId = step.questId || '', action = step.effect || step.id;
  const isExit = questId === 'HY-EXIT' || step.id?.startsWith('HY-EXIT-');
  const route = context.routeId || state.selectedRoute || state.worldState?.selectedRoute || 'journey';
  if (isExit || action.startsWith('boss:CH6')) requireThat(routes.includes(route), '出口の経路を選び直そう。');
  let scenarioId = isExit ? route : questScenario[questId] || step.scenarioId;
  if(questId.startsWith('FI-'))scenarioId='funding-japan';
  const qs=state.questStates?.[state.activeQuestKey];
  const inheritedOverride=qs?.questId===questId&&qs?.routeId===route?qs.scenarioOverride:undefined;
  const override=context.scenarioOverride??inheritedOverride;
  if(isExit&&override!==undefined){
    requireThat(override==='chapter6-journey'&&route==='journey','専用の練習残高は「運用を見送る」の出口で使います。今回の経路を開き直そう。');
    scenarioId='chapter6-journey';
  }
  if (step.id?.startsWith('HY-SPOT-S0') && Number(step.id.slice(-3)) >= 25 && Number(step.id.slice(-3)) < 40) scenarioId = 'spot-limit';
  if (step.id?.startsWith('HY-PERP-S0')) { const n = Number(step.id.slice(-3)); if (n >= 28 && n < 38) scenarioId = 'perp-sl'; else if (n >= 38 && n < 43) scenarioId = 'perp-funding'; else if (n >= 43 && n < 47) scenarioId = 'perp-liquidation'; }
  if (action.startsWith('boss:CH5-B4')) scenarioId = 'boss-ch5-transfer';
  if (action.startsWith('boss:CH6')) scenarioId = `boss-ch6-${route}`;
  return scenarioId;
}
export function applyFinancialStep(state, step, value, context = {}) {
  requireThat(state?.financialScenarios, '金融の練習データが見つかりません。');
  const questId = step.questId || '', action = step.effect || step.id;
  const scenarioId = scenarioForStep(step, context, state);
  if(scenarioId==='funding-japan')return applyFundingStep(state,step,value,context);
  if(extensionScenarioIds.includes(scenarioId))return applyExtensionStep(state,step,value,context);
  const s = state.financialScenarios[scenarioId];
  if (!s) return false;
  s.phoneState ||= { formDrafts: {}, flags: {} }; s.phoneState.formDrafts ||= {}; s.phoneState.flags ||= {};
  if (step.field && step.type !== 'focus' && value !== undefined) {
    s.phoneState.formDrafts[questId] ||= {};
    s.phoneState.formDrafts[questId][step.field] = value;
  }
  if (step.id === 'P031') s.phoneState.flags.participated = true;
  if (step.id === 'P032') { requireThat(s.phoneState.flags.participated, '先に参加登録しよう。'); s.phoneState.flags.viaRecorded = true; }
  if (step.id === 'P055') { needEvent(s, 'purchase:order-001'); s.simulationTime = Math.max(s.simulationTime, 15 * DAY); }
  if (step.id === 'P064') { requireThat(s.simulationTime >= 15 * DAY, '承認予定日を確認しよう。'); s.phoneState.flags.inquirySent = true; }
  const defs = (actions.get(action) || actions.get(step.id) || []).filter(d => d.scenarioId === scenarioId);
  const draft = draftFor(state, scenarioId, questId);
  let changed = false;
  for (const def of defs) {
    if (s.eventLog.some(e => e.id === `${scenarioId}:${def.kind}`)) continue;
    def.guard?.(s, draft, state);
    changed = commit(s, def) || changed;
  }
  assertAccounts(s.accounts);
  return changed;
}
function assertAccounts(accounts) {
  const signed = new Set(['unrealizedPnl', 'realizedPnl', 'realizedProfit']);
  for (const [key, value] of Object.entries(accounts)) requireThat(typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1e9 && (signed.has(key) || value >= 0), '残高の形式または範囲が正しくありません。');
}
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, k) => { a[k] = v[k]; return a; }, {}) : v);
/** Rebuild monetary state from known events; never trust imported balances. */
export function validateFinancialState(scenarios) {
  const fresh = initialScenarios();
  requireThat(scenarios && typeof scenarios === 'object' && !Array.isArray(scenarios), '金融データの形式が違います。');
  requireThat(stable(Object.keys(scenarios).sort()) === stable(Object.keys(fresh).sort()), '金融シナリオが不足しているか、未知のシナリオがあります。');
  validateFundingScenarios(scenarios);
  validateExtensionScenarios(scenarios);
  for (const [id, s] of Object.entries(scenarios)) {
    if(id==='funding-japan'||extensionScenarioIds.includes(id))continue;
    requireThat(s && typeof s === 'object' && Array.isArray(s.eventLog) && s.eventLog.length <= 100, '金融イベントの形式が違います。');
    const expected = fresh[id];
    requireThat(stable(s.initialSnapshot) === stable(expected.initialSnapshot), '初期資金は変更できません。');
    const seen = new Set();
    for (const event of s.eventLog) {
      requireThat(event && typeof event.kind === 'string', '金融イベントが壊れています。');
      const def = definitions.get(`${id}|${event.kind}`);
      requireThat(def && event.scenarioId === id && event.id === `${id}:${event.kind}` && event.stepId === def.stepId && !seen.has(event.id), '未知または重複した金融イベントです。');
      seen.add(event.id); commit(expected, def);
      requireThat(event.at === expected.simulationTime, '金融イベントの時刻が正しくありません。');
      requireThat(stable(event) === stable(expected.eventLog.at(-1)), '金融イベントに未知の内容があります。');
    }
    if (id === 'points-shopping' && !seen.has('points-shopping:approve:order-001') && s.simulationTime === 15 * DAY) {
      requireThat(seen.has('points-shopping:purchase:order-001'), '購入前に日付は進みません。'); expected.simulationTime = 15 * DAY;
    }
    assertAccounts(s.accounts);
    requireThat(s.simulationTime === expected.simulationTime && stable(s.accounts) === stable(expected.accounts) && stable(s.data) === stable(expected.data), '金融の残高・時刻・履歴が一致しません。');
  }
  requireThat(!scenarios['fx-offer'].eventLog.length || scenarios['fx-order'].data.evidenceSaved, '案件に対応する取引記録がありません。');
  return true;
}

const names = { cash: '架空の現金（円）', spent: '今回の支払（円）', pendingPoints: '判定待ち（P）', approvedPoints: '交換できるポイント（P）', pendingGiftValue: '受取待ちの特典（円分）', receivedGiftValue: '受取済みの特典（円分）', sourceBalance: '送金元（円）', targetBalance: '受取口座（円）', feeExpense: '手数料', cashBalance: '現金（円）', usedMargin: '使用中の証拠金（円）', unrealizedPnl: '評価損益', realizedPnl: '確定損益', equity: '純資産（円）', availableMargin: '使える証拠金（円）', inventoryInTransitCost: '到着待ち在庫の原価（円）', inventoryCost: '手元在庫の原価（円）', unsettledSales: '未精算の売上（円）', sales: '売上（円）', packagingPaid: '支払済み梱包費（円）', shippingExpense: '発送費（円）', netPayout: '入金（円）', realizedProfit: '確定した利益（円）', walletUSDC: '自分のウォレット（Mock USDC）', walletETH: 'ガス用残高（Mock ETH）', availableUSDC: 'サービス内で使える残高（Mock USDC）', incomingUSDC: '入金の処理中（Mock USDC）', depositFee: '教材の入金費（Mock USDC）', withdrawalPending: '出金の処理中（Mock USDC）', withdrawalFee: '教材の出金費（Mock USDC）', hype: '保有するMock HYPE', reservedUSDC: '注文で拘束中（Mock USDC）', hlpUnits: 'HLPの模擬口数', hlpValue: 'HLPの評価額（Mock USDC）', spotHYPE: '現物のMock HYPE', stakingHYPE: 'ステーキング残高（Mock HYPE）', delegatedHYPE: '委任中（Mock HYPE）', waitingHYPE: '到着待ち（Mock HYPE）', rewardHYPE: '単発報酬の内訳（Mock HYPE）', collateral: '配分中の証拠金（Mock USDC）' };
export function scenarioSummary(scenario) {
  if (!scenario) return [];
  if(extensionScenarioIds.includes(scenario.data?.scenarioId))return extensionScenarioSummary(scenario);
  if('bankJPY' in scenario.accounts||scenario.initialSnapshot?.accounts?.bankJPY!==undefined)return fundingScenarioSummary(scenario);
  const rows = Object.entries(scenario.accounts).map(([key, value]) => ({ key, label: names[key] || key, value }));
  const p = scenario.data.perp?.position;
  if (p) {
    const metrics = perpMetrics(p);
    for (const [key, label, value] of [
      ['notional', '建玉金額（値動きを受ける大きさ）', p.notional],
      ['positionQuantity', '建玉の数量', p.quantity],
      ['positionEquity', '配分した部分の自己資本', metrics.equity],
      ['maintenance', '教材の維持証拠金', metrics.maintenance],
      ['fundingPaid', '支払済みの資金調達料', p.fundingPaid],
      ['fundingReceived', '受取済みの資金調達料', p.fundingReceived]
    ]) rows.push({ key, label, value });
  }
  return rows;
}
