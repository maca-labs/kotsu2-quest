import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,parseSave,totalXp} from '../js/engine.js';
import {questById,stepById} from '../js/content.js';
import {getAvailableEncounters} from '../js/rpg.js';
import {getRpgSpawn,stepRpgMap,nearbyRpgFeature} from '../js/rpg-world.js';

const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
let clock=1000000;
const run=(state,command)=>dispatch(state,command,clock++);
const turn=(state,action)=>run(state,{type:'RPG_BATTLE_ACTION',battleId:state.rpg.battle.id,turn:state.rpg.battle.turn,action});
const start=(state,id)=>run(state,{type:'RPG_BATTLE_START',encounterId:id});
function win(state){
 for(let n=0;state.rpg.battle.status==='active';n++){
  assert.ok(n<20,'fixture fight must finish');
  state=turn(state,state.rpg.battle.skillUsed?'attack':'skill');
 }
 assert.equal(state.rpg.battle.status,'won');return state;
}
function advance(state,index){
 const q=questById[state.questStates[state.activeQuestKey].questId];
 while(state.questStates[state.activeQuestKey].index<index){
  const step=stepById[q.stepIds[state.questStates[state.activeQuestKey].index]];
  state=run(state,{type:'STEP',id:step.id,value:step.value});
 }
 return state;
}
function opening(){
 let state=createState();
 for(const command of [{type:'START'},{type:'CHAPTER',id:'CH-3'},{type:'NPC',chapterId:'CH-3',index:0},{type:'SAVE_OFFER'},{type:'ACCEPT',id:'FX-01'},{type:'RPG_TRAVEL',mapId:'world'},{type:'RPG_TRAVEL',mapId:'cave:CH-3'}])state=run(state,command);
 return state;
}
const entryState=opening();
const progressState=advance(win(start(entryState,'enc:FX-01:cp:0')),12);
const escapedState=turn(start(progressState,'enc:FX-01:cp:12'),'flee');
function nextQuest(){
 let state=advance(escapedState,18);
 for(const command of [{type:'NPC',chapterId:'CH-3',index:0},{type:'RPG_TRAVEL',mapId:'world'},{type:'RPG_TRAVEL',mapId:'town:CH-3'},{type:'ACCEPT',id:'FX-02'},{type:'RPG_TRAVEL',mapId:'world'},{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-3'}])state=run(state,command);
 state=turn(state,'flee');
 return parseSave(JSON.stringify(run(state,{type:'RPG_TRAVEL',mapId:'cave:CH-3'})));
}
const nextQuestState=nextQuest();
const protectedValues=state=>structuredClone({questStates:state.questStates,rewardEvents:state.rewardEvents,financialScenarios:state.financialScenarios,masteryEvidence:state.masteryEvidence,inventory:state.inventory,equippedItems:state.equippedItems,xp:totalXp(state)});

// Exercise production selectors and the real cave step, with painting omitted.
function screen(saved,{fieldSteps=23}={}){
 const context={state:structuredClone(saved),ui:{fieldSteps,expeditionPosition:getRpgSpawn('cave:CH-3','world')},getAvailableEncounters,questById,stepRpgMap,nearbyRpgFeature,document:{querySelector:()=>null},window:{scrollTo(){}},worldControls:null,commands:[],maybeFieldEncounter:()=>false};
 context.expeditionPosition=()=>context.ui.expeditionPosition;
 context.act=(command,options={})=>{context.commands.push(command);context.state=run(context.state,command);if(options.view)context.ui.view=options.view;return true;};
 context.travelArea=()=>assert.fail('test step must stay inside cave');
 context.resumeFromChapter=()=>assert.fail('gate should find the current accepted encounter');
 vm.createContext(context);
 for(const name of ['walkExpedition','automaticEncounter','beginEncounter','meetGate','escapedPracticeQuest']){
  const line=app.split('\n').find(line=>line.startsWith(`function ${name}(`));
  assert.ok(line,`production function ${name} is available`);vm.runInContext(line,context);
 }
 return context;
}

test('the next cave step cannot revive an escaped old quest or replace the new active quest',()=>{
 const c=screen(nextQuestState),before=structuredClone(c.state);
 assert.equal(c.state.activeQuestKey,'FX-02');assert.equal(c.state.questStates['FX-01'].completed,true);
 assert.ok(getAvailableEncounters(c.state).some(e=>e.id==='enc:FX-01:cp:12'&&e.available&&!e.defeated),'the old foe remains available for an intentional revisit');
 assert.equal(c.automaticEncounter(),undefined);c.walkExpedition(0,-1);
 assert.equal(c.ui.fieldSteps,24);assert.equal(c.ui.expeditionPosition.y,15);
 assert.equal(c.state.activeQuestKey,'FX-02');assert.deepEqual(c.commands,[]);assert.deepEqual(c.state,before);
 assert.deepEqual(protectedValues(c.state),protectedValues(before));
});

test('an unescaped current quest progress foe still appears at the walking checkpoint',()=>{
 const c=screen(progressState),before=protectedValues(c.state);
 assert.equal(c.automaticEncounter()?.id,'enc:FX-01:cp:12');c.walkExpedition(0,-1);
 assert.equal(c.commands.length,1);assert.equal(c.state.rpg.battle.encounterId,'enc:FX-01:cp:12');
 assert.equal(c.state.rpg.battle.status,'active');assert.equal(c.state.activeQuestKey,'FX-01');
 assert.deepEqual(protectedValues(c.state),before);
});

test('an escaped current progress foe is deferred through further lesson progress and cave walking',()=>{
 const state=advance(escapedState,13),c=screen(state,{fieldSteps:11}),before=structuredClone(c.state);
 assert.equal(c.automaticEncounter(),undefined);
 for(let n=0;n<24;n++)c.walkExpedition(0,n%2?1:-1);
 assert.equal(c.ui.fieldSteps,35);assert.deepEqual(c.commands,[]);assert.deepEqual(c.state,before);
});

test('a completed quest does not automatically start an unescaped optional final or progress fight',()=>{
 // Deliberately complete the phone steps without fighting the optional progress foe.
 const state=advance(progressState,18),c=screen(state),before=structuredClone(c.state);
 assert.ok(getAvailableEncounters(state).some(e=>e.id==='enc:FX-01:cp:12'&&e.available&&!e.defeated));
 assert.equal(c.automaticEncounter(),undefined);c.walkExpedition(0,-1);
 assert.deepEqual(c.commands,[]);assert.deepEqual(c.state,before);
});

test('explicitly revisiting an escaped old foe remains possible and cannot repeat its coin reward',()=>{
 const before=protectedValues(nextQuestState);let state=start(nextQuestState,'enc:FX-01:cp:12');
 assert.equal(state.activeQuestKey,'FX-01');state=win(state);
 const coins=state.rpg.coins,loot=state.rpg.eventLog.filter(e=>e.kind==='loot'&&e.encounterId==='enc:FX-01:cp:12');
 assert.equal(loot.length,1);assert.equal(coins,nextQuestState.rpg.coins+15);
 state=win(start(state,'enc:FX-01:cp:12'));
 assert.equal(state.rpg.coins,coins);assert.equal(state.rpg.eventLog.filter(e=>e.kind==='loot'&&e.encounterId==='enc:FX-01:cp:12').length,1);
 assert.deepEqual(protectedValues(state),before);
});

test('meeting the new quest gate selects its own required entry encounter ahead of old optional foes',()=>{
 const c=screen(nextQuestState),before=protectedValues(c.state);c.meetGate('CH-3');
 assert.equal(c.commands.length,1);assert.equal(c.state.rpg.battle.encounterId,'enc:FX-02:cp:0');
 assert.equal(c.state.activeQuestKey,'FX-02');assert.equal(c.state.questStates['FX-02'].index,0);
 assert.deepEqual(protectedValues(c.state),before);
});

test('the optional escape shortcut is a pure lookup only for an unfinished own cave progress fight',()=>{
 const c=screen(escapedState),before=structuredClone(c.state);
 for(let n=0;n<3;n++)assert.equal(c.escapedPracticeQuest()?.id,'FX-01');
 assert.deepEqual(c.state,before);assert.deepEqual(c.commands,[]);

 const gateFled=turn(start(entryState,'enc:FX-01:cp:0'),'flee');
 const fieldFled=turn(run(run(escapedState,{type:'RPG_TRAVEL',mapId:'world'}),{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-3'}),'flee');
 const completed=advance(escapedState,18),outside=run(escapedState,{type:'RPG_TRAVEL',mapId:'world'});
 const active=start(progressState,'enc:FX-01:cp:12'),won=win(active);
 let lost=active;for(let n=0;lost.rpg.battle.status==='active';n++){assert.ok(n<100);lost=turn(lost,'guard');}
 assert.equal(lost.rpg.battle.status,'lost');
 for(const[label,state]of Object.entries({gateFled,fieldFled,completed,outside,active,won,lost})){
  const view=screen(state),snapshot=structuredClone(view.state);assert.equal(view.escapedPracticeQuest(),null,label);assert.deepEqual(view.state,snapshot,label);assert.deepEqual(view.commands,[],label);
 }
 // Guard-only variants isolate a stale UI selection or a missing defeated gate.
 for(const mutate of [s=>{s.activeQuestKey='another-record';},s=>{s.rpg.defeatedIds=s.rpg.defeatedIds.filter(id=>id!=='enc:FX-01:cp:0');}]){
  const view=screen(escapedState);mutate(view.state);const snapshot=structuredClone(view.state);
  assert.equal(view.escapedPracticeQuest(),null);assert.deepEqual(view.state,snapshot);
 }
});
