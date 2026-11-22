import {simulationConfig, steps} from './content-crypto.js';
import {openPerp, perpMetrics, roundAmount} from './finance.js';

const questId = 'HY-PERP';
const lesson = new Map(steps.filter(step => step.questId === questId).map(step => [step.id, step]));
const collateralInput = lesson.get('HY-PERP-S012').value;
const stopInput = lesson.get('HY-PERP-S032').value;
const fmt = value => Number(value).toLocaleString('ja-JP', {maximumFractionDigits:6});
const usdc = value => fmt(value) + ' Mock USDC';
const mainRoute = '本編・鏡の塔。第5章の財布と別の練習口座です。';
const free = account => '手元' + usdc(account.accounts.availableUSDC);
const subRoute = main => '本編の決済時は' + usdc(main.data.perp.available) + '。この小練習の資金は別口座です。';

function orderFigures(p) {
  return '証拠金' + fmt(p.collateral) + ' × 倍率' + fmt(p.leverage) + '倍 ＝ 取引額（建玉金額）' + usdc(p.notional) +
    '。取引額' + fmt(p.notional) + ' ÷ 教材価格' + fmt(p.entryPrice) + ' ＝ 数量' + fmt(p.quantity) + '枚。';
}

function beforeOrder(main, state, number, stepId) {
  const draft = main.phoneState.formDrafts[questId] ?? {};
  const selection = state.phoneState.formDrafts['selection:' + stepId];
  const side = (number === 7 ? selection : draft.side) === 'short' ? -1 : 1;
  const rawLeverage = Number(number === 9 && selection ? selection : draft.leverage);
  const leverage = [1, 2, 5].includes(rawLeverage) ? rawLeverage : lesson.get('HY-PERP-S009').value;
  const quote = openPerp({available:main.accounts.availableUSDC, collateral:draft.collateral ?? collateralInput, leverage, side});
  const p = quote.position;
  const route = mainRoute;
  const title = '本編・注文前';
  const cash = free(main) + '、建玉0件。';
  if (number <= 6) {
    const intro = number <= 2 ? '先物は価格の変化で損益が決まる取引です。建玉（たてぎょく）は、始めてからまだ終えていない取引のことです。' :
      number <= 4 ? '分離証拠金は、この取引に使うお金を手元から分ける方式。クロスでは口座の資金を共有します。' :
      '今回は1枚' + usdc(p.entryPrice) + 'の教材トークンで練習します。';
    return {title, route, reference:intro, status:cash};
  }
  if (number === 7) {
    const direction = side === 1 ? '買い・ロング' : '売り・ショート';
    const comparison = 'ロングは上がると利益・下がると損失。ショートは上がると損失・下がると利益。';
    const perCoin = {...p, quantity:1};
    const difference = price => {
      const pnl = perpMetrics(perCoin, price).unrealizedPnl;
      return (pnl > 0 ? '利益' : '損失') + fmt(Math.abs(pnl));
    };
    const example = '価格' + fmt(p.entryPrice) + 'から' + fmt(p.entryPrice + 1) + 'に上がると' + difference(p.entryPrice + 1) +
      '、' + fmt(p.entryPrice - 1) + 'に下がると' + difference(p.entryPrice - 1) + '。';
    return {title:'買いと売りの向き', route, reference:comparison + '本編は買い・ロングで進みます。' + cash,
      status:selection ? direction + '1枚の試算。' + example : '注文前の比較。' + comparison};
  }
  const figures = orderFigures(p);
  if (number <= 10) {
    return {title:'注文前・倍率の試算', route, reference:figures + '本編はロング・2倍で進みます。' + cash,
      status:'試算 証拠金' + fmt(p.collateral) + ' × ' + fmt(p.leverage) + '倍 ＝ 取引額' + fmt(p.notional) + '。価格' + fmt(p.entryPrice) + 'で数量' + fmt(p.quantity) + '枚。'};
  }
  if (number <= 12) return {title:'本編・証拠金の入力', route,
    reference:'証拠金は、手元からこの取引に分けるお金です。金額の単位はMock USDCです。',
    status:cash + '証拠金の欄に「' + fmt(collateralInput) + '」を入力します。'};
  let reference = figures;
  if (number === 16 || number === 17) reference += 'このロングは教材価格95で自分で決済する計画です。';
  if (number >= 18) reference += 'この本編の手数料と資金調達料は0です。';
  return {title:'本編・ロングの注文見積もり', route, reference,
    status:'今の手元' + fmt(main.accounts.availableUSDC) + 'から証拠金' + fmt(p.collateral) + 'だけを使う予定。' +
      fmt(p.leverage) + '倍で取引額' + fmt(p.notional) + '・数量' + fmt(p.quantity) + '枚、残る予定' + usdc(quote.available) + '。'};
}

function openMain(main, number) {
  const p = main.data.perp.position;
  const route = mainRoute;
  const reference = '注文成立時 ' + orderFigures(p);
  const metrics = perpMetrics(p);
  const position = 'ロング' + fmt(p.quantity) + '枚、教材価格' + fmt(p.markPrice);
  if (metrics.unrealizedPnl === 0) return {title:'本編・保有中の建玉', route, reference,
    status:position + '。証拠金' + fmt(p.collateral) + 'を取引中。' + free(main) + '、含み損益0。'};
  const move = '価格' + fmt(p.entryPrice) + ' → ' + fmt(p.markPrice) + '。含み損' + fmt(-metrics.unrealizedPnl) + '（未確定）。';
  const settlement = number >= 25 ? '今の手元' + fmt(main.accounts.availableUSDC) + ' ＋ 戻る予定' + fmt(metrics.equity) +
    ' ＝ 決済後' + usdc(roundAmount(main.accounts.availableUSDC + metrics.equity)) + '（予定）。' :
    '今すべて決済すれば' + usdc(metrics.equity) + 'が戻る予定。今の' + free(main) + 'とは別です。';
  return {title:number >= 23 ? '本編・全決済の見積もり' : '本編・値下がり後の建玉', route,
    reference:reference + ' 値下がり' + fmt(p.entryPrice - p.markPrice) + ' × 数量' + fmt(p.quantity) + '枚 ＝ 評価損' + usdc(-metrics.unrealizedPnl) + '。',
    status:move + settlement};
}

function settledMain(main, number) {
  const snapshot = main.data.perp;
  const close = snapshot.history.at(-1);
  const remainder = roundAmount(snapshot.available - close.returned);
  const reference = '決済時は価格' + fmt(close.fillPrice) + 'で確定損失' + fmt(-close.netPnl) + '。手元' + fmt(remainder) +
    ' ＋ 証拠金から戻った' + fmt(close.returned) + ' ＝ ' + usdc(snapshot.available) + '。';
  let status = '今は建玉0件、' + free(main) + '。';
  if (main.data.exitStatus === 'processing') status += '出金処理中' + usdc(main.accounts.withdrawalPending) + '。';
  else if (main.data.exitStatus === 'received') status += '練習ウォレットに' + usdc(main.accounts.walletUSDC) + '到着。';
  else if (number === 28) status += '次は別口座のSLの小練習へ。';
  else if (number === 48) status += 'この残高を出金に引き継ぎます。';
  return {title:number === null ? '本編・先物の決済履歴' : '本編・手動決済後', route:mainRoute, reference, status};
}

function stopSlip(account, main, number) {
  const route = subRoute(main);
  const p = account.data.perp.position;
  const stop = Number(account.phoneState.formDrafts[questId]?.stopPrice ?? stopInput);
  if (p) {
    const reference = '開始価格' + fmt(p.entryPrice) + '、ロング' + fmt(p.quantity) + '枚。SLは損失を抑えるため、自動決済を始める設定です。';
    const input = '発動価格の欄に「' + fmt(stopInput) + '」を入力。売れる価格は別に決まります。';
    let status = '教材価格' + fmt(p.markPrice) + '、' + free(account) + '。SLは未設定。';
    if (number === 31 || number === 32) status = input;
    else if (number >= 33) status = p.sl === null ? '発動価格' + fmt(stop) + 'を設定予定。売れる価格は別に決まります。' :
      '発動価格' + fmt(p.sl) + 'で設定済み。今の価格は' + fmt(p.markPrice) + '、まだ建玉を保有中。';
    return {title:'SLの小練習・保有中', route, reference, status};
  }
  const close = account.data.perp.history.at(-1);
  const start = account.initialSnapshot.data.perp.position;
  return {title:'SLの小練習・決済後', route,
    reference:'価格' + fmt(stop) + 'で発動し、売れた価格は' + fmt(close.fillPrice) + '。値下がり' + fmt(start.entryPrice - close.fillPrice) +
      ' × ' + fmt(start.quantity) + '枚 ＝ 確定損失' + usdc(-close.netPnl) + '。',
    status:'発動' + fmt(stop) + ' → 成立' + fmt(close.fillPrice) + '。損失' + fmt(-close.netPnl) + '、戻った' + fmt(close.returned) +
      '、' + free(account) + '。' + (number === 38 ? '次は別口座の資金調達料へ。' : '建玉0件。')};
}

function fundingSlip(account, main, number) {
  const p = account.data.perp.position;
  const rate = simulationConfig.fundingHourlyRate;
  const basis = account.initialSnapshot.data.perp.position.markPrice;
  const amount = roundAmount(p.quantity * basis * rate);
  const reference = '数量' + fmt(p.quantity) + '枚 × 基準価格' + fmt(basis) + ' × 教材の1時間率＋' + fmt(rate * 100) + '% ＝ ' +
    usdc(amount) + '。正の率ではロングが払い、ショートが受け取ります。';
  const paid = p.fundingPaid;
  const equity = perpMetrics(p).equity;
  const status = paid ? '1時間分の支払' + fmt(paid) + '。証拠金内に' + fmt(equity) + '、手元' + fmt(account.accounts.availableUSDC) +
    '、合計' + usdc(roundAmount(account.accounts.availableUSDC + equity)) + '。' :
    '今の支払0。1時間率＋' + fmt(rate * 100) + '%なら、次の時刻にロングが' + usdc(amount) + '払う予定。';
  return {title:'資金調達料の小練習', route:subRoute(main), reference,
    status:status + (number === 43 ? '次は別口座の清算見学へ。' : '')};
}

function liquidationSlip(account, main, number) {
  const route = subRoute(main);
  const title = '清算の見学・教材の簡略清算判定';
  const snapshot = account.data.perp;
  const open = account.initialSnapshot.data.perp.position;
  const price = snapshot.position?.markPrice ?? snapshot.history.at(-1).fillPrice;
  const {equity, maintenance} = perpMetrics(open, price, simulationConfig.maintenanceRate);
  const reference = '自己資本は証拠金に損益と費用を反映した額。維持証拠金は取引を続けるのに必要な額。自己資本が維持証拠金以下で教材の建玉を閉じます。';
  const comparison = '価格' + fmt(price) + 'で自己資本' + fmt(equity) + '、維持証拠金' + fmt(maintenance) + '。';
  if (snapshot.position) return {title, route, reference, status:comparison + '今はロング' + fmt(open.quantity) + '枚、' + free(account) + '。'};
  const close = snapshot.history.at(-1);
  return {title, route, reference:reference + ' 維持証拠金は' + fmt(open.quantity) + '枚 × 価格' + fmt(price) + ' × 教材維持率' + fmt(simulationConfig.maintenanceRate * 100) + '%。',
    status:comparison + '清算で戻った' + fmt(close.returned) + '、' + free(account) + '。' +
      (number === 47 ? 'このお金は足さず、本編の' + usdc(main.accounts.availableUSDC) + 'へ戻ります。' : '建玉0件。')};
}

/** A switch button still belongs to its source account until the step completes. */
export function getPerpSlip(state, stepId = null) {
  const record = state?.questStates?.[questId];
  if (!record || (stepId === null ? !record.completed : !lesson.has(stepId))) return null;
  const scenarios = state.financialScenarios;
  const main = scenarios?.perp;
  if (!main) return null;
  const number = stepId === null ? null : Number(stepId.slice(-3));
  if (number >= 29 && number <= 38) return stopSlip(scenarios['perp-sl'], main, number);
  if (number >= 39 && number <= 43) return fundingSlip(scenarios['perp-funding'], main, number);
  if (number >= 44 && number <= 47) return liquidationSlip(scenarios['perp-liquidation'], main, number);
  if (main.data.perp?.history.length) return settledMain(main, number);
  if (main.data.perp?.position) return openMain(main, number);
  return beforeOrder(main, state, number, stepId);
}
