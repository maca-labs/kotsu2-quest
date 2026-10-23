import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,steps} from '../js/content.js';
import {getAdventure,getChapterChanges,questBrief,recoveryReaction,getTavernAdvice,getAdventureChronicle,adventureCatalog} from '../js/adventure.js';
import {initialExtensionScenarios,applyExtensionStep,getExtensionView} from '../js/finance-extension.js';

const byId=Object.fromEntries(quests.map(q=>[q.id,q]));
function progress(q,n,route='journey'){
 const key=q.id==='HY-EXIT'?`${q.id}:${route}`:q.id;
 return {selectedRoute:route,activeQuestKey:key,questStates:{[key]:{questId:q.id,routeId:route,completedSteps:q.stepIds.slice(0,n),index:n,completed:n===q.stepIds.length}},worldState:{seals:[]},phoneState:{},rewardEvents:[],masteryEvidence:{}};
}

test('every standard, extra and funding quest has a distinct incident and bounded reaction gaps',()=>{
 const enemyNames=new Set();
 for(const q of quests){
  assert.ok(adventureCatalog[q.id],q.id);
  const a=getAdventure(progress(q,0),q);assert.ok(a.stages.length,q.id);
  assert.equal(a.stages.at(-1).endStepId,q.stepIds.at(-1),q.id);
  assert.ok(a.enemy.maxHp>0,q.id);assert.equal(a.enemy.hp,a.enemy.maxHp);
  enemyNames.add(a.enemy.name);
  let previous=0;for(const stage of a.stages){assert.ok(stage.endIndex>previous);assert.ok(stage.endIndex-previous<=8,`${q.id} gap ${stage.endIndex-previous}`);assert.equal(stage.startStepId,q.stepIds[previous]);assert.equal(stage.endStepId,q.stepIds[stage.endIndex-1]);assert.equal(stage.damage,stage.kind==='seal'?20:0);previous=stage.endIndex;}
  assert.match(questBrief(q).incident,/[。！？]$/);assert.ok(questBrief(q).goal.length>8);
 }
 assert.equal(enemyNames.size,quests.length);
});

test('mail discovery does not damage an enemy; actual authentication breaks the last seal',()=>{
 const q=byId['PO-01'];
 const filled=getAdventure(progress(q,7),q),mail=getAdventure(progress(q,13),q),verified=getAdventure(progress(q,19),q);
 assert.equal(mail.enemy.hp,filled.enemy.hp);assert.equal(mail.latestReaction.kind,'clue');
 assert.equal(verified.enemy.hp,0);assert.equal(verified.latestReaction.worldEffect.kind,'postbox');
});

test('exchange request cannot pretend a gift has been received or open the exchange window',()=>{
 const q=byId['PO-06'],before=progress(q,9),after=progress(q,10);
 assert.ok(getAdventure(before,q).enemy.hp>0);
 assert.ok(!getChapterChanges(before,'CH-1').some(c=>c.kind==='exchange-window'));
 assert.equal(getAdventure(after,q).enemy.hp,0);
 assert.ok(getChapterChanges(after,'CH-1').some(c=>c.kind==='exchange-window'));
});

test('only a contiguous sequence of completed IDs can unlock a stage',()=>{
 const q=byId['TR-01'],s=progress(q,0);
 s.questStates[q.id].index=q.stepIds.length;s.questStates[q.id].completed=true;s.questStates[q.id].completedSteps=[q.stepIds.at(-1)];
 const a=getAdventure(s,q);assert.equal(a.progress,0);assert.equal(a.enemy.hp,a.enemy.maxHp);assert.deepEqual(getChapterChanges(s,'CH-2'),[]);
});

test('progress is monotone, reaches zero, and never depends on XP or profit',()=>{
 for(const q of quests){let previous=Infinity;for(let n=0;n<=q.stepIds.length;n++){
  const s=progress(q,n),a=getAdventure(s,q);assert.ok(a.enemy.hp>=0&&a.enemy.hp<=previous,q.id);previous=a.enemy.hp;
  s.rewardEvents=[{id:'arbitrary',xp:999999}];s.financialScenarios={fake:{accounts:{profit:999999}}};
  assert.equal(getAdventure(s,q).enemy.hp,a.enemy.hp);
 }assert.equal(previous,0,q.id);}
});

test('error advice never heals enemies, removes rewards or modifies saved progress',()=>{
 const q=byId['CR-03'],s=progress(q,18),before=structuredClone(s),hp=getAdventure(s,q).enemy.hp;
 for(const field of ['network','address','quantity','bankCode','facePosition','condition']){
  const advice=recoveryReaction({id:'example',field,instruction:'この欄を直す'},'値を見直そう');
  assert.equal(advice.hpChange,0);assert.equal(advice.penalty,0);assert.ok(advice.text.length>10);
 }
 assert.deepEqual(s,before);assert.equal(getAdventure(s,q).enemy.hp,hp);
});

test('funding network and address fields get specific recovery advice despite capital letters',()=>{
 for(const field of ['withdrawNetwork','bridgeNetwork','receiveNetwork'])assert.match(recoveryReaction({id:'FI-02-S007',field},'違う道').text,/送り道.*ネットワーク/);
 assert.match(recoveryReaction({field:'withdrawAddress'}).text,/宛先/);
 assert.match(recoveryReaction({field:'swapQuantity'}).text,/数量.*単位/);
 assert.match(recoveryReaction({field:'gasPayment'}).text,/USDC.*ETH/);
});

test('an unstudied lab has no world effect and advice does not mark any mastery',()=>{
 const q=byId['CR-04'],s=progress(q,q.stepIds.length,'journey'),before=structuredClone(s);
 const changes=getChapterChanges(s,'CH-6');assert.equal(changes.length,0);
 assert.equal(getAdventure(s,byId['HY-SPOT']).progress,0);
 assert.match(getAdventure(s,q).latestReaction.text,/運用を見送る/);
 getTavernAdvice(s,q);assert.deepEqual(s,before);
});

test('exit progress belongs to its selected route and cannot borrow another route receipt',()=>{
 const q=byId['HY-EXIT'],s=progress(q,q.stepIds.length,'spot');
 s.selectedRoute='hlp';s.activeQuestKey=null;
 assert.equal(getAdventure(s,q).progress,0);
 s.selectedRoute='spot';assert.equal(getAdventure(s,q).progress,q.stepIds.length);
});

test('later main-journey exit does not borrow the finished standalone skip exit',()=>{
 const q=byId['HY-EXIT'],s=progress(q,q.stepIds.length,'journey');
 s.questStates['HY-EXIT:journey-main']={questId:'HY-EXIT',routeId:'journey',completedSteps:[],index:0,completed:false};
 s.activeQuestKey='HY-EXIT:journey-main';
 const current=getAdventure(s,q);assert.equal(current.progress,0);assert.equal(current.recordKey,'HY-EXIT:journey-main');
 assert.equal(current.enemy.hp,current.enemy.maxHp);
 assert.ok(getChapterChanges(s,'CH-6').some(change=>change.kind==='return-dock'));
 s.activeQuestKey=null;assert.equal(getAdventure(s,q).progress,0);
});

test('tavern advice cites only completed steps; unknown future scenes remain explanations',()=>{
 const empty={questStates:{},phoneState:{},worldState:{seals:[]}},unseen=getTavernAdvice(empty);
 assert.equal(unseen.length,9);assert.ok(unseen.every(a=>a.unseen&&!a.recallStepIds.length&&!a.hasRecall));
 assert.equal(unseen.find(a=>a.id==='elder').role,'冒険の記録庫');
 const q=byId['PO-04'],s=progress(q,3),before=structuredClone(s),advice=getTavernAdvice(s,q);
 const done=new Set(q.stepIds.slice(0,3));
 for(const row of advice)for(const id of row.recallStepIds)assert.ok(done.has(id));
 assert.match(advice.find(a=>a.id==='mina').recallText,/PQ-001/);assert.ok(advice.find(a=>a.id==='sora').unseen);
 assert.deepEqual(s,before);
});

test('an advisor can recall a relevant earlier input in the current quest, not a future milestone',()=>{
 const q=byId['BK-01'],s=progress(q,22),advice=getTavernAdvice(s,q).find(row=>row.id==='sui');
 assert.ok(advice.hasRecall);assert.ok(advice.recallStepIds.includes('BK-01-022'));
 assert.ok(!advice.recallStepIds.includes('BK-01-031'));assert.match(advice.recallText,/住所|入力/);
});

test('funding milestones distinguish buying, self withdrawal, swap, bridge and gas',()=>{
 for(const id of ['FI-01','FI-02','FI-03'])assert.ok(byId[id],id);
 const q=byId['FI-03'];
 assert.match(getAdventure(progress(q,6),q).latestReaction.text,/種類/);
 assert.match(getAdventure(progress(q,16),q).latestReaction.text,/道替え.*20/);
 assert.match(getAdventure(progress(q,23),q).latestReaction.text,/USDC1,000.*ETH0.001/);
});

test('old milestone letters never claim that received funds are currently still pending',()=>{
 for(const [id,n]of [['FI-02',19],['CR-03',26],['HY-EXIT',20],['HY-STAKE',35]]){
  const q=byId[id],a=getAdventure(progress(q,n),q);
  assert.ok(!/まだ受取前|まだ移動中|今は待機中/.test(a.latestReaction.text),id);
 }
});

test('the elder archive exposes only actual completed operations and marks partial quests',()=>{
 const q=byId['PO-04'],s=progress(q,3),before=structuredClone(s),archive=getAdventureChronicle(s);
 assert.equal(archive.length,1);const record=archive[0];assert.equal(record.completed,false);assert.match(record.statusLabel,/途中/);
 assert.deepEqual(record.completedStepIds,q.stepIds.slice(0,3));assert.equal(record.entries.length,3);
 assert.ok(record.entries.every(e=>q.stepIds.slice(0,3).includes(e.stepId)));
 assert.ok(!record.entries.some(e=>e.stepId==='P049'));assert.equal(record.milestones.length,0);
 assert.ok(record.entries.every(e=>e.meaning&&e.pitfall&&e.recordText));assert.deepEqual(s,before);
});

test('the elder archive does not borrow future progress from an index or a completed flag',()=>{
 const q=byId['BK-01'],s=progress(q,0);s.questStates[q.id].index=q.stepIds.length;s.questStates[q.id].completed=true;
 assert.deepEqual(getAdventureChronicle(s),[]);
 s.questStates[q.id].completedSteps=[q.stepIds.at(-1)];assert.deepEqual(getAdventureChronicle(s),[]);
});

test('every completed step is readable in the elder archive without executing finance or rewards',()=>{
 const s={selectedRoute:'journey',questStates:{},phoneState:{},worldState:{seals:[]},rewardEvents:[{id:'keep',xp:3}],financialScenarios:{keep:{accounts:{cash:123}}}};
 for(const q of quests)Object.assign(s.questStates,progress(q,q.stepIds.length).questStates);
 const before=structuredClone(s),records=getAdventureChronicle(s);
 assert.equal(records.length,quests.length);assert.equal(records.reduce((n,r)=>n+r.entries.length,0),steps.length);
 for(const r of records){assert.equal(r.completed,true);assert.equal(r.replayAction,false);assert.ok(r.milestones.length);for(const entry of r.entries){assert.ok(entry.pitfall.length>10);assert.ok(!/occupation=employee|accountType=ordinary/.test(entry.recordText));}}
 assert.deepEqual(s,before);
});

test('the elder keeps route exits and the later main journey in separate named volumes',()=>{
 const q=byId['HY-EXIT'],s=progress(q,q.stepIds.length,'journey');
 s.questStates['HY-EXIT:journey-main']={questId:q.id,routeId:'journey',completedSteps:q.stepIds.slice(0,8),index:8,completed:false};
 s.questStates['HY-EXIT:spot']={questId:q.id,routeId:'spot',completedSteps:q.stepIds.slice(0,12),index:12,completed:false};
 const records=getAdventureChronicle(s);assert.equal(records.length,3);
 assert.equal(records.find(r=>r.recordKey==='HY-EXIT:journey').completed,true);
 const main=records.find(r=>r.recordKey==='HY-EXIT:journey-main');assert.equal(main.entries.length,8);assert.match(main.title,/入金の旅/);assert.equal(main.completed,false);
 assert.match(records.find(r=>r.recordKey==='HY-EXIT:spot').title,/現物/);
});

test('domestic signup cannot light the open window before the KYC result and final history',()=>{
 const signup=byId['DX-01'],kyc=byId['DX-02'],s=progress(signup,signup.stepIds.length);
 Object.assign(s.questStates,progress(kyc,22).questStates);s.activeQuestKey=kyc.id;
 assert.ok(getChapterChanges(s,'CH-5').some(c=>c.kind==='domestic-desk'));
 assert.ok(!getChapterChanges(s,'CH-5').some(c=>c.kind==='domestic-open'));
 s.questStates[kyc.id].completedSteps.push(kyc.stepIds[22]);s.questStates[kyc.id].completed=true;
 assert.ok(getChapterChanges(s,'CH-5').some(c=>c.kind==='domestic-open'));
});

test('order clues distinguish reservation, cancellation and actual fill in both directions',()=>{
 const q=byId['DX-05'];
 const reservation=getAdventure(progress(q,13),q),cancelled=getAdventure(progress(q,15),q),bought=getAdventure(progress(q,20),q),salePending=getAdventure(progress(q,31),q),sold=getAdventure(progress(q,34),q);
 assert.match(reservation.latestReaction.text,/予約.*まだ.*買えていない/);
 assert.match(cancelled.latestReaction.text,/取消|取り消.*予約が解け/);assert.match(cancelled.latestReaction.text,/売却.*ではない/);
 assert.match(bought.latestReaction.text,/成立.*コインが届/);assert.match(salePending.latestReaction.text,/予約中.*まだ.*円.*届いていない/);
 assert.match(sold.latestReaction.text,/予約がなくなって円/);assert.equal(sold.enemy.hp,0);
});

test('lending return request is not a receipt or a completed return cart',()=>{
 const q=byId['LD-01'],request=progress(q,17),settled=progress(q,21),received=progress(q,22);
 assert.match(getAdventure(request,q).latestReaction.text,/申請.*処理中と受取/);
 assert.ok(!getChapterChanges(request,'CH-6').some(c=>c.kind==='lending-returned'));
 assert.ok(!getChapterChanges(settled,'CH-6').some(c=>c.kind==='lending-returned'));
 assert.ok(getChapterChanges(received,'CH-6').some(c=>c.kind==='lending-returned'));
});

test('new villagers recall only the current completed operations and do not learn other courses',()=>{
 for(const id of ['DX-01','DX-02','DX-03','DX-04','DX-05','LD-01','LV-01']){
  const q=byId[id],s=progress(q,7),before=structuredClone(s),done=new Set(q.stepIds.slice(0,7));
  const advisor=getTavernAdvice(s,q,steps.find(step=>step.id===q.stepIds[7])).find(a=>a.id===(id.startsWith('DX')?'senna':'sora'));
  assert.ok(advisor.hasRecall,id);assert.ok(advisor.recallStepIds.length,id);assert.ok(advisor.recallStepIds.every(stepId=>done.has(stepId)),id);
  assert.equal(advisor.hintCost,0);assert.equal(advisor.readOnly,true);assert.deepEqual(s,before);
  const archive=getAdventureChronicle(s);assert.equal(archive.length,1);assert.equal(archive[0].questId,id);
 }
});

test('chosen leverage values come from the financial view, with the same shields for all profit outcomes',()=>{
 const q=byId['LV-01'],rows=steps.filter(step=>step.questId===q.id),variants=[{side:'short',leverage:'5',markPrice:'95'},{side:'long',leverage:'1',markPrice:'95'}],results=[];
 for(const variant of variants){
  const s=progress(q,0);s.financialScenarios=initialExtensionScenarios();s.journal=[];
  for(const step of rows){const value=step.acceptAnyChoice?variant[step.field]:step.value;applyExtensionStep(s,step,value);s.journal.push({command:{type:'STEP',id:step.id,value},at:0});s.questStates[q.id].completedSteps.push(step.id);s.questStates[q.id].index++;}
  s.questStates[q.id].completed=true;
  const before=structuredClone(s),a=getAdventure(s,q),view=getExtensionView(s,rows[0]);assert.deepEqual(a.selection,view.metrics);
  assert.equal(a.selection.side,variant.side);assert.equal(a.selection.leverage,Number(variant.leverage));assert.equal(a.enemy.hp,0);
  const record=getAdventureChronicle(s)[0],sideEntry=record.entries.find(e=>e.stepId==='LV-01-S005'),leverageEntry=record.entries.find(e=>e.stepId==='LV-01-S006');
  assert.match(sideEntry.recordText,variant.side==='short'?/ショート/:/ロング/);assert.match(leverageEntry.recordText,new RegExp(`${variant.leverage}倍`));
  assert.ok(!record.entries.some(e=>e.stepId.includes('review')));assert.deepEqual(s,before);results.push(a);
 }
 assert.equal(results[0].enemy.maxHp,results[1].enemy.maxHp);assert.notEqual(results[0].selection.realizedPnl,results[1].selection.realizedPnl);
});

test('a selected default and a review journal never masquerade as a completed choice',()=>{
 const q=byId['LV-01'],s=progress(q,6);s.journal=[{command:{type:'REVIEW_ACTION',id:'LV-01-S005',value:'short'}}];s.reviewStates={'LV-01':{completed:true}};
 const entries=getAdventureChronicle(s)[0].entries;
 for(const id of ['LV-01-S005','LV-01-S006']){const text=entries.find(e=>e.stepId===id).recordText;assert.ok(!/ロング|ショート|2倍/.test(text));assert.match(text,/自分が選んだ条件/);}
 s.questStates={};assert.deepEqual(getAdventureChronicle(s),[]);
});

test('closing leverage updates the live bubble immediately but keeps the final shield until S022',()=>{
 const q=byId['LV-01'],rows=steps.filter(step=>step.questId===q.id),s=progress(q,0);
 s.financialScenarios=initialExtensionScenarios();s.rewardEvents=[{id:'keep',xp:2}];
 const perform=step=>{const value=step.acceptAnyChoice?({side:'short',leverage:'5',markPrice:'95'})[step.field]:step.value;applyExtensionStep(s,step,value);s.questStates[q.id].completedSteps.push(step.id);s.questStates[q.id].index++;};
 for(const step of rows.slice(0,19))perform(step);
 const before=getAdventure(s,q);assert.match(before.latestReaction.text,/まだ閉じていない/);assert.ok(before.enemy.hp>0);
 perform(rows[19]);const saved=structuredClone(s),closed=getAdventure(s,q);
 assert.equal(closed.selection.positionOpen,false);assert.match(closed.latestReaction.text,/全決済は終わった.*履歴の方向・倍率.*残量ゼロ/);
 assert.ok(!/まだ閉じていない/.test(closed.latestReaction.text));assert.equal(closed.enemy.hp,before.enemy.hp);assert.equal(closed.completedStages,before.completedStages);
 assert.ok(!closed.chapterChanges.some(change=>change.kind==='leverage-return'));
 assert.match(closed.stages.find(stage=>stage.endIndex===17).meaning,/まだ閉じていない/);assert.deepEqual(s,saved);
 perform(rows[20]);assert.equal(getAdventure(s,q).enemy.hp,before.enemy.hp);
 perform(rows[21]);assert.equal(getAdventure(s,q).enemy.hp,0);assert.deepEqual(s.rewardEvents,[{id:'keep',xp:2}]);
});

test('live order and lending advice follows intervening financial events without advancing seals',()=>{
 const cases=[
  ['DX-05',14,/取消が終わり.*予約が解け/],
  ['DX-05',17,/出し直した.*もう一度予約中/],
  ['DX-05',18,/買い注文が成立.*コインが届/],
  ['DX-05',32,/指値売りが成立.*円を受け取った/],
  ['LD-01',19,/返還処理が終わり.*受取確認は.*次/],
  ['LD-01',21,/元本と利息は手元へ戻った/],
 ];
 for(const [id,n,expected]of cases){
  const q=byId[id],s=progress(q,n),rows=steps.filter(step=>step.questId===q.id);s.financialScenarios=initialExtensionScenarios();
  for(const step of rows.slice(0,n))applyExtensionStep(s,step,step.value);
  const before=structuredClone(s),live=getAdventure(s,q),sameEvidence=getAdventure(progress(q,n),q);
  assert.match(live.latestReaction.text,expected,`${id} after ${n}`);assert.equal(live.enemy.hp,sameEvidence.enemy.hp);
  assert.deepEqual(live.chapterChanges,sameEvidence.chapterChanges);assert.deepEqual(s,before);
 }
});
