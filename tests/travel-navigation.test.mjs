import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,parseSave} from '../js/engine.js';
import {questById} from '../js/content.js';
import {getAvailableEncounters,getFieldEncounter} from '../js/rpg.js';
import {mapTile} from '../js/world.js';
import {getTownLayout} from '../js/towns.js';
import {doorAt} from '../js/rooms.js';

const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const body=name=>source.split('\n').find(line=>line.startsWith(`function ${name}(`));
const act=(state,command)=>dispatch(state,command,Date.now());
function ready(){let state=createState();for(const command of [{type:'START'},{type:'NPC',chapterId:'CH-0',index:0},{type:'ACCEPT',id:'PR-01'},{type:'RPG_TRAVEL',mapId:'cave:CH-0'}])state=act(state,command);return act(state,{type:'RPG_BATTLE_START',encounterId:getAvailableEncounters(state)[0].id});}
function turn(state,action){return act(state,{type:'RPG_BATTLE_ACTION',battleId:state.rpg.battle.id,turn:state.rpg.battle.turn,action});}
function environment(state){const context={state:structuredClone(state),ui:{view:'combat'},questById,render(){},window:{scrollTo(){}},entryEncounter:()=>null,phone:0,openQuestPhone(){context.phone++;},getFieldEncounter,mapTile,doorAt,getTownLayout,expeditionPosition:()=>({mapId:'world'}),isDesert:()=>false,toast(){},requests:[]};context.startFieldBattle=kind=>{context.requests.push(kind);return true;};vm.createContext(context);for(const name of ['continueAfterBattle','revivalPending','maybeFieldEncounter','normalizeTownPosition'])vm.runInContext(body(name),context);return context;}

test('flee returns to the road rather than silently opening an unfinished lesson',()=>{
 const state=turn(ready(),'flee'),before=structuredClone(state),env=environment(state);env.continueAfterBattle();assert.equal(env.ui.view,'world');assert.equal(env.phone,0);assert.deepEqual(env.state,before);
});

test('a field victory never resumes the active phone quest, while its gate victory does',()=>{
 let gate=ready();gate=turn(turn(gate,'skill'),'attack');let env=environment(gate);env.continueAfterBattle();assert.equal(env.phone,1);
 let road=act(gate,{type:'RPG_TRAVEL',mapId:'world'});road=act(road,{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-0'});road=turn(turn(road,'skill'),'attack');env=environment(road);env.continueAfterBattle();assert.equal(env.ui.view,'world');assert.equal(env.phone,0);
});

test('road encounters have an initial four successful moves and a twenty move repeat interval',()=>{
 const env=environment(act(createState(),{type:'RPG_TRAVEL',mapId:'world'}));for(let i=0;i<3;i++)assert.equal(env.maybeFieldEncounter(),false);assert.equal(env.maybeFieldEncounter(),true);assert.deepEqual(Array.from(env.requests),['road']);
 env.state.rpg.attempts[getFieldEncounter('road','CH-0').id]=1;for(let i=0;i<19;i++)assert.equal(env.maybeFieldEncounter(),false);assert.equal(env.maybeFieldEncounter(),true);assert.equal(env.requests.length,2);
});

test('desert escape gives eight successful moves without an immediate encounter loop',()=>{
 const env=environment(createState());env.isDesert=()=>true;env.ui.desertGrace=8;for(let i=0;i<8;i++)assert.equal(env.maybeFieldEncounter(),false);assert.equal(env.maybeFieldEncounter(),false);assert.equal(env.maybeFieldEncounter(),true);assert.deepEqual(Array.from(env.requests),['desert']);
});

test('church revival survives JSON reload and is consumed by leaving the church',()=>{
 let state=act(createState(),{type:'RPG_TRAVEL',mapId:'world'});state=act(state,{type:'RPG_FIELD_START',kind:'desert',chapterId:'CH-0'});state=turn(state,'attack');state=parseSave(JSON.stringify(state));let env=environment(state);assert.equal(env.revivalPending(),true);state=act(state,{type:'RPG_TRAVEL',mapId:'town:CH-0'});env=environment(parseSave(JSON.stringify(state)));assert.equal(env.revivalPending(),false);assert.equal(state.rpg.hp,32);
});

test('old positions inside a new fountain or house recover onto the town road without changing learning state',()=>{
 for(const [x,y] of [[12,7],[11,8],[18,14]]){const state=createState();Object.assign(state.worldState,{x,y});const before=JSON.stringify(state.questStates),env=environment(state);env.normalizeTownPosition();assert.equal(env.state.worldState.x,12);assert.equal(env.state.worldState.y,16);assert.equal(JSON.stringify(env.state.questStates),before);assert.equal(env.state.rpg.coins,0);}
 const state=createState();Object.assign(state.worldState,{x:19,y:16});const env=environment(state);env.normalizeTownPosition();assert.equal(env.state.worldState.x,19);assert.equal(env.state.worldState.y,16);
});
