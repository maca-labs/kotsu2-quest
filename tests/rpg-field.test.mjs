import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createState,dispatch,activeStep,chapterResumeKey,parseSave,totalXp} from '../js/engine.js';
import {getFieldEncounter,getBattleStats,getAvailableEncounters} from '../js/rpg.js';
let clock=2000000;
const act=(s,c)=>dispatch(s,c,clock++);
const turn=(s,action)=>act(s,{type:'RPG_BATTLE_ACTION',battleId:s.rpg.battle.id,turn:s.rpg.battle.turn,action});
function field(s,kind='road',chapterId=s.currentChapter){return act(s,{type:'RPG_FIELD_START',kind,chapterId});}
function world(s,chapterId='CH-0'){s=act(s,{type:'CHAPTER',id:chapterId});s=act(s,{type:'RPG_REST'});return act(s,{type:'RPG_TRAVEL',mapId:'world'});}
function win(s){for(let n=0;s.rpg.battle.status==='active'&&n<100;n++)s=turn(s,s.rpg.battle.skillUsed?'attack':'skill');assert.equal(s.rpg.battle.status,'won');return s;}
const protectedValues=s=>structuredClone({financialScenarios:s.financialScenarios,rewardEvents:s.rewardEvents,questStates:s.questStates,masteryEvidence:s.masteryEvidence,inventory:s.inventory,equippedItems:s.equippedItems,selectedRoute:s.selectedRoute,activeQuestKey:s.activeQuestKey});
function earnRoadCoins(s){for(let n=0;n<=6;n++)s=win(field(world(s,`CH-${n}`)));return s;}

test('road foes can be fought without a lesson and first-win coins cannot be farmed by walking or reloading',()=>{
 let s=world(createState()),before=protectedValues(s);
 assert.deepEqual(getAvailableEncounters(s),[]);
 s=field(s);assert.equal(s.rpg.battle.kind,'field');assert.equal(s.rpg.battle.fieldKind,'road');assert.equal(s.rpg.battle.recordKey,null);assert.equal(s.rpg.battle.enemyHp,14);
 const oldAction={type:'RPG_BATTLE_ACTION',battleId:s.rpg.battle.id,turn:1,action:'skill'};
 s=act(s,oldAction);assert.equal(s.rpg.hp,29);assert.equal(s.rpg.battle.enemyHp,4);
 const copy=structuredClone(s);assert.throws(()=>act(s,oldAction));assert.deepEqual(s,copy);
 s=parseSave(JSON.stringify(s));s=win(s);assert.equal(s.rpg.coins,12);assert.equal(totalXp(s),0);
 assert.deepEqual(protectedValues(s),before);assert.equal(s.rpg.eventLog.filter(e=>e.kind==='loot').length,1);
 s=parseSave(JSON.stringify(s));s=field(s);assert.equal(s.rpg.battle.firstVictory,false);s=win(s);
 assert.equal(s.rpg.coins,12);assert.equal(s.rpg.attempts['field:road:CH-0'],2);assert.deepEqual(protectedValues(s),before);
 assert.deepEqual(parseSave(JSON.stringify(s)).rpg,s.rpg);
});

test('each chapter has a stable road foe; seven victories buy and equip real gear without lesson XP or financial spending',()=>{
 let s=createState(),before=structuredClone(s.financialScenarios);s=earnRoadCoins(s);
 assert.equal(s.rpg.coins,111);assert.equal(s.rpg.defeatedIds.length,7);assert.equal(totalXp(s),0);
 assert.equal(new Set(s.rpg.defeatedIds).size,7);assert.deepEqual(s.financialScenarios,before);
 s=act(s,{type:'RPG_TRAVEL',mapId:'shop:CH-6'});
 s=act(s,{type:'RPG_BUY',gearId:'rpg-iron-sword'});s=act(s,{type:'RPG_EQUIP',gearId:'rpg-iron-sword'});
 s=act(s,{type:'RPG_BUY',gearId:'rpg-mail-armor'});s=act(s,{type:'RPG_EQUIP',gearId:'rpg-mail-armor'});
 assert.equal(s.rpg.coins,1);assert.equal(getBattleStats(s).attack,14);assert.equal(getBattleStats(s).defense,6);
 assert.deepEqual(s.financialScenarios,before);assert.equal(totalXp(s),0);assert.deepEqual(parseSave(JSON.stringify(s)).rpg,s.rpg);
});

test('road and desert flee always succeeds and never changes the accepted lesson, money or XP',()=>{
 let s=world(createState());const before=protectedValues(s);
 for(const kind of ['road','desert']){s=field(s,kind);s=turn(s,'flee');assert.equal(s.rpg.battle.status,'fled');assert.equal(s.rpg.hp,32);assert.equal(s.rpg.location.mapId,'world');assert.equal(s.rpg.coins,0);assert.equal(s.rpg.defeatedIds.length,0);assert.deepEqual(protectedValues(s),before);s=parseSave(JSON.stringify(s));}
});

test('desert foe defeats a beginner on the first attack or guard and revives them at the first-town church without losses',()=>{
 for(const action of ['attack','guard','skill']){
  let s=field(world(createState(),'CH-5'),'desert');assert.equal(s.rpg.battle.enemy.name,'砂暁のガルザドン');assert.equal(s.rpg.battle.enemyHp,220);
  const before=protectedValues(s),coins=s.rpg.coins;s=parseSave(JSON.stringify(s));s=turn(s,action);
  assert.equal(s.rpg.battle.status,'lost');assert.equal(s.rpg.location.mapId,'town:CH-0');assert.equal(s.currentChapter,'CH-0');assert.equal(s.worldState.x,19);assert.equal(s.worldState.y,16);assert.equal(s.rpg.hp,32);assert.equal(s.rpg.coins,coins);
  assert.deepEqual(protectedValues(s),before);assert.equal(s.rpg.eventLog.filter(e=>e.kind==='revive').length,1);assert.equal(s.rpg.eventLog.at(-1).status,'lost');
  assert.match(s.rpg.battle.log.at(-1),/教会.*全回復/);assert.deepEqual(parseSave(JSON.stringify(s)).rpg,s.rpg);
  const defeated=structuredClone(s);assert.throws(()=>turn(s,action));assert.deepEqual(s,defeated);
  s=act(s,{type:'RPG_TRAVEL',mapId:'world'});assert.equal(s.rpg.eventLog.at(-1).kind,'travel');s=field(s,'road','CH-0');assert.equal(s.rpg.battle.status,'active');
 }
});

test('church revival keeps equipped purchases, coins and both chapter lessons while chapter-resume keys remain distinct',()=>{
 let s=earnRoadCoins(createState());s=act(s,{type:'RPG_TRAVEL',mapId:'shop:CH-6'});
 for(const gearId of ['rpg-copper-sword','rpg-cloth-armor']){s=act(s,{type:'RPG_BUY',gearId});s=act(s,{type:'RPG_EQUIP',gearId});}
 for(const[chapterId,id]of [['CH-0','PR-01'],['CH-6','LV-01']]){s=act(s,{type:'CHAPTER',id:chapterId});s=act(s,{type:'NPC',index:0});s=act(s,{type:'ACCEPT',id});}
 for(let n=0;n<3;n++){const step=activeStep(s);s=act(s,{type:'STEP',id:step.id,value:step.type==='check'?true:step.value});}
 const before=protectedValues(s),coins=s.rpg.coins,gear=structuredClone(s.rpg.equipped),step=activeStep(s).id;
 s=act(s,{type:'RPG_TRAVEL',mapId:'world'});s=turn(field(s,'desert'),'attack');
 assert.equal(s.rpg.battle.status,'lost');assert.equal(s.rpg.coins,coins);assert.deepEqual(s.rpg.equipped,gear);assert.equal(s.activeQuestKey,'LV-01');assert.equal(activeStep(s).id,step);
 assert.deepEqual(protectedValues(s),before);assert.equal(chapterResumeKey(s),'PR-01');assert.equal(chapterResumeKey(s,'CH-6'),'LV-01');assert.equal(s.currentChapter,'CH-0');
 s=parseSave(JSON.stringify(s));assert.deepEqual(protectedValues(s),before);assert.equal(s.rpg.hp,getBattleStats(s).maxHp);
 s=act(s,{type:'CHAPTER',id:'CH-6'});s=act(s,{type:'ACCEPT',id:'LV-01'});assert.equal(activeStep(s).id,step);
});

test('an ordinary field defeat also revives at church; quest encounters keep their existing defeat behavior',()=>{
 let s=field(world(createState(),'CH-4'));
 for(let n=0;s.rpg.battle.status==='active'&&n<100;n++)s=turn(s,'guard');
 assert.equal(s.rpg.battle.status,'lost');assert.equal(s.rpg.hp,32);assert.equal(s.currentChapter,'CH-0');assert.equal(s.rpg.location.mapId,'town:CH-0');assert.equal(s.rpg.coins,0);
 assert.deepEqual(parseSave(JSON.stringify(s)).rpg,s.rpg);
});

test('invalid field source, forged encounter, concurrent battle and corrupted field saves are rejected without mutation',()=>{
 let s=createState();const copy=structuredClone(s);assert.throws(()=>field(s));assert.deepEqual(s,copy);s=world(s,'CH-2');
 for(const command of [{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-1'},{type:'RPG_FIELD_START',kind:'fake',chapterId:'CH-2'},{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-9'},{type:'RPG_FIELD_START',kind:'road',chapterId:'CH-2',encounterId:'field:road:CH-0'}]){const before=structuredClone(s);assert.throws(()=>act(s,command));assert.deepEqual(s,before);}
 s=field(s);const before=structuredClone(s);assert.throws(()=>field(s,'desert'));assert.throws(()=>act(s,{type:'CHAPTER',id:'CH-0'}));assert.deepEqual(s,before);
 for(const mutate of [x=>x.rpg.battle.fieldKind='desert',x=>x.rpg.battle.enemy.attack=1,x=>x.rpg.battle.coins=10000,x=>x.rpg.coins++,x=>delete x.rpg,x=>x.rpg.eventLog.push(x.rpg.eventLog[0])]){const raw=structuredClone(s);mutate(raw);assert.throws(()=>parseSave(JSON.stringify(raw)));}
 assert.equal(getFieldEncounter('road','CH-99'),null);assert.equal(getFieldEncounter('fake','CH-0'),null);
});

test('old 642-step saves can start a field fight without retroactive reward or changing their original learning and finances',()=>{
 const raw=JSON.parse(fs.readFileSync(new URL('./fixtures/pre-extension-v3.json',import.meta.url),'utf8'));let s=parseSave(JSON.stringify(raw));const before=protectedValues(s);
 s=act(s,{type:'RPG_TRAVEL',mapId:'world'});s=field(s);assert.equal(s.rpg.coins,0);assert.deepEqual(protectedValues(s),before);s=turn(s,'flee');assert.equal(s.rpg.coins,0);assert.deepEqual(protectedValues(s),before);
 assert.deepEqual(parseSave(JSON.stringify(s)).rpg,s.rpg);
});
