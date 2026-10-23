import test from 'node:test';
import assert from 'node:assert/strict';
import {getPhoneGuideView,renderPhoneGuide} from '../js/phone-guide.js';
import {createState,dispatch,activeStep} from '../js/engine.js';
import {questById} from '../js/content.js';
import {renderExtensionPanel} from '../js/phone-extension.js';
import {applyExtensionReview} from '../js/finance-extension.js';

class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.textContent='';this.events={};}
 append(...items){this.children.push(...items);}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(name,fn){this.events[name]=fn;}
}
const doc={createElement:tag=>new Element(tag)};
const all=root=>[root,...root.children.flatMap(child=>all(child))];
const text=root=>all(root).map(node=>node.textContent).join(' ');
const now=1792700000000;
const accept=(state,id)=>{state=dispatch(state,{type:'CHAPTER',id:questById[id].chapterId},now);state=dispatch(state,{type:'NPC',index:0},now);return dispatch(state,{type:'ACCEPT',id,timed:false},now);};
const act=state=>{const step=activeStep(state);return dispatch(state,{type:'STEP',id:step.id,value:step.type==='check'?true:step.value},now);};
const through=(state,last)=>{while(activeStep(state)){const id=activeStep(state).id;state=act(state);if(id===last)return state;}throw Error(`Checkpoint not reached: ${last}`);};

test('copy display requires this mail read, its actual copy step, and matching current clipboard',()=>{
 const state=createState(),quest=questById['PR-01'],step={id:'PR-01-006',questId:'PR-01'};
 state.phoneState.clipboard='一歩ずつ';state.questStates['PR-01']={questId:'PR-01',completedSteps:['PR-01-006']};
 let view=getPhoneGuideView(state,quest,step);assert.equal(view.copyText,null);assert.equal(view.copyState,'not-copied');assert.doesNotMatch(text(renderPhoneGuide({document:doc,state,quest,step})),/一歩ずつ/);
 state.phoneState.mailById['intro-mail'].read=true;state.questStates['PR-01'].completedSteps=[];view=getPhoneGuideView(state,quest,step);assert.equal(view.copyText,null);assert.equal(view.copyStepCompleted,false);
 state.questStates['PR-01'].completedSteps.push('PR-01-006');const before=structuredClone(state);view=getPhoneGuideView(state,quest,step);assert.equal(view.copyText,'一歩ずつ');assert.equal(view.copyState,'copied');assert.deepEqual(state,before);
});

test('a previous quest clipboard never appears as the current registration code',()=>{
 const state=createState(),quest=questById['PO-01'],step={id:'P017',questId:'PO-01'};
 state.phoneState.clipboard='一歩ずつ';state.phoneState.mailById['registration-mail']={read:true,code:'735921'};state.questStates['PO-01']={questId:'PO-01',completedSteps:['P014']};
 const view=getPhoneGuideView(state,quest,step),dom=renderPhoneGuide({document:doc,state,quest,step});assert.equal(view.copyText,null);assert.match(view.copyMessage,/この用事のコード.*ゲーム内コピーにありません/);assert.doesNotMatch(text(dom),/一歩ずつ|735921/);
 assert.match(view.flow[0].target,/コツコツモール/);assert.match(view.flow[1].target,/入力中.*認証画面/);assert.match(view.flow[2].target,/確認コードの欄/);
});

test('PR actual 12 operations show source, return, paste, save, and persistent completion without rewards from the guide',()=>{
 let state=accept(createState(),'PR-01');const quest=questById['PR-01'];
 state=through(state,'PR-01-005');let view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'source');assert.equal(view.mailRead,true);assert.equal(view.copyText,null);
 state=act(state);view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'return');assert.equal(view.copyText,'一歩ずつ');assert.equal(view.flow[1].state,'current');
 state=through(state,'PR-01-008');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'destination');assert.equal(view.flow[2].state,'current');
 state=through(state,'PR-01-010');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'finish');assert.equal(view.pasted,true);assert.match(view.phaseLabel,/メモを保存/);assert.ok(view.flow.every(point=>point.state==='done'));
 state=through(state,'PR-01-011');const restored=JSON.parse(JSON.stringify(state)),before=structuredClone(restored);view=getPhoneGuideView(restored,quest,activeStep(restored));const dom=renderPhoneGuide({document:doc,state:restored,quest,step:activeStep(restored)});assert.equal(view.finished,true);assert.equal(view.phase,'done');assert.match(view.phaseLabel,/保存できた/);assert.equal(dom.children[1].tag,'details');assert.deepEqual(restored,before);
});

test('PO actual registration keeps the intro phrase separate and identifies browser authentication',()=>{
 let state=through(accept(createState(),'PR-01'),'PR-01-012');state=accept(state,'PO-01');const quest=questById['PO-01'];
 state=through(state,'P010');let view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(state.phoneState.clipboard,'一歩ずつ');assert.equal(view.copyText,null);assert.equal(view.mailRead,false);
 state=through(state,'P013');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.copyText,null);assert.equal(view.mailRead,true);
 state=through(state,'P014');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'return');assert.equal(view.copyText,state.phoneState.mailById['registration-mail'].code);assert.match(view.flow[1].label,/モールへ戻る/);
 state=through(state,'P018');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'finish');assert.equal(view.pasted,true);assert.match(view.phaseLabel,/認証する/);
 state=through(state,'P019');view=getPhoneGuideView(state,quest,null);assert.equal(view.finished,true);assert.match(view.phaseLabel,/コツコツモール.*認証/);
});

test('DX actual mail and profile phases use only the exchange code and preserve all state on rendering',()=>{
 let state=accept(createState(),'DX-01');const quest=questById['DX-01'];state.phoneState.clipboard='一歩ずつ';
 state=through(state,'DX-01-S009');let view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.copyText,null);assert.equal(view.phase,'source');
 state=through(state,'DX-01-S012');assert.equal(getPhoneGuideView(state,quest,activeStep(state)).copyText,null);
 state=through(state,'DX-01-S013');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.copyText,'482615');assert.equal(view.phase,'return');assert.match(view.flow[1].target,/あかつき取引所/);
 state=through(state,'DX-01-S017');view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.pasted,true);assert.equal(view.finished,false);
 state=through(state,'DX-01-S018');const before=structuredClone(state),dom=renderPhoneGuide({document:doc,state,quest,step:activeStep(state)});view=getPhoneGuideView(state,quest,activeStep(state));assert.equal(view.phase,'done');assert.match(view.summary,/プロフィール/);assert.deepEqual(state,before);assert.equal(dom.children[1].tag,'details');
});

test('unrelated quests receive no guide and the guide has no action controls or clipboard access',()=>{
 const state=createState();assert.equal(getPhoneGuideView(state,questById['FI-01'],{id:'FI-01-S001'}),null);assert.equal(renderPhoneGuide({document:doc,state,quest:questById['FI-01'],step:{id:'FI-01-S001'}}),null);
 const dom=renderPhoneGuide({document:doc,state,quest:questById['PR-01'],step:{id:'PR-01-001'}});assert.equal(all(dom).filter(node=>['button','input','textarea'].includes(node.tag)).length,0);assert.equal(all(dom).filter(node=>node.tag==='summary').length,1);
});

test('DX main paste rejects a foreign clipboard, offers mail recovery, then submits only the matching lesson code',()=>{
 let state=through(accept(createState(),'DX-01'),'DX-01-S016');const quest=questById['DX-01'],step=activeStep(state),submitted=[],navigated=[];
 state.phoneState.clipboard='246810';const before=structuredClone(state),panel=renderExtensionPanel({document:doc,state,quest,step,onAction:value=>submitted.push(value),onAppNavigate:app=>navigated.push(app)});
 assert.equal(getPhoneGuideView(state,quest,step).copyText,null);assert.equal(panel.handlesAction,true);assert.doesNotMatch(text(panel.element),/コピー済み|246810|482615/);assert.match(text(panel.element),/今回の確認メールへ戻り/);
 assert.equal(all(panel.element).filter(node=>node.tag==='button'&&/貼り付け/.test(node.textContent)).length,0);
 all(panel.element).find(node=>node.tag==='button'&&node.textContent==='今回の確認メールを見直す').events.click();assert.deepEqual(navigated,['mail']);assert.deepEqual(submitted,[]);assert.deepEqual(state,before);
 // The existing mail revisit copies locally; no STEP or extra reward is issued.
 state.phoneState.clipboard=state.phoneState.mailById['domestic-registration'].code;const recoveredBefore=structuredClone(state),valid=renderExtensionPanel({document:doc,state,quest,step,onAction:value=>submitted.push(value)});
 assert.match(text(valid.element),/今回の確認メールから.*コピー済み/);assert.match(text(valid.element),/482615/);all(valid.element).find(node=>node.tag==='button'&&/貼り付け/.test(node.textContent)).events.click();assert.deepEqual(submitted,['482615']);assert.deepEqual(state,recoveredBefore);
});

test('DX review paste uses only its own mail-read flag and profile code, including recovery',()=>{
 const state=through(accept(createState(),'DX-01'),'DX-01-S016'),quest=questById['DX-01'],actions=quest.reviewVariant.tasks[0].actions;
 const review=structuredClone(quest.reviewVariant.initialSnapshot);for(const action of actions){if(action.field==='verificationCode'&&action.type==='input')break;applyExtensionReview(review,action,action.type==='check'?true:action.value);}
 const step=actions.find(action=>action.field==='verificationCode'&&action.type==='input'),reviewCode=review.scenario.data.profile.verificationCode,mainBefore=structuredClone(state);
 assert.notEqual(reviewCode,state.phoneState.clipboard);
 for(const change of [{clipboard:'246810',mailOpened:true},{clipboard:reviewCode,mailOpened:false},{clipboard:undefined,mailOpened:undefined}]){
  const snapshot={...structuredClone(review),...change},navigated=[],submitted=[],before=structuredClone(snapshot),panel=renderExtensionPanel({document:doc,state,quest,step,reviewSnapshot:snapshot,onAction:value=>submitted.push(value),onAppNavigate:app=>navigated.push(app)});
  assert.doesNotMatch(text(panel.element),/コピー済み|246810|482615/);assert.equal(text(panel.element).includes(reviewCode),false);assert.equal(all(panel.element).filter(node=>node.tag==='button'&&/貼り付け/.test(node.textContent)).length,0);
  all(panel.element).find(node=>node.tag==='button'&&node.textContent==='今回の確認メールを見直す').events.click();assert.deepEqual(navigated,['mail']);assert.deepEqual(submitted,[]);assert.deepEqual(snapshot,before);
 }
 const submitted=[],snapshot={...structuredClone(review),mailOpened:true,clipboard:reviewCode},before=structuredClone(snapshot),panel=renderExtensionPanel({document:doc,state,quest,step,reviewSnapshot:snapshot,onAction:value=>submitted.push(value)});
 assert.match(text(panel.element),/コピー済み/);assert.ok(text(panel.element).includes(reviewCode));all(panel.element).find(node=>node.tag==='button'&&/貼り付け/.test(node.textContent)).events.click();assert.deepEqual(submitted,[reviewCode]);assert.deepEqual(snapshot,before);assert.deepEqual(state,mainBefore);
});
