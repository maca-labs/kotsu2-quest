import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,parseSave} from '../js/engine.js';
import {getAvailableEncounters,getRpgView} from '../js/rpg.js';

const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const combatSource=source.slice(source.indexOf('function renderCombatView('),source.indexOf('function maybeFieldEncounter('));
function savedBattle(kind='road'){
 let state=createState(),now=Date.now();
 const commands=[{type:'START'}];
 if(kind==='gate')commands.push({type:'NPC',chapterId:'CH-0',index:0},{type:'ACCEPT',id:'PR-01'});
 commands.push({type:'RPG_TRAVEL',mapId:'world'});
 if(kind==='gate')commands.push({type:'RPG_TRAVEL',mapId:'cave:CH-0'});
 for(const command of commands)state=dispatch(state,command,++now);
 return dispatch(state,kind==='gate'?{type:'RPG_BATTLE_START',encounterId:getAvailableEncounters(state)[0].id}:{type:'RPG_FIELD_START',kind,chapterId:'CH-0'},++now);
}
function screen(state){
 let now=Date.now()+1000,id=0;
 const timers=new Map(),context={state:structuredClone(state),ui:{view:'combat'},document:{querySelector:()=>null},modal:{open:false},window:{scrollTo(){}},encounterIntro:null,combatArmTimer:null,battleAnimation:null,intros:[],battleViews:[],effects:[],commands:[]};
 context.Date={now:()=>now};
 context.setTimeout=(fn,delay)=>{const key=++id;timers.set(key,{fn,due:now+delay});return key;};
 context.clearTimeout=key=>timers.delete(key);
 context.mountEncounterIntro=options=>{const intro={element:{kind:'intro'},options,destroyed:false,destroy(){this.destroyed=true;}};context.intros.push(intro);return intro;};
 context.renderRpgBattle=options=>{const buttons=getRpgView(context.state).battle.actions.map(action=>({disabled:!action.enabled,isConnected:true}));const root={kind:'battle',options,buttons,querySelectorAll:()=>buttons};context.battleViews.push(root);return root;};
 context.act=(command,options={})=>{context.commands.push(command);context.state=dispatch(context.state,command,++now);if(options.render!==false)context.render();return true;};
 context.mountBattleTurn=options=>{const effect={options,destroyed:false,destroy(){this.destroyed=true;}};context.effects.push(effect);return effect;};
 context.continueAfterBattle=context.wakeAtChurch=context.travelArea=()=>{};
 context.main={children:[],append(element){this.children.push(element);}};
 vm.createContext(context);vm.runInContext(combatSource,context);
 context.render=()=>{context.battleAnimation?.destroy();context.battleAnimation=null;context.ui.battleAnimating=false;context.encounterIntro?.destroy();context.encounterIntro=null;context.clearTimeout(context.combatArmTimer);context.combatArmTimer=null;for(const item of context.main.children)for(const button of item.buttons??[])button.isConnected=false;context.main.children=[];if(context.ui.view==='combat')context.renderCombatView(context.main);};
 context.advance=ms=>{now+=ms;for(const[key,timer]of [...timers])if(timer.due<=now){timers.delete(key);timer.fn();}};
 context.render();return context;
}

test('gate, road, desert and turn-one JSON restoration all require the intro without advancing state',()=>{
 for(const kind of ['gate','road','desert']){
  const saved=parseSave(JSON.stringify(savedBattle(kind))),c=screen(saved);
  assert.equal(c.main.children[0].kind,'intro');assert.equal(c.battleViews.length,0);assert.deepEqual(c.state,saved);
  c.ui.view='settings';c.render();assert.equal(c.intros[0].destroyed,true);
  c.ui.view='combat';c.render();assert.equal(c.main.children[0].kind,'intro');assert.equal(c.commands.length,0);
 }
});
test('explicit start blocks a second tap, preserves the remaining 350ms through settings, then allows one action',()=>{
 const c=screen(savedBattle()),before=structuredClone(c.state);c.intros.at(-1).options.onStart();
 assert.deepEqual(c.state,before);assert.equal(c.intros[0].destroyed,true);
 let view=c.battleViews.at(-1);assert.ok(view.buttons.every(button=>button.disabled));
 view.options.onAction('flee',c.state.rpg.battle.id,1);assert.equal(c.commands.length,0);
 c.advance(200);c.ui.view='settings';c.render();c.advance(100);c.ui.view='combat';c.render();
 view=c.battleViews.at(-1);assert.ok(view.buttons.every(button=>button.disabled));
 c.advance(49);view.options.onAction('attack',c.state.rpg.battle.id,1);assert.equal(c.commands.length,0);
 c.advance(1);assert.ok(view.buttons.every(button=>!button.disabled));
 view.options.onAction('guard',c.state.rpg.battle.id,1);assert.equal(c.commands.length,1);assert.equal(c.state.rpg.battle.turn,2);
 assert.equal(c.main.children[0].kind,'battle');assert.equal(c.intros.length,1);
});
test('turn-two JSON restoration resumes combat immediately without replaying an intro',()=>{
 let saved=savedBattle();saved=dispatch(saved,{type:'RPG_BATTLE_ACTION',action:'guard',battleId:saved.rpg.battle.id,turn:1},Date.now()+10);
 const c=screen(parseSave(JSON.stringify(saved)));assert.equal(c.intros.length,0);assert.equal(c.main.children[0].kind,'battle');assert.equal(c.state.rpg.battle.turn,2);assert.deepEqual(c.state,saved);
});
test('stale intro callbacks cannot acknowledge a different battle or a settings screen',()=>{
 const c=screen(savedBattle()),start=c.intros[0].options.onStart;c.ui.view='settings';c.render();start();assert.equal(c.ui.acknowledgedBattleId,undefined);
 c.state=savedBattle('desert');c.ui.view='combat';c.render();start();assert.equal(c.ui.acknowledgedBattleId,undefined);assert.equal(c.main.children[0].kind,'intro');
});


test('importing a turn-one JSON from the same battle ID clears its old acknowledgement',()=>{
 const saved=savedBattle(),c=screen(saved);c.intros[0].options.onStart();c.advance(400);c.ui.view='settings';c.render();
 c.store={replace:()=>parseSave(JSON.stringify(saved))};c.text=JSON.stringify(saved);
 const load=source.match(/const next=store\.replace\(text\);[\s\S]*?(?=ui\.room=)/)?.[0];assert.ok(load);
 vm.runInContext('{'+load+'}',c);c.ui.view='combat';c.render();
 assert.equal(c.main.children[0].kind,'intro');assert.equal(c.commands.length,0);assert.deepEqual(c.state,saved);
});
test('starting a new adventure cannot reuse an acknowledgement for its first encounter',()=>{
 const saved=savedBattle(),c=screen(saved);c.intros[0].options.onStart();c.advance(400);
 c.store={reset:()=>createState()};
 const reset=source.match(/state=store\.reset\(\);[\s\S]*?(?=modal\.close\(\))/)?.[0];assert.ok(reset);
 vm.runInContext(reset,c);assert.equal(c.ui.view,'home');
 // A fresh playthrough generates exactly the same first-battle ID.
 c.state=savedBattle();assert.equal(c.state.rpg.battle.id,saved.rpg.battle.id);c.ui.view='combat';c.render();
 assert.equal(c.main.children[0].kind,'intro');assert.equal(c.commands.length,0);
});


test('battle effects save one action before playback, reject repeats, and guard the next turn after completion',()=>{
 const c=screen(savedBattle());c.intros[0].options.onStart();c.advance(350);
 const action=c.battleViews.at(-1).options.onAction,id=c.state.rpg.battle.id;
 action('attack',id,1);assert.equal(c.commands.length,1);assert.equal(c.state.rpg.battle.turn,2);assert.equal(c.ui.battleAnimating,true);assert.equal(c.effects.length,1);
 const effect=c.effects[0],saved=structuredClone(c.state);assert.equal(effect.options.beforeState.rpg.battle.turn,1);assert.equal(effect.options.afterState.rpg.battle.turn,2);
 action('attack',id,1);action('flee',id,2);assert.equal(c.commands.length,1);
 effect.options.onComplete();assert.equal(c.ui.battleAnimating,false);assert.deepEqual(c.state,saved);
 const next=c.battleViews.at(-1);assert.ok(next.buttons.every(button=>button.disabled));next.options.onAction('guard',id,2);assert.equal(c.commands.length,1);
 c.advance(180);next.options.onAction('guard',id,2);assert.equal(c.commands.length,2);assert.equal(c.state.rpg.battle.turn,3);
});
test('destroying playback or switching the save prevents an old completion from restoring a battle',()=>{
 const c=screen(savedBattle());c.intros[0].options.onStart();c.advance(350);c.battleViews.at(-1).options.onAction('attack',c.state.rpg.battle.id,1);
 const effect=c.effects[0],saved=structuredClone(c.state);c.ui.view='settings';c.render();assert.equal(effect.destroyed,true);effect.options.onComplete();assert.equal(c.ui.view,'settings');assert.deepEqual(c.state,saved);
 c.state=savedBattle('desert');c.ui.view='combat';c.render();effect.options.onComplete();assert.equal(c.main.children[0].kind,'intro');assert.equal(c.commands.length,1);
});
test('a failed battle dispatch cannot start visual feedback or leave the UI busy',()=>{
 const c=screen(savedBattle());c.intros[0].options.onStart();c.advance(350);c.act=()=>false;
 c.battleViews.at(-1).options.onAction('attack',c.state.rpg.battle.id,1);assert.equal(c.effects.length,0);assert.equal(c.ui.battleAnimating,false);assert.equal(c.state.rpg.battle.turn,1);
});


test('menu, navigation, and chapter hashes stay blocked during a saved escape animation',()=>{
 const c=screen(savedBattle());c.intros[0].options.onStart();c.advance(350);c.battleViews.at(-1).options.onAction('flee',c.state.rpg.battle.id,1);
 assert.equal(c.state.rpg.battle.status,'fled');assert.equal(c.ui.battleAnimating,true);
 c.location={hash:'#CH-5'};c.addEventListener=(_,handler)=>c.hashHandler=handler;
 for(const prefix of ['function nav(','function openAdventureMenu(',"addEventListener('hashchange'"]){const callback=source.split('\n').find(line=>line.startsWith(prefix));assert.ok(callback);vm.runInContext(callback,c);}
 c.nav('home');c.openAdventureMenu();c.hashHandler();assert.equal(c.ui.view,'combat');assert.equal(c.state.currentChapter,'CH-0');assert.equal(c.commands.length,1);
});
test('an unavailable visual controller falls back to the already-saved result without another action',()=>{
 const c=screen(savedBattle());c.intros[0].options.onStart();c.advance(350);c.mountBattleTurn=()=>{throw new Error('visual unavailable');};
 c.battleViews.at(-1).options.onAction('guard',c.state.rpg.battle.id,1);assert.equal(c.commands.length,1);assert.equal(c.state.rpg.battle.turn,2);assert.equal(c.ui.battleAnimating,false);assert.equal(c.main.children[0].kind,'battle');
 c.advance(180);assert.ok(c.battleViews.at(-1).buttons.every(button=>!button.disabled));
});
