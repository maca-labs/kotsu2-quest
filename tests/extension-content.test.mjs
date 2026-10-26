import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,steps,extensionProfile,extensionReviewProfile} from '../js/content-extension.js';
import {initialExtensionScenarios,applyExtensionStep,applyExtensionReview} from '../js/finance-extension.js';
import {renderExtensionPanel} from '../js/phone-extension.js';
import * as points from '../js/content-points.js';

const step=id=>steps.find(s=>s.id===id);
const fixture=()=>({financialScenarios:initialExtensionScenarios(),phoneState:{mailById:{},clipboard:''}});
function documentFixture(){
 const make=tag=>({tagName:tag,children:[],attributes:{},listeners:{},textContent:'',className:'',append(...children){this.children.push(...children);},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;},getContext(){return null;}});
 return {createElement:make};
}
function all(n){return [n,...(n.children??[]).flatMap(all)];}
function text(n){return all(n).map(x=>x.textContent??'').join('\n');}
const button=(n,label)=>all(n).find(x=>x.tagName==='button'&&x.textContent===label);

test('the seven new courses retain individual submit, pending, cancellation, fill and receipt operations',()=>{
 assert.deepEqual(quests.map(q=>[q.id,q.stepIds.length]),[['DX-01',33],['DX-02',23],['DX-03',21],['DX-04',21],['DX-05',34],['LD-01',22],['LV-01',22]]);
 assert.equal(new Set(steps.map(s=>s.id)).size,176);
 for(const q of quests){assert.equal(q.extension,true);assert.equal(q.optionalCourse,true);assert.equal(q.reward,40);assert.equal(q.completionRule,'all-steps');assert.ok(q.stepIds.length>20);}
 assert.equal(step('DX-05-S011').extensionAction,'limit-buy-place');
 assert.equal(step('DX-05-S014').extensionAction,'limit-buy-cancel');
 assert.equal(step('DX-05-S017').extensionAction,'limit-buy-replace');
 assert.equal(step('DX-05-S018').extensionAction,'limit-buy-fill');
 assert.equal(step('DX-05-S029').extensionAction,'limit-sell-place');
 assert.equal(step('DX-05-S032').extensionAction,'limit-sell-fill');
 assert.equal(step('LD-01-S017').extensionAction,'lending-request');
 assert.equal(step('LD-01-S019').extensionAction,'lending-settle');
 assert.equal(step('LD-01-S021').extensionAction,'lending-receive');
});

test('every course has a changed-condition independent action review without reward',()=>{
 for(const q of quests){const r=q.reviewVariant;assert.equal(r.stepReward,0);assert.equal(r.questReward,0);assert.equal(r.independentSnapshot,true);assert.ok(r.tasks[0].actions.length>1);assert.ok(r.tasks[0].objectiveEvidence.every(e=>e.domain===q.domain));}
 assert.notEqual(extensionReviewProfile.verificationCode,extensionProfile.verificationCode);
 assert.notEqual(extensionReviewProfile.fullName,extensionProfile.fullName);
 assert.equal(quests.find(q=>q.id==='DX-05').reviewVariant.initialSnapshot.exerciseQuantity,5);
 assert.equal(quests.find(q=>q.id==='LD-01').reviewVariant.initialSnapshot.lendingAmount,200);
 const choose=steps.filter(s=>s.questId==='LV-01'&&s.acceptAnyChoice);
 assert.deepEqual(choose.map(s=>s.field),['side','leverage','markPrice']);
 assert.deepEqual(choose[1].choices.map(c=>c.value),['1','2','5']);
});

test('opening the account and memo does not reveal an unread mail answer',()=>{
 const state=fixture(),doc=documentFixture();
 const opening=renderExtensionPanel({document:doc,state,step:step('DX-01-S001'),quest:quests[0]});
 assert.ok(!text(opening.element).includes(extensionProfile.verificationCode));
 const inbox=renderExtensionPanel({document:doc,state,step:step('DX-01-S012'),quest:quests[0]});
 assert.ok(!text(inbox.element).includes(extensionProfile.verificationCode));
 const mailState=structuredClone(state);mailState.phoneState.mailById['domestic-registration']={read:true};
 const opened=renderExtensionPanel({document:doc,state:mailState,step:step('DX-01-S013'),quest:quests[0]});
 assert.ok(text(opened.element).includes(extensionProfile.verificationCode));
 for(const id of ['PR-01-001','PR-01-002','P001','P002','P008']){
  const s=points.steps.find(s=>s.id===id);assert.ok(!s.details.join(' ').includes(points.practiceProfile.introPhrase));assert.ok(!s.details.join(' ').includes(points.practiceProfile.registrationCode));
 }
});

test('review mail uses the separate code and clipboard',()=>{
 const state=fixture(),doc=documentFixture(),q=quests[0],rs=structuredClone(q.reviewVariant.initialSnapshot);rs.mailOpened=true;rs.clipboard=extensionReviewProfile.verificationCode;
 const s=q.reviewVariant.tasks[0].actions.find(a=>a.phoneEffect==='copy-code');
 const panel=renderExtensionPanel({document:doc,state,step:s,quest:q,reviewSnapshot:rs});
 assert.ok(text(panel.element).includes(extensionReviewProfile.verificationCode));
 assert.ok(!text(panel.element).includes(extensionProfile.verificationCode));
 const paste=q.reviewVariant.tasks[0].actions.find(a=>a.type==='input'&&a.field==='verificationCode');let sent;
 const pastePanel=renderExtensionPanel({document:doc,state,step:paste,quest:q,reviewSnapshot:rs,onAction:v=>sent=v});
 button(pastePanel.element,'確認コードを貼り付け').listeners.click();assert.equal(sent,extensionReviewProfile.verificationCode);
});

test('venue previews use financial view prices and cannot submit an order',()=>{
 const state=fixture(),before=structuredClone(state),doc=documentFixture(),q=quests.find(q=>q.id==='DX-03');let actions=[],navigations=[];
 const selectPanel=renderExtensionPanel({document:doc,state,step:step('DX-03-S002'),quest:q,onAction:v=>actions.push(v),onNavigate:v=>navigations.push(v)});
 button(selectPanel.element,'板取引所').listeners.click();assert.deepEqual(actions,[]);assert.deepEqual(navigations,['board']);
 button(selectPanel.element,'販売所').listeners.click();assert.deepEqual(actions,['dealer']);
 const preview=renderExtensionPanel({document:doc,state,step:step('DX-03-S012'),quest:q,previewVenue:'board',onAction:v=>actions.push(v),onNavigate:v=>navigations.push(v)});
 assert.equal(preview.handlesAction,true);assert.ok(text(preview.element).includes('見学中'));assert.ok(text(preview.element).includes('100'));
 assert.ok(!button(preview.element,'販売所で購入を確定'));
 button(preview.element,'元の作業画面へ戻る').listeners.click();assert.equal(navigations.at(-1),null);assert.deepEqual(state,before);
});

test('the limit screen distinguishes reserved money, cancelled orders and filled coins',()=>{
 const state=fixture(),doc=documentFixture(),q=quests.find(q=>q.id==='DX-05');
 for(const s of steps.filter(s=>s.questId==='DX-05')){applyExtensionStep(state,s,s.value);if(s.id==='DX-05-S011')break;}
 let panel=renderExtensionPanel({document:doc,state,step:step('DX-05-S012'),quest:q});
 assert.ok(text(panel.element).includes('未約定・まだ売買していません'));assert.ok(text(panel.element).includes('950'));
 applyExtensionStep(state,step('DX-05-S014'));
 panel=renderExtensionPanel({document:doc,state,step:step('DX-05-S015'),quest:q});assert.ok(text(panel.element).includes('取消済み'));assert.ok(text(panel.element).includes('100,000'));
});

test('the initial app switcher is explicit and does not pre-open the destination',()=>{
 for(const [from,to,target]of [['PR-01-007','PR-01-008','memo'],['P015','P016','browser']]){
  assert.equal(points.steps.find(s=>s.id===from).appId,'mail');assert.equal(points.steps.find(s=>s.id===from).navigationAction,'switcher');
  const selection=points.steps.find(s=>s.id===to);assert.equal(selection.displayAppId,'switcher');assert.equal(selection.phoneScreen,'switcher');assert.equal(selection.openAppId,target);
 }
});

test('the board exposes opposing order prices and waiting quantities in both study and preview',()=>{
 const state=fixture(),doc=documentFixture(),q=quests.find(q=>q.id==='DX-03');
 applyExtensionStep(state,step('DX-03-S004'),'board');
 const board=renderExtensionPanel({document:doc,state,step:step('DX-03-S005'),quest:q});
 const tables=all(board.element).filter(n=>n.tagName==='table');assert.equal(tables.length,2);
 assert.ok(text(tables[0]).includes('売り注文'));assert.ok(text(tables[1]).includes('買い注文'));
 assert.ok(text(tables[0]).includes('待機枚数'));assert.ok(text(tables[0]).includes('100'));assert.ok(text(tables[0]).includes('10'));
 assert.ok(text(tables[1]).includes('99'));assert.ok(text(tables[1]).includes('15'));
 assert.equal(all(tables[0]).filter(n=>n.tagName==='tr').length,4);
 applyExtensionStep(state,step('DX-03-S006'),'dealer');
 const preview=renderExtensionPanel({document:doc,state,step:step('DX-03-S012'),quest:q,previewVenue:'board'});
 assert.equal(preview.handlesAction,true);assert.equal(all(preview.element).filter(n=>n.tagName==='table').length,2);
});

test('closed leverage separates current zero quantity from the historical filled quantity',()=>{
 const state=fixture(),doc=documentFixture(),q=quests.find(q=>q.id==='LV-01');
 for(const s of steps.filter(s=>s.questId===q.id))applyExtensionStep(state,s,s.value);
 const panel=renderExtensionPanel({document:doc,state,step:step('LV-01-S022'),quest:q});
 const current=all(panel.element).find(n=>n.tagName==='section'&&n.children?.some(c=>c.tagName==='h4'&&c.textContent==='現在の建玉 — まだ閉じていない取引'));
 assert.ok(text(current).includes('残量はゼロ'));assert.deepEqual(all(current).filter(n=>n.tagName==='dd').map(n=>n.textContent),['0','0','0']);
 const past=all(panel.element).find(n=>n.tagName==='section'&&n.children?.some(c=>c.tagName==='h4'&&c.textContent==='決済した取引の履歴 — 過去の記録'));
 const pastValues=all(past).filter(n=>n.tagName==='dd').map(n=>n.textContent);
 assert.deepEqual(pastValues.slice(0,5),['ロング（買い）','2倍','100','95','2']);assert.ok(pastValues.includes('-10'));
 const rs=structuredClone(q.reviewVariant.initialSnapshot);for(const a of q.reviewVariant.tasks[0].actions)applyExtensionReview(rs,a,a.value);
 const same=renderExtensionPanel({document:doc,state,step:q.reviewVariant.tasks[0].actions.at(-1),quest:q,reviewSnapshot:rs});
 assert.equal(all(same.element).find(n=>n.className==='extension-demo').textContent,'方向と倍率の復習');
 const changed=structuredClone(q.reviewVariant.initialSnapshot);for(const a of q.reviewVariant.tasks[0].actions)applyExtensionReview(changed,a,a.field==='side'?'short':a.value);
 const other=renderExtensionPanel({document:doc,state,step:q.reviewVariant.tasks[0].actions.at(-1),quest:q,reviewSnapshot:changed});
 assert.equal(all(other.element).find(n=>n.className==='extension-demo').textContent,'別条件の確認');
});
