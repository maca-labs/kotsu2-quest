import test from 'node:test';
import assert from 'node:assert/strict';
import {getLessonGuide} from '../js/lesson-guide.js';
import {createState,dispatch,activeStep,totalXp,parseSave} from '../js/engine.js';
import {quests,questById,stepById,points,extension} from '../js/content.js';

const at=1_000_000;
const act=(state,command)=>dispatch(state,command,at);
function accept(id){
 let state=act(createState(),{type:'START'});
 state=act(state,{type:'NPC',chapterId:questById[id].chapterId,index:0});
 return act(state,{type:'ACCEPT',id,timed:false});
}
function until(state,id){
 let guard=0;
 while(activeStep(state)?.id!==id){
  const step=activeStep(state);assert.ok(step,`Missing ${id}`);
  assert.ok(guard++<100);
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

test('all 34 ordinary requests and both side exercises have a short purpose and a real first action',()=>{
 assert.equal(quests.filter(q=>!q.extra).length,34);
 const state=freeze(createState()),before=JSON.stringify(state);
 for(const quest of quests){
  const first=stepById[quest.stepIds[0]],guide=getLessonGuide({state,quest,step:first});
  for(const key of ['title','story','practice','firstAction'])assert.ok(guide[key],`${quest.id} ${key}`);
  assert.ok(guide.steps.length>=3&&guide.steps.length<=4,quest.id);
  assert.ok(guide.steps.every(text=>typeof text==='string'&&text.length<85),quest.id);
  assert.equal(guide.firstAction,first.instruction,quest.id);
 }
 assert.equal(JSON.stringify(state),before);
});

test('copy narration names the correct mail and destination without exposing a phrase, code or old clipboard',()=>{
 const state=createState();state.phoneState.clipboard='OLD-CLIPBOARD-DO-NOT-REUSE';
 const secrets=[points.practiceProfile.introPhrase,points.practiceProfile.registrationCode,points.practiceProfile.bankCode,extension.extensionProfile.verificationCode,'OLD-CLIPBOARD-DO-NOT-REUSE'];
 const targets={
  'PR-01':['intro-mail','memo','合言葉をコピー'],
  'PO-01':['registration-mail','browser','このメールの練習コードをコピー'],
  'BK-01':['bank-verification','bank','このメールの練習コードをコピー'],
  'DX-01':['domestic-registration','browser','このメールの確認コードをコピー'],
 };
 for(const [id,[mailId,destination,copyLabel]]of Object.entries(targets)){
  const guide=getLessonGuide({state,quest:questById[id]});
  assert.equal(guide.flow.source,'mail');assert.equal(guide.flow.mailId,mailId);
  assert.equal(guide.flow.destination,destination);assert.equal(guide.flow.clipboardLabel,copyLabel);
  assert.match(guide.practice,/別の用事でコピーした内容は使いません/);
  for(const secret of secrets)assert.equal(JSON.stringify(guide).includes(secret),false,`${id}: ${secret}`);
 }
 // A source/destination label needs no access to the contents of either place.
 Object.defineProperty(state.phoneState,'clipboard',{get(){throw new Error('Narration read clipboard');}});
 Object.defineProperty(state.phoneState.mailById['intro-mail'],'code',{get(){throw new Error('Narration read code');}});
 assert.doesNotThrow(()=>getLessonGuide({state,quest:questById['PR-01']}));
});

test('resuming at prologue app switching uses the saved current action and only the remaining preview',()=>{
 let state=until(accept('PR-01'),'PR-01-007');
 const before=JSON.stringify(state),xp=totalXp(state);
 const guide=getLessonGuide({state:freeze(state),quest:questById['PR-01'],step:stepById['PR-01-001']});
 assert.equal(guide.firstAction,'アプリ切替を押す');
 assert.match(guide.steps[0],/アプリ切替.*メモへ戻る/);
 assert.equal(guide.steps.some(text=>/メールを開き|合言葉をコピー/.test(text)),false);
 assert.deepEqual(getLessonGuide({state:parseSave(before),quest:questById['PR-01']}),guide);
 assert.equal(totalXp(state),xp);assert.equal(JSON.stringify(state),before);
 // The next app card also remains the next action; it does not restart copying.
 state=act(state,{type:'STEP',id:'PR-01-007',value:stepById['PR-01-007'].value});
 assert.equal(getLessonGuide({state,quest:questById['PR-01']}).firstAction,'メモを押す');
});

test('registration and domestic exchange restart at their actual return, paste and profile stages',()=>{
 for(const [id,returnStep,pasteStep,afterAuth]of [
  ['PO-01','P015','P018',null],
  ['DX-01','DX-01-S014','DX-01-S017','DX-01-S019'],
 ]){
  let state=until(accept(id),returnStep);
  const before=JSON.stringify(state),guide=getLessonGuide({state:freeze(state),quest:questById[id],step:stepById[questById[id].stepIds[0]]});
  assert.equal(guide.firstAction,stepById[returnStep].instruction);
  assert.match(guide.steps[0],/アプリ切替/);
  assert.equal(guide.steps.some(text=>/メールを読み|メールを送る/.test(text)),false);
  assert.equal(JSON.stringify(state),before);
  state=until(state,pasteStep);
  const paste=getLessonGuide({state,quest:questById[id]});
  assert.equal(paste.firstAction,stepById[pasteStep].instruction);
  assert.match(paste.steps[0],/指定欄.*貼り付け/);
  if(afterAuth){
   state=until(state,afterAuth);const profile=getLessonGuide({state,quest:questById[id]});
   assert.equal(profile.firstAction,stepById[afterAuth].instruction);
   assert.equal(profile.flow,undefined);assert.match(profile.steps[0],/成人カード/);
  }
 }
});

test('a narration call cannot advance steps or award XP, including after the request finishes',()=>{
 let state=accept('PR-01');
 const initial=JSON.stringify(state),xp=totalXp(state);
 getLessonGuide({state,quest:questById['PR-01']});
 assert.equal(JSON.stringify(state),initial);assert.equal(totalXp(state),xp);
 while(activeStep(state)){
  const step=activeStep(state);state=act(state,{type:'STEP',id:step.id,value:step.value??true});
 }
 const completed=JSON.stringify(state),guide=getLessonGuide({state:freeze(state),quest:questById['PR-01'],step:stepById['PR-01-001']});
 assert.match(guide.firstAction,/終わっています/);assert.equal(guide.flow,undefined);
 assert.equal(JSON.stringify(state),completed);
});

test('financial previews distinguish sending, reservations and lending from completed receipt',()=>{
 const state=freeze(createState());
 for(const id of ['FI-02','CR-03','HY-EXIT']){
  const guide=getLessonGuide({state,quest:questById[id]});
  assert.match(guide.practice,/到着|届いた|受取|照合/);
  assert.match(guide.steps.at(-1),/到着|受取|届いた|照合/);
 }
 const board=getLessonGuide({state,quest:questById['DX-05']});
 assert.match(board.practice,/未約定.*成立していない/);assert.match(board.steps[0],/予約/);
 const lending=getLessonGuide({state,quest:questById['LD-01']});
 assert.match(lending.practice,/元本.*利息.*危険/);
 assert.match(lending.steps[1],/手元.*貸出中/);assert.match(lending.steps.at(-1),/受取/);
 assert.equal(state.questStates['HY-HLP'],undefined);
});
