import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,steps,milestones,fundingQuestIds} from '../js/content-funding.js';
import {initialFundingScenarios,applyFundingStep,validateFundingScenarios,fundingHandoffReference} from '../js/finance-funding.js';

const makeState=(legacy=false)=>({financialScenarios:{...initialFundingScenarios(),journey:{initialSnapshot:{accounts:{walletUSDC:1000,walletETH:0.001}},accounts:{walletUSDC:legacy?998:1000,walletETH:legacy?0.0009:0.001,availableUSDC:0},eventLog:legacy?[{id:'existing-journey-event',kind:'previously-completed'}]:[]}}});
const scenario=state=>state.financialScenarios['funding-japan'];
const byId=id=>steps.find(step=>step.id===id);
const valueFor=step=>step.value??step.choices?.[0]?.value;
const doStep=(state,step,value=valueFor(step))=>applyFundingStep(state,step,value);
function through(state,lastId,firstIndex=0){for(let i=firstIndex;i<steps.length;i++){doStep(state,steps[i]);if(steps[i].id===lastId)return i+1;}throw Error(`Unknown test checkpoint ${lastId}`);}

test('funding lesson has 3 linked quests and 70 individual Japanese actions',()=>{
 assert.deepEqual(fundingQuestIds,['FI-01','FI-02','FI-03']);assert.equal(steps.length,70);assert.equal(new Set(steps.map(s=>s.id)).size,70);
 assert.deepEqual(quests.map(q=>q.stepIds.length),[23,21,26]);assert.deepEqual(quests.map(q=>q.prerequisites),[['PR-01'],['FI-01'],['FI-02']]);
 for(const step of steps){assert.ok(step.screenTitle&&step.appTitle&&step.panel&&step.context,step.id);assert.ok(step.helpKeys.length>=1,step.id);if(step.type==='input'||step.type==='focus'||step.type==='select')assert.ok(step.fieldLabel,step.id);}
 assert.equal(milestones.some(m=>m.grantsChapterSeal),false);
});

test('JPY deposit and coin withdrawal stay pending until each explicit receipt event',()=>{
 const state=makeState();let next=through(state,'FI-01-S011');
 assert.equal(scenario(state).accounts.bankJPY,80000);assert.equal(scenario(state).accounts.depositPendingJPY,120000);assert.equal(scenario(state).accounts.domesticJPY,0);
 assert.throws(()=>doStep(state,byId('FI-01-S022')),/先に|見積書|教材コイン/);
 assert.equal(scenario(state).accounts.domesticMCHI,0);
 next=through(state,'FI-01-S023',next);assert.equal(scenario(state).accounts.domesticJPY,16000);assert.equal(scenario(state).accounts.domesticMCHI,104);
 next=through(state,'FI-02-S017',next);assert.equal(scenario(state).accounts.domesticMCHI,0);assert.equal(scenario(state).accounts.walletMCHI,0);assert.equal(scenario(state).accounts.withdrawPendingMCHI,103);assert.equal(scenario(state).accounts.withdrawalFeeMCHI,1);
 through(state,'FI-02-S021',next);assert.equal(scenario(state).accounts.walletMCHI,103);assert.equal(scenario(state).accounts.withdrawPendingMCHI,0);
 validateFundingScenarios(state.financialScenarios);
});

test('wrong network, address, asset, quantity or fee blocks withdrawal and keeps correct fields',()=>{
 for(const[id,bad]of [['FI-02-S007','HoshiNet'],['FI-02-S009','DEMO-WALLET-B'],['FI-02-S004','SORA'],['FI-02-S011',105]]){
  const state=makeState();through(state,'FI-02-S016');const before=structuredClone(scenario(state).accounts);doStep(state,byId(id),bad);
  assert.throws(()=>doStep(state,byId('FI-02-S017')),/受取カード|見積書/);assert.deepEqual(scenario(state).accounts,before);
  doStep(state,byId(id));doStep(state,byId('FI-02-S017'));assert.equal(scenario(state).accounts.withdrawPendingMCHI,103);
 }
 const state=makeState();through(state,'FI-02-S016');scenario(state).data.quotes.withdraw.fee=2;const before=structuredClone(scenario(state).accounts);
 assert.throws(()=>doStep(state,byId('FI-02-S017')),/費用/);assert.deepEqual(scenario(state).accounts,before);
 scenario(state).data.quotes.withdraw=structuredClone(initialFundingScenarios()['funding-japan'].data.quotes.withdraw);
 doStep(state,byId('FI-02-S017'));assert.equal(scenario(state).accounts.withdrawalFeeMCHI,1);
});

test('each processing checkpoint survives JSON roundtrip and resumes to one handoff',()=>{
 for(const id of ['FI-01-S011','FI-02-S017','FI-03-S006','FI-03-S014','FI-03-S021']){
  let state=makeState();const next=through(state,id);state=JSON.parse(JSON.stringify(state));validateFundingScenarios(state.financialScenarios);
  through(state,'FI-03-S026',next);validateFundingScenarios(state.financialScenarios);
  assert.deepEqual(scenario(state).data.handoff,fundingHandoffReference,id);
  assert.equal(scenario(state).accounts.arbitrumUSDC,0);assert.equal(scenario(state).accounts.walletETH,0);
 }
});

test('conversion, path fee and gas preparation conserve the fictional budget',()=>{
 const state=makeState();let next=through(state,'FI-03-S006');assert.equal(scenario(state).accounts.walletMCHI,0);assert.equal(scenario(state).accounts.swapPendingUSDC,1030);assert.equal(scenario(state).accounts.michiUSDC,0);
 next=through(state,'FI-03-S014',next);assert.equal(scenario(state).accounts.michiUSDC,0);assert.equal(scenario(state).accounts.pathFeeUSDC,20);assert.equal(scenario(state).accounts.bridgePendingUSDC,1010);assert.equal(scenario(state).accounts.arbitrumUSDC,0);
 next=through(state,'FI-03-S021',next);assert.equal(scenario(state).accounts.arbitrumUSDC,1000);assert.equal(scenario(state).accounts.walletETH,0);assert.equal(scenario(state).accounts.gasPendingETH,0.001);
 through(state,'FI-03-S023',next);assert.equal(scenario(state).accounts.arbitrumUSDC,1000);assert.equal(scenario(state).accounts.walletETH,0.001);
 const a=scenario(state).accounts;
 // Valuation here uses only this lesson's invented quotes: 1MCHI=1000JPY=10USDC.
 assert.equal(a.bankJPY+a.domesticJPY+a.arbitrumUSDC*100+a.gasCostUSDC*100+a.withdrawalFeeMCHI*1000+a.pathFeeUSDC*100,200000);
 validateFundingScenarios(state.financialScenarios);
});

test('every action is idempotent and the handoff never credits or rewinds a current or legacy journey',()=>{
 for(const legacy of [false,true]){
  const state=makeState(legacy),journeyBefore=structuredClone(state.financialScenarios.journey);
  for(const step of steps){doStep(state,step);const once=structuredClone(scenario(state));doStep(state,step);assert.deepEqual(scenario(state),once,step.id);}
  assert.deepEqual(state.financialScenarios.journey,journeyBefore);
  assert.equal(scenario(state).eventLog.length,12);assert.equal(scenario(state).simulationTime,5*3600000);
  assert.equal(scenario(state).data.handoff.additionalCredit,false);assert.equal(scenario(state).accounts.arbitrumUSDC+scenario(state).accounts.walletETH,0);
  validateFundingScenarios(state.financialScenarios);
 }
});

test('import validation rejects changed balances, fees, duplicated receipts and invalid financial values',()=>{
 const base=makeState();through(base,'FI-03-S026');
 for(const mutate of [s=>s.accounts.bankJPY++,s=>s.data.quotes.bridge.fee=1,s=>s.eventLog.push(structuredClone(s.eventLog[0])),s=>s.accounts.walletETH=-1,s=>s.accounts.bankJPY=NaN,s=>s.data.handoff.additionalCredit=true]){
  const altered=structuredClone(base);mutate(scenario(altered));assert.throws(()=>validateFundingScenarios(altered.financialScenarios));
 }
 const state=makeState();through(state,'FI-01-S010');doStep(state,byId('FI-01-S008'),200001);assert.throws(()=>doStep(state,byId('FI-01-S011')),/受取カード|見積書/);assert.equal(scenario(state).accounts.bankJPY,200000);
});
