import test from 'node:test';
import assert from 'node:assert/strict';
import {getFundingView,renderFundingPanel} from '../js/phone-funding.js';
import {steps} from '../js/content-funding.js';
import {initialFundingScenarios,applyFundingStep} from '../js/finance-funding.js';
import {getIdentityReviewView,renderExtensionPanel} from '../js/phone-extension.js';
import {steps as extensionSteps,quests as extensionQuests} from '../js/content-extension.js';
import {initialExtensionScenarios,applyExtensionStep,applyExtensionReview} from '../js/finance-extension.js';

const fresh=()=>({financialScenarios:initialFundingScenarios()});
const step=id=>steps.find(item=>item.id===id);
const scenario=state=>state.financialScenarios['funding-japan'];
const through=(state,id)=>{for(const item of steps){applyFundingStep(state,item,item.value);if(item.id===id)return;}};
const row=(view,key)=>view.rows.find(item=>item.key===key)?.value;
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.textContent='';}
 append(...items){this.children.push(...items);}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(){}
 getContext(){return null;}
}
const doc={createElement:tag=>new Element(tag)};
const all=root=>[root,...root.children.flatMap(child=>all(child))];

test('funding begins unentered and the confirmation reads actual saved inputs, not the correct future plan',()=>{
 const state=fresh(),initial=getFundingView(state,step('FI-01-S009'));
 assert.deepEqual(initial.inputs.map(item=>item.value),['未入力','未入力']);assert.equal(initial.quoteReady,false);assert.match(initial.statusText,/まだ入力/);assert.equal(row(initial,'bankJPY'),200000);assert.equal(row(initial,'depositPendingJPY'),0);
 through(state,'FI-01-S008');let view=getFundingView(state,step('FI-01-S010'));
 assert.deepEqual(view.inputs.map(item=>item.value),['DEMO-JPY-GATE',120000]);assert.equal(view.quoteReady,true);assert.match(view.statusText,/まだ確定/);
 // An input correction must remain visible across JSON save/reload, even when wrong.
 scenario(state).phoneState.formDrafts.funding.depositRecipient='DEMO-JPY-OTHER';scenario(state).phoneState.formDrafts.funding.depositJPY='90000';
 const saved=JSON.parse(JSON.stringify(state)),before=structuredClone(saved);view=getFundingView(saved,step('FI-01-S011'));
 assert.deepEqual(view.inputs.map(item=>item.value),['DEMO-JPY-OTHER','90000']);assert.equal(view.quoteReady,false);assert.equal(row(view,'bankJPY'),200000);assert.equal(row(view,'domesticJPY'),0);assert.deepEqual(saved,before);
});

test('funding views distinguish submitted, processing, settled, and purchased amounts at every transfer',()=>{
 const checks=[
  ['FI-01-S011','FI-01-S012','processing','depositPendingJPY',120000,'domesticJPY',0],
  ['FI-01-S013','FI-01-S015','received','depositPendingJPY',0,'domesticJPY',120000],
  ['FI-01-S022','FI-01-S023','filled','domesticJPY',16000,'domesticMCHI',104],
  ['FI-02-S017','FI-02-S018','processing','withdrawPendingMCHI',103,'walletMCHI',0],
  ['FI-02-S019','FI-02-S021','received','withdrawPendingMCHI',0,'walletMCHI',103],
  ['FI-03-S006','FI-03-S007','processing','swapPendingUSDC',1030,'michiUSDC',0],
  ['FI-03-S007','FI-03-S008','received','swapPendingUSDC',0,'michiUSDC',1030],
  ['FI-03-S014','FI-03-S015','processing','bridgePendingUSDC',1010,'arbitrumUSDC',0],
  ['FI-03-S015','FI-03-S016','received','bridgePendingUSDC',0,'arbitrumUSDC',1010],
  ['FI-03-S021','FI-03-S022','processing','gasPendingETH',0.001,'walletETH',0],
  ['FI-03-S022','FI-03-S023','received','gasPendingETH',0,'walletETH',0.001]
 ];
 for(const [complete,display,status,key,value,other,otherValue]of checks){const state=fresh();through(state,complete);const view=getFundingView(state,step(display));assert.equal(view.status,status,complete);assert.equal(row(view,key),value,complete);assert.equal(row(view,other),otherValue,complete);if(status==='processing')assert.match(view.statusText,/まだ受取先では使えません/);}
 const state=fresh();through(state,'FI-03-S026');const view=getFundingView(state,step('FI-03-S026'));assert.equal(view.status,'transferred');assert.equal(row(view,'arbitrumUSDC'),0);assert.equal(row(view,'walletETH'),0);assert.equal(row(view,'handoffUSDC'),1000);assert.match(view.statusText,/追加配布はありません/);
});

test('withdrawal, swap, bridge and gas confirmation show actual choices separately from fixed quotes',()=>{
 for(const [id,field,bad]of [['FI-02-S012','withdrawNetwork','HoshiNet'],['FI-02-S016','withdrawAddress','DEMO-WALLET-B'],['FI-03-S005','swapQuantity',100],['FI-03-S013','bridgeNetwork','MichiNet'],['FI-03-S020','gasPayment',20]]){
  const state=fresh();through(state,id);scenario(state).phoneState.formDrafts.funding[field]=bad;const before=structuredClone(state),view=getFundingView(state,step(id));
  assert.equal(view.quoteReady,false,id);assert.notEqual(view.inputs.find(item=>item.key===field).value,'未入力');assert.deepEqual(state,before,id);
  const rendered=renderFundingPanel({document:doc,state,step:step(id)});assert.equal(rendered.handlesAction,false);const text=all(rendered.element).map(item=>item.textContent).join(' ');assert.match(text,/今回、入力した内容/);assert.match(text,/確定前の予定/);assert.match(text,/台帳に記録された/);
 }
});

test('all 70 existing funding steps render without replacing generic controls or mutating state',()=>{
 const state=fresh();for(const item of steps){const before=structuredClone(state),panel=renderFundingPanel({document:doc,state,step:item});assert.ok(panel?.element,item.id);assert.equal(panel.handlesAction,false,item.id);assert.equal(all(panel.element).filter(node=>node.tag==='button').length,0,item.id);assert.deepEqual(state,before,item.id);applyFundingStep(state,item,item.value);}
});

test('DX three-point confirmation remains present from opening through checking and submitting',()=>{
 const state={financialScenarios:initialExtensionScenarios()};for(const item of extensionSteps.filter(item=>item.questId==='DX-01'||item.questId==='DX-02')){if(item.id==='DX-02-S015')break;applyExtensionStep(state,item,item.type==='check'?true:item.value);}
 const identity=getIdentityReviewView(state,extensionSteps.find(item=>item.id==='DX-02-S015'));assert.equal(identity.profile.fullName,'朝日 ミナト');assert.deepEqual(identity.pictures.map(item=>item.value),['clear','clear','clear-centered']);
 for(const id of ['DX-02-S015','DX-02-S016','DX-02-S017']){const before=structuredClone(state),item=extensionSteps.find(item=>item.id===id),panel=renderExtensionPanel({document:doc,state,step:item,quest:{id:'DX-02'}});assert.equal(all(panel.element).filter(node=>node.tag==='canvas').length,3,id);assert.deepEqual(all(panel.element).filter(node=>node.tag==='figcaption').map(node=>node.textContent),['表面','裏面','画面内人物']);assert.deepEqual(state,before);}
});

test('DX independent review reads its own applicant and picture selections',()=>{
 const state={financialScenarios:initialExtensionScenarios()},quest=extensionQuests.find(item=>item.id==='DX-02'),review=structuredClone(quest.reviewVariant.initialSnapshot),actions=quest.reviewVariant.tasks[0].actions;
 for(const item of actions){if(item.id.endsWith('A015'))break;applyExtensionReview(review,item,item.type==='check'?true:item.value);}
 const before=structuredClone(state);review.scenario.phoneState.formDrafts.idBack='blurred';
 for(const suffix of ['A015','A016','A017']){const item=actions.find(item=>item.id.endsWith(suffix)),view=getIdentityReviewView(state,item,{reviewSnapshot:review}),panel=renderExtensionPanel({document:doc,state,step:item,quest,reviewSnapshot:review});assert.equal(view.profile.fullName,'木立 アオイ');assert.equal(view.pictures[1].value,'blurred');assert.equal(view.pictures[1].selection,'ぼやけたまま');assert.equal(all(panel.element).filter(node=>node.tag==='canvas').length,3);const text=all(panel.element).map(node=>node.textContent).join(' ');assert.match(text,/木立 アオイ/);assert.doesNotMatch(text,/朝日 ミナト/);}
 assert.deepEqual(state,before);
});
