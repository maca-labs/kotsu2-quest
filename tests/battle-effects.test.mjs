import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mountBattleTurn} from '../js/battle-effects.js';
import {renderRpgBattle} from '../js/rpg-ui.js';
import {createState,dispatch,parseSave,totalXp} from '../js/engine.js';
import {getAvailableEncounters} from '../js/rpg.js';

function fixture(){
 let time=0,timerId=0;
 const timers=new Map();
 class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.events=new Map();this.textContent='';this.className='';this.disabled=false;this.hidden=false;this.style={minHeight:''};this.parentNode=null;this.classList={toggle:(name,on)=>{const classes=new Set(this.className.split(/\s+/).filter(Boolean));if(on)classes.add(name);else classes.delete(name);this.className=[...classes].join(' ');},contains:name=>this.className.split(/\s+/).includes(name)};}
  get isConnected(){return this===document.body||Boolean(this.parentNode?.isConnected);}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node);}}
  insertBefore(node,reference){if(!reference){this.append(node);return;}const at=this.children.indexOf(reference);assert.ok(at>=0);node.parentNode=this;this.children.splice(at,0,node);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  removeAttribute(key){delete this.attributes[key];}
  getAttribute(key){return this.attributes[key]??null;}
  addEventListener(type,fn){if(!this.events.has(type))this.events.set(type,new Set());this.events.get(type).add(fn);}
  removeEventListener(type,fn){this.events.get(type)?.delete(fn);}
  getContext(){return null;}
  getBoundingClientRect(){return {height:54};}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}
  querySelectorAll(selector){return tree(this).slice(1).filter(node=>selector==='button'?node.tagName==='BUTTON':selector.startsWith('.')?node.classList.contains(selector.slice(1)):Object.hasOwn(node.attributes,selector.slice(1,-1)));}
  querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
  click(){const event={preventDefault(){},stopPropagation(){}};for(const fn of [...(this.events.get('click')??[])])fn(event);}
 }
 const host={setTimeout(fn,delay){const id=++timerId;timers.set(id,{at:time+delay,fn});return id;},clearTimeout(id){timers.delete(id);}};
 const document={defaultView:host,createElement:tag=>new Element(tag)};document.body=new Element('body');
 const advance=duration=>{const end=time+duration;while(true){const due=[...timers].filter(([,task])=>task.at<=end).sort((a,b)=>a[1].at-b[1].at);if(!due.length)break;const [id,task]=due[0];timers.delete(id);time=task.at;task.fn();}time=end;};
 return {document,timers,advance};
}
const tree=node=>[node,...node.children.flatMap(tree)];
const act=(state,command)=>dispatch(state,command,2000000);
const turn=(state,action)=>act(state,{type:'RPG_BATTLE_ACTION',battleId:state.rpg.battle.id,turn:state.rpg.battle.turn,action});
function field(kind='road',chapterId='CH-0',initial=createState()){let state=act(initial,{type:'CHAPTER',id:chapterId});state=act(state,{type:'RPG_REST'});state=act(state,{type:'RPG_TRAVEL',mapId:'world'});return act(state,{type:'RPG_FIELD_START',kind,chapterId});}
function cave(){let state=act(createState(),{type:'NPC',index:0});state=act(state,{type:'ACCEPT',id:'PR-01',timed:false});state=act(state,{type:'RPG_TRAVEL',mapId:'cave:CH-0'});return act(state,{type:'RPG_BATTLE_START',encounterId:getAvailableEncounters(state).find(item=>item.checkpoint===0).id});}
function play(before,action,{reducedMotion=false,after=turn(before,action)}={}){
 const f=fixture();let completed=0,actions=0;
 const root=renderRpgBattle({document:f.document,state:before,onAction:()=>actions++});f.document.body.append(root);
 const controller=mountBattleTurn({document:f.document,root,beforeState:before,afterState:after,action,onComplete:()=>completed++,reducedMotion});
 return {...f,root,controller,before,after,q:selector=>root.querySelector(selector),get completed(){return completed;},get actions(){return actions;}};
}
const numberValues=p=>p.root.querySelectorAll('.rpg-damage-number').map(node=>node.textContent);

test('attack flashes the foe and displays committed damage before HP and the separate enemy counterattack',()=>{
 const before=field(),after=turn(before,'attack'),snapshot=structuredClone({before,after}),p=play(before,'attack',{after});
 assert.equal(p.q('[data-battle-enemy-hp]').value,14);assert.equal(p.q('[data-battle-hero-hp]').value,32);assert.equal(p.root.getAttribute('aria-busy'),'true');
 assert.equal(p.q('[data-battle-message]').style.minHeight,'54px');assert.equal(p.q('[data-battle-skip]').parentNode,p.q('[data-battle-intent]'));
 for(const button of p.root.querySelectorAll('button').filter(node=>node.getAttribute('data-rpg-action')!==null)){assert.equal(button.disabled,true);button.click();}assert.equal(p.actions,0);
 p.advance(149);assert.deepEqual(numberValues(p),[]);p.advance(1);assert.deepEqual(numberValues(p),['6']);assert.ok(p.q('[data-battle-enemy]').classList.contains('is-hit'));assert.ok(p.q('.rpg-battle-slash'));assert.equal(p.q('[data-battle-enemy-hp]').value,8);assert.equal(p.q('[data-battle-hero-hp]').value,32);
 p.advance(420);assert.deepEqual(numberValues(p),['6','3']);assert.equal(p.q('[data-battle-hero-hp]').value,29);assert.ok(p.q('[data-battle-hero]').classList.contains('is-hit'));assert.equal(p.completed,0);
 p.advance(550);assert.equal(p.completed,1);assert.equal(p.timers.size,0);assert.equal(p.root.getAttribute('aria-busy'),null);assert.equal(p.q('[data-battle-message]').style.minHeight,'');assert.deepEqual({before,after},snapshot);assert.equal(parseSave(JSON.stringify(after)).rpg.battle.turn,2);
});

test('a strong strike shows 10, guard takes 2, and a charge turn does not reuse an old damage number',()=>{
 const strong=play(field(),'skill');strong.advance(150);assert.deepEqual(numberValues(strong),['10']);assert.match(strong.q('[data-battle-message]').textContent,/強打.*10/);strong.controller.destroy();
 const guard=play(field(),'guard');assert.ok(guard.q('[data-battle-hero]').classList.contains('is-guarding'));guard.advance(360);assert.deepEqual(numberValues(guard),['2']);assert.equal(guard.q('[data-battle-hero-hp]').value,30);assert.equal(guard.q('[data-battle-enemy-hp]').value,14);guard.controller.destroy();
 const strongCounter=play(turn(turn(field(),'guard'),'guard'),'guard');strongCounter.advance(360);assert.deepEqual(numberValues(strongCounter),['4']);assert.match(strongCounter.q('[data-battle-message]').textContent,/強い攻撃！ 4/);strongCounter.controller.destroy();
 const beforeCharge=turn(field(),'attack'),charge=play(beforeCharge,'guard');charge.advance(570);assert.deepEqual(numberValues(charge),[]);assert.equal(charge.q('[data-battle-hero-hp]').value,29);assert.match(charge.q('[data-battle-message]').textContent,/力をためている/);assert.ok(charge.q('[data-battle-enemy]').classList.contains('is-charging'));charge.advance(550);assert.equal(charge.completed,1);
});

test('a full ten-line battle log still yields the current attack and counterattack',()=>{
 let before=field();for(let n=0;n<6;n++)before=turn(before,'guard');assert.equal(before.rpg.battle.log.length,10);assert.equal(before.rpg.battle.turn,7);
 const p=play(before,'attack');assert.equal(p.after.rpg.battle.log.length,10);p.advance(570);assert.deepEqual(numberValues(p),['6','3']);assert.match(p.q('[data-battle-message]').textContent,/3ダメージ/);p.controller.destroy();
});

test('a lethal attack keeps its full damage number, makes the enemy disappear, and never counterattacks or repeats loot',()=>{
 let before=turn(field(),'skill');before=turn(before,'guard');assert.equal(before.rpg.battle.enemyHp,4);const p=play(before,'attack'),snapshot=structuredClone(p.after);
 p.advance(150);assert.deepEqual(numberValues(p),['6']);assert.equal(p.q('[data-battle-enemy-hp]').value,0);p.advance(270);assert.ok(p.q('[data-battle-enemy]').classList.contains('is-defeated'));p.advance(180);assert.equal(p.q('[data-battle-enemy]').hidden,true);assert.deepEqual(numberValues(p),['6']);p.advance(440);assert.equal(p.completed,1);assert.deepEqual(p.after,snapshot);assert.equal(p.after.rpg.coins,12);assert.equal(p.after.rpg.eventLog.filter(event=>event.kind==='loot').length,1);
 const won=renderRpgBattle({document:p.document,state:p.after});assert.equal(won.querySelector('[data-battle-enemy]'),null);assert.ok(won.querySelector('.rpg-enemy-gone'));assert.deepEqual(parseSave(JSON.stringify(p.after)).rpg,p.after.rpg);
});

test('a victory heal is shown as recovery and cannot become a negative or enemy damage popup',()=>{
 let initial=parseSave(fs.readFileSync(new URL('./fixtures/pre-extension-v3.json',import.meta.url),'utf8'));initial=act(initial,{type:'EQUIP',id:'traveler-staff'});let before=field('road','CH-6',initial);
 while(before.rpg.battle.enemyHp>5)before=turn(before,'attack');const p=play(before,'attack');assert.equal(p.after.rpg.battle.status,'won');assert.equal(p.after.rpg.hp-before.rpg.hp,3);
 p.advance(600);assert.deepEqual(numberValues(p),['5']);assert.match(p.q('[data-battle-message]').textContent,/HPが3回復/);assert.equal(p.q('[data-battle-hero-hp]').value,p.after.rpg.hp);p.advance(440);assert.equal(p.completed,1);
});

test('desert defeat displays the actual 88 damage and zero HP before the saved church revival',()=>{
 const before=field('desert'),p=play(before,'attack'),snapshot=structuredClone(p.after);assert.equal(before.rpg.hp,32);assert.equal(p.after.rpg.hp,32);assert.equal(p.after.rpg.battle.status,'lost');
 p.advance(570);assert.deepEqual(numberValues(p),['1','88']);assert.equal(p.q('[data-battle-hero-hp]').value,0);assert.match(p.q('[data-battle-message]').textContent,/88ダメージ.*倒れた/);p.advance(310);assert.ok(p.q('[data-battle-hero]').classList.contains('is-defeated'));assert.match(p.q('[data-battle-message]').textContent,/始まりの教会/);p.advance(400);assert.equal(p.completed,1);assert.deepEqual(p.after,snapshot);assert.equal(totalXp(p.after),0);assert.equal(p.after.rpg.coins,0);assert.equal(p.after.rpg.eventLog.filter(event=>event.kind==='revive').length,1);
 const revived=renderRpgBattle({document:p.document,state:p.after});assert.equal(revived.querySelector('[data-battle-hero-hp]').value,32);assert.deepEqual(parseSave(JSON.stringify(p.after)).rpg,p.after.rpg);
});

test('a cave defeat displays zero HP and the inn destination rather than a church recovery',()=>{
 let before=cave(),after;for(let n=0;n<100;n++){after=turn(before,'guard');if(after.rpg.battle.status==='lost')break;before=after;}assert.equal(after.rpg.battle.status,'lost');
 const p=play(before,'guard',{after});p.advance(880);assert.equal(p.q('[data-battle-hero-hp]').value,0);assert.match(p.q('[data-battle-message]').textContent,/宿へ運んで/);assert.equal(after.rpg.hp,0);p.advance(400);assert.equal(p.completed,1);
});

test('flee is brief, shows no damage, and keeps learning, health and coins unchanged',()=>{
 const before=field(),p=play(before,'flee');assert.ok(p.q('[data-battle-hero]').classList.contains('is-fleeing'));p.advance(439);assert.deepEqual(numberValues(p),[]);assert.equal(p.completed,0);p.advance(1);assert.equal(p.completed,1);assert.equal(p.after.rpg.hp,before.rpg.hp);assert.equal(p.after.rpg.coins,before.rpg.coins);assert.deepEqual(p.after.rewardEvents,before.rewardEvents);assert.deepEqual(p.after.financialScenarios,before.financialScenarios);
});

test('skip completes once while destroy and detached roots cancel all timers without completing or replaying the turn',()=>{
 const skip=play(field(),'attack'),snapshot=structuredClone(skip.after),button=skip.q('[data-battle-skip]');button.click();button.click();skip.advance(5000);assert.equal(skip.completed,1);assert.equal(skip.timers.size,0);assert.deepEqual(skip.after,snapshot);
 const canceled=play(field(),'skill');canceled.advance(150);assert.ok(canceled.q('[data-battle-enemy]').classList.contains('is-hit'));canceled.controller.destroy();canceled.controller.destroy();assert.equal(canceled.timers.size,0);assert.equal(canceled.q('.rpg-damage-number'),null);assert.equal(canceled.q('[data-battle-enemy]').classList.contains('is-hit'),false);canceled.advance(5000);assert.equal(canceled.completed,0);assert.equal(canceled.after.rpg.battle.turn,2);
 const detached=play(field(),'attack');detached.root.remove();detached.advance(5000);assert.equal(detached.completed,0);assert.equal(detached.timers.size,0);
});

test('reduced motion presents numbers and results briefly without blinking, slashing, shaking or moving',()=>{
 for(const action of ['attack','guard','flee']){
  const p=play(field(),action,{reducedMotion:true});assert.ok(p.root.classList.contains('battle-motion-reduced'));p.advance(20);assert.equal(p.q('.rpg-battle-slash'),null);for(const target of [p.q('[data-battle-enemy]'),p.q('[data-battle-hero]')])for(const name of ['is-hit','is-striking','is-fleeing','is-charging'])assert.equal(target.classList.contains(name),false);
  assert.deepEqual(numberValues(p),action==='attack'?['6','3']:action==='guard'?['2']:[]);p.advance(320);assert.equal(p.completed,1);
 }
 const before=turn(turn(field(),'skill'),'guard'),won=play(before,'attack',{reducedMotion:true});won.advance(20);assert.equal(won.q('[data-battle-enemy]').hidden,true);assert.match(won.q('[data-battle-message]').textContent,/敵を倒した/);won.advance(320);assert.equal(won.completed,1);
});
