import test from 'node:test';
import assert from 'node:assert/strict';
import * as crypto from '../js/content-crypto.js';
import * as funding from '../js/content-funding.js';
import * as extension from '../js/content-extension.js';
import {initialScenarios,applyFinancialStep} from '../js/finance.js';
import {initialExtensionScenarios,applyExtensionStep} from '../js/finance-extension.js';

const step=(list,id)=>list.find(s=>s.id===id);
const copy=s=>[s.instruction,s.label,...(s.details??[])].join('\n');
const value=s=>s.value??s.choices?.[0]?.value;
const fresh=()=>({financialScenarios:initialScenarios(),phoneState:{formDrafts:{}}});
function through(state,questId,lastId){
 for(const s of crypto.steps.filter(s=>s.questId===questId)){
  applyFinancialStep(state,s,value(s));
  if(s.id===lastId)return;
 }
}

test('all crypto-course inputs name an explicit submit action without exposing behavior seeds',()=>{
 const main=[...crypto.steps,...funding.steps,...extension.steps];
 assert.equal(main.length,521);
 const review=crypto.quests.flatMap(q=>q.reviewVariant.tasks.flatMap(t=>t.actions));
 const boss=crypto.bosses.flatMap(b=>[b.tasks,...Object.values(b.routeTasks??{})].flatMap(ts=>ts.flatMap(t=>t.actions)));
 for(const s of [...main,...review,...boss].filter(s=>s.type==='input')){
  assert.equal(s.label,'入力した内容で進む',s.id);
  assert.match(s.instruction,/入力|貼り付け/,s.id);
 }
 for(const s of main)assert.doesNotMatch(copy(s),/snapshot|出口route|別network|oracle100|validator一覧|fundingの小練習/,s.id);
 assert.equal(step(crypto.steps,'HY-STAKE-S013').type,'select');
 assert.equal(step(crypto.steps,'HY-EXIT-S026').type,'confirm');
 assert.equal(step(crypto.steps,'CR-03-S024').screenId,'CR-03:送信確認');
});

test('the payer name and destination are compared with their own sources, and estimates stay estimates',()=>{
 const name=step(funding.steps,'FI-01-S010');
 assert.match(name.instruction,/振込人名義を申込者の名前と/);
 assert.match(name.instruction,/入金先を受取カードと/);
 assert.equal(name.panel['振込人名義（申し込んだ人の名前）'],'朝日 ミナト（架空の成人）');
 assert.match(step(funding.steps,'FI-03-S012').instruction,/みち道のMock USDC1,030を、Arbitrumへ移す/);
 assert.match(step(funding.steps,'FI-03-S012').panel.到着予定,/DEMO-WALLET-A.*1,010 Mock USDC/);
 assert.match(funding.glossary.find(g=>g.id==='funding.pending').description,/届ける処理がまだ終わっていない/);
 assert.match(step(funding.steps,'FI-03-S001').panel.交換後のネットワーク,/交換が終わった後も/);
});

test('deposit copy distinguishes the estimate, sending and completed receipt at their actual boundaries',()=>{
 const state=fresh();
 through(state,'CR-02','CR-02-S025');
 through(state,'CR-03','CR-03-S024');
 assert.match(copy(step(crypto.steps,'CR-03-S024')),/受取予定99/);
 assert.match(copy(step(crypto.steps,'CR-03-S024')),/練習ウォレットからHyperCore/);
 assert.match(copy(step(crypto.steps,'CR-03-S024')),/別のETH残高/);
 assert.equal(state.financialScenarios.journey.accounts.walletUSDC,1000);
 applyFinancialStep(state,step(crypto.steps,'CR-03-S025'));
 assert.deepEqual([state.financialScenarios.journey.accounts.walletUSDC,state.financialScenarios.journey.accounts.incomingUSDC,state.financialScenarios.journey.accounts.availableUSDC],[900,99,0]);
 assert.match(step(crypto.steps,'CR-03-S025').result,/処理はまだ終わっていません/);
 applyFinancialStep(state,step(crypto.steps,'CR-03-S026'));
 assert.equal(state.financialScenarios.journey.accounts.availableUSDC,99);
 assert.match(step(crypto.steps,'CR-03-S030').instruction,/受け取った99 Mock USDC/);
});

test('HLP receipt and staking return copy keep their fixed times and destinations distinct',()=>{
 const state=fresh();
 through(state,'HY-HLP','HY-HLP-S023');
 const hlp=state.financialScenarios.hlp.accounts;
 assert.equal(hlp.availableUSDC,700);
 assert.equal(hlp.hlpValue,291);
 assert.match(step(crypto.steps,'HY-HLP-S023').label,/受取予定291/);
 applyFinancialStep(state,step(crypto.steps,'HY-HLP-S024'));
 assert.equal(hlp.availableUSDC,991);
 assert.equal(hlp.hlpValue,0);
 assert.match(step(crypto.steps,'HY-HLP-S027').instruction,/受け取った291/);
 assert.match(step(crypto.steps,'HY-STAKE-S031').instruction,/ステーキング残高から現物残高へ戻す申請/);
 assert.match(step(crypto.steps,'HY-STAKE-S033').instruction,/申請から.*7日/);
 assert.match(crypto.glossary.find(g=>g.term==='評価額').description,/数量.*1枚.*掛けた/);
 assert.match(copy(step(crypto.steps,'HY-PERP-S042')),/ロング側が払い、ショート側が受け取/);
});

test('registration requests a service mail, while main and review use their own adult profile',()=>{
 const register=step(extension.steps,'DX-01-S009');
 const state={phoneState:{}};
 extension.applyContentEffect(state,register);
 assert.equal(register.extensionAction,'account-register');
 assert.match(register.instruction,/メールアドレス.*登録/);
 assert.match(register.result,/あかつき取引所から.*確認コードが届き/);
 assert.match(register.result,/まだメール認証は終わっていません/);
 assert.equal(state.phoneState.mailById['domestic-registration'].sender,'あかつき教材窓口');
 assert.equal(state.phoneState.mailById['domestic-registration'].code,extension.extensionProfile.verificationCode);
 const review=extension.quests.find(q=>q.id==='DX-02').reviewVariant.tasks[0].actions;
 assert.match(review.find(a=>a.field==='idType').instruction,/木立アオイ/);
 assert.doesNotMatch(review.map(copy).join('\n'),/朝日ミナト|朝日 ミナト/);
 assert.match(step(extension.steps,'DX-02-S022').instruction,/あかつき取引所が利用を認めた/);
});

test('lending receives funds only after the notice, and the final exit action saves a report for Luka',()=>{
 const state={financialScenarios:initialExtensionScenarios(),phoneState:{formDrafts:{}}};
 for(const s of extension.steps.filter(s=>s.questId==='LD-01')){
  applyExtensionStep(state,s,value(s));
  if(s.id==='LD-01-S020')break;
 }
 const lending=state.financialScenarios['lending-lab'];
 assert.equal(lending.accounts.availableUSDC,900);
 assert.equal(lending.data.status,'arrived');
 const receive=step(extension.steps,'LD-01-S021');
 assert.match(receive.instruction,/明細を確認し、元本と利息を受け取る/);
 applyExtensionStep(state,receive);
 assert.equal(state.financialScenarios['lending-lab'].accounts.availableUSDC,1000.986301);
 assert.match(step(extension.steps,'LD-01-S009').instruction,/貸したMock USDC.*返してもらえない/);
 const final=step(crypto.steps,'HY-EXIT-S026');
 assert.match(final.instruction,/記録を保存.*灯台守ルカ.*準備/);
 assert.doesNotMatch(copy(final),/村長|町へ戻り/);
 assert.deepEqual(crypto.routeReceipts,{journey:98,spot:979,hlp:990,stake:807,perp:989});
});

test('results describe completed operations in sentences, while inputs do not announce a transfer or reveal values',()=>{
 for(const s of [...crypto.steps,...funding.steps]){
  assert.match(s.result,/。$/,s.id);
  assert.match(s.result,/ました|ません|です|ます|ましょう/,s.id);
  assert.doesNotMatch(s.result,/この操作を練習の記録に保存しました|この一つの操作を記録しました|(?:押す|開く|選ぶ|入力する|確認する|照合する|確定する)。/,s.id);
  if(s.type==='focus')assert.match(s.result,/欄を開きました/,s.id);
  if(s.type==='input'){
   assert.match(s.result,/入力した内容を保存しました/,s.id);
   assert.match(s.result,/まだ行っていません/,s.id);
   assert.doesNotMatch(s.result,/\d|届きました|購入しました|支払いました/,s.id);
  }
 }
 assert.match(step(crypto.steps,'CR-01-S001').result,/資産の地図.*アプリを開きました/);
 assert.match(step(crypto.steps,'HY-HLP-S010').result,/HLPへ預けました.*分かれました/);
 assert.match(step(crypto.steps,'HY-HLP-S022').result,/予定額.*まだ引き出していません/);
 assert.match(step(crypto.steps,'HY-EXIT-S018').result,/出金申請.*まだ終わっていません/);
 assert.match(step(crypto.steps,'HY-EXIT-S020').result,/処理が終わり.*届きました/);
});

test('saving the asset-map exercise does not claim to move to town or finish the client report',()=>{
 const final=step(crypto.steps,'CR-01-S018');
 assert.equal(final.type,'confirm');
 assert.equal(final.effect,'CR-01-S018');
 assert.match(final.label,/記録を保存$/);
 assert.doesNotMatch([final.instruction,final.label,final.result].join('\n'),/町へ戻る|町へ戻りました|報告しました/);
 assert.match(final.result,/練習を終えました.*町への移動.*報告はこの後/);
 assert.equal(final.screenId,'CR-01:確認メモ');
 assert.equal(final.context,'確認メモ');
});

test('the staking reward result belongs to the time advance, and opening its statement does not add it again',()=>{
 const state=fresh();
 through(state,'HY-STAKE','HY-STAKE-S019');
 assert.equal(state.financialScenarios.stake.accounts.rewardHYPE,0);
 applyFinancialStep(state,step(crypto.steps,'HY-STAKE-S020'));
 assert.equal(state.financialScenarios.stake.accounts.rewardHYPE,0.1);
 assert.match(step(crypto.steps,'HY-STAKE-S020').result,/報酬が.*加わりました/);
 const before=structuredClone(state.financialScenarios.stake.accounts);
 applyFinancialStep(state,step(crypto.steps,'HY-STAKE-S021'));
 assert.deepEqual(state.financialScenarios.stake.accounts,before);
 assert.match(step(crypto.steps,'HY-STAKE-S021').result,/加わった.*明細を開きました/);
 assert.match(step(funding.steps,'FI-03-S026').result,/同じ資金をもう一度足していません/);
 assert.doesNotMatch(copy(step(funding.steps,'FI-03-S026')),/移管|証跡/);
});

test('result text cannot reveal either mail answer, and identity copy compares information and a face with the applicant',()=>{
 const main=[...crypto.steps,...funding.steps,...extension.steps];
 const review=extension.quests.flatMap(q=>q.reviewVariant.tasks.flatMap(t=>t.actions));
 const resultText=[...main,...review].map(s=>s.result??'').join('\n');
 for(const profile of [extension.extensionProfile,extension.extensionReviewProfile]){
  assert.ok(!resultText.includes(profile.verificationCode));
  assert.ok(!resultText.includes(profile.password));
 }
 assert.match(step(extension.steps,'DX-02-S002').instruction,/書類の情報を申込内容と比べ/);
 const comparison=step(extension.steps,'DX-02-S016');
 assert.match(comparison.instruction,/申込者・書類・画面内人物/);
 assert.match(comparison.instruction,/書類の氏名・住所.*画面内の顔.*本人のもの/);
 assert.doesNotMatch(comparison.instruction,/書類.*同じ人/);
 assert.equal(comparison.type,'check');
 assert.equal(comparison.effect,'DX-02-S016');
});
