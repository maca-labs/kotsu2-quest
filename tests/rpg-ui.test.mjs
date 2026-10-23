import test from 'node:test';
import assert from 'node:assert/strict';
import {renderRpgBattle,renderRpgShop,renderRpgEquipment} from '../js/rpg-ui.js';
import {createState,dispatch,activeStep} from '../js/engine.js';
import {getRpgView,getBattleStats} from '../js/rpg.js';

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.textContent='';this.events={};this.disabled=false;}
 append(...nodes){for(const node of nodes){this.children.push(node);node.parent=this;}}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(name,fn){this.events[name]=fn;}
 getContext(){return null;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 click(){this.events.click?.();}
}
const doc={createElement:tag=>new Element(tag)},tree=node=>[node,...node.children.flatMap(child=>tree(child))],text=node=>tree(node).map(child=>child.textContent).join(' '),buttons=node=>tree(node).filter(child=>child.tagName==='BUTTON');
const find=(root,label)=>buttons(root).find(button=>button.textContent===label);
const act=(state,command)=>dispatch(state,command,1000000);
function ready(){let state=createState();state=act(state,{type:'NPC',index:0});state=act(state,{type:'ACCEPT',id:'PR-01',timed:false});state=act(state,{type:'RPG_TRAVEL',mapId:'cave:CH-0'});const enc=getRpgView(state).encounters.find(item=>item.checkpoint===0);return act(state,{type:'RPG_BATTLE_START',encounterId:enc.id});}
function turn(state,action){return act(state,{type:'RPG_BATTLE_ACTION',battleId:state.rpg.battle.id,turn:state.rpg.battle.turn,action});}
function win(state){for(let i=0;state.rpg.battle.status==='active'&&i<100;i++)state=turn(state,state.rpg.battle.skillUsed?'attack':'skill');assert.equal(state.rpg.battle.status,'won');return state;}
function fundedShop(){let state=win(ready());while(activeStep(state)){const step=activeStep(state);state=act(state,{type:'STEP',id:step.id,value:step.type==='check'?true:step.value});}const last=getRpgView(state).encounters.find(item=>item.checkpoint===12);state=act(state,{type:'RPG_BATTLE_START',encounterId:last.id});state=win(state);return act(state,{type:'RPG_TRAVEL',mapId:'shop:CH-0'});}

test('battle renders the real HP, intent, equipment totals, and frozen action token without mutating game state',()=>{
 const state=ready(),before=structuredClone(state),calls=[],root=renderRpgBattle({document:doc,state,onAction:(...args)=>calls.push(args)}),view=getRpgView(state),battle=view.battle;
 assert.ok(text(root).includes(battle.enemy.name));assert.ok(text(root).includes(battle.enemyIntent.label));assert.match(text(root),/装備込みの攻撃 7 ／ 防御 2/);assert.equal(tree(root).find(node=>node.tagName==='PROGRESS'&&node.attributes['aria-label']==='あなたのHP').value,32);
 for(const action of battle.actions){const control=tree(root).find(node=>node.attributes['data-rpg-action']===action.id);assert.equal(control.disabled,!action.enabled);control.click();assert.deepEqual(calls.at(-1),[action.id,battle.id,battle.turn]);}
 assert.match(text(root),/教材の円・ポイント・暗号資産とは別/);assert.deepEqual(state,before);
});

test('used strong strike is disabled, while guard and flee still send the current battle turn',()=>{
 const state=turn(ready(),'skill'),calls=[],root=renderRpgBattle({document:doc,state,onAction:(...args)=>calls.push(args)}),skill=tree(root).find(node=>node.attributes['data-rpg-action']==='skill');assert.equal(skill.disabled,true);assert.match(text(skill),/使用済み/);skill.click();assert.deepEqual(calls,[]);
 tree(root).find(node=>node.attributes['data-rpg-action']==='guard').click();tree(root).find(node=>node.attributes['data-rpg-action']==='flee').click();assert.deepEqual(calls.map(item=>item[0]),['guard','flee']);assert.ok(calls.every(item=>item[2]===2));
});

test('won, replayed, fled, and lost battles show the correct result and continuation without awarding coins',()=>{
 const won=win(ready()),before=structuredClone(won),calls=[],root=renderRpgBattle({document:doc,state:won,onContinue:()=>calls.push('continue'),onTown:()=>calls.push('town')});assert.match(text(root),/初勝利の冒険コイン 12枚/);assert.equal(tree(root).filter(node=>node.attributes['data-rpg-action']).length,0);find(root,'用事の続きを進める').click();find(root,'町の宿へ戻る').click();assert.deepEqual(calls,['continue','town']);assert.deepEqual(won,before);
 const replay=win(act(won,{type:'RPG_BATTLE_START',encounterId:won.rpg.battle.encounterId})),replayRoot=renderRpgBattle({document:doc,state:replay});assert.match(text(replayRoot),/再戦にも勝利/);assert.doesNotMatch(text(replayRoot),/初勝利の冒険コイン/);assert.equal(replay.rpg.coins,12);
 const fled=turn(ready(),'flee'),fleeRoot=renderRpgBattle({document:doc,state:fled,onContinue:()=>calls.push('path')});assert.match(text(fleeRoot),/勝利コインは増えません/);find(fleeRoot,'道へ戻る').click();assert.equal(calls.at(-1),'path');
 let lost=ready();for(let i=0;lost.rpg.battle.status==='active'&&i<100;i++)lost=turn(lost,'guard');const lostRoot=renderRpgBattle({document:doc,state:lost,onTown:()=>calls.push('rest')});assert.equal(lost.rpg.hp,0);assert.match(text(lostRoot),/コインや用事の続きは、そのまま/);find(lostRoot,'町の宿へ戻る').click();assert.equal(calls.at(-1),'rest');
});

test('shop requires a visible purchase confirmation and keeps owned/equipped controls separate',()=>{
 let state=fundedShop();const before=structuredClone(state),buys=[],equips=[],root=renderRpgShop({document:doc,state,onBuy:id=>buys.push(id),onEquip:id=>equips.push(id)}),card=tree(root).find(node=>node.attributes['aria-label']==='こだまの銅剣');assert.match(text(card),/攻撃 \+4/);assert.match(text(card),/24 冒険コイン/);find(card,'この品を買う').click();assert.deepEqual(buys,[]);assert.match(text(card),/いま持っている冒険コイン：27 枚/);find(card,'買わずに戻る').click();assert.equal(find(card,'この内容で買う'),undefined);
 find(card,'この品を買う').click();find(card,'この内容で買う').click();assert.deepEqual(buys,['rpg-copper-sword']);assert.deepEqual(state,before);
 state=act(state,{type:'RPG_BUY',gearId:'rpg-copper-sword'});let purchased=renderRpgShop({document:doc,state,onEquip:id=>equips.push(id)}),owned=tree(purchased).find(node=>node.attributes['aria-label']==='こだまの銅剣');assert.match(text(owned),/購入済み・まだ装備していません/);assert.equal(find(owned,'この品を買う'),undefined);find(owned,'この装備を身につける').click();assert.deepEqual(equips,['rpg-copper-sword']);
 state=act(state,{type:'RPG_EQUIP',gearId:'rpg-copper-sword'});purchased=renderRpgShop({document:doc,state});owned=tree(purchased).find(node=>node.attributes['aria-label']==='こだまの銅剣');assert.equal(find(owned,'装備中').disabled,true);
});

test('the shop offers a leave action before the shelf as well as after it',()=>{
 const state=createState(),before=structuredClone(state),calls=[],root=renderRpgShop({document:doc,state,onLeave:()=>calls.push('leave')}),top=find(root,'店の外へ'),bottom=find(root,'店を出て町へ戻る'),nodes=tree(root);
 assert.ok(top);assert.ok(bottom);assert.ok(nodes.indexOf(top)<nodes.findIndex(node=>node.attributes['aria-label']==='こだまの銅剣'));top.click();bottom.click();assert.deepEqual(calls,['leave','leave']);assert.deepEqual(state,before);
});

test('shop shortages cannot buy and equipment shows actual engine totals only after equipping',()=>{
 let state=createState();state=act(state,{type:'RPG_TRAVEL',mapId:'shop:CH-0'});const buys=[],poor=renderRpgShop({document:doc,state,onBuy:id=>buys.push(id)});for(const button of buttons(poor).filter(button=>button.textContent==='冒険コインが足りません')){assert.equal(button.disabled,true);button.click();}assert.deepEqual(buys,[]);
 state=fundedShop();state=act(state,{type:'RPG_BUY',gearId:'rpg-copper-sword'});const before=structuredClone(state),equipCalls=[],root=renderRpgEquipment({document:doc,state,onEquip:id=>equipCalls.push(id)});assert.equal(getBattleStats(state).attack,7);assert.match(text(root),/購入済み・まだ装備していません/);assert.match(text(root),/買っただけでは強さは変わりません/);assert.deepEqual(state,before);
 find(root,'この装備を身につける').click();assert.deepEqual(equipCalls,['rpg-copper-sword']);state=act(state,{type:'RPG_EQUIP',gearId:equipCalls[0]});const equipped=renderRpgEquipment({document:doc,state});assert.equal(getBattleStats(state).attack,10);assert.match(text(equipped),/武器：こだまの銅剣/);assert.ok(tree(equipped).some(node=>node.tagName==='DD'&&node.textContent==='10'));assert.match(text(equipped),/スマホの確認や章の試練/);
});
