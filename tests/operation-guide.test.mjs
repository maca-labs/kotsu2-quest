import test from 'node:test';
import assert from 'node:assert/strict';
import {mountOperationGuide} from '../js/operation-guide.js';
import {renderExtensionPanel} from '../js/phone-extension.js';
import {initialExtensionScenarios} from '../js/finance-extension.js';
import {steps as extensionSteps,quests as extensionQuests} from '../js/content-extension.js';

class Events{
 constructor(){this.listeners=[];}
 addEventListener(type,fn,options){this.listeners.push({type,fn,options});}
 removeEventListener(type,fn,options){this.listeners=this.listeners.filter(item=>item.type!==type||item.fn!==fn||item.options!==options);}
 emit(type){for(const item of [...this.listeners])if(item.type===type)item.fn();}
}
class Element extends Events{
 constructor(tag='div',rect={left:0,top:0,width:120,height:48}){super();this.tagName=tag.toUpperCase();this.rect=rect;this.children=[];this.attributes={};this.className='';this.textContent='';this.style={setProperty(key,value){this[key]=value;}};const classes=new Set();this.classList={contains:key=>classes.has(key),add:key=>classes.add(key),remove:key=>classes.delete(key)};this.scrollCalls=[];this.clicks=0;this.focuses=0;this.hidden=false;this.clientLeft=0;this.clientTop=0;this.scrollLeft=0;this.scrollTop=0;}
 append(...nodes){for(const node of nodes){this.children.push(node);node.parent=this;}}
 setAttribute(key,value){this.attributes[key]=value;}
 getBoundingClientRect(){return {...this.rect,right:this.rect.left+this.rect.width,bottom:this.rect.top+this.rect.height};}
 querySelector(selector){return selector==='[data-guide-submit]'?null:this.targets?.[0]??null;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 scrollIntoView(options){this.scrollCalls.push(options);}
 click(){this.clicks++;}
 focus(){this.focuses++;}
}
function scene({left=0,top=0,width=320,height=600,targetTop=300,targetLeft=30,targetWidth=260,targetHeight=44,tag='button',readOnly=false}={}){
 const win=new Events(),frames=new Map();let sequence=0;win.requestAnimationFrame=fn=>{const id=++sequence;frames.set(id,fn);return id;};win.cancelAnimationFrame=id=>frames.delete(id);win.flush=()=>{const pending=[...frames.values()];frames.clear();for(const fn of pending)fn();};
 const resize=[],mutations=[];class Resize{constructor(fn){this.fn=fn;this.watched=new Set();this.disconnected=false;resize.push(this);}observe(node){assert.ok(node);this.watched.add(node);}unobserve(node){assert.ok(node);this.watched.delete(node);}disconnect(){this.disconnected=true;this.watched.clear();}}
 class Mutation{constructor(fn){this.fn=fn;this.disconnected=false;mutations.push(this);}observe(node,options){this.node=node;this.options=options;}disconnect(){this.disconnected=true;}}
 win.ResizeObserver=Resize;win.MutationObserver=Mutation;
 const phone=new Element('section',{left,top,width,height});phone.clientWidth=width;phone.clientHeight=height;
 const target=new Element(tag,{left:left+targetLeft,top:top+targetTop,width:targetWidth,height:targetHeight});target.readOnly=readOnly;target.setAttribute('aria-label','既存の操作名');phone.targets=[target];phone.append(target);
 const doc={defaultView:win,createElement:tag=>new Element(tag)};
 return {doc,phone,target,win,resize,mutations,frames,marker:()=>phone.children.find(node=>node.className==='operation-guide-marker')};
}

test('one real target is outlined with a click-through arrow; names, tap dimensions, and actions remain unchanged',()=>{
 const s=scene(),second=new Element('button');s.phone.targets.push(second);s.phone.append(second);const control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap'}}),marker=s.marker();
 assert.ok(s.target.classList.contains('operation-guide-target'));assert.equal(second.classList.contains('operation-guide-target'),false);assert.equal(marker.style.pointerEvents,'none');assert.ok(marker.children.every(child=>child.style.pointerEvents==='none'));assert.equal(marker.attributes['aria-hidden'],'true');assert.equal(marker.children[0].textContent,'ここをタップ');assert.equal(s.target.attributes['aria-label'],'既存の操作名');assert.equal(s.target.rect.height,44);assert.equal(s.target.clicks,0);assert.equal(s.target.focuses,0);assert.equal(s.target.scrollCalls.length,0);control.destroy();
});

test('the live lesson can repeat its instruction beside the target without performing the action',()=>{
 const s=scene(),control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap',instruction:'メールを押す'},showInstruction:true});
 assert.equal(s.marker().children[0].textContent,'メールを押す');control.scrollToTarget();assert.equal(s.target.clicks,0);assert.equal(s.target.focuses,0);assert.equal(s.target.scrollCalls.length,1);control.destroy();
 const paste=scene();paste.phone.querySelector=()=>paste.target;const pasted=mountOperationGuide({document:paste.doc,phone:paste.phone,step:{type:'input',instruction:'練習コードを貼り付け'},showInstruction:true});assert.equal(paste.marker().children[0].textContent,'練習コードを貼り付け');pasted.destroy();
});

test('marker follows actual geometry on scroll, resize, and observed layout changes within 320px bounds',()=>{
 const s=scene(),control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap'}}),marker=s.marker(),initial=Number.parseFloat(marker.style.top);
 assert.equal(initial,244);s.target.rect.top=200;s.win.emit('scroll');s.phone.emit('scroll');assert.equal(s.frames.size,1);s.win.flush();assert.equal(Number.parseFloat(marker.style.top),144);
 s.target.rect.left=300;s.win.emit('resize');s.win.flush();assert.equal(Number.parseFloat(marker.style.left),192);assert.ok(Number.parseFloat(marker.style.left)+120<=312);
 s.target.rect.left=-100;s.resize[0].fn();s.win.flush();assert.equal(Number.parseFloat(marker.style.left),8);assert.ok(Number.parseFloat(marker.style.top)>=8);control.destroy();
});

test('top-edge target uses a downward-safe label position; invisible or cramped targets never get covered',()=>{
 const s=scene({targetTop:4}),control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap'}}),marker=s.marker();
 assert.equal(marker.attributes['data-placement'],'below');assert.equal(marker.children[1].textContent,'▲');assert.ok(Number.parseFloat(marker.style.top)>=s.target.rect.top+s.target.rect.height+8);assert.equal(marker.hidden,false);
 s.target.rect.top=700;s.phone.emit('scroll');s.win.flush();assert.equal(marker.hidden,true);control.destroy();
 const tiny=scene({height:70,targetTop:8});const smallControl=mountOperationGuide({document:tiny.doc,phone:tiny.phone,step:{type:'focus'}});assert.equal(tiny.marker().hidden,true);assert.equal(tiny.target.classList.contains('operation-guide-target'),true);smallControl.destroy();
});

test('editable fields say input; readonly focus, select, buttons, and checkbox labels remain tap targets',()=>{
 for(const[tag,readOnly,stepType,expected]of [['input',false,'input','ここへ入力'],['textarea',false,'input','ここへ入力'],['input',true,'focus','ここをタップ'],['select',false,'select','ここをタップ'],['label',false,'check','ここをタップ'],['button',false,'input','ここをタップ']]){const s=scene({tag,readOnly}),control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:stepType}});assert.equal(s.marker().children[0].textContent,expected);assert.equal(s.target.readOnly,readOnly);assert.equal(s.target.focuses,0);control.destroy();}
});

test('scrollToTarget only scrolls the current control; destroy cancels work and releases all listeners and observers',()=>{
 const s=scene(),control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'input'}});assert.equal(control.scrollToTarget(),true);assert.deepEqual(s.target.scrollCalls,[{block:'center',inline:'nearest',behavior:'auto'}]);assert.equal(s.target.focuses,0);assert.equal(s.target.clicks,0);
 s.win.emit('resize');assert.equal(s.frames.size,1);control.destroy();control.destroy();assert.equal(s.frames.size,0);assert.equal(s.win.listeners.length,0);assert.equal(s.phone.listeners.length,0);assert.ok(s.resize.every(observer=>observer.disconnected));assert.ok(s.mutations.every(observer=>observer.disconnected));assert.equal(s.target.classList.contains('operation-guide-target'),false);assert.equal(s.phone.classList.contains('operation-guide-host'),false);assert.equal(s.marker(),undefined);assert.equal(control.scrollToTarget(),false);
});

test('replacement and repeated mounting keep just one marker and restore the old target',()=>{
 const s=scene(),first=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap'}}),replacement=new Element('button',{left:20,top:400,width:200,height:44});s.phone.targets=[replacement];s.phone.append(replacement);s.mutations[0].fn();s.win.flush();assert.equal(s.target.classList.contains('operation-guide-target'),false);assert.equal(replacement.classList.contains('operation-guide-target'),true);
 const second=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:'tap'}});assert.equal(s.phone.children.filter(node=>node.className==='operation-guide-marker').length,1);assert.equal(first.scrollToTarget(),false);second.destroy();assert.equal(replacement.classList.contains('operation-guide-target'),false);
 const blank=scene();blank.phone.targets=[];const empty=mountOperationGuide({document:blank.doc,phone:blank.phone,step:{type:'tap'}});assert.equal(empty.scrollToTarget(),false);assert.equal(blank.marker(),undefined);assert.equal(blank.win.listeners.length,0);empty.destroy();
});

test('typing or choosing moves the arrow to confirmation and clearing restores the field without submitting',()=>{
 for(const tag of ['input','textarea','select']){
  const s=scene({tag}),submit=new Element('button',{left:30,top:400,width:260,height:44});s.phone.append(submit);s.phone.querySelector=selector=>selector==='[data-guide-submit]'?submit:s.target;s.target.value='';
  const control=mountOperationGuide({document:s.doc,phone:s.phone,step:{type:tag==='select'?'select':'input'}});
  assert.equal(s.target.classList.contains('operation-guide-target'),true);s.target.value='1';s.phone.emit(tag==='select'?'change':'input');s.win.flush();
  assert.equal(submit.classList.contains('operation-guide-target'),true);assert.equal(s.target.classList.contains('operation-guide-target'),false);assert.equal(s.marker().children[0].textContent,'ここをタップ');assert.equal(submit.clicks,0);
  control.scrollToTarget();assert.equal(submit.scrollCalls.length,1);s.target.value='';s.phone.emit('input');s.win.flush();assert.equal(s.target.classList.contains('operation-guide-target'),true);assert.equal(submit.classList.contains('operation-guide-target'),false);control.destroy();
 }
});

test('guided venue switch marks only the requested real tab; previews, reviews, and boss copies reveal no answer target',()=>{
 const state={financialScenarios:initialExtensionScenarios()},before=structuredClone(state),doc={createElement:tag=>new Element(tag)},submitted=[],visited=[];
 const tree=node=>[node,...node.children.flatMap(child=>tree(child))];
 const tabs=panel=>tree(panel.element).find(node=>node.className==='extension-venue-tabs').children;
 for(const step of extensionSteps.filter(item=>item.venueSwitch)){
  const quest=extensionQuests.find(item=>item.id===step.questId),panel=renderExtensionPanel({document:doc,state,step,quest,onAction:value=>submitted.push(value),onNavigate:value=>visited.push(value)}),buttons=tabs(panel),marked=buttons.filter(button=>button.attributes['data-guide-target']);
  assert.equal(panel.handlesAction,true);assert.equal(marked.length,1,step.id);assert.equal(marked[0].textContent,step.value==='dealer'?'販売所':'板取引所');marked[0].emit('click');assert.equal(submitted.at(-1),step.value);
  const other=buttons.find(button=>button!==marked[0]);assert.equal(other.attributes['data-guide-target'],undefined);other.emit('click');assert.equal(visited.at(-1),step.value==='dealer'?'board':'dealer');
  const preview=renderExtensionPanel({document:doc,state,step,quest,previewVenue:'board'});assert.equal(tabs(preview).filter(button=>button.attributes['data-guide-target']).length,0);
  const boss=renderExtensionPanel({document:doc,state,step:{...step,id:`BOSS-${step.id}`},quest});assert.equal(tabs(boss).filter(button=>button.attributes['data-guide-target']).length,0);
  const reviewAction=quest.reviewVariant.tasks[0].actions.find(action=>action.venueSwitch),review=renderExtensionPanel({document:doc,state,step:reviewAction,quest,reviewSnapshot:structuredClone(quest.reviewVariant.initialSnapshot)});assert.equal(tabs(review).filter(button=>button.attributes['data-guide-target']).length,0);
 }
 const nonSwitch=extensionSteps.find(item=>item.questId==='DX-03'&&!item.venueSwitch),panel=renderExtensionPanel({document:doc,state,step:nonSwitch,quest:{id:'DX-03'}});assert.equal(tabs(panel).filter(button=>button.attributes['data-guide-target']).length,0);assert.deepEqual(state,before);
});
