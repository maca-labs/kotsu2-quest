import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getStoryGuide} from '../js/story-guide.js';
import {createState,dispatch,activeStep,getBossTasks,totalXp,parseSave} from '../js/engine.js';
import {questById} from '../js/content.js';

const at=1_000_000;
function act(state,command){return dispatch(state,command,at);}
function started(chapter='CH-0'){
 let state=act(createState(),{type:'START'});
 return act(state,{type:'CHAPTER',id:chapter});
}
function hear(state,chapter){return act(state,{type:'NPC',chapterId:chapter,index:0});}
function play(state,id,{remaining=0}={}){
 const quest=questById[id];
 state=hear(state,quest.chapterId);
 state=act(state,{type:'ACCEPT',id,timed:false});
 while(activeStep(state)&&state.questStates[state.activeQuestKey].index<quest.stepIds.length-remaining){
  const step=activeStep(state);
  state=act(state,{type:'STEP',id:step.id,value:step.type==='check'?true:step.value??true});
 }
 return state;
}
function freeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);for(const child of Object.values(value))freeze(child);
 }
 return value;
}

test('first invitation recommends the prologue and keeps every other town selectable',()=>{
 const state=freeze(createState()),before=JSON.stringify(state);
 const home=getStoryGuide(state,{view:'home'}),town=getStoryGuide(state);
 assert.deepEqual(home.action,{type:'chapter',id:'CH-0'});
 assert.match(home.instruction,/好きな章/);
 assert.equal(town.questId,'PR-01');assert.equal(town.action.type,'house');
 assert.equal(town.action.id,'client');assert.match(town.instruction,/郵便屋の家.*ミナ/);
 assert.equal(home.houseName,'郵便屋の家');
 for(const id of ['CH-0','CH-1','CH-2','CH-3','CH-4','CH-5','CH-6']){
  const guide=getStoryGuide(state,{chapterId:id});
  assert.ok(guide.houseName);assert.equal(guide.actionLabel,guide.houseName+'へ');
  assert.ok(guide.instruction.includes(guide.houseName));
 }
 assert.match(town.controlsHint,/扉.*メニュー/);
 assert.equal(getStoryGuide(state,{chapterId:'CH-5'}).questId,'DX-01');
 assert.equal(getStoryGuide(state,{chapterId:'CH-6'}).questId,'HY-EXIT');
 assert.equal(JSON.stringify(state),before);
});

test('interrupted phone work resumes its saved key without rewriting the state',()=>{
 const state=play(started(),'PR-01',{remaining:10}),before=JSON.stringify(state);
 freeze(state);
 const guide=getStoryGuide(state);
 assert.deepEqual(guide.action,{type:'resume',id:'PR-01'});
 assert.equal(guide.client,'郵便屋ミナ');assert.match(guide.instruction,/次の操作：.*途中の入力/);
 assert.equal(guide.milestones[0].state,'done');
 assert.deepEqual(getStoryGuide(parseSave(before)),guide);
 assert.equal(JSON.stringify(state),before);
 // A visit to another town must not send its main button to the old chapter.
 const other=getStoryGuide(state,{chapterId:'CH-1'});
 assert.equal(other.questId,'PO-01');assert.equal(other.action.type,'house');
});

test('the completed prologue offers a client report before the next town, including after reload',()=>{
 let state=play(started(),'PR-01');
 const xp=totalXp(state),money=JSON.stringify(state.financialScenarios),items=[...state.inventory],before=JSON.stringify(state);
 const guide=getStoryGuide(freeze(state));
 assert.equal(guide.questId,'PR-01');assert.equal(guide.recordKey,'PR-01');
 assert.equal(guide.action.type,'house');assert.equal(guide.action.id,'client');
 assert.match(guide.instruction,/郵便屋の家.*ミナ.*結果を話そう/);
 assert.equal(guide.milestones[1].state,'current');
 assert.deepEqual(getStoryGuide(parseSave(before)),guide);
 assert.equal(JSON.stringify(state),before);
 state=act(state,{type:'NPC',chapterId:'CH-0',index:1});
 assert.equal(getStoryGuide(state).questId,'PR-01');
 const xpBeforeReport=totalXp(state);
 state=hear(state,'CH-0');
 assert.deepEqual(getStoryGuide(parseSave(JSON.stringify(state))).action,{type:'chapter',id:'CH-1'});
 assert.equal(totalXp(state),xpBeforeReport);
 assert.equal(JSON.stringify(state.financialScenarios),money);assert.deepEqual(state.inventory,items);
 assert.equal(xp,67);
});

test('the reported prologue points to the next town after the existing notebook reward',()=>{
 const state=hear(play(started(),'PR-01'),'CH-0'),before=JSON.stringify(state);
 assert.equal(totalXp(state),67);assert.ok(state.inventory.includes('traveler-notebook'));
 const guide=getStoryGuide(freeze(state));
 assert.deepEqual(guide.action,{type:'chapter',id:'CH-1'});
 assert.match(guide.title,/手帳.*次の町/);
 assert.ok(guide.milestones.every(x=>x.state==='done'));
 assert.equal(JSON.stringify(state),before);
 // The existing request book also accepts the request after another villager's
 // introduction. Do not present that valid completed prologue as unfinished.
 let alternate=act(started(),{type:'NPC',chapterId:'CH-0',index:1});
 alternate=act(alternate,{type:'ACCEPT',id:'PR-01',timed:false});
 while(activeStep(alternate)){
  const step=activeStep(alternate);
  alternate=act(alternate,{type:'STEP',id:step.id,value:step.value??true});
 }
 assert.equal(getStoryGuide(alternate).questId,'PR-01');
 alternate=hear(alternate,'CH-0');
 assert.ok(getStoryGuide(alternate).milestones.every(x=>x.state==='done'));
});

test('a completed request asks for a report across reload, then offers the next job',()=>{
 let state=play(started('CH-1'),'PO-01');
 const xp=totalXp(state),money=JSON.stringify(state.financialScenarios);
 let guide=getStoryGuide(parseSave(JSON.stringify(state)));
 assert.equal(guide.questId,'PO-01');assert.match(guide.instruction,/結果を話そう/);
 assert.equal(guide.action.type,'house');assert.equal(guide.action.questId,'PO-01');
 // An explanation from a different villager does not impersonate the client report.
 state=act(state,{type:'NPC',chapterId:'CH-1',index:1});
 assert.equal(getStoryGuide(state).questId,'PO-01');
 const beforeReportXp=totalXp(state);
 state=hear(state,'CH-1');guide=getStoryGuide(state);
 assert.equal(guide.questId,'PO-02');assert.equal(totalXp(state),beforeReportXp);
 assert.equal(JSON.stringify(state.financialScenarios),money);
 assert.equal(xp,81);assert.deepEqual(getStoryGuide(parseSave(JSON.stringify(state))),guide);
});

test('an unreported request survives a different chapter detour and reload while unfinished work keeps priority',()=>{
 let state=play(started('CH-1'),'PO-01');
 state=act(state,{type:'CHAPTER',id:'CH-5'});
 state=play(state,'DX-01',{remaining:32});
 state=act(state,{type:'CHAPTER',id:'CH-1'});
 state=parseSave(JSON.stringify(state));
 assert.equal(state.activeQuestKey,'DX-01');
 const report=getStoryGuide(state);
 assert.equal(report.questId,'PO-01');assert.match(report.title,/結果を.*ハル/);
 assert.equal(report.action.type,'house');
 // Other jobs remain available. Once one is accepted, its unfinished phone
 // takes priority without falsifying the earlier report.
 state=act(state,{type:'ACCEPT',id:'PO-02',timed:false});
 const resume=getStoryGuide(state);
 assert.deepEqual(resume.action,{type:'resume',id:'PO-02'});
});

test('main quests plus a client report lead to the existing chapter boss, then the next town',()=>{
 let state=started('CH-1');
 for(const id of ['PO-01','PO-02','PO-03','PO-04','PO-05','PO-06'])state=play(state,id);
 assert.equal(getStoryGuide(state).action.type,'house');
 state=hear(state,'CH-1');
 assert.deepEqual(getStoryGuide(state).action,{type:'boss',id:'CH-1'});
 while(!state.bossStates['CH-1']?.completed){
  const progress=state.bossStates['CH-1'],task=getBossTasks(state,'CH-1')[progress?.index??0];
  if(task.actions?.length){const action=task.actions[progress?.actionIndex??0];state=act(state,{type:'BOSS',id:'CH-1',taskId:task.id,actionId:action.id,value:action.value??true});}
  else state=act(state,{type:'BOSS',id:'CH-1',taskId:task.id,values:Object.fromEntries(task.fields.map(f=>[f.key,f.value]))});
 }
 const guide=getStoryGuide(freeze(state));
 assert.deepEqual(guide.action,{type:'chapter',id:'CH-2'});
 assert.equal(guide.milestones.at(-1).state,'done');
});

test('domestic application and KYC lead to the distinct funding journey without pretending to move money',()=>{
 let state=started('CH-5');
 assert.equal(getStoryGuide(state).questId,'DX-01');
 state=play(state,'DX-01');state=hear(state,'CH-5');
 assert.equal(getStoryGuide(state).questId,'DX-02');
 state=play(state,'DX-02');
 assert.match(getStoryGuide(state).title,/結果/);
 state=hear(state,'CH-5');const before=JSON.stringify(state);
 const guide=getStoryGuide(freeze(state));
 assert.equal(guide.questId,'FI-01');assert.equal(guide.milestones[0].state,'done');
 assert.match(guide.story,/申込済み.*別の財布/);
 assert.equal(state.questStates['FI-01'],undefined);
 assert.equal(state.questStates['CR-03'],undefined);
 assert.equal(JSON.stringify(state),before);
});

test('chapter six distinguishes a chosen lab from the unlearned alternatives and preserves route-specific resumption',()=>{
 let state=started('CH-6');
 const skip=getStoryGuide(state);
 assert.equal(skip.questId,'HY-EXIT');assert.match(skip.story,/運用を見送/);
 state=act(state,{type:'ROUTE',route:'spot'});
 const spot=getStoryGuide(state);
 assert.equal(spot.questId,'HY-SPOT');assert.match(spot.story,/ほかのラボは未受講/);
 assert.equal(state.questStates['HY-HLP'],undefined);
 state=act(state,{type:'ROUTE',route:'journey'});
 state=play(state,'HY-EXIT',{remaining:25});
 const guide=getStoryGuide(freeze(state));
 assert.equal(guide.action.type,'resume');
 assert.equal(guide.action.id,state.activeQuestKey);
 assert.match(guide.action.id,/^HY-EXIT:journey/);
 assert.equal(state.questStates['HY-SPOT'],undefined);
});

test('a newly finished optional course can be reported after an old chapter clear without reopening old reports',()=>{
 let state=parseSave(fs.readFileSync(new URL('./fixtures/pre-extension-v3.json',import.meta.url),'utf8'));
 state=act(state,{type:'CHAPTER',id:'CH-5'});
 assert.equal(getStoryGuide(state).action.type,'chapter');
 state=play(state,'DX-01');
 assert.equal(getStoryGuide(state).questId,'DX-01');
 assert.match(getStoryGuide(state).title,/結果/);
 state=hear(state,'CH-5');
 assert.equal(getStoryGuide(state).action.type,'chapter');
 assert.ok(state.worldState.seals.includes('CH-5'));
});

test('an exit report identifies its completed route even after the selected route changes',()=>{
 let state=act(started('CH-6'),{type:'ROUTE',route:'spot'});
 state=play(state,'HY-SPOT');state=hear(state,'CH-6');
 state=play(state,'HY-EXIT');
 const finishedKey=state.activeQuestKey;
 state=act(state,{type:'ROUTE',route:'hlp'});
 state=parseSave(JSON.stringify(state));
 const money=JSON.stringify(state.financialScenarios),guide=getStoryGuide(freeze(state));
 assert.equal(guide.questId,'HY-EXIT');assert.equal(guide.recordKey,finishedKey);
 assert.equal(guide.routeId,'spot');assert.equal(guide.action.recordKey,finishedKey);
 assert.equal(state.questStates[guide.recordKey].completed,true);
 assert.equal(state.selectedRoute,'hlp');assert.equal(state.questStates['HY-HLP'],undefined);
 assert.equal(JSON.stringify(state.financialScenarios),money);
});
