import test from 'node:test';
import assert from 'node:assert/strict';
import {steps as fundingSteps} from '../js/content-funding.js';
import {steps as cryptoSteps} from '../js/content-crypto.js';
import {initialScenarios,applyFinancialStep} from '../js/finance.js';
import {getFundingSlip,getFundingView} from '../js/phone-funding.js';

const fresh=()=>({financialScenarios:initialScenarios()});
const slip=(state,id)=>getFundingSlip(state,id.slice(0,5),id);
const complete=(state,step)=>applyFinancialStep(state,step,step.type==='check'?true:step.value);

test('every funding control has a route, a reference and the current balance without applying an action',()=>{
 const state=fresh();
 for(const step of fundingSteps){
  const before=structuredClone(state.financialScenarios['funding-japan']);
  const card=slip(state,step.id);
  assert.ok(card.title&&card.route.includes('→')&&card.reference&&card.status,step.id);
  assert.deepEqual(state.financialScenarios['funding-japan'],before,step.id);
  complete(state,step);
 }
 assert.equal(getFundingSlip(state,'DX-01'),null);
 assert.equal(getFundingSlip(state,'FI-01','FI-02-S001'),null);
 assert.equal(getFundingSlip({},'FI-03'),null);
});

test('the bank deposit, purchase and wallet receipt identify the right account before and after settlement',()=>{
 const state=fresh();
 let card=slip(state,'FI-01-S006');
 assert.match(card.route,/銀行.*こみち交換所.*あかつき取引所/);
 assert.match(card.reference,/DEMO-JPY-GATE.*朝日 ミナト.*120,000円/);
 assert.match(card.status,/銀行に200,000円、交換所に0円/);
 for(const step of fundingSteps){
  complete(state,step);
  if(step.id==='FI-01-S011'){
   card=slip(state,'FI-01-S012');
   assert.match(card.status,/120,000円を預かり中.*銀行に80,000円、交換所に0円/);
  }
  if(step.id==='FI-01-S013'){
   assert.match(slip(state,'FI-01-S014').status,/到着済み.*銀行に80,000円、交換所に120,000円/);
   assert.match(getFundingView(state,{id:'FI-01-S014'}).copy,/交換所に届いた円/);
  }
  if(step.id==='FI-01-S023'){
   card=getFundingSlip(state,'FI-01');
   assert.match(card.reference,/1枚1,000円.*104枚.*104,000円/);
   assert.match(card.status,/購入済み.*銀行に80,000円.*交換所に16,000円とMCHI 104枚/);
   const withdraw=slip(state,'FI-02-S009');
   assert.match(withdraw.route,/こみち交換所.*財布A/);
   assert.match(withdraw.reference,/みち道.*DEMO-WALLET-A.*104枚.*1枚.*103枚/);
   assert.match(withdraw.status,/交換所にMCHI 104枚、財布AにMCHI 0枚/);
  }
  if(step.id==='FI-02-S017')assert.match(slip(JSON.parse(JSON.stringify(state)),'FI-02-S018').status,/MCHI 103枚を預かり中.*財布AにMCHI 0枚/);
  if(step.id==='FI-02-S021'){
   assert.match(getFundingSlip(state,'FI-02').status,/到着済み.*交換所にMCHI 0枚、財布AにMCHI 103枚/);
   break;
  }
 }
});

test('wallet A keeps the same address through exchange, network change, gas and handoff',()=>{
 const state=fresh();
 const expectedAfter={
  'FI-03-S006':/1,030 Mock USDCを預かり中.*MCHI 0枚と0 Mock USDC/,
  'FI-03-S007':/到着済み.*MCHI 0枚と1,030 Mock USDC/,
  'FI-03-S014':/1,010 Mock USDCを預かり中.*みち道に0 Mock USDC、Arbitrumに0 Mock USDC/,
  'FI-03-S015':/到着済み.*Arbitrumに1,010 Mock USDC/,
  'FI-03-S021':/0.001 Mock ETHを預かり中.*1,000 Mock USDCと0 Mock ETH/,
  'FI-03-S022':/到着済み.*1,000 Mock USDCと0.001 Mock ETH/,
 };
 for(const step of fundingSteps){
  const card=slip(state,step.id);
  if(step.questId==='FI-03'){
   assert.match(card.reference,/DEMO-WALLET-A/,step.id);
   assert.match(card.route,/財布A.*→.*同じ財布A/,step.id);
  }
  if(step.id==='FI-03-S013'){
   assert.match(card.route,/みち道.*→.*Arbitrum/);
   assert.match(card.reference,/1,030 Mock USDC.*費用20.*1,010 Mock USDC/);
  }
  complete(state,step);
  if(expectedAfter[step.id])assert.match(slip(state,step.id).status,expectedAfter[step.id],step.id);
 }
 const result=getFundingSlip(state,'FI-03');
 assert.match(result.reference,/一度だけ/);
 assert.match(result.status,/引継ぎ済み.*旅の財布Aに1,000 Mock USDCと0.001 Mock ETH/);
});

test('a previous journey keeps its own wallet and HyperCore balances through review and handoff',()=>{
 for(const lastStep of ['CR-03-S025','CR-03-S026']){
  const state=fresh();
  for(const step of cryptoSteps.filter(step=>['CR-02','CR-03'].includes(step.questId))){
   complete(state,step);
   if(step.id===lastStep)break;
  }
  const before=structuredClone(state.financialScenarios.journey);
  const serviceBalance=lastStep.endsWith('025')?/HyperCoreへ99 Mock USDCを届けている途中/:/HyperCoreで使えるのは99 Mock USDC/;
  for(const step of fundingSteps){
   if(step.id==='FI-03-S026'){
    const card=slip(state,step.id);
    assert.match(card.status,/準備の財布Aに1,000 Mock USDCと0.001 Mock ETH/);
    assert.match(card.status,/旅の財布Aに900 Mock USDCと0.0009 Mock ETH/);
    assert.match(card.status,serviceBalance);
   }
   complete(state,step);
  }
  const card=getFundingSlip(JSON.parse(JSON.stringify(state)),'FI-03');
  assert.match(card.status,/引継ぎ済み.*旅の財布Aに900 Mock USDCと0.0009 Mock ETH/);
  assert.match(card.status,serviceBalance);
  assert.doesNotMatch(card.status,/1,000 Mock USDC|0\.001 Mock ETH/);
  assert.deepEqual(state.financialScenarios.journey,before);
 }
});
