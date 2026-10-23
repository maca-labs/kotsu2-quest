import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,dispatch,activeStep,chapterResumeKey,chapterAvailable,questAvailable,questState,stateKey,totalXp,mastery,bossAvailable,getBossTasks,parseSave,SAVE_KEY} from '../js/engine.js';
import {quests,questById} from '../js/content.js';
import {validateFinancialState} from '../js/finance.js';
import {SaveStore} from '../js/storage.js';

const answer=a=>a.value??a.choices?.[0]?.value??true;
const legacyScenarios=['intro-phone','points-shopping','bank-application','bank-kyc-retake','bank-transfer','fx-order','fx-sell-variant','fx-offer','cards-trade','journey','spot','spot-limit','hlp','stake','perp','perp-sl','perp-funding','perp-liquidation','boss-ch5-transfer','boss-ch6-journey','boss-ch6-spot','boss-ch6-hlp','boss-ch6-stake','boss-ch6-perp'];
function run(state=createState(),legacy=false){return {s:structuredClone(state),now:1_000_000_000,act(command){this.s=dispatch(this.s,command,this.now++,legacy?'replay':true,{legacyContent:legacy});return this.s;}};}
function doQuest(r,id){const q=questById[id];r.act({type:'NPC',chapterId:q.chapterId,index:0});if(q.offerCardRequired)r.act({type:'SAVE_OFFER'});r.act({type:'ACCEPT',id,timed:true});while(activeStep(r.s)){const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)});}}
function doBoss(r,id){while(!r.s.bossStates[id]?.completed){const bs=r.s.bossStates[id],task=getBossTasks(r.s,id)[bs?.index??0];if(task.actions?.length){const a=task.actions[bs?.actionIndex??0];r.act({type:'BOSS',id,taskId:task.id,actionId:a.id,value:answer(a)});}else r.act({type:'BOSS',id,taskId:task.id,values:Object.fromEntries(task.fields.map(f=>[f.key,f.value]))});}}
function legacyFixture(){
  const r=run(createState(),true);r.act({type:'START',avatar:2});doQuest(r,'PR-01');r.act({type:'UNLOCK',code:'CRYPTO-START'});
  for(const id of ['CR-01','CR-02','CR-03','CR-04'])doQuest(r,id);doBoss(r,'CH-5');
  r.act({type:'CHAPTER',id:'CH-5'});
  const old=structuredClone(r.s);delete old.navigationVersion;delete old.migration;old.unlockedParts=['intro','crypto'];
  old.financialScenarios=Object.fromEntries(legacyScenarios.map(id=>[id,old.financialScenarios[id]]));return old;
}

test('all chapters and both parts are open from a fresh save; visiting them grants no learning or money',()=>{
  const r=run(),before=structuredClone(r.s.financialScenarios);assert.deepEqual(r.s.unlockedParts,['intro','points','crypto']);
  for(let n=0;n<=6;n++){const id=`CH-${n}`;assert.equal(chapterAvailable(r.s,id),true);r.act({type:'CHAPTER',id});assert.equal(r.s.currentChapter,id);}
  assert.deepEqual(r.s.questStates,{});assert.deepEqual(r.s.masteryEvidence,{});assert.deepEqual(r.s.inventory,['traveler-staff']);assert.deepEqual(r.s.worldState.seals,[]);assert.equal(totalXp(r.s),0);assert.deepEqual(r.s.financialScenarios,before);
  r.act({type:'UNLOCK',code:' ｃｒｙｐｔｏ－ｓｔａｒｔ '});r.act({type:'UNLOCK',code:'POINT-START'});assert.equal(totalXp(r.s),0);assert.deepEqual(r.s.financialScenarios,before);
});

test('a later chapter starts without earlier learning while required operations within its own chapter stay ordered',()=>{
  for(const chapter of ['CH-1','CH-2','CH-3','CH-4','CH-5']){
    const r=run(),list=quests.filter(q=>q.chapterId===chapter&&!q.extra&&!q.extension),first=list[0];
    assert.equal(questAvailable(r.s,first),true);if(list[1])assert.equal(questAvailable(r.s,list[1]),false);
    r.act({type:'CHAPTER',id:chapter});r.act({type:'NPC',chapterId:chapter,index:0});if(first.offerCardRequired)r.act({type:'SAVE_OFFER'});r.act({type:'ACCEPT',id:first.id});
    assert.deepEqual(Object.keys(r.s.questStates),[first.id]);assert.equal(questState(r.s,'PR-01'),undefined);assert.deepEqual(r.s.masteryEvidence,{});assert.deepEqual(r.s.worldState.seals,[]);
    if(list[1])assert.throws(()=>r.act({type:'ACCEPT',id:list[1].id}));
  }
});

test('chapter 6 alone can skip operation, receive its dedicated 98 and finish without learning the entry or labs',()=>{
  const r=run(),originalJourney=structuredClone(r.s.financialScenarios.journey);
  r.act({type:'CHAPTER',id:'CH-6'});assert.equal(questAvailable(r.s,questById['HY-EXIT']),true);doQuest(r,'HY-EXIT');
  assert.equal(questState(r.s,'HY-EXIT').scenarioOverride,'chapter6-journey');assert.equal(r.s.financialScenarios['chapter6-journey'].accounts.walletUSDC,98);assert.deepEqual(r.s.financialScenarios.journey,originalJourney);
  doBoss(r,'CH-6');assert.deepEqual(r.s.worldState.seals,['CH-6']);assert.equal(bossAvailable(r.s,'hidden'),false);
  for(const id of ['PR-01','FI-01','FI-02','FI-03','CR-01','CR-02','CR-03','CR-04','HY-SPOT','HY-HLP','HY-STAKE','HY-PERP'])assert.equal(questState(r.s,id),undefined);
  for(const domain of ['crypto_basics','spot','hlp','staking','perps'])assert.equal(mastery(r.s,domain),0);
  assert.equal(validateFinancialState(r.s.financialScenarios),true);assert.deepEqual(parseSave(JSON.stringify(r.s)).financialScenarios,r.s.financialScenarios);
});

for(const [route,id,received]of [['spot','HY-SPOT',979],['hlp','HY-HLP',990],['stake','HY-STAKE',807],['perp','HY-PERP',989]])test(`chapter 6 ${route} starts independently and retains all its required operations`,()=>{
  const r=run();r.act({type:'CHAPTER',id:'CH-6'});r.act({type:'ROUTE',route});assert.equal(questAvailable(r.s,questById[id]),true);assert.equal(questAvailable(r.s,questById['HY-EXIT']),false);
  doQuest(r,id);assert.equal(questState(r.s,id).completedSteps.length,questById[id].stepIds.length);doQuest(r,'HY-EXIT');doBoss(r,'CH-6');
  assert.equal(r.s.financialScenarios[route].accounts.walletUSDC,received);assert.deepEqual(r.s.worldState.seals,['CH-6']);assert.equal(questState(r.s,'PR-01'),undefined);assert.equal(questState(r.s,'CR-03'),undefined);
  const domains={spot:'spot',hlp:'hlp',stake:'staking',perp:'perps'};for(const [other,domain]of Object.entries(domains))if(other!==route)assert.equal(mastery(r.s,domain),0);
  assert.equal(validateFinancialState(r.s.financialScenarios),true);
});

test('legacy v3 replay preserves balances, XP, equipment, clocks and revision while adding untouched defaults only',()=>{
  const old=legacyFixture(),source=JSON.stringify(old),next=parseSave(source);
  assert.equal(next.navigationVersion,2);assert.deepEqual(next.unlockedParts,['intro','points','crypto']);assert.equal(next.revision,old.revision);assert.equal(next.migration.legacyV3JournalLength,old.journal.length);
  for(const id of legacyScenarios)assert.deepEqual(next.financialScenarios[id],old.financialScenarios[id]);
  for(const key of ['questStates','rewardEvents','inventory','equippedItems','masteryEvidence','bossStates'])assert.deepEqual(next[key],old[key]);
  assert.equal(next.financialScenarios['funding-japan'].eventLog.length,0);assert.equal(next.financialScenarios['chapter6-journey'].eventLog.length,0);
  for(const id of ['FI-01','FI-02','FI-03'])assert.equal(questState(next,id),undefined);
  assert.deepEqual(parseSave(JSON.stringify(next)),next);assert.equal(JSON.stringify(old),source);
  const r=run(next);r.now=next.realClockState.lastObservedAt+1000;r.act({type:'CHAPTER',id:'CH-2'});r.act({type:'NPC',chapterId:'CH-2',index:0});r.act({type:'ACCEPT',id:'BK-01'});
  const twice=parseSave(JSON.stringify(r.s));assert.equal(twice.migration.legacyV3JournalLength,old.journal.length);assert.deepEqual(twice.questStates['CR-03'],old.questStates['CR-03']);assert.equal(twice.revision,r.s.revision);
});

test('legacy hydration still rejects altered balances, missing old snapshots, unknown IDs and duplicate rewards',()=>{
  const old=legacyFixture(),bad=mutate=>{const value=structuredClone(old);mutate(value);assert.throws(()=>parseSave(JSON.stringify(value)));};
  bad(s=>s.financialScenarios.journey.accounts.walletUSDC++);bad(s=>delete s.financialScenarios.spot);bad(s=>s.financialScenarios.unknown={});bad(s=>s.rewardEvents.push(s.rewardEvents[0]));bad(s=>s.unlockedParts=['intro']);bad(s=>s.revision++);bad(s=>s.journal.push({command:{type:'STEP',id:'missing-step'},at:1_000_001_000}));
  const current=createState();delete current.financialScenarios['funding-japan'];assert.throws(()=>parseSave(JSON.stringify(current)));
});

test('loading an old save keeps its source untouched and importing it preserves its original revision',()=>{
  const old=legacyFixture(),text=JSON.stringify(old),map=new Map([[SAVE_KEY,text]]),descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)}});
  try{const store=new SaveStore(),loaded=store.load();assert.equal(store.rawCorrupt,null);assert.equal(store.preMigrationRaw,text);assert.equal(loaded.revision,old.revision);assert.equal(map.get(SAVE_KEY),text);store.writable=true;const imported=store.replace(text);assert.equal(imported.revision,old.revision);assert.equal(JSON.parse(map.get(SAVE_KEY)).revision,old.revision);assert.deepEqual(parseSave(map.get(SAVE_KEY)),imported);}
  finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
});

test('a review can restart and finish again without changing initial XP, finance or accepted deadlines',()=>{
  const r=run();doQuest(r,'PR-01');const before=structuredClone(r.s),q=questById['PR-01'];
  const finish=()=>{while(!r.s.reviewStates[q.id]?.completed){const rs=r.s.reviewStates[q.id],task=q.reviewVariant.tasks[rs?.index??0],a=task.actions?.[rs?.actionIndex??0]??task;r.act({type:'REVIEW_ACTION',id:q.id,taskId:task.id,actionId:a.id,value:answer(a)});}};
  finish();const evidence=structuredClone(r.s.masteryEvidence);r.act({type:'RESTART_REVIEW',id:q.id});assert.equal(r.s.reviewStates[q.id],undefined);finish();
  assert.equal(totalXp(r.s),totalXp(before));assert.deepEqual(r.s.financialScenarios,before.financialScenarios);assert.deepEqual(r.s.questStates,before.questStates);assert.deepEqual(r.s.masteryEvidence,evidence);assert.deepEqual(parseSave(JSON.stringify(r.s)).reviewStates,r.s.reviewStates);
});

for(const earlyComplete of [true,false])test(`entry learned after a ${earlyComplete?'completed':'partial'} chapter-only exit can later withdraw main journey funds without repeated XP`,()=>{
  const r=run();r.act({type:'CHAPTER',id:'CH-6'});r.act({type:'NPC',chapterId:'CH-6',index:0});r.act({type:'ACCEPT',id:'HY-EXIT',timed:true});
  let firstActions=0;while(activeStep(r.s)&&(earlyComplete||firstActions<5)){const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)});firstActions++;}
  const originalClock=structuredClone(r.s.questStates['HY-EXIT:journey']);
  for(const q of quests.filter(q=>q.chapterId==='CH-5'&&!q.extra&&!q.extension&&q.id!=='CR-04'))doQuest(r,q.id);
  assert.equal(r.s.financialScenarios.journey.accounts.availableUSDC,99);assert.equal(r.s.financialScenarios.journey.accounts.walletUSDC,900);
  if(!earlyComplete){assert.equal(chapterResumeKey(r.s,'CH-6'),'HY-EXIT:journey');r.act({type:'ACCEPT',id:'HY-EXIT',timed:false});assert.equal(r.s.activeQuestKey,'HY-EXIT:journey');assert.equal(questState(r.s,'HY-EXIT').acceptedAtReal,originalClock.acceptedAtReal);while(activeStep(r.s)){const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)});}}
  const independent=structuredClone(r.s.questStates['HY-EXIT:journey']),xp=totalXp(r.s),main=stateKey(questById['HY-EXIT'],'journey',r.s);
  assert.equal(main,'HY-EXIT:journey-main');assert.equal(questState(r.s,'HY-EXIT'),undefined);assert.equal(questAvailable(r.s,questById['HY-EXIT']),true);
  r.act({type:'ACCEPT',id:'HY-EXIT',timed:true});assert.equal(r.s.activeQuestKey,main);assert.equal(questState(r.s,'HY-EXIT').scenarioOverride,undefined);
  while(activeStep(r.s)){const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)});if(a.id==='HY-EXIT-S018'){assert.equal(r.s.financialScenarios.journey.accounts.withdrawalPending,98);r.s=parseSave(JSON.stringify(r.s));assert.equal(r.s.activeQuestKey,main);assert.equal(chapterResumeKey(r.s,'CH-6'),main);}}
  assert.deepEqual(r.s.questStates['HY-EXIT:journey'],independent);assert.equal(r.s.questStates[main].completedSteps.length,questById['HY-EXIT'].stepIds.length);
  assert.equal(r.s.financialScenarios.journey.accounts.walletUSDC,998);assert.equal(r.s.financialScenarios.journey.accounts.walletETH,.0009);assert.equal(r.s.financialScenarios['chapter6-journey'].accounts.walletUSDC,98);
  assert.equal(totalXp(r.s),xp);assert.equal(r.s.rewardEvents.filter(e=>e.id==='quest:HY-EXIT:first').length,1);assert.equal(r.s.rewardEvents.filter(e=>e.id==='time:HY-EXIT:first').length,1);assert.equal(r.s.rewardEvents.filter(e=>e.id.startsWith('step:HY-EXIT-')).length,26);
  const restored=parseSave(JSON.stringify(r.s));assert.deepEqual(restored.financialScenarios,r.s.financialScenarios);assert.deepEqual(restored.questStates,r.s.questStates);assert.equal(validateFinancialState(restored.financialScenarios),true);
});
