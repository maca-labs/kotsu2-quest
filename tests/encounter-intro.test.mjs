import test from 'node:test';
import assert from 'node:assert/strict';
import {mountEncounterIntro,trackEncounterInputs} from '../js/rpg-ui.js';
import {createState,dispatch,totalXp} from '../js/engine.js';
import {getAvailableEncounters} from '../js/rpg.js';

function fixture(){
 let time=0,timerId=0;
 const timers=new Map(),targets=[];
 class Target{
  constructor(tagName,parentNode=null){this.tagName=tagName.toUpperCase();this.parentNode=parentNode;this.children=[];this.attributes={};this.listeners=new Map();this.textContent='';this.disabled=false;targets.push(this);}
  get isConnected(){return this===document||Boolean(this.parentNode?.isConnected);}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node);}}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}
  setAttribute(key,value){this.attributes[key]=value;}
  getContext(){return null;}
  addEventListener(type,fn,capture=false){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push({fn,capture});}
  removeEventListener(type,fn,capture=false){this.listeners.set(type,(this.listeners.get(type)??[]).filter(listener=>listener.fn!==fn||listener.capture!==capture));}
  emit(type,values={}){
   const event={type,target:this,detail:0,button:0,pointerId:1,preventDefault(){this.defaultPrevented=true;},...values},path=[];
   for(let target=this;target;target=target.parentNode)path.push(target);
   for(const target of [...path].reverse())for(const {fn,capture} of [...(target.listeners.get(type)??[])])if(capture)fn(event);
   for(const target of path)for(const {fn,capture} of [...(target.listeners.get(type)??[])])if(!capture)fn(event);
   return event;
  }
 }
 const host=new Target('window');host.performance={now:()=>time};
 host.setTimeout=(fn,delay)=>{const id=++timerId;timers.set(id,{at:time+delay,fn});return id;};host.clearTimeout=id=>timers.delete(id);
 const document=new Target('document',host);document.defaultView=host;document.hidden=false;document.createElement=tag=>new Target(tag);
 document.documentElement=new Target('html');document.append(document.documentElement);const body=new Target('body');document.documentElement.append(body);
 const advance=duration=>{const end=time+duration;while(true){const due=[...timers].filter(([,task])=>task.at<=end).sort((a,b)=>a[1].at-b[1].at);if(!due.length)break;const [id,task]=due[0];timers.delete(id);time=task.at;task.fn();}time=end;};
 const listenerCount=()=>targets.reduce((total,target)=>total+[...target.listeners.values()].reduce((count,list)=>count+list.length,0),0);
 return {document,host,body,timers,advance,listenerCount};
}
const tree=node=>[node,...node.children.flatMap(tree)];
const text=node=>tree(node).map(child=>child.textContent).join(' ');
const act=(state,command)=>dispatch(state,command,1000000);
function field(kind='road'){let state=createState();state=act(state,{type:'RPG_TRAVEL',mapId:'world'});return act(state,{type:'RPG_FIELD_START',kind,chapterId:'CH-0'});}
function mount(f,{state=field(),minimumDisplayMs}={}){
 let starts=0;
 const intro=mountEncounterIntro({document:f.document,state,onStart:()=>starts++,minimumDisplayMs});f.body.append(intro.element);
 const start=tree(intro.element).find(node=>node.tagName==='BUTTON');
 return {intro,start,state,get starts(){return starts;}};
}
function pointerClick(button,id=1){button.emit('pointerdown',{pointerId:id});button.emit('pointerup',{pointerId:id});button.emit('click',{detail:1,pointerId:id});}

test('an encounter presents the enemy, HP and one start button, without battle actions or changing the save',()=>{
 const f=fixture(),state=field(),before=structuredClone(state),m=mount(f,{state});
 assert.match(text(m.intro.element),/敵が現れた！.*画面を確かめてから戦闘をはじめよう/);
 assert.ok(text(m.intro.element).includes(state.rpg.battle.enemy.name));assert.match(text(m.intro.element),/あなたのHP 32 \/ 32/);
 assert.equal(tree(m.intro.element).filter(node=>node.tagName==='BUTTON').length,1);assert.equal(m.start.textContent,'戦闘をはじめる');
 assert.equal(tree(m.intro.element).filter(node=>node.attributes['data-rpg-action']).length,0);
 assert.equal(m.start.disabled,true);f.advance(599);assert.equal(m.start.disabled,true);f.advance(1);assert.equal(m.start.disabled,false);
 pointerClick(m.start);assert.equal(m.starts,1);assert.deepEqual(state,before);assert.equal(f.timers.size,0);assert.equal(f.listenerCount(),0);
});

test('a pointer already held before the encounter keeps start disabled after 600 ms and its release cannot click through',()=>{
 const f=fixture(),stopTracking=trackEncounterInputs(f.document);
 f.body.emit('pointerdown',{pointerId:7});const m=mount(f);f.advance(1600);assert.equal(m.start.disabled,true);
 f.host.emit('pointerup',{pointerId:8});assert.equal(m.start.disabled,true);
 m.start.emit('pointerup',{pointerId:7});assert.equal(m.start.disabled,false);
 m.start.emit('click',{detail:1,pointerId:7});assert.equal(m.starts,0);
 pointerClick(m.start,9);assert.equal(m.starts,1);stopTracking();assert.equal(f.listenerCount(),0);
});

test('all held fingers and keys must be released, and a repeat key cannot start a newly enabled encounter',()=>{
 const f=fixture(),stopTracking=trackEncounterInputs(f.document);
 f.body.emit('pointerdown',{pointerId:1});f.body.emit('pointerdown',{pointerId:2});f.body.emit('keydown',{key:'ArrowDown',code:'ArrowDown'});
 const m=mount(f);f.advance(600);f.host.emit('pointerup',{pointerId:1});assert.equal(m.start.disabled,true);
 f.host.emit('pointercancel',{pointerId:2});assert.equal(m.start.disabled,true);f.host.emit('keyup',{key:'ArrowDown',code:'ArrowDown'});assert.equal(m.start.disabled,false);
 const repeat=m.start.emit('keydown',{key:'Enter',code:'Enter',repeat:true});assert.equal(repeat.defaultPrevented,true);m.start.emit('click');assert.equal(m.starts,0);
 f.host.emit('keyup',{key:'Enter',code:'Enter'});f.advance(250);m.start.emit('keydown',{key:'Enter',code:'Enter',repeat:false});m.start.emit('click');assert.equal(m.starts,1);
 stopTracking();assert.equal(f.listenerCount(),0);
});

test('held space release does not start the battle; fresh keyboard and assistive activations remain available',()=>{
 for(const activation of ['keyboard','assistive']){
  const f=fixture(),stopTracking=trackEncounterInputs(f.document);f.body.emit('keydown',{key:' ',code:'Space'});
  const m=mount(f);f.advance(600);assert.equal(m.start.disabled,true);
  m.start.emit('keyup',{key:' ',code:'Space'});assert.equal(m.start.disabled,false);m.start.emit('click');assert.equal(m.starts,0);
  if(activation==='keyboard'){
   m.start.emit('keydown',{key:' ',code:'Space',repeat:false});m.start.emit('keyup',{key:' ',code:'Space'});
  }else f.advance(250);
  m.start.emit('click');m.start.emit('click');assert.equal(m.starts,1,activation);stopTracking();assert.equal(f.listenerCount(),0);
 }
});

test('pressing during the introduction, canceling a press, and stale mouse clicks do not start the battle',()=>{
 const f=fixture(),m=mount(f);m.start.emit('pointerdown');f.advance(700);assert.equal(m.start.disabled,true);
 m.start.emit('pointerup');assert.equal(m.start.disabled,false);m.start.emit('click',{detail:1});assert.equal(m.starts,0);
 m.start.emit('pointerdown');m.start.emit('pointercancel');m.start.emit('click',{detail:1});assert.equal(m.starts,0);
 m.start.emit('click',{detail:1});assert.equal(m.starts,0);pointerClick(m.start);assert.equal(m.starts,1);
});

test('two start clicks are consumed once, and destroy removes timers and listeners before any callback can run',()=>{
 const f=fixture(),m=mount(f);f.advance(600);m.start.emit('click');m.start.emit('click');pointerClick(m.start);assert.equal(m.starts,1);assert.equal(m.start.disabled,true);
 const g=fixture(),n=mount(g);assert.equal(g.timers.size,1);n.intro.destroy();n.intro.destroy();assert.equal(g.timers.size,0);assert.equal(g.listenerCount(),0);
 g.advance(5000);n.start.emit('click');pointerClick(n.start);assert.equal(n.starts,0);
});

test('removed and hidden introductions never start, and a longer display duration is respected',()=>{
 const f=fixture(),m=mount(f,{minimumDisplayMs:1200});f.advance(1199);assert.equal(m.start.disabled,true);f.advance(1);assert.equal(m.start.disabled,false);
 f.document.hidden=true;m.start.emit('click');assert.equal(m.starts,0);f.document.hidden=false;m.intro.element.remove();pointerClick(m.start);m.start.emit('click');assert.equal(m.starts,0);m.intro.destroy();assert.equal(f.listenerCount(),0);
 const g=fixture(),n=mount(g,{minimumDisplayMs:0});g.advance(599);assert.equal(n.start.disabled,true);g.advance(1);assert.equal(n.start.disabled,false);n.intro.destroy();
});

test('returning to a tab after the minimum display time enables its still-mounted introduction',()=>{
 const f=fixture(),m=mount(f);f.document.hidden=true;f.document.emit('visibilitychange');f.advance(900);assert.equal(m.start.disabled,true);
 f.document.hidden=false;f.document.emit('visibilitychange');assert.equal(m.start.disabled,false);m.start.emit('click');assert.equal(m.starts,1);
});

test('the desert warning explains its danger and safe retreat using the real enemy without advancing a turn',()=>{
 const f=fixture(),state=field('desert'),before=structuredClone(state),m=mount(f,{state});
 assert.ok(text(m.intro.element).includes(state.rpg.battle.enemy.name));assert.match(text(m.intro.element),/とても強い魔物.*「にげる」で必ず逃げられます.*教会で回復/);
 assert.equal(state.rpg.battle.turn,1);assert.equal(state.rpg.coins,0);assert.equal(totalXp(state),0);assert.deepEqual(state,before);m.intro.destroy();
});

test('the same introduction works for a cave gate and leaves its quest, turn and rewards unchanged',()=>{
 const f=fixture();let state=createState();state=act(state,{type:'NPC',index:0});state=act(state,{type:'ACCEPT',id:'PR-01',timed:false});state=act(state,{type:'RPG_TRAVEL',mapId:'cave:CH-0'});
 const encounter=getAvailableEncounters(state).find(item=>item.checkpoint===0);
 state=act(state,{type:'RPG_BATTLE_START',encounterId:encounter.id});
 const before=structuredClone(state),m=mount(f,{state});assert.ok(text(m.intro.element).includes(state.rpg.battle.enemy.name));
 assert.doesNotMatch(text(m.intro.element),/とても強い魔物です/);f.advance(600);m.start.emit('click');assert.equal(m.starts,1);assert.deepEqual(state,before);
});
