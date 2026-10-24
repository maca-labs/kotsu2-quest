import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlaceBanner,renderSpeakerIdentity} from '../js/place-presentation.js';

function fixture(){
 let time=0,next=0;
 const timers=new Map(),observers=[],listeners=new Map();
 class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={position:''};this.textContent='';this.isConnected=true;this.clientTop=0;this.clientLeft=0;this.rect={left:0,top:0,width:320,height:230};}
  append(...nodes){for(const node of nodes){node.parentNode=this;node.isConnected=true;this.children.push(node);}}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;this.isConnected=false;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  getBoundingClientRect(){return this.rect;}
 }
 const host={performance:{now:()=>time},getComputedStyle:node=>({position:node.computedPosition??'static'}),setTimeout(fn,delay){const id=++next;timers.set(id,{at:time+delay,fn});return id;},clearTimeout:id=>timers.delete(id),addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);},ResizeObserver:class{constructor(fn){this.fn=fn;this.active=true;observers.push(this);}observe(){}disconnect(){this.active=false;}}};
 const document={defaultView:host,createElement:tag=>new Element(tag)};
 const advance=duration=>{const end=time+duration;while(true){const due=[...timers].filter(([,task])=>task.at<=end).sort((a,b)=>a[1].at-b[1].at);if(!due.length)break;const [id,task]=due[0];timers.delete(id);time=task.at;task.fn();}time=end;};
 return {document,host,timers,observers,listeners,advance,container:()=>new Element('section'),listenerCount:()=>[...listeners.values()].reduce((n,list)=>n+list.size,0)};
}
const tree=node=>[node,...node.children.flatMap(tree)];
const text=node=>tree(node).map(child=>child.textContent).join(' ');
const town=Object.freeze({key:'town:CH-0',title:'旅立ちの村',kind:'town'});

test('entry adds an absolute noninteractive status and the same-place rerender keeps the original 2800ms deadline',()=>{
 const f=fixture(),controller=createPlaceBanner({document:f.document}),first=f.container(),before=structuredClone(town);
 const banner=controller.sync({place:town,host:first});assert.match(text(banner),/町に入りました 旅立ちの村/);assert.equal(banner.style.position,'absolute');assert.equal(banner.style.pointerEvents,'none');assert.equal(banner.attributes.role,'status');assert.equal(first.style.position,'relative');
 f.advance(1000);const second=f.container(),again=controller.sync({place:town,host:second});assert.equal(first.children.length,0);assert.equal(first.style.position,'');assert.ok(again);assert.equal(f.timers.size,1);assert.equal(f.listenerCount(),1);
 f.advance(1799);assert.equal(second.children.length,1);f.advance(1);assert.equal(second.children.length,0);assert.equal(f.timers.size,0);assert.equal(f.listenerCount(),0);assert.equal(second.style.position,'');
 assert.equal(controller.sync({place:town,host:f.container()}),null);assert.deepEqual(town,before);controller.destroy();
});

test('hidden menus and phone screens keep the physical place deadline, while entering and leaving a room starts a new arrival',()=>{
 const f=fixture(),controller=createPlaceBanner({document:f.document}),container=f.container();controller.sync({place:town,host:container});f.advance(600);
 controller.sync({place:town,visible:false});assert.equal(container.children.length,0);assert.equal(f.timers.size,0);
 f.advance(500);assert.ok(controller.sync({place:town,host:container}));f.advance(1700);assert.equal(container.children.length,0);
 controller.sync({place:town,visible:false});f.advance(5000);assert.equal(controller.sync({place:town,host:container}),null);
 const house={key:'room:CH-0:client',title:'郵便屋の家',kind:'house'};assert.match(text(controller.sync({place:house,host:container})),/家に入りました 郵便屋の家/);
 f.advance(100);assert.ok(controller.sync({place:town,host:container}));f.advance(2799);assert.equal(container.children.length,1);f.advance(1);assert.equal(container.children.length,0);controller.destroy();
});

test('all requested place categories have clear labels and changing display text within one key does not extend time',()=>{
 const f=fixture(),controller=createPlaceBanner({document:f.document}),container=f.container();
 for(const [kind,title,label]of [['house','帳場の家','家に入りました'],['tavern','酒処 あかし灯','酒場に入りました'],['church','はじまりの教会','教会に入りました'],['shop','こだま武具店','店に入りました'],['cave','あかしの洞窟','洞窟に入りました']]){
  const place=Object.freeze({key:`${kind}:CH-2`,title,kind});assert.match(text(controller.sync({place,host:container})),new RegExp(label));f.advance(1000);
  assert.ok(text(controller.sync({place:{...place,title:title+'・入口'},host:container})).includes(title+'・入口'));f.advance(1800);assert.equal(container.children.length,0);
 }
 controller.destroy();
});

test('a shop banner uses its picture anchor instead of covering the header or exit, and resize/detach cleanup is complete',()=>{
 const f=fixture(),controller=createPlaceBanner({document:f.document}),container=f.container(),anchor=f.container();container.rect={left:10,top:60,width:296,height:600};container.clientTop=2;container.clientLeft=2;anchor.rect={left:26,top:220,width:264,height:100};container.append(anchor);
 const banner=controller.sync({place:{key:'shop:CH-2',title:'こだま武具店',kind:'shop'},host:container,anchor});assert.equal(banner.style.top,'166px');assert.equal(banner.style.left,'146px');assert.equal(banner.style.maxWidth,'244px');
 anchor.rect={left:26,top:230,width:200,height:75};f.observers.at(-1).fn();assert.equal(banner.style.top,'176px');assert.equal(banner.style.maxWidth,'180px');
 anchor.remove();f.observers.at(-1).fn();assert.equal(container.children.length,0);assert.equal(f.timers.size,0);assert.equal(f.listenerCount(),0);assert.ok(f.observers.every(observer=>!observer.active));controller.destroy();
});

test('reset rearms a replaced adventure, destroy cancels pending effects, and stale callbacks cannot remove a newer banner',()=>{
 const f=fixture(),controller=createPlaceBanner({document:f.document}),container=f.container();controller.sync({place:town,host:container});const oldTimer=[...f.timers.values()][0].fn,oldObserver=f.observers[0];f.advance(2800);
 assert.equal(controller.sync({place:town,host:container}),null);controller.reset();const replacement=controller.sync({place:town,host:container});assert.ok(replacement);oldTimer();oldObserver.fn();assert.equal(container.children[0],replacement);
 controller.destroy();controller.destroy();assert.equal(container.children.length,0);assert.equal(f.timers.size,0);assert.equal(f.listenerCount(),0);f.advance(5000);assert.equal(controller.sync({place:town,host:container}),null);
});

test('speaker identity names the actual person and role separately from place labels, with an optional original portrait',()=>{
 const f=fixture(),portrait=f.document.createElement('canvas'),person=Object.freeze({name:'長老オリベ',role:'冒険の記録庫'}),before=structuredClone(person),root=renderSpeakerIdentity({document:f.document,...person,portrait});
 assert.equal(root.attributes['aria-label'],'話している人');assert.match(text(root),/話している人 長老オリベ 冒険の記録庫/);assert.ok(!text(root).includes('町に入りました'));assert.equal(root.children[0].attributes['aria-hidden'],'true');assert.equal(root.children[0].children[0],portrait);assert.deepEqual(person,before);
 const long=renderSpeakerIdentity({document:f.document,name:'はじまりの教会で旅人を見守る神官ミル',role:'教会の神官'});assert.ok(text(long).includes('神官ミル'));assert.equal(long.children.length,1);assert.equal(long.attributes.tabindex,undefined);
 const literal=renderSpeakerIdentity({document:f.document,name:'<script>人物の名前</script>',role:'案内役'});assert.ok(text(literal).includes('<script>人物の名前</script>'));assert.equal(tree(literal).filter(node=>node.tagName==='SCRIPT').length,0);
});
