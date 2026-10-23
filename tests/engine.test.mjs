import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,dispatch,activeStep,totalXp,questState,questAvailable,chapterAvailable,bossAvailable,getBossTasks,parseSave,mastery,validateAction} from '../js/engine.js';
import {quests,steps,questById,chapterById} from '../js/content.js';
import {validateFinancialState,DAY} from '../js/finance.js';

const START=1_000_000_000;
const copy=structuredClone;
const answer=action=>action.value??action.choices?.[0]?.value??true;
function runner(state=createState()) {return {s:copy(state),now:START,act(command,at=this.now){this.s=dispatch(this.s,command,at);return this.s;}};}
function talk(r,chapter='CH-0',index=0){r.act({type:'NPC',chapterId:chapter,index});}
function quest(r,id,{timed=true,finishAt,remaining=0}={}){
  const q=questById[id];talk(r,q.chapterId);
  if(q.offerCardRequired&&!Number.isFinite(r.s.phoneState.offerConditionsSavedAt))r.act({type:'SAVE_OFFER'});
  r.act({type:'ACCEPT',id,timed});
  while(activeStep(r.s)&&r.s.questStates[r.s.activeQuestKey].index<q.stepIds.length-remaining){
    const a=activeStep(r.s),last=a.id===q.stepIds.at(-1);
    r.act({type:'STEP',id:a.id,value:answer(a)},last&&finishAt!==undefined?finishAt:r.now);
  }
  return r;
}
function boss(r,id){
  let guard=0;
  while(!r.s.bossStates[id]?.completed){
    if(guard++>200)throw new Error(`Boss loop: ${id}`);
    const b=r.s.bossStates[id],t=getBossTasks(r.s,id)[b?.index??0];
    if(t.actions?.length){const a=t.actions[b?.actionIndex??0];r.act({type:'BOSS',id,taskId:t.id,actionId:a.id,value:answer(a)});}
    else r.act({type:'BOSS',id,taskId:t.id,values:Object.fromEntries(t.fields.map(f=>[f.key,f.value]))});
  }
}
function intro(){const r=runner();r.act({type:'START',avatar:1});quest(r,'PR-01');return r;}
let cryptoBaseCache;
function cryptoBase(){
  if(!cryptoBaseCache){const r=intro();r.act({type:'UNLOCK',code:'CRYPTO-START'});
    for(const q of quests.filter(q=>q.chapterId==='CH-5'&&!q.extra&&!q.extension))quest(r,q.id);
    r.act({type:'ROUTE',route:'journey'});
    assert.equal(chapterAvailable(r.s,'CH-6'),true);assert.equal(questAvailable(r.s,questById['HY-EXIT']),true);
    boss(r,'CH-5');cryptoBaseCache=copy(r.s);
  }
  return runner(cryptoBaseCache);
}
function route(r,id){r.act({type:'ROUTE',route:id});if(id!=='journey')quest(r,{'spot':'HY-SPOT','hlp':'HY-HLP','stake':'HY-STAKE','perp':'HY-PERP'}[id]);quest(r,'HY-EXIT');}
let fullCache;
function full(){
  if(!fullCache){const r=intro();r.act({type:'UNLOCK',code:'POINT-START'});r.act({type:'UNLOCK',code:'CRYPTO-START'});
    for(const chapter of ['CH-1','CH-2','CH-3','CH-4']){for(const q of quests.filter(q=>q.chapterId===chapter))quest(r,q.id);boss(r,chapter);}
    for(const q of quests.filter(q=>q.chapterId==='CH-5'&&!q.extra&&!q.extension))quest(r,q.id);boss(r,'CH-5');
    route(r,'journey');boss(r,'CH-6');
    for(const id of ['spot','hlp','stake','perp'])route(r,id);
    boss(r,'hidden');fullCache=copy(r.s);
  }
  return runner(fullCache);
}

test('catalog retains the original 24 quests / 548 steps and adds the funding entry without removing any operation',()=>{
  const standard=quests.filter(q=>!q.extra&&!q.extension),extra=quests.filter(q=>q.extra),added=quests.filter(q=>q.extension);
  assert.equal(added.length,7);assert.equal(added.reduce((n,q)=>n+q.stepIds.length,0),176);assert.equal(steps.length,818);
  const original=standard.filter(q=>!q.id.startsWith('FI-'));
  assert.equal(original.length,24);assert.equal(original.reduce((n,q)=>n+q.stepIds.length,0),548);
  assert.equal(standard.length,27);assert.equal(standard.reduce((n,q)=>n+q.stepIds.length,0),618);
  assert.equal(extra.length,2);assert.equal(extra.reduce((n,q)=>n+q.stepIds.length,0),24);
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);
  for(const q of quests)for(const id of q.stepIds)assert.ok(steps.some(s=>s.id===id&&s.questId===q.id));
});

test('all chapters are selectable initially while unknown IDs, in-chapter skips and invalid legacy codes are refused',()=>{
  const r=runner(),before=JSON.stringify(r.s);
  for(const command of [{type:'CHAPTER',id:'CH-99'},{type:'ACCEPT',id:'missing'},{type:'ACCEPT',id:'PO-02'},{type:'UNLOCK',code:''},{type:'UNLOCK',code:'wrong'}])assert.throws(()=>r.act(command));
  assert.equal(JSON.stringify(r.s),before);assert.equal(totalXp(r.s),0);
  r.act({type:'UNLOCK',code:' ｐｏｉｎｔ－ｓｔａｒｔ '});assert.ok(r.s.unlockedParts.includes('points'));
  for(let n=0;n<=6;n++)assert.equal(chapterAvailable(r.s,`CH-${n}`),true);assert.throws(()=>r.act({type:'ACCEPT',id:'PO-02'}));
});

test('registered useful NPC topics award 3 XP only once and invalid NPCs do not count',()=>{
  const r=runner();talk(r);const after=totalXp(r.s);assert.equal(after,3);talk(r);assert.equal(totalXp(r.s),after);
  for(const index of [-1,99,1.5])assert.throws(()=>talk(r,'CH-0',index));
  assert.equal(r.s.worldState.talked.length,1);
  const before=totalXp(r.s);talk(r,'CH-0',3);assert.equal(totalXp(r.s),before+(chapterById['CH-0'].npcs?.[3]?.topicId?3:0));
  talk(r,'CH-5',0);assert.equal(totalXp(r.s),before+(chapterById['CH-0'].npcs?.[3]?.topicId?3:0)+3);
});

test('step, quest, unlock and equipment rewards remain stable on repeated actions and continuation',()=>{
  const r=intro();assert.equal(totalXp(r.s),12*2+40+3);assert.equal(r.s.inventory.filter(id=>id===chapterById['CH-0'].equipment.id).length,1);
  const money=copy(r.s.financialScenarios);r.act({type:'UNLOCK',code:'POINT-START'});r.act({type:'UNLOCK',code:'POINT-START'});assert.deepEqual(r.s.financialScenarios,money);
  assert.throws(()=>r.act({type:'ACCEPT',id:'PR-01',timed:true}));const xp=totalXp(r.s);
  r.act({type:'EQUIP',id:chapterById['CH-0'].equipment.id});r.act({type:'EQUIP',id:chapterById['CH-0'].equipment.id});assert.equal(totalXp(r.s),xp);
  quest(r,'PO-01',{remaining:18});const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)});const checkpoint=JSON.stringify(r.s);assert.throws(()=>r.act({type:'STEP',id:a.id,value:answer(a)}));assert.equal(JSON.stringify(r.s),checkpoint);
});

let timeBaseCache;
function timeBase(){if(!timeBaseCache){const r=intro();r.act({type:'UNLOCK',code:'POINT-START'});quest(r,'PO-01',{remaining:1});timeBaseCache=copy(r.s);}return runner(timeBaseCache);}
for(const delta of [-1,0,1])test(`24-hour deadline is inclusive at boundary ${delta>=0?'+':''}${delta} ms`,()=>{
  const r=timeBase(),qs=questState(r.s,'PO-01'),last=activeStep(r.s);const expected=delta<=0;
  r.act({type:'STEP',id:last.id,value:answer(last)},qs.deadlineAtReal+delta);
  assert.equal(questState(r.s,'PO-01').completed,true);assert.equal(questState(r.s,'PO-01').timeBonusAwarded,expected);
  assert.equal(r.s.rewardEvents.some(e=>e.id==='time:PO-01:first'),expected);assert.ok(r.s.rewardEvents.some(e=>e.id==='quest:PO-01:first'&&e.xp===40));
});

test('acceptance fixes the deadline despite setting changes, reopening and repeated acceptance',()=>{
  const r=timeBase(),before=copy(questState(r.s,'PO-01'));r.act({type:'SETTINGS',values:{durationHours:1,timeBonus:false}});
  r.act({type:'ACCEPT',id:'PO-01',timed:true},START+1000);const qs=questState(r.s,'PO-01');
  assert.equal(qs.acceptedAtReal,before.acceptedAtReal);assert.equal(qs.deadlineAtReal,before.deadlineAtReal);assert.equal(qs.durationHoursAtAccept,24);
  const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)},before.deadlineAtReal);assert.equal(questState(r.s,'PO-01').timeBonusAwarded,true);
});

test('a clock rollback removes only uncertain time bonuses; basic progress and equipment remain available',()=>{
  const r=timeBase();r.act({type:'SETTINGS',values:{sound:false}},START+600_001);const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)},START+1);
  const qs=questState(r.s,'PO-01');assert.equal(qs.completed,true);assert.equal(qs.timeBonusStatus,'clock-unverified');assert.equal(qs.timeBonusAwarded,false);assert.ok(r.s.inventory.includes(chapterById['CH-0'].equipment.id));assert.ok(r.s.rewardEvents.some(e=>e.id==='quest:PO-01:first'));
});

test('voluntary untimed play preserves base XP and never grants the time event',()=>{
  const r=timeBase();r.act({type:'UNTIMED'});const a=activeStep(r.s);r.act({type:'STEP',id:a.id,value:answer(a)},START+30*DAY);
  assert.equal(questState(r.s,'PO-01').completed,true);assert.equal(questState(r.s,'PO-01').timeBonusAwarded,false);
  assert.ok(r.s.rewardEvents.some(e=>e.id==='quest:PO-01:first'));
});

test('partial save/import restores the exact input, clipboard, checkpoint, accounts and rewards then continues',()=>{
  const r=intro();r.act({type:'UNLOCK',code:'POINT-START'});quest(r,'PO-01',{remaining:5});
  const checkpoint=activeStep(r.s).id,serialized=JSON.stringify(r.s),restored=parseSave(serialized);
  assert.equal(activeStep(restored).id,checkpoint);assert.deepEqual(restored.questStates,r.s.questStates);assert.deepEqual(restored.financialScenarios,r.s.financialScenarios);assert.deepEqual(restored.phoneState,r.s.phoneState);assert.equal(totalXp(restored),totalXp(r.s));
  const resumed=runner(restored);while(activeStep(resumed.s)){const a=activeStep(resumed.s);resumed.act({type:'STEP',id:a.id,value:answer(a)});}
  assert.equal(questState(resumed.s,'PO-01').completed,true);assert.equal(resumed.s.phoneState.registrationVerified,true);
});

test('save import rejects malformed, unknown, oversized, impossible and financially altered records',()=>{
  const original=timeBase().s,untouched=JSON.stringify(original);
  assert.throws(()=>parseSave('{'));assert.throws(()=>parseSave('x'.repeat(2*1024*1024+1)));
  const bad=mutate=>{const s=copy(original);mutate(s);assert.throws(()=>parseSave(JSON.stringify(s)));};
  bad(s=>s.schemaVersion=99);bad(s=>s.financialScenarios['points-shopping'].accounts.cash++);bad(s=>s.rewardEvents[0].xp=999);bad(s=>s.inventory.push('unknown-equipment'));bad(s=>s.questStates['PO-01'].completedSteps.push('missing-step'));bad(s=>s.journal.push(s.journal.find(e=>e.command.type==='STEP')));bad(s=>s.revision++);
  bad(s=>s.phoneState.notifications={});bad(s=>s.phoneState.formDrafts=null);bad(s=>s.phoneState.recentApps=[{}]);bad(s=>s.phoneState.clipboard={});
  assert.equal(JSON.stringify(original),untouched);
});

test('crypto entry follows its own required operations while chapter 6 remains independently selectable',()=>{
  const r=runner();assert.equal(chapterAvailable(r.s,'CH-5'),true);assert.equal(chapterAvailable(r.s,'CH-1'),true);
  for(const q of quests.filter(q=>q.chapterId==='CH-5'&&!q.extra&&!q.extension))quest(r,q.id);
  assert.equal(questAvailable(r.s,questById['HY-SPOT']),true);r.act({type:'ROUTE',route:'journey'});assert.equal(questAvailable(r.s,questById['HY-EXIT']),true);
  boss(r,'CH-5');assert.equal(chapterAvailable(r.s,'CH-6'),true);assert.equal(r.s.financialScenarios.journey.accounts.availableUSDC,99);assert.equal(r.s.financialScenarios['boss-ch5-transfer'].accounts.availableUSDC,49);
});

test('operation skip plus exit and five boss tasks earns chapter 6 while every operation lab stays unlearned',()=>{
  const r=cryptoBase();assert.equal(bossAvailable(r.s,'CH-6'),false);route(r,'journey');assert.equal(bossAvailable(r.s,'CH-6'),true);boss(r,'CH-6');
  assert.ok(r.s.worldState.seals.includes('CH-6'));assert.ok(r.s.inventory.includes(chapterById['CH-6'].equipment.id));assert.equal(r.s.bossStates['CH-6'].index,5);
  for(const [q,domain] of [['HY-SPOT','spot'],['HY-HLP','hlp'],['HY-STAKE','staking'],['HY-PERP','perps']]){assert.equal(questState(r.s,q),undefined);assert.equal(mastery(r.s,domain),0);}
  assert.equal(r.s.financialScenarios.journey.accounts.walletUSDC,998);assert.equal(r.s.financialScenarios['boss-ch6-journey'].accounts.walletUSDC,99);
});

for(const [routeId,available,received,bossReceived]of [['spot',980,979,104],['hlp',991,990,99],['stake',808,807,79],['perp',990,989,49]])test(`${routeId} completes its own lab, exit and corresponding boss using independent finances`,()=>{
  const r=cryptoBase();r.act({type:'ROUTE',route:routeId});const q={'spot':'HY-SPOT','hlp':'HY-HLP','stake':'HY-STAKE','perp':'HY-PERP'}[routeId];quest(r,q);
  assert.equal(questState(r.s,q).routeId,routeId);assert.equal(r.s.financialScenarios[routeId].accounts.availableUSDC,available);
  quest(r,'HY-EXIT');boss(r,'CH-6');assert.equal(r.s.financialScenarios[routeId].accounts.walletUSDC,received);assert.equal(r.s.financialScenarios[`boss-ch6-${routeId}`].accounts.walletUSDC,bossReceived);
  assert.equal(r.s.financialScenarios.journey.accounts.availableUSDC,99);assert.equal(validateFinancialState(r.s.financialScenarios),true);
});

test('four and seven game-days do not advance the real 24-hour challenge clock',()=>{
  for(const routeId of ['hlp','stake']){const r=cryptoBase();r.act({type:'ROUTE',route:routeId});const id=routeId==='hlp'?'HY-HLP':'HY-STAKE';quest(r,id);
    const qs=questState(r.s,id);assert.equal(qs.acceptedAtReal,START);assert.equal(qs.completedAtReal,START);assert.equal(qs.timeBonusAwarded,true);assert.ok(r.s.financialScenarios[routeId].simulationTime>=4*DAY);
  }
});

test('all original and funding quests plus both extras complete; six chapter seals unlock the hidden dragon and fixed sword',()=>{
  const r=full();assert.equal(Object.values(r.s.questStates).filter(q=>q.completed&&q.questId!=='HY-EXIT').length,28);
  assert.equal(r.s.worldState.seals.length,6);assert.equal(new Set(r.s.worldState.seals).size,6);assert.equal(bossAvailable(r.s,'hidden'),true);assert.equal(r.s.bossStates.hidden.index,6);assert.ok(r.s.inventory.includes('rainbow-oath'));
  const rewardedSteps=r.s.rewardEvents.filter(e=>e.id.startsWith('step:'));assert.equal(rewardedSteps.length,642);assert.equal(rewardedSteps.reduce((n,e)=>n+e.xp,0),1284);
  assert.equal(r.s.rewardEvents.filter(e=>e.id.startsWith('quest:')&&e.xp===40).length,27);
  assert.equal(r.s.rewardEvents.filter(e=>/^boss:CH-/.test(e.id)).length,6);assert.equal(r.s.rewardEvents.filter(e=>e.id==='boss:hidden:first').length,1);
  assert.equal(totalXp(r.s),3045); // Funding entry adds 70 first steps, 3 quests, and 3 optional time rewards.
  assert.deepEqual([...r.s.worldState.seals].sort(),['CH-1','CH-2','CH-3','CH-4','CH-5','CH-6']);
  assert.equal(Object.entries(r.s.financialScenarios).filter(([id])=>!['funding-japan','chapter6-journey'].includes(id)).reduce((sum,[,s])=>sum+s.eventLog.length,0),69);
  assert.equal(r.s.financialScenarios['points-shopping'].eventLog.length,4);assert.equal(r.s.financialScenarios['cards-trade'].eventLog.length,9);
  assert.equal(r.s.financialScenarios['points-shopping'].accounts.receivedGiftValue,300);assert.equal(r.s.financialScenarios['fx-order'].accounts.cashBalance,99880);assert.equal(r.s.financialScenarios['fx-sell-variant'].accounts.cashBalance,100070);assert.equal(r.s.financialScenarios['cards-trade'].accounts.cashBalance,10250);
  assert.equal(validateFinancialState(r.s.financialScenarios),true);
});

test('revisiting each exit route grants one common set of XP, keeps route finances separate, and survives full JSON replay',()=>{
  const r=full(),s=r.s;assert.equal(s.rewardEvents.filter(e=>e.id.startsWith('step:HY-EXIT-')).length,26);assert.equal(s.rewardEvents.filter(e=>e.id==='quest:HY-EXIT:first').length,1);assert.equal(s.rewardEvents.filter(e=>e.id==='time:HY-EXIT:first').length,1);
  assert.equal(Object.keys(s.questStates).filter(k=>k.startsWith('HY-EXIT:')).length,5);
  for(const routeId of ['journey','spot','hlp','stake','perp'])assert.equal(s.financialScenarios[routeId].eventLog.filter(e=>e.kind===`withdraw:exit-${routeId}-001`).length,1);
  const before=totalXp(s),money=copy(s.financialScenarios);r.act({type:'BOSS',id:'hidden',taskId:'H6',values:{received:98}});assert.equal(totalXp(r.s),before);assert.deepEqual(r.s.financialScenarios,money);
  const saved=JSON.stringify(r.s);assert.ok(new TextEncoder().encode(saved).length<2*1024*1024);const restored=parseSave(saved);assert.deepEqual(restored.financialScenarios,r.s.financialScenarios);assert.deepEqual(restored.rewardEvents,r.s.rewardEvents);assert.deepEqual(restored.inventory,r.s.inventory);assert.equal(restored.worldState.seals.length,6);
});

test('FX offer conditions are explicitly saved before acceptance and do not move money or award XP',()=>{
  const commands=full().s.journal;const end=commands.findIndex(e=>e.command.type==='SAVE_OFFER');assert.ok(end>0);
  const r=runner();for(const event of commands.slice(0,end))r.act(event.command,event.at);
  assert.throws(()=>r.act({type:'ACCEPT',id:'FX-01',timed:true}));const xp=totalXp(r.s),money=copy(r.s.financialScenarios);
  r.act({type:'SAVE_OFFER'});assert.equal(r.s.phoneState.offerConditionCard.newQuantity,1000);assert.equal(r.s.phoneState.offerConditionCard.fullClose,true);assert.equal(totalXp(r.s),xp);assert.deepEqual(r.s.financialScenarios,money);
  r.act({type:'ACCEPT',id:'FX-01',timed:true});assert.equal(activeStep(r.s).questId,'FX-01');
});

test('condition-changed review actions use independent snapshots and never grant initial XP or reset deadlines',()=>{
  const r=full(),xp=totalXp(r.s),money=copy(r.s.financialScenarios),progress=copy(r.s.questStates);
  for(const id of ['PR-01','CR-01','CR-02','CR-03','CR-04','HY-SPOT','HY-HLP','HY-STAKE','HY-PERP','HY-EXIT']){
    const q=questById[id],tasks=q.reviewVariant?.tasks;if(!tasks?.length)continue;
    let guard=0;
    while(!r.s.reviewStates[id]?.completed){if(guard++>250)throw new Error(`Review loop: ${id}`);
      const rs=r.s.reviewStates[id],task=tasks[rs?.index??0],a=task.actions?.[rs?.actionIndex??0]??task;
      r.act({type:'REVIEW_ACTION',id,taskId:task.id,actionId:a.id,value:answer(a)});
    }
    const last=tasks.at(-1),a=last.actions?.at(-1)??last;
    r.act({type:'REVIEW_ACTION',id,taskId:last.id,actionId:a.id,value:answer(a)});
  }
  assert.equal(totalXp(r.s),xp);assert.deepEqual(r.s.financialScenarios,money);assert.deepEqual(r.s.questStates,progress);
  assert.equal(mastery(r.s,'smartphone'),100);assert.equal(mastery(r.s,'spot'),100);assert.equal(mastery(r.s,'hlp'),100);assert.equal(mastery(r.s,'staking'),100);assert.equal(mastery(r.s,'perps'),100);
  assert.deepEqual(parseSave(JSON.stringify(r.s)).reviewStates,r.s.reviewStates);
});

test('all 17 intro and points reviews complete 33 tasks / 148 actions without XP, financial or undefined-domain changes',()=>{
  const r=full(),xp=totalXp(r.s),money=copy(r.s.financialScenarios),progress=copy(r.s.questStates);
  const pointsQuests=quests.filter(q=>q.partId==='intro'||q.partId==='points');
  assert.equal(pointsQuests.length,17);
  assert.equal(pointsQuests.reduce((n,q)=>n+q.reviewVariant.tasks.length,0),33);
  assert.equal(pointsQuests.reduce((n,q)=>n+q.reviewVariant.tasks.reduce((sum,t)=>sum+(t.actions?.length??1),0),0),148);
  const validDomains=new Set(['smartphone','points','bankKyc','transfer','fx','cards']);
  let actionCount=0;
  for(const q of pointsQuests){
    const tasks=q.reviewVariant.tasks;
    for(const task of tasks){
      const evidence=task.objectiveEvidence??[{domain:task.domain,objectiveIndex:task.objectiveIndex}];
      for(const e of evidence){assert.ok(validDomains.has(e.domain),`${q.id}: valid domain`);assert.ok(Number.isInteger(e.objectiveIndex)&&e.objectiveIndex>=0&&e.objectiveIndex<5);}
    }
    while(!r.s.reviewStates[q.id]?.completed){
      const rs=r.s.reviewStates[q.id],task=tasks[rs?.index??0],a=task.actions?.[rs?.actionIndex??0]??task;
      r.act({type:'REVIEW_ACTION',id:q.id,taskId:task.id,actionId:a.id,value:answer(a)});actionCount++;
    }
    const task=tasks.at(-1),a=task.actions?.at(-1)??task;
    r.act({type:'REVIEW_ACTION',id:q.id,taskId:task.id,actionId:a.id,value:answer(a)});
  }
  assert.equal(actionCount,148);assert.equal(totalXp(r.s),xp);assert.deepEqual(r.s.financialScenarios,money);assert.deepEqual(r.s.questStates,progress);
  assert.equal(Object.hasOwn(r.s.masteryEvidence,'undefined'),false);
  for(const [domain,e]of Object.entries(r.s.masteryEvidence)){assert.notEqual(domain,'undefined');for(const kind of ['guided','transfer'])for(const index of e[kind])assert.ok(Number.isInteger(index)&&index>=0&&index<5);}
  for(const domain of validDomains)assert.equal(mastery(r.s,domain),100,domain);
  assert.deepEqual(parseSave(JSON.stringify(r.s)).reviewStates,r.s.reviewStates);
});

test('numeric form values reject scientific notation even when it represents the expected 1000',()=>{
  const a={type:'input',field:'amount',value:1000};
  for(const value of ['1e3','1E3','0x3e8','1000.0000000','',Infinity,NaN])assert.throws(()=>validateAction(a,value));
  for(const value of [1000,'1000','1000.000000'])assert.doesNotThrow(()=>validateAction(a,value));
});
