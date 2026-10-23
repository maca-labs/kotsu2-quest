import test from 'node:test';
import assert from 'node:assert/strict';
import { initialScenarios, applyFinancialStep, validateFinancialState, scenarioForStep, parseAmount, fxPnl, cardProfit, cartTotals, offerValue, openPerp, closePerp, tickPerp, perpMetrics, hlpDeposit, hlpWithdraw, DAY } from '../js/finance.js';

const fresh = () => ({financialScenarios:initialScenarios(),phoneState:{formDrafts:{}},selectedRoute:'journey'});
const qid = id => id.startsWith('P0') ? `PO-0${id.slice(1)*1<=19?1:id.slice(1)*1<=32?2:id.slice(1)*1<=45?3:id.slice(1)*1<=55?4:id.slice(1)*1<=67?5:6}` : id.replace(/-(?:S)?\d{3}$/,'');
function step(s,id,field,value,routeId) { return applyFinancialStep(s,{id,questId:qid(id),type:field?'input':'confirm',field},field?value:true,{routeId}); }
function values(s,quest,fields) { for(const [field,value] of Object.entries(fields)) applyFinancialStep(s,{id:`${quest}-draft-${field}`,questId:quest,type:'input',field},value); }
function shopping(s) { step(s,'P031');step(s,'P032');values(s,'PO-03',{cartItem:'daily-standard',coupon:0});step(s,'P045');step(s,'P055');step(s,'P064');step(s,'P065');values(s,'PO-06',{exchangeTarget:'A',exchangePoints:300});step(s,'P073');step(s,'P076'); }
function cryptoBase(s) { step(s,'CR-02-S008');step(s,'CR-02-S013');values(s,'CR-03',{asset:'USDC',network:'Arbitrum',address:'DEMO-VAULT-A',quantity:100});step(s,'CR-03-S025');step(s,'CR-03-S026'); }
function routeLab(s,route) {
  if(route==='journey')return cryptoBase(s);
  if(route==='spot') { values(s,'HY-SPOT',{quantity:2,sellQuantity:2});for(const id of ['HY-SPOT-S012','HY-SPOT-S015','HY-SPOT-S022'])step(s,id); }
  if(route==='hlp') { values(s,'HY-HLP',{quantity:300});for(const id of ['HY-HLP-S010','HY-HLP-S013','HY-HLP-S018','HY-HLP-S024'])step(s,id); }
  if(route==='stake') { values(s,'HY-STAKE',{quantity:10});for(const id of ['HY-STAKE-S010','HY-STAKE-S018','HY-STAKE-S020','HY-STAKE-S022','HY-STAKE-S026','HY-STAKE-S031','HY-STAKE-S033','HY-STAKE-S039'])step(s,id); }
  if(route==='perp') { values(s,'HY-PERP',{collateral:100,leverage:2,side:'long',marginMode:'isolated',lossPlan:'manual-95'});for(const id of ['HY-PERP-S019','HY-PERP-S021','HY-PERP-S026'])step(s,id); }
}
function exit(s,route) { values(s,'HY-EXIT',{asset:'USDC',network:'Arbitrum',address:'DEMO-WALLET-A',quantity:'all'}); // route-specific draft is set by actual catalog steps
  for(const [id,field,value] of [['HY-EXIT-S006','asset','USDC'],['HY-EXIT-S008','network','Arbitrum'],['HY-EXIT-S010','address','DEMO-WALLET-A'],['HY-EXIT-S012','quantity','all']])step(s,id,field,value,route);
  step(s,'HY-EXIT-S018',undefined,undefined,route);step(s,'HY-EXIT-S020',undefined,undefined,route);
}

test('decimal parsing rejects empty, negative, nonfinite, scientific and overprecision inputs',()=>{
  for(const n of ['',0,-1,Infinity,NaN,'1e3','0.1234567','1,000','1000000001'])assert.throws(()=>parseAmount(n));
  assert.equal(parseAmount('0.0001'),.0001);assert.equal(parseAmount('0',{positive:false}),0);
  assert.deepEqual(cartTotals({coupon:100,shipping:100}),{eligibleAmount:1900,payment:2000,eligible:false});
  assert.equal(offerValue(500,600),-100);
});

test('shopping has exactly four monetary events and cannot spend at preview or duplicate confirmations',()=>{
  const s=fresh();step(s,'P031');step(s,'P032');values(s,'PO-03',{cartItem:'daily-standard',coupon:100});
  step(s,'P044');assert.equal(s.financialScenarios['points-shopping'].accounts.cash,5000);
  assert.throws(()=>step(s,'P045'));values(s,'PO-03',{coupon:0,shipping:100});assert.throws(()=>step(s,'P045'));
  values(s,'PO-03',{shipping:0});step(s,'P045');step(s,'P045');
  assert.equal(s.financialScenarios['points-shopping'].eventLog.length,1);
  step(s,'P055');assert.equal(validateFinancialState(s.financialScenarios),true);
  step(s,'P064');step(s,'P065');values(s,'PO-06',{exchangeTarget:'B',exchangePoints:300});assert.throws(()=>step(s,'P073'));
  values(s,'PO-06',{exchangeTarget:'A'});step(s,'P073');step(s,'P075');assert.equal(s.financialScenarios['points-shopping'].accounts.receivedGiftValue,0);
  step(s,'P076');step(s,'P076');const p=s.financialScenarios['points-shopping'];
  assert.deepEqual(p.accounts,{cash:3000,spent:2000,pendingPoints:0,approvedPoints:0,pendingGiftValue:0,receivedGiftValue:300});
  assert.equal(p.eventLog.length,4);assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('application, KYC and authenticated bank transfer occur once at their own confirm actions',()=>{
  const s=fresh();step(s,'BK-01-032');step(s,'BK-01-032');step(s,'BK-02-021');assert.equal(s.financialScenarios['bank-application'].data.accountCount,0);
  step(s,'BK-02-022');step(s,'BK-02-023');step(s,'BK-02-022');assert.equal(s.financialScenarios['bank-application'].data.accountCount,1);
  values(s,'TR-01',{bank:'hoshi',branch:'tabidachi',accountType:'ordinary',accountNumber:'1234567',recipient:'アサヒ ミナト',transferAmount:3100,transferDate:'today'});
  step(s,'TR-01-023');assert.equal(s.financialScenarios['bank-transfer'].accounts.sourceBalance,10000);assert.throws(()=>step(s,'TR-01-024'));
  values(s,'TR-01',{transferAmount:3000});step(s,'TR-01-024');step(s,'TR-01-024');
  assert.deepEqual(s.financialScenarios['bank-transfer'].accounts,{sourceBalance:6890,targetBalance:3000,feeExpense:110});
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('FX uses the executable bid/ask and separates opening quantity from closing quantity',()=>{
  assert.equal(fxPnl({side:'buy',entryPrice:'150.00',exitPrice:'149.88'}),-120);
  assert.equal(fxPnl({side:'sell',entryPrice:'160.00',exitPrice:'159.93'}),70);
  const s=fresh();values(s,'FX-01',{pair:'USDJPY',lots:1,side:'buy'});step(s,'FX-02-004');
  assert.deepEqual(s.financialScenarios['fx-order'].accounts,{cashBalance:100000,usedMargin:30000,unrealizedPnl:-20,realizedPnl:0,equity:99980,availableMargin:69980});
  step(s,'FX-02-009');values(s,'FX-02',{closeLots:1});step(s,'FX-02-014');step(s,'FX-02-020');step(s,'FX-02-014');
  assert.equal(s.financialScenarios['fx-order'].accounts.cashBalance,99880);assert.equal(s.financialScenarios['fx-order'].data.fills[0].baseQuantity,1000);
  values(s,'FX-02-S',{pair:'EURJPY',lots:1,side:'sell',closeLots:1});step(s,'FX-02-S-009');assert.equal(s.financialScenarios['fx-sell-variant'].accounts.unrealizedPnl,-30);step(s,'FX-02-S-012');step(s,'FX-02-S-016');step(s,'FX-02-S-018');
  assert.equal(s.financialScenarios['fx-sell-variant'].accounts.cashBalance,100070);
  step(s,'FX-03-010');step(s,'FX-03-011');step(s,'FX-03-011');assert.equal(s.financialScenarios['fx-offer'].accounts.approvedPoints,300);
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('cards hold stock at cost, prepay packaging once and settle only after buyer acceptance',()=>{
  assert.equal(cardProfit({salePrice:3000}).profit,250);assert.equal(cardProfit({salePrice:2500}).profit,-200);
  const s=fresh();values(s,'TC-01',{purchasePrice:2000,inboundShipping:200,expectedSalePrice:3000,feeRate:.1,outboundShipping:200,packagingCost:50});step(s,'TC-01-021');
  const c=s.financialScenarios['cards-trade'];assert.equal(c.accounts.cashBalance+c.accounts.inventoryInTransitCost,10000);assert.equal(c.accounts.realizedProfit,0);
  step(s,'TC-02-001');values(s,'TC-02',{frontPhoto:'card-front',backPhoto:'card-back',edition:'星版2026',condition:'minor-scratches',salePrice:3000,delivery:'tracked-200',bendProtection:true,waterProtection:true});
  for(const id of ['TC-02-022','TC-02-023','TC-02-025','TC-02-025','TC-02-028'])step(s,id);
  assert.equal(c.accounts.cashBalance,7750);assert.equal(c.accounts.unsettledSales,3000);assert.equal(c.accounts.realizedProfit,0);
  step(s,'TC-02-029');step(s,'TC-02-029');assert.equal(c.accounts.cashBalance,10250);assert.equal(c.accounts.inventoryCost,0);assert.equal(c.accounts.realizedProfit,250);
  assert.deepEqual(c.eventLog.slice(-3).map(e=>e.kind),['deliver:card-sale-001','approve:card-sale-001','settle:card-sale-001']);
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('crypto deposit rejects mismatching routes, checks gas and separates pending from received',()=>{
  const s=fresh();step(s,'CR-02-S008');step(s,'CR-02-S013');values(s,'CR-03',{asset:'USDT',network:'Arbitrum',address:'DEMO-VAULT-A',quantity:100});
  assert.throws(()=>step(s,'CR-03-S025'));values(s,'CR-03',{asset:'USDC'});step(s,'CR-03-S025');step(s,'CR-03-S025');
  const j=s.financialScenarios.journey;assert.equal(j.accounts.availableUSDC,0);assert.equal(j.accounts.incomingUSDC,99);assert.equal(j.accounts.walletUSDC,900);assert.equal(j.accounts.walletETH,.0009);
  step(s,'CR-03-S026');step(s,'CR-03-S026');assert.equal(j.accounts.availableUSDC,99);assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('all five routes preserve independent final balances, withdraw once and actually receive after processing',()=>{
  const expected={journey:[99,998],spot:[980,979],hlp:[991,990],stake:[808,807],perp:[990,989]};
  const s=fresh();
  for(const [route,[available,wallet]] of Object.entries(expected)){
    routeLab(s,route);const r=s.financialScenarios[route];assert.equal(r.accounts.availableUSDC,available);const otherBefore=structuredClone(s.financialScenarios.spot.accounts);
    exit(s,route);step(s,'HY-EXIT-S018',undefined,undefined,route);step(s,'HY-EXIT-S020',undefined,undefined,route);
    assert.equal(r.accounts.walletUSDC,wallet);assert.equal(r.accounts.withdrawalFee,1);assert.equal(r.accounts.availableUSDC,0);
    if(route!=='spot')assert.deepEqual(s.financialScenarios.spot.accounts,otherBefore);
    assert.equal(validateFinancialState(s.financialScenarios),true);
  }
  assert.equal(s.financialScenarios.journey.accounts.walletETH,.0009);
});

test('HLP uses last deposit plus four days, and boundary equality is withdrawable',()=>{
  const base={available:1000,units:0,unitPrice:100,lastDepositAt:null,withdrawableAt:null};
  let h=hlpDeposit(base,300,0);h=hlpDeposit(h,50,2*DAY);
  assert.equal(h.withdrawableAt,6*DAY);assert.equal(h.available+h.units*h.unitPrice,1000);
  assert.throws(()=>hlpWithdraw(h,6*DAY-1));assert.equal(hlpWithdraw(h,6*DAY).available,1000);assert.equal(base.available,1000);
  const s=fresh();values(s,'HY-HLP',{quantity:300});step(s,'HY-HLP-S010');step(s,'HY-HLP-S013');assert.throws(()=>step(s,'HY-HLP-S024'));assert.equal(s.financialScenarios.hlp.accounts.availableUSDC,700);
});

test('staking tracks delegated reward through independent one-day lock and seven-day waiting area',()=>{
  const s=fresh();values(s,'HY-STAKE',{quantity:10});step(s,'HY-STAKE-S010');step(s,'HY-STAKE-S018');assert.throws(()=>step(s,'HY-STAKE-S026'));
  step(s,'HY-STAKE-S020');step(s,'HY-STAKE-S020');let r=s.financialScenarios.stake;assert.equal(r.accounts.delegatedHYPE,10.1);assert.equal(r.simulationTime,DAY);
  step(s,'HY-STAKE-S022');step(s,'HY-STAKE-S026');step(s,'HY-STAKE-S031');assert.equal(r.accounts.waitingHYPE,10.1);assert.equal(r.accounts.spotHYPE,0);assert.equal(r.data.arrivalAt,8*DAY);
  step(s,'HY-STAKE-S033');assert.equal(r.accounts.waitingHYPE,0);assert.equal(r.accounts.spotHYPE,10.1);step(s,'HY-STAKE-S039');assert.equal(r.accounts.availableUSDC,808);
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('perps allocate only collateral; fees and funding are never charged twice; SL fill differs from trigger',()=>{
  let p=openPerp();assert.equal(p.available,900);assert.equal(p.position.notional,200);assert.equal(p.position.quantity,2);
  assert.equal(perpMetrics(p.position,95).unrealizedPnl,-10);assert.equal(closePerp(p,95).available,990);
  p.position.sl=97;const sl=tickPerp(p,{markPrice:97,fillPrice:96.5});assert.equal(sl.realizedPnl,-7);assert.equal(sl.available,993);assert.equal(sl.position,null);
  const long=tickPerp(openPerp(),{markPrice:100,fundingRate:.0001,fundingEventId:'hour1'});assert.equal(long.position.fundingPaid,.02);
  assert.deepEqual(tickPerp(long,{markPrice:100,fundingRate:.0001,fundingEventId:'hour1'}),long);
  const short=tickPerp(openPerp({side:-1}),{markPrice:100,fundingRate:.0001,fundingEventId:'hour1'});assert.equal(short.position.fundingReceived,.02);
  const negative=tickPerp(openPerp({side:-1}),{markPrice:100,fundingRate:-.0001,fundingEventId:'hour1'});assert.equal(negative.position.fundingPaid,.02);
  const fees=openPerp({feeRate:.01});assert.equal(fees.available,900);assert.equal(perpMetrics(fees.position).equity,98);
  assert.equal(closePerp(fees,100).available,996);
});

test('liquidation runs before stop orders at equality and returns isolated remainder, not all funds',()=>{
  const p=openPerp();p.position.sl=97;const metric=perpMetrics(p.position,52);assert.deepEqual(metric,{unrealizedPnl:-96,equity:4,maintenance:5.2});
  const liquidated=tickPerp(p,{markPrice:52,fillPrice:49});assert.equal(liquidated.history[0].reason,'liquidation');assert.equal(liquidated.history[0].fillPrice,52);assert.equal(liquidated.available,904);assert.equal(liquidated.position,null);
  assert.deepEqual(tickPerp(liquidated,{markPrice:1}),liquidated);
  const equality=openPerp({available:100,collateral:100,leverage:1}); // q=1, C+(mark-entry)=mark; maintenance adjusted to equality
  const atEquality=tickPerp(equality,{markPrice:95,maintenanceRate:1});assert.equal(atEquality.position,null);
});

test('SL, funding, liquidation and limit snapshots never change their parent lab',()=>{
  const s=fresh();routeLab(s,'perp');const main=structuredClone(s.financialScenarios.perp);
  step(s,'HY-PERP-S032','stopPrice',97);step(s,'HY-PERP-S034');step(s,'HY-PERP-S035');step(s,'HY-PERP-S041');step(s,'HY-PERP-S041');step(s,'HY-PERP-S045');
  assert.deepEqual(s.financialScenarios.perp,main);assert.equal(s.financialScenarios['perp-sl'].accounts.availableUSDC,993);assert.equal(s.financialScenarios['perp-funding'].data.perp.position.fundingPaid,.02);assert.equal(s.financialScenarios['perp-liquidation'].accounts.availableUSDC,904);
  step(s,'HY-SPOT-S030','limitPrice',95);step(s,'HY-SPOT-S032','limitQuantity',1);step(s,'HY-SPOT-S034');assert.equal(s.financialScenarios['spot-limit'].accounts.reservedUSDC,95);assert.equal(s.financialScenarios['spot-limit'].accounts.hype,0);step(s,'HY-SPOT-S038');step(s,'HY-SPOT-S038');assert.equal(s.financialScenarios['spot-limit'].accounts.availableUSDC,1000);
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('bosses use separate balances and stable per-route events',()=>{
  const s=fresh();cryptoBase(s);const main=structuredClone(s.financialScenarios.journey);
  const effect=(name,route)=>applyFinancialStep(s,{id:name,effect:name,type:'confirm'},true,{routeId:route});
  effect('boss:CH5-B4:send');effect('boss:CH5-B4:receive');assert.equal(s.financialScenarios['boss-ch5-transfer'].accounts.availableUSDC,49);assert.deepEqual(s.financialScenarios.journey,main);
  const prep={journey:[],spot:['spot:sell'],hlp:['hlp:wait','hlp:withdraw'],stake:['stake:undelegate','stake:request','stake:wait','stake:sell'],perp:['perp:close']};
  for(const [route,actions]of Object.entries(prep)){for(const action of actions)effect(`boss:CH6-B1:${action}`,route);effect('boss:CH6-B4:withdraw',route);effect('boss:CH6-B5:receive',route);effect('boss:CH6-B5:receive',route);}
  assert.deepEqual(Object.keys(prep).map(r=>s.financialScenarios[`boss-ch6-${r}`].accounts.walletUSDC),[99,104,99,79,49]);assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('save validation reconstructs accounts and rejects tampering, duplicates, unknown or impossible event order',()=>{
  const s=fresh();shopping(s);const saved=JSON.parse(JSON.stringify(s.financialScenarios));assert.equal(validateFinancialState(saved),true);
  const corrupt=change=>{const c=structuredClone(saved);change(c);assert.throws(()=>validateFinancialState(c));};
  corrupt(c=>c['points-shopping'].accounts.cash++);corrupt(c=>c['points-shopping'].initialSnapshot.accounts.cash++);corrupt(c=>c['points-shopping'].eventLog.push(c['points-shopping'].eventLog[0]));corrupt(c=>c['points-shopping'].eventLog.reverse());corrupt(c=>c['points-shopping'].eventLog[0].at=1);corrupt(c=>c['points-shopping'].accounts.cash=NaN);corrupt(c=>delete c.spot);corrupt(c=>c.unknown={});
});

test('the actual complete content catalog and phone effects agree with the finance model at every step',async()=>{
  const {steps,contentEffect}=await import('../js/content.js');
  const s=fresh();
  for(const action of steps){
    const value=action.value??(action.choices?.[0]?.value??true);
    try {applyFinancialStep(s,action,value,{routeId:'journey'});contentEffect(s,action,value,{routeId:'journey'});validateFinancialState(s.financialScenarios);}
    catch(error){throw new Error(`${action.id}: ${error.message}`,{cause:error});}
  }
  assert.equal(s.financialScenarios['cards-trade'].accounts.cashBalance,10250);
  assert.equal(s.financialScenarios.journey.accounts.walletUSDC,998);
  assert.equal(s.financialScenarios.perp.accounts.availableUSDC,990);
});

test('the integrated funding handoff and later journey use the same 1000 rather than crediting it twice',async()=>{
  const {steps,contentEffect}=await import('../js/content.js'),s=fresh(),initialJourney=structuredClone(s.financialScenarios.journey);
  const doAction=a=>{const value=a.value??a.choices?.[0]?.value??true;applyFinancialStep(s,a,value,{routeId:'journey'});contentEffect(s,a,value,{routeId:'journey'});};
  const funding=steps.filter(a=>a.questId.startsWith('FI-'));
  for(const a of funding)doAction(a);
  assert.deepEqual(s.financialScenarios.journey,initialJourney);assert.equal(s.financialScenarios['funding-japan'].data.handoff.additionalCredit,false);
  assert.equal(s.financialScenarios['funding-japan'].accounts.arbitrumUSDC,0);assert.equal(s.financialScenarios['funding-japan'].accounts.walletETH,0);
  for(const a of steps.filter(a=>['CR-02','CR-03'].includes(a.questId)))doAction(a);
  assert.equal(s.financialScenarios.journey.accounts.walletUSDC,900);assert.equal(s.financialScenarios.journey.accounts.availableUSDC,99);assert.equal(s.financialScenarios.journey.accounts.walletETH,.0009);
  for(const a of steps.filter(a=>a.questId==='HY-EXIT'))doAction(a);
  const final=structuredClone(s.financialScenarios);doAction(funding.at(-1));for(const a of steps.filter(a=>['HY-EXIT-S018','HY-EXIT-S020'].includes(a.id)))doAction(a);
  assert.deepEqual(s.financialScenarios,final);assert.equal(s.financialScenarios.journey.accounts.walletUSDC,998);assert.equal(s.financialScenarios.journey.accounts.withdrawalFee,1);
  assert.equal(validateFinancialState(s.financialScenarios),true);
});

test('the independent chapter-6 skip is 99 to pending 98 to received 98 and cannot hijack another route',async()=>{
  const {steps,contentEffect}=await import('../js/content.js'),s=fresh(),original=structuredClone(s.financialScenarios.journey);
  s.activeQuestKey='HY-EXIT:journey';s.questStates={[s.activeQuestKey]:{questId:'HY-EXIT',routeId:'journey',scenarioOverride:'chapter6-journey'}};
  const context={routeId:'journey'};
  for(const a of steps.filter(a=>a.questId==='HY-EXIT')){
    const value=a.value??a.choices?.[0]?.value??true;applyFinancialStep(s,a,value,context);contentEffect(s,a,value,context);
    const x=s.financialScenarios['chapter6-journey'];
    if(a.id==='HY-EXIT-S018'){assert.equal(x.accounts.availableUSDC,0);assert.equal(x.accounts.withdrawalPending,98);assert.equal(x.accounts.walletUSDC,0);}
    if(a.id==='HY-EXIT-S020'){assert.equal(x.accounts.withdrawalPending,0);assert.equal(x.accounts.walletUSDC,98);}
  }
  assert.deepEqual(s.financialScenarios.journey,original);assert.equal(s.financialScenarios['chapter6-journey'].eventLog.length,2);
  const a=steps.find(a=>a.id==='HY-EXIT-S018');assert.equal(scenarioForStep(a,{routeId:'spot'},s),'spot');
  assert.throws(()=>scenarioForStep(a,{routeId:'spot',scenarioOverride:'chapter6-journey'},s));
  s.questStates[s.activeQuestKey]={questId:'HY-SPOT',routeId:'journey',scenarioOverride:'chapter6-journey'};
  assert.equal(scenarioForStep(a,{routeId:'journey'},s),'journey');
  assert.equal(validateFinancialState(s.financialScenarios),true);
});
