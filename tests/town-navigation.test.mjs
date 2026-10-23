import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState,parseSave} from '../js/engine.js';
import {getTownLayout} from '../js/towns.js';
import {getTownDoors,doorAt,roomPeople,roomStep,nearbyRoomPerson} from '../js/rooms.js';
import {getTownTravelFeatures} from '../js/rpg-world.js';
import {mapTile,move} from '../js/world.js';

const source=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
function environment(chapterId){
 const state=createState();state.currentChapter=chapterId;state.rpg.location.mapId='town:'+chapterId;
 const calls=[],context={state,ui:{view:'world',room:null},store:{writable:true},modal:{open:false},getTownLayout,getTownDoors,getTownTravelFeatures,doorAt,mapTile,move,roomPeople,roomStep,nearbyRoomPerson,
  ensureStarted:()=>true,visualState:()=>state,currentChapter:()=>({title:'町'}),storyGuide:()=>({action:{},houseName:'依頼人の家'}),
  renderWorld(){},drawTownDoors(){},drawTownTravelFeatures(){},renderRoom(){},render(){},saveQuiet(){},act(){return true;},window:{scrollTo(){}},
  document:{querySelectorAll:()=>[],querySelector:()=>null},h:(tag,attrs)=>({attrs,getBoundingClientRect:()=>({left:0,top:0,width:400,height:288})}),
  openShop:()=>calls.push('shop'),enterRoom:id=>calls.push(id),talk:i=>calls.push('npc:'+i),travelArea:id=>calls.push(id),toast:message=>calls.push('hint'),roomConversation:()=>calls.push('room')};
 vm.createContext(context);
 for(const name of ['worldCanvas','walk','nearbyTalk','leaveRoom','normalizeTownPosition']){
  let line=source.split('\n').find(line=>line.startsWith(`function ${name}(`)||line.startsWith(`let lastWalk=0;function ${name}(`));
  assert.ok(line,name);vm.runInContext(line.replace('let lastWalk=0;',''),context);
 }
 return {context,state,calls};
}

for(let chapter=0;chapter<=6;chapter++){
 const id='CH-'+chapter;
 test(id+' actual canvas, walking and talk handlers open the current buildings and shop',()=>{
  const {context,state,calls}=environment(id),layout=getTownLayout(id),canvas=context.worldCanvas();
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
