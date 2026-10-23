import test from 'node:test';
import assert from 'node:assert/strict';
import {renderWorldControls} from '../js/world-controls.js';

function fixture(){
 let time=0,next=0,under=null;
 const timers=new Map(),observers=[];
 class Target{
  constructor(tagName){this.tagName=tagName;this.children=[];this.attributes={};this.listeners=new Map();this.isConnected=true;this.parentElement=null;const classes=new Set();this.classList={toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)};}
  append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
  emit(name,values={}){const event={pointerId:1,button:0,detail:0,clientX:80,clientY:10,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...values};for(const fn of this.listeners.get(name)??[])fn(event);return event;}
  getBoundingClientRect(){return {left:0,top:0,right:204,bottom:204};}
  setPointerCapture(id){this.capture=id;}
  hasPointerCapture(id){return this.capture===id;}
  releasePointerCapture(id){this.capture=null;this.emit('lostpointercapture',{pointerId:id});}
 }
 const host=new Target('window');host.performance={now:()=>time};host.setTimeout=(fn,delay)=>{const id=++next;timers.set(id,{fn,at:time+delay});return id;};host.clearTimeout=id=>timers.delete(id);
 host.MutationObserver=class{constructor(fn){this.fn=fn;observers.push(this);}observe(){this.observing=true;}disconnect(){this.observing=false;}};
 const document=new Target('document');document.defaultView=host;document.documentElement=new Target('html');document.createElement=tag=>new Target(tag);document.elementFromPoint=()=>under;document.hidden=false;
 const moves=[];let talks=0,enabled=true;
 const controls=renderWorldControls({document,onMove:(dx,dy)=>moves.push([dx,dy]),onTalk:()=>talks++,canMove:()=>enabled});
 const pad=controls.element.children[0],button=name=>pad.children.find(n=>n.attributes['aria-label']===name||n.textContent===name);
 const advance=ms=>{const end=time+ms;while(true){const entries=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at);if(!entries.length)break;const [id,item]=entries[0];timers.delete(id);time=item.at;item.fn();}time=end;};
 return {controls,pad,button,document,host,moves,timers,observers,advance,get talks(){return talks;},set under(value){under=value;},set enabled(value){enabled=value;}};
}

test('a held direction starts once, repeats after a short pause and ignores its synthesized click',()=>{
 const f=fixture(),up=f.button('上へ歩く');assert.equal(f.pad.children.length,5);
 assert.match(f.controls.element.children[1].textContent,/押し続ける.*町の人.*話す/);
 up.emit('pointerdown');assert.deepEqual(f.moves,[[0,-1]]);assert.equal(up.classList.contains('held'),true);
 f.advance(259);assert.equal(f.moves.length,1);f.advance(1);assert.equal(f.moves.length,2);f.advance(290);assert.equal(f.moves.length,4);
 f.host.emit('pointerup');assert.equal(f.timers.size,0);assert.equal(up.classList.contains('held'),false);
 up.emit('click',{detail:1});assert.equal(f.moves.length,4);f.advance(1000);assert.equal(f.moves.length,4);
 up.emit('click',{detail:0});assert.equal(f.moves.length,5); // Keyboard / accessibility activation stays available.
 f.controls.destroy();
});

test('release, cancel, leaving, backgrounding, lost capture, removal and destruction all stop walking',()=>{
 for(const reason of ['pointerup','pointercancel','pointerleave','blur','visibility','capture','removed','destroy']){
  const f=fixture();f.button('右へ歩く').emit('pointerdown');f.advance(260);assert.equal(f.moves.length,2,reason);
  if(reason==='pointerup'||reason==='pointercancel')f.host.emit(reason);
  else if(reason==='pointerleave')f.pad.emit(reason);
  else if(reason==='blur')f.host.emit('blur');
  else if(reason==='visibility'){f.document.hidden=true;f.document.emit('visibilitychange');}
  else if(reason==='capture')f.pad.emit('lostpointercapture');
  else if(reason==='removed'){f.controls.element.isConnected=false;for(const observer of f.observers)observer.fn();}
  else f.controls.destroy();
  assert.equal(f.timers.size,0,reason);f.advance(2000);assert.equal(f.moves.length,2,reason);f.controls.destroy();
 }
});

test('the same finger can slide between directions, pause at the center and stop outside the pad',()=>{
 const f=fixture();f.button('上へ歩く').emit('pointerdown');
 f.under=f.button('左へ歩く').children[0];f.pad.emit('pointermove',{clientX:10,clientY:80});
 assert.deepEqual(f.moves,[[0,-1],[-1,0]]);f.advance(145);assert.deepEqual(f.moves.at(-1),[-1,0]);
 f.under=f.button('話す');f.pad.emit('pointermove',{clientX:80,clientY:80});f.advance(1000);assert.equal(f.moves.length,3);assert.equal(f.talks,0);
 f.under=f.button('下へ歩く');f.pad.emit('pointermove',{clientX:80,clientY:160});assert.deepEqual(f.moves.at(-1),[0,1]);
 f.pad.emit('pointermove',{clientX:210,clientY:160});assert.equal(f.timers.size,0);f.advance(1000);assert.equal(f.moves.length,4);f.controls.destroy();
});

test('ordinary clicks, focused arrow keys and the central talk button work without a held pointer',()=>{
 const f=fixture();for(const label of ['上へ歩く','左へ歩く','右へ歩く','下へ歩く'])f.button(label).emit('click');
 assert.deepEqual(f.moves,[[0,-1],[-1,0],[1,0],[0,1]]);
 const event=f.pad.emit('keydown',{key:'ArrowLeft'});assert.equal(event.prevented,true);assert.equal(event.stopped,true);assert.deepEqual(f.moves.at(-1),[-1,0]);
 f.button('右へ歩く').emit('pointerdown');f.button('話す').emit('click');assert.equal(f.talks,1);assert.equal(f.timers.size,0);const count=f.moves.length;f.advance(1000);assert.equal(f.moves.length,count);
 f.controls.destroy();f.button('下へ歩く').emit('click');assert.equal(f.moves.length,count);assert.equal(f.observers[0].observing,false);
});

test('extra fingers, secondary mouse buttons and a disabled game cannot start extra movement',()=>{
 const f=fixture();f.button('上へ歩く').emit('pointerdown',{button:2});assert.equal(f.moves.length,0);
 f.button('上へ歩く').emit('pointerdown');f.button('右へ歩く').emit('pointerdown',{pointerId:2});assert.equal(f.moves.length,1);
 f.host.emit('pointerup',{pointerId:2});f.advance(260);assert.deepEqual(f.moves,[[0,-1],[0,-1]]);
 f.enabled=false;f.advance(145);assert.equal(f.moves.length,2);assert.equal(f.timers.size,0);
 f.button('左へ歩く').emit('pointerdown');f.button('左へ歩く').emit('click');assert.equal(f.moves.length,2);f.controls.destroy();
});
