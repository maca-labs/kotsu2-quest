import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,dispatch,parseSave,totalXp,SAVE_KEY} from '../js/engine.js';
import {getTownLayout} from '../js/towns.js';
import {getTownDoors,doorAt,roomPeople,roomStep,nearbyRoomPerson} from '../js/rooms.js';
import {getTownTravelFeatures} from '../js/rpg-world.js';
import {mapTile,move} from '../js/world.js';

const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
function environment(chapterId){
 const state=createState();state.currentChapter=chapterId;state.rpg.location.mapId='town:'+chapterId;
 const calls=[],context={state,ui:{view:'world',room:null},paintFlags:0,store:{writable:true},modal:{open:false},getTownLayout,getTownDoors,getTownTravelFeatures,doorAt,mapTile,move,roomPeople,roomStep,nearbyRoomPerson,
  ensureStarted:()=>true,visualState:()=>state,currentChapter:()=>({title:'町'}),storyGuide:()=>({action:{},houseName:'依頼人の家'}),
  renderWorld(){},drawTownDoors(){},drawTownTravelFeatures(){},drawTownWalkGuide(){context.paintFlags++;},getTownWalkGuide:()=>null,renderRoom(){},render(){},saveQuiet(){},act(command,options={}){if(options.worldPosition)Object.assign(state.worldState,options.worldPosition);return true;},window:{scrollTo(){}},
  document:{querySelectorAll:()=>[],querySelector:()=>null},h:(tag,attrs)=>({attrs,getBoundingClientRect:()=>({left:0,top:0,width:400,height:288})}),
  openShop:()=>calls.push('shop'),enterRoom:id=>calls.push(id),talk:i=>calls.push('npc:'+i),travelArea:id=>calls.push(id),toast:message=>calls.push('hint'),roomConversation:()=>calls.push('room')};
 vm.createContext(context);
 for(const name of ['worldCanvas','walk','nearbyTalk','leaveRoom','leaveShop','normalizeTownPosition']){
  let line=source.split('\n').find(line=>line.startsWith(`function ${name}(`)||line.startsWith(`let lastWalk=0;function ${name}(`));
  assert.ok(line,name);vm.runInContext(line.replace('let lastWalk=0;',''),context);
 }
 return {context,state,calls};
}

for(let chapter=0;chapter<=6;chapter++){
 const id='CH-'+chapter;
 test(id+' actual canvas, walking and talk handlers open the current buildings and shop',()=>{
  const {context,state,calls}=environment(id),layout=getTownLayout(id),canvas=context.worldCanvas();
  assert.equal(context.paintFlags,1,'destination is drawn on arrival before the first move');
  assert.ok(canvas.attrs['aria-label'].includes(layout.description));
  for(const building of layout.buildings){
   canvas.attrs.onClick({clientX:(building.x+.5)*16,clientY:(building.y+.5)*16});assert.equal(calls.pop(),building.id);
   Object.assign(state.worldState,{x:building.door.x,y:building.door.y+1});context.walk(0,-1);assert.equal(calls.pop(),building.id);
   context.nearbyTalk();assert.equal(calls.pop(),building.id);
  }
  for(const [index,[x,y]]of layout.npcs.entries()){
   canvas.attrs.onClick({clientX:(x+.5)*16,clientY:y*16});assert.equal(calls.pop(),'npc:'+index);
  }
  Object.assign(state.worldState,{x:12,y:16});context.walk(0,1);assert.equal(calls.pop(),'world');context.nearbyTalk();assert.equal(calls.pop(),'world');
 });
 test(id+' leaving rooms returns outside their actual doors and preserves the saved lesson',()=>{
  const {context,state}=environment(id),before=JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg});
  for(const door of getTownDoors(id)){
   context.ui.room={id:door.id};context.leaveRoom();assert.equal(context.ui.room,null);assert.equal(state.worldState.x,door.x);assert.equal(state.worldState.y,door.y+1);
  }
  assert.equal(JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg}),before);
 });
 test(id+' leaving the shop returns to its own doorstep for one-step reentry',()=>{
  const {context,state,calls}=environment(id),before=JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg}),shop=getTownTravelFeatures(id).find(f=>f.type==='shop');
  context.ui.view='shop';context.leaveShop();assert.equal(context.ui.view,'world');assert.equal(state.worldState.x,shop.x);assert.equal(state.worldState.y,shop.y+1);context.walk(0,-1);assert.equal(calls.pop(),'shop');
  assert.equal(JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg}),before);
 });
}

test('old saved positions overlapping a relocated wall, sea, or person resume on a safe south road',()=>{
 for(let chapter=0;chapter<=6;chapter++){
  const id='CH-'+chapter,{context,state}=environment(id),layout=getTownLayout(id),building=layout.buildings[0],positions=[[building.x,building.y],...layout.npcs];
  for(let y=1;y<17;y++)for(let x=1;x<24;x++)if(mapTile(chapter,x,y)==='water')positions.push([x,y]);
  for(const [x,y]of positions){
   Object.assign(state.worldState,{x,y});const before=JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg});
   context.normalizeTownPosition();assert.equal(state.worldState.x,12);assert.equal(state.worldState.y,16);assert.equal(mapTile(chapter,12,16),'path');
   assert.equal(JSON.stringify({quests:state.questStates,rewards:state.rewardEvents,finance:state.financialScenarios,rpg:state.rpg}),before);
  }
 }
 const {context,state}=environment('CH-0');Object.assign(state.worldState,{x:19,y:16});context.normalizeTownPosition();assert.equal(state.worldState.x,19);assert.equal(state.worldState.y,16);assert.equal(parseSave(JSON.stringify(state)).worldState.x,19);
});

function savedShop(chapterId,mode='ok'){
 let state=createState();for(const command of [{type:'START'},{type:'CHAPTER',id:chapterId},{type:'RPG_TRAVEL',mapId:'shop:'+chapterId}])state=dispatch(state,command);
 const context={state,ui:{view:'shop',room:null},createState,parseSave,totalXp,SAVE_KEY,dispatch,getTownTravelFeatures,
  raw:JSON.stringify(state),writes:0,notices:[],render(){},window:{scrollTo(){}},toast:m=>context.notices.push(m),showError:m=>context.notices.push(m)};
 context.localStorage={getItem:()=>context.raw,setItem(key,text){context.writes++;if(mode==='quota')throw new Error('QuotaExceededError');context.raw=text;}};
 vm.createContext(context);
 const storage=fs.readFileSync(new URL('../js/storage.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'').replaceAll('export ','');
 vm.runInContext(storage+'\nvar store=new SaveStore();store.writable=true;store.seenRevision=state.revision;',context);
 if(mode==='conflict')vm.runInContext("store.save=()=>{throw new Error('別タブが編集中');};",context);
 for(const name of ['act','leaveShop'])vm.runInContext(source.split('\n').find(line=>line.startsWith(`function ${name}(`)),context);
 return context;
}

test('shop travel and doorstep persist together in one real SaveStore write in every town',()=>{
 for(let i=0;i<=6;i++){
  const env=savedShop('CH-'+i),before=JSON.stringify({quests:env.state.questStates,rewards:env.state.rewardEvents,finance:env.state.financialScenarios}),shop=getTownTravelFeatures('CH-'+i).find(f=>f.type==='shop');
  env.leaveShop();const restored=parseSave(env.raw);
  assert.equal(env.writes,1);assert.equal(restored.rpg.location.mapId,'town:CH-'+i);assert.equal(restored.worldState.x,shop.x);assert.equal(restored.worldState.y,shop.y+1);assert.equal(JSON.stringify(restored.rpg),JSON.stringify(env.state.rpg));
  assert.equal(JSON.stringify({quests:env.state.questStates,rewards:env.state.rewardEvents,finance:env.state.financialScenarios}),before);
 }
});

test('shop save conflict keeps the shop and prior position without half a travel',()=>{
 const env=savedShop('CH-3','conflict'),before=JSON.stringify(env.state);env.leaveShop();
 assert.equal(JSON.stringify(env.state),before);assert.equal(env.ui.view,'shop');assert.equal(env.writes,0);assert.ok(env.notices.some(m=>m.includes('別タブ')));
});

test('quota failure preserves the old coherent shop save and announces unsaved memory continuation',()=>{
 const env=savedShop('CH-3','quota'),oldSave=env.raw;env.leaveShop();
 assert.equal(env.writes,1);assert.equal(env.raw,oldSave);assert.equal(parseSave(env.raw).rpg.location.mapId,'shop:CH-3');assert.equal(env.ui.view,'world');assert.equal(env.state.worldState.x,11);assert.equal(env.state.worldState.y,15);assert.ok(env.notices.some(m=>m.includes('保存できません')));
});
