import test from 'node:test';
import assert from 'node:assert/strict';
import {submissionValue} from '../js/action-input.js';

test('review paste uses its own copied code despite a different main-story code',()=>{
 const context={step:{label:'ゲーム内コードを貼り付け'},typedValue:'',mainClipboard:'246810',reviewClipboard:'735921'};
 assert.equal(submissionValue({...context,namespace:'review'}),'735921');
 assert.equal(submissionValue({...context,namespace:'step'}),'246810');
 assert.equal(submissionValue({...context,namespace:'review',reviewClipboard:''}),'');
 assert.equal(submissionValue({...context,namespace:'boss',typedValue:'別の確認値'}),'別の確認値');
});
test('ordinary typed input stays in its own field and is not replaced by any clipboard',()=>{
 for(const namespace of ['step','review','boss'])assert.equal(submissionValue({step:{label:'数量を入力'},typedValue:'103',namespace,mainClipboard:'246810',reviewClipboard:'735921'}),'103');
});

test('the staking quantity accepts Japanese mobile input and resumes an existing decimal draft',async()=>{
 const {createState,dispatch,activeStep,parseSave}=await import('../js/engine.js');
 let state=createState();
 const perform=command=>{state=dispatch(state,command,state.realClockState.lastObservedAt+1);};
 for(const command of [{type:'START'},{type:'CHAPTER',id:'CH-6'},{type:'NPC',index:0},{type:'ACCEPT',id:'HY-STAKE'}])perform(command);
 for(let index=1;index<=10;index++){
  const step=activeStep(state);
  let value=step.value??step.choices?.[0]?.value??true;
  if(index===8){
   value=submissionValue({step,typedValue:'１０．０'});
   assert.equal(value,'10.0');
   assert.throws(()=>perform({type:'STEP',id:step.id,value:'11'}));
  }
  perform({type:'STEP',id:step.id,value});
  if(index===8)state=parseSave(JSON.stringify(state));
 }
 const {spotHYPE,stakingHYPE}=state.financialScenarios.stake.accounts;
 assert.deepEqual([spotHYPE,stakingHYPE],[0,10]);
 assert.throws(()=>perform({type:'STEP',id:'HY-STAKE-S010',value:true}));
});

test('perpetual collateral and stop prices keep a valid decimal amount across a save and confirmation',async()=>{
 const {createState,dispatch,activeStep,parseSave}=await import('../js/engine.js');
 let state=createState();
 const perform=command=>{state=dispatch(state,command,state.realClockState.lastObservedAt+1);};
 for(const command of [{type:'START'},{type:'CHAPTER',id:'CH-6'},{type:'NPC',index:0},{type:'ACCEPT',id:'HY-PERP'}])perform(command);
 for(let index=1;index<=35;index++){
  const step=activeStep(state);
  let value=step.value??step.choices?.[0]?.value??true;
  if(index===12||index===32){
   value=submissionValue({step,typedValue:index===12?'１００．０':'９７．００'});
   assert.throws(()=>perform({type:'STEP',id:step.id,value:'11'}));
  }
  perform({type:'STEP',id:step.id,value});
  if(index===12||index===32)state=parseSave(JSON.stringify(state));
  if(index===19)assert.equal(state.financialScenarios.perp.accounts.availableUSDC,900);
 }
 assert.equal(state.financialScenarios.perp.accounts.availableUSDC,990);
 assert.equal(state.financialScenarios['perp-sl'].accounts.availableUSDC,993);
});

test('the free-choice dojo accepts a Japanese decimal for its collateral and still checks the amount', async()=>{
 const {steps}=await import('../js/content-extension.js');
 const {validateAction}=await import('../js/engine.js');
 const step=steps.find(item=>item.id==='LV-01-S004');
 const amount=typedValue=>submissionValue({step,typedValue});
 assert.equal(amount('１００．０'),'100.0');
 assert.doesNotThrow(()=>validateAction(step,amount('１００．０')));
 assert.throws(()=>validateAction(step,amount('１１')));
});
