import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,activeStep,totalXp} from '../js/engine.js';
import {displayPracticeValue,humanFieldLabel} from '../js/help.js';
import {submissionValue} from '../js/action-input.js';
import {getFxOperationInstruction,getFxConceptCards,getFxSubmitLabel,getFxOrderConfirmation} from '../js/fx-guidance.js';

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.listeners={};this.value='';this.ownText='';}
 setAttribute(key,value){this.attributes[key]=value;if(['value','type','id'].includes(key))this[key]=value;}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 dispatchEvent(event){for(const fn of this.listeners[event.type]??[])fn({type:event.type,target:this,preventDefault(){}});return true;}
 append(...nodes){this.children.push(...nodes);}
 set textContent(value){this.ownText=String(value);this.children=[];}
 get textContent(){return this.ownText+this.children.map(n=>n.textContent).join('');}
}
const all=root=>[root,...root.children.flatMap(all)];
const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
function setup(id){
 let state=createState(),now=Date.now(),saves=0,scrolls=0;
 const act=command=>{state=dispatch(state,command,++now);};
 const bank=id.startsWith('BK-');
 for(const command of [{type:'START'},{type:'CHAPTER',id:bank?'CH-2':'CH-3'},{type:'NPC',chapterId:bank?'CH-2':'CH-3',index:0},...(bank?[]:[{type:'SAVE_OFFER'}]),{type:'ACCEPT',id:bank?'BK-01':'FX-01'}])act(command);
 const finish=()=>{while(activeStep(state)){const step=activeStep(state);act({type:'STEP',id:step.id,value:step.type==='check'?true:step.value});}};
 if(id.startsWith('FX-02')){finish();act({type:'ACCEPT',id:'FX-02'});if(id.startsWith('FX-02-S')){finish();act({type:'ACCEPT',id:'FX-02-S'});}}
 while(activeStep(state).id!==id){const step=activeStep(state);act({type:'STEP',id:step.id,value:step.type==='check'?true:step.value});}
 const env={Node:Element,Event:class{constructor(type){this.type=type;}},document:{createElement:tag=>new Element(tag),createTextNode:text=>{const node=new Element('#text');node.textContent=text;return node;},createDocumentFragment:()=>new Element('#fragment')},ui:{inputs:{},reviewId:null},get state(){return state;},getFxOperationInstruction,getFxConceptCards,getFxSubmitLabel,getFxOrderConfirmation,displayPracticeValue,humanFieldLabel,phoneFieldLabels:{},submissionValue,valueDisplay:value=>String(value),saveQuiet:()=>saves++,operationGuide:{scrollToTarget:()=>{scrolls++;}},showError:message=>{throw Error(message);}};
 vm.createContext(env);
 vm.runInContext(source.split('\n').filter(line=>line.startsWith('function h(')||line.startsWith('const btn=')||line.startsWith('const p=')).join('\n'),env);
 vm.runInContext(source.slice(source.indexOf('function detailsBlock('),source.indexOf('function phoneNavigationForStep(')),env);
 const step=activeStep(state),element=env.renderAction(step,value=>act({type:'STEP',id:step.id,value}));
 return {element,step,get state(){return state;},get saves(){return saves;},get scrolls(){return scrolls;}};
}

test('a quantity candidate only fills the draft; the separate real submit advances once',()=>{
 const c=setup('FX-01-010'),before=structuredClone(c.state),xp=totalXp(c.state),nodes=all(c.element);
 const candidate=nodes.find(n=>n.className==='candidate'),input=nodes.find(n=>n.tagName==='INPUT'),form=nodes.find(n=>n.tagName==='FORM'),submit=nodes.find(n=>n.type==='submit');
 assert.equal(submit.textContent,'このlot数で進む');
 candidate.dispatchEvent({type:'click'});candidate.dispatchEvent({type:'click'});
 assert.equal(input.value,'0.1');assert.equal(c.state.phoneState.formDrafts['step:FX-01-010'],'0.1');
 assert.equal(activeStep(c.state).id,'FX-01-010');assert.equal(totalXp(c.state),xp);assert.deepEqual(c.state.financialScenarios,before.financialScenarios);assert.deepEqual(c.state.questStates,before.questStates);assert.equal(c.scrolls,2);
 form.dispatchEvent({type:'submit'});assert.equal(activeStep(c.state).id,'FX-01-011');assert.equal(totalXp(c.state),xp+2);
 assert.throws(()=>form.dispatchEvent({type:'submit'}),/画面が更新/);assert.equal(totalXp(c.state),xp+2);
});

test('the same input-only candidate behavior also protects ordinary registration fields',()=>{
 const c=setup('BK-01-006'),before=structuredClone(c.state),nodes=all(c.element),candidate=nodes.find(n=>n.className==='candidate'),input=nodes.find(n=>n.tagName==='INPUT');
 candidate.dispatchEvent({type:'click'});assert.equal(input.value,String(c.step.value));assert.equal(activeStep(c.state).id,c.step.id);assert.deepEqual(c.state.questStates,before.questStates);assert.equal(totalXp(c.state),totalXp(before));assert.deepEqual(c.state.financialScenarios,before.financialScenarios);
});

test('the real confirm action shows its saved order and planned price beside its single submit',()=>{
 for(const[id,price,pnl]of [['FX-02-004','Ask 150.00円','−20円'],['FX-02-014','Bid 149.88円','−120円'],['FX-02-S-009','Bid 160.00円','−30円'],['FX-02-S-016','Ask 159.93円','＋70円']]){
  const c=setup(id),before=structuredClone(c.state),nodes=all(c.element),confirmation=nodes.find(n=>n.className==='practice-card fx-confirmation');
  assert.ok(confirmation,id);assert.ok(confirmation.textContent.includes(price),id);assert.ok(confirmation.textContent.includes(pnl),id);assert.match(confirmation.textContent,/未発注|まだ閉じていません/);
  assert.equal(nodes.filter(n=>n.attributes['data-guide-target']==='true').length,1);assert.deepEqual(c.state,before);
  assert.ok(nodes.find(n=>n.tagName==='SUMMARY'&&n.textContent==='この練習の開始時の資料'));
 }
});
