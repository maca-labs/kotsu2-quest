import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,questById,stepById,points,extension} from '../js/content.js';
import {createState,dispatch,activeStep,totalXp,parseSave} from '../js/engine.js';
import {getAdventure,questBrief,getAdventureChronicle,getTavernAdvice} from '../js/adventure.js';
import {getStoryGuide} from '../js/story-guide.js';
import {getLessonGuide} from '../js/lesson-guide.js';

const at=1_000_000;
const act=(state,command)=>dispatch(state,command,at);
function accept(id){
 let state=act(createState(),{type:'START'});
 state=act(state,{type:'NPC',chapterId:questById[id].chapterId,index:0});
 return act(state,{type:'ACCEPT',id,timed:false});
}
function until(state,id){
 for(let n=0;activeStep(state)?.id!==id;n++){
  const step=activeStep(state);assert.ok(step,`Missing ${id}`);assert.ok(n<100);
  state=act(state,{type:'STEP',id:step.id,value:step.type==='check'?true:step.value??true});
 }
 return state;
}
function progress(id,count,route='journey'){
 const state=createState(),quest=questById[id],key=id==='HY-EXIT'?`${id}:${route}`:id;
 state.currentChapter=quest.chapterId;state.selectedRoute=route;state.activeQuestKey=key;
 state.questStates[key]={questId:id,routeId:route,index:count,completed:count===quest.stepIds.length,completedSteps:quest.stepIds.slice(0,count)};
 return state;
}
function freeze(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);for(const child of Object.values(value))freeze(child);
 }
 return value;
}

test('the prologue copies a phrase into a memo and reports it to Mina; the notebook is received',()=>{
 const quest=questById['PR-01'],brief=questBrief(quest),intro=getLessonGuide({state:createState(),quest});
 assert.match(brief.incident,/合言葉.*わたしのメモ.*メール/);
 assert.match(brief.goal,/メールの合言葉.*メモ.*保存.*ミナ.*知らせ/);
 assert.match(intro.flow.destinationLabel,/メモ.*メールの合言葉.*欄/);
 let state=until(accept('PR-01'),'PR-01-012');
 const before=JSON.stringify(state),guide=getLessonGuide({state:freeze(state),quest});
 assert.match(guide.steps.join(' '),/ミナ.*合言葉.*保存.*受け取る旅人の手帳/);
 assert.doesNotMatch(guide.steps.join(' '),/手帳.*届け|掲示板.*入力/);
 assert.equal(JSON.stringify(state),before);
 state=act(state,{type:'STEP',id:'PR-01-012',value:stepById['PR-01-012'].value??true});
 assert.ok(state.inventory.includes('traveler-notebook'));
 assert.match(getStoryGuide(state).instruction,/ミナ.*結果を話/);
 assert.match(getLessonGuide({state,quest}).firstAction,/ミナ.*結果を知らせ/);
 assert.match(getAdventure(state,quest).nextGoal,/ミナ.*確かめた結果を知らせ/);
});

test('registration and late points are specific service tasks, rather than broken post or delayed parcels',()=>{
 const register=questBrief(questById['PO-01']),late=questBrief(questById['PO-05']);
 assert.match(register.incident,/ハル.*コツコツモール.*会員登録/);
 assert.match(register.goal,/メール.*確認コード.*登録画面.*認証/);
 assert.match(late.incident,/ミナ.*ポイント.*予定日.*判定待ち/);
 assert.match(late.goal,/注文番号.*問い合わせ.*ポイント.*承認結果/);
 const done=getAdventure(progress('PO-01',19),questById['PO-01']);
 assert.match(done.latestReaction.text,/メール認証.*登録が終わ/);
});

test('bank identity compares the applicant with records and transfer goes to one other account',()=>{
 const identity=questBrief(questById['BK-02']),transfer=questBrief(questById['TR-01']);
 assert.match(identity.incident,/スイ.*申込書.*書類の情報.*人物.*申し込んだ本人/);
 assert.match(identity.goal,/カード.*人物.*通知/);
 assert.match(transfer.goal,/自分名義の別口座.*受取側.*金額/);
 assert.doesNotMatch(transfer.goal,/二つの口座へ/);
 const lesson=getLessonGuide({state:createState(),quest:questById['FI-01']});
 assert.match(lesson.steps[1],/入金先.*受取カード.*振込人名義.*申込者/);
});

test('selling a card starts with inspection and listing, and only then packaging and receipt',()=>{
 const quest=questById['TC-02'],before=getAdventure(progress('TC-02',0),quest);
 assert.match(before.latestReaction.text,/シノ.*出品から入金.*手順/);
 assert.doesNotMatch(before.latestReaction.text,/売れた.*荷物|発送.*止まって/);
 assert.match(questBrief(quest).goal,/出品.*売れたらカードを梱包.*相手の受取.*入金/);
 const listed=getAdventure(progress('TC-02',22),quest),shipped=getAdventure(progress('TC-02',28),quest);
 assert.match(listed.latestReaction.text,/出品.*売れた印とはまだ別/);
 assert.match(shipped.latestReaction.text,/カード.*発送.*相手の受取.*待/);
 assert.equal(listed.stages.find(stage=>stage.endIndex===28).completed,false);
});

test('the exchange sends the confirmation mail after the player registers an address',()=>{
 const quest=questById['DX-01'],state=until(accept('DX-01'),'DX-01-S009');
 const before=JSON.stringify(state),guide=getLessonGuide({state:freeze(state),quest}),reaction=getAdventure(state,quest);
 assert.match(guide.steps[0],/メールアドレスを登録.*取引所から確認メールを受け取/);
 assert.match(reaction.latestReaction.text,/メールアドレスを登録.*取引所から届く確認メール/);
 assert.doesNotMatch(reaction.latestReaction.text,/確認メールを届け|確認メールを送/);
 assert.equal(state.phoneState.mailById['domestic-registration'],undefined);
 for(const secret of [extension.extensionProfile.verificationCode,points.practiceProfile.introPhrase]){
  assert.equal(JSON.stringify(guide).includes(secret),false);
 }
 assert.equal(JSON.stringify(state),before);
 const mailed=act(state,{type:'STEP',id:'DX-01-S009',value:true});
 assert.ok(mailed.phoneState.mailById['domestic-registration']);
 assert.equal(mailed.financialScenarios['domestic-account'].data.emailVerified,false);
 const returning=until(mailed,'DX-01-S014'),resume=getLessonGuide({state:returning,quest});
 assert.match(resume.steps[0],/アプリ切替.*申込画面へ戻る/);
 assert.doesNotMatch(resume.steps.join(' '),/確認メールを送|確認メールを受け取/);
});

test('funding previews preserve the independent already-open practice account and name each asset move',()=>{
 const state=createState(),before=JSON.stringify(state);
 const funding=getLessonGuide({state,quest:questById['FI-01']}),bridge=getLessonGuide({state,quest:questById['FI-03']});
 assert.match(funding.practice,/こみち交換所.*申込と本人確認を終えた設定.*口座づくり.*別の財布/);
 assert.match(bridge.steps[0],/教材コイン.*教材USDC.*交換/);
 assert.match(bridge.steps[1],/教材USDC.*Arbitrumへ移す/);
 assert.match(bridge.steps[2],/処理費用を払う.*教材ETH/);
 assert.equal(state.questStates['DX-01'],undefined);assert.equal(state.questStates['DX-02'],undefined);
 assert.equal(JSON.stringify(state),before);
 const transfer=questBrief(questById['CR-03']);
 assert.match(transfer.incident,/ルカ.*送金画面.*資産.*ネットワーク.*宛先.*受取カード/);
 assert.match(transfer.goal,/受取カード.*ハイリキに届いた数量.*明細/);
});

test('HLP, staking and perpetual futures name funds, HYPE and positions alongside the imagery',()=>{
 const hlp=questBrief(questById['HY-HLP']),stake=questBrief(questById['HY-STAKE']),perp=questById['HY-PERP'];
 assert.match(hlp.incident,/ソラ.*HLPに預けた資金.*引き出/);
 assert.match(hlp.goal,/手元の資金.*HLPに預けた分.*最後に預けた時/);
 assert.match(stake.goal,/HYPEの委任を解除.*待機.*HYPEが現物残高.*明細/);
 assert.match(questBrief(perp).incident,/ソラ.*証拠金.*倍率.*取引量/);
 assert.match(getAdventure(progress(perp.id,12),perp).latestReaction.text,/証拠金100.*取引量.*価格.*損益/);
 assert.match(getAdventure(progress(perp.id,26),perp).latestReaction.text,/建玉の残量がゼロ.*いかり/);
});

test('each exit route reports the receipt result to Luka and keeps other labs unstudied',()=>{
 const quest=questById['HY-EXIT'];
 for(const route of ['journey','spot','hlp','stake','perp']){
  const state=progress('HY-EXIT',26,route);
  state.journal.push({command:{type:'STEP',id:'HY-EXIT-S026'},at});
  const before=JSON.stringify(state),xp=totalXp(state);
  freeze(state);
  const adventure=getAdventure(state,quest),story=getStoryGuide(state),lesson=getLessonGuide({state,quest});
  assert.match(adventure.stages.at(-1).title,/受取.*記録/);
  assert.match(adventure.latestReaction.text,/財布への到着.*ルカに結果/);
  assert.match(story.instruction,/ルカ.*結果を話/);
  assert.match(lesson.firstAction,/ルカ.*結果を知らせ/);
  assert.doesNotMatch(JSON.stringify({adventure,story,lesson}),/村長.*明細/);
  assert.equal(story.recordKey,`HY-EXIT:${route}`);assert.equal(story.routeId,route);
  for(const id of ['HY-SPOT','HY-HLP','HY-STAKE','HY-PERP'])assert.equal(state.questStates[id],undefined);
  assert.equal(totalXp(state),xp);assert.equal(JSON.stringify(state),before);
 }
});

test('next-operation text follows the saved current step while milestone names and completed evidence stay separate',()=>{
 for(const quest of quests){
  const count=Math.min(7,quest.stepIds.length-1),state=progress(quest.id,count),before=JSON.stringify(state);
  const adventure=getAdventure(freeze(state),quest);
  assert.equal(adventure.nextGoal,stepById[quest.stepIds[count]].instruction,quest.id);
  assert.equal(adventure.progress,count,quest.id);
  getLessonGuide({state,quest});getAdventureChronicle(state);getTavernAdvice(state,quest,stepById[quest.stepIds[count]]);
  assert.equal(JSON.stringify(state),before,quest.id);
 }
 const quest=questById['LV-01'],done=getAdventure(progress('LV-01',22),quest);
 assert.match(questBrief(quest).incident,/ロング.*ショート.*倍率.*損益/);
 assert.match(done.latestReaction.text,/別条件の確認課題.*変えて.*比べられる/);
 assert.doesNotMatch(done.latestReaction.text,/違いを比べた|比較できた/);
});

test('reading Japanese story guidance preserves real saved progress, assets, XP and rewards on reload',()=>{
 const state=until(accept('DX-01'),'DX-01-S019'),saved=JSON.stringify(state),restored=parseSave(saved);
 const quest=questById['DX-01'];
 const expected={adventure:getAdventure(state,quest),story:getStoryGuide(state),lesson:getLessonGuide({state,quest})};
 assert.deepEqual({adventure:getAdventure(restored,quest),story:getStoryGuide(restored),lesson:getLessonGuide({state:restored,quest})},expected);
 assert.equal(JSON.stringify(state),saved);assert.equal(JSON.stringify(restored),saved);
 assert.equal(restored.financialScenarios['domestic-account'].data.emailVerified,true);
 assert.equal(restored.questStates['DX-02'],undefined);
});
