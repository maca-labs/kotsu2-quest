import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,chapterAvailable,parseSave} from '../js/engine.js';
import {chapterById} from '../js/content.js';
import {getAvailableEncounters} from '../js/rpg.js';

// Run the production startup/hash callbacks with the real engine. The DOM shell is
// intentionally absent: these failures concerned saved location and combat state.
const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const startupView=source.match(/ui\.view=state\.started\?[^;]+;/)?.[0];
const initialHash=source.split('\n').find(line=>line.startsWith('if(location.hash&&'));
const hashChange=source.split('\n').find(line=>line.startsWith("addEventListener('hashchange'"));
function environment(state,hash){
 const context={state:structuredClone(state),location:{hash},ui:{view:'home'},chapterById,chapterAvailable,renders:0,now:Date.now(),handler:null};
 context.act=(command,options={})=>{context.state=dispatch(context.state,command,++context.now);if(options.view)context.ui.view=options.view;return true;};
 context.render=()=>context.renders++;
 context.nav=view=>{context.ui.view=view;context.renders++;};
 context.addEventListener=(_,handler)=>context.handler=handler;
 vm.createContext(context);vm.runInContext(startupView,context);vm.runInContext(initialHash,context);vm.runInContext(hashChange,context);return context;
}
function battle(){let state=createState(),now=Date.now();for(const command of [{type:'START'},{type:'NPC',chapterId:'CH-0',index:0},{type:'ACCEPT',id:'PR-01'},{type:'RPG_TRAVEL',mapId:'world'},{type:'RPG_TRAVEL',mapId:'cave:CH-0'}])state=dispatch(state,command,++now);return dispatch(state,{type:'RPG_BATTLE_START',encounterId:getAvailableEncounters(state)[0].id},++now);}

test('chapter deep links synchronize visible chapter and saved town, including entry into its house',()=>{
 for(const id of ['CH-0','CH-5','CH-6']){const context=environment(createState(),'#'+id);assert.equal(context.ui.view,'world');assert.equal(context.state.currentChapter,id);assert.equal(context.state.rpg.location.mapId,'town:'+id);context.act({type:'RPG_TRAVEL',mapId:'town:'+id});assert.equal(parseSave(JSON.stringify(context.state)).currentChapter,id);}
});
test('startup and valid or invalid hash changes preserve an active combat and its exact turn',()=>{
 const saved=battle();for(const hash of ['#CH-5','#not-a-chapter']){const context=environment(saved,hash);assert.equal(context.ui.view,'combat');assert.deepEqual(context.state,saved);context.ui.view='settings';context.handler();assert.equal(context.ui.view,'combat');assert.deepEqual(context.state,saved);assert.equal(context.state.rpg.battle.turn,1);}
});
test('ordinary hash changes use the chapter command while invalid links return to the home menu',()=>{
 const context=environment(createState(),'');context.location.hash='#CH-5';context.handler();assert.equal(context.state.currentChapter,'CH-5');assert.equal(context.state.rpg.location.mapId,'town:CH-5');assert.equal(context.ui.view,'world');const before=structuredClone(context.state);context.location.hash='#missing';context.handler();assert.equal(context.ui.view,'home');assert.deepEqual(context.state,before);
});
