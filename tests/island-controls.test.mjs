import test from 'node:test';
import assert from 'node:assert/strict';
import {questById,stepById,chapterById} from '../js/content.js';
import {getAdventure,getTavernAdvice,questBrief} from '../js/adventure.js';
import {createState,dispatch,activeStep,parseSave,totalXp} from '../js/engine.js';
import {getPhoneHomeApps,getStepOpenAppId} from '../js/phone-navigation.js';
import {submissionValue} from '../js/action-input.js';

test('Japanese-width amounts and grouping on a transfer form do not alter addresses or accept malformed grouping',()=>{
 const step=stepById['FI-01-S008'];
 const submit=typedValue=>submissionValue({step,typedValue});
 assert.equal(submit('１２０，０００'),'120000');
 assert.equal(submit('１２，００'),'12,00');
 assert.equal(submissionValue({step:stepById['CR-03-S018'],typedValue:'１００'}),'100');
 assert.equal(submissionValue({step:stepById['FI-02-S009'],typedValue:'DEMO-WALLET-Ａ'}),'DEMO-WALLET-Ａ');
});

test('the island guide and the real home controls name the same app and requester',()=>{
 for(const [id,app,name] of [
  ['CR-01-S001','memo','資産の地図（メモ）'],['CR-02-S001','hyper','そらの取引練習'],
  ['CR-02-S021','hyper','そらの取引練習'],['CR-03-S009','wallet','練習ウォレット']
 ]){
  const step=stepById[id];
  assert.equal(step.screenTitle,'スマホホーム');
  assert.equal(getStepOpenAppId(step),app);
  assert.equal(Object.fromEntries(getPhoneHomeApps(questById[step.questId],step))[app],name);
 }
 assert.equal(chapterById['CH-5'].npcName,questBrief(questById['DX-01']).client);
 assert.equal(stepById['CR-03-S008'].navigationAction,'home');
});

test('the recipient is copied before pasting, and the keeper describes receipt only after settlement',()=>{
 let state=createState();
 const act=command=>{state=dispatch(state,command,1800000000000);};
 for(const c of [{type:'START'},{type:'CHAPTER',id:'CH-5'},{type:'NPC',chapterId:'CH-5',index:0}])act(c);
 const quest=questById['CR-03'];
 const luka=getTavernAdvice(state,quest,stepById[quest.stepIds[0]]).find(person=>person.id==='luka');
 assert.match(luka.recallText,/受け取るのはハイリキ/);
 for(const id of ['FI-01','FI-02','FI-03','CR-01','CR-02','CR-03']){
  act({type:'ACCEPT',id});
  while(activeStep(state)){
   const step=activeStep(state);
   if(step.id==='CR-03-S016'){
    state=parseSave(JSON.stringify(state));
    assert.equal(state.financialScenarios.journey.phoneState.formDrafts['CR-03'].clipboard,'DEMO-VAULT-A');
    const before=totalXp(state);
    assert.throws(()=>act({type:'STEP',id:step.id,value:'DEMO-WALLET-A'}),/コピー/);
    assert.equal(totalXp(state),before);
    assert.equal(activeStep(state).id,step.id);
   }
   act({type:'STEP',id:step.id,value:step.type==='check'?true:step.value});
   if(step.id==='CR-03-S012')assert.match(getAdventure(state,quest).latestReaction.text,/次は通り道/);
   if(step.id==='CR-03-S025')assert.doesNotMatch(getAdventure(state,quest).latestReaction.text,/99 USDCが届いた/);
   if(step.id==='CR-03-S026')assert.match(getAdventure(state,quest).latestReaction.text,/99 USDCが届いた/);
  }
 }
 assert.equal(parseSave(JSON.stringify(state)).financialScenarios.journey.accounts.availableUSDC,99);
});
