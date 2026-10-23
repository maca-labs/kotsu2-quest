import test from 'node:test';
import assert from 'node:assert/strict';
import {getTownWalkGuide,drawTownWalkGuide} from '../js/town-guidance.js';
import {getTownLayout} from '../js/towns.js';
import {move} from '../js/world.js';
import {createState,dispatch,totalXp} from '../js/engine.js';
import {getStoryGuide} from '../js/story-guide.js';

test('every town guides a new traveler to the named house using actual walkable steps',()=>{
 for(let chapter=0;chapter<=6;chapter++)for(const start of [[12,10],[12,16]]){
  let state=dispatch(createState(),{type:'CHAPTER',id:`CH-${chapter}`},1000);Object.assign(state.worldState,{x:start[0],y:start[1]});
  const guide=getStoryGuide(state),before=JSON.stringify(state),route=getTownWalkGuide(state,guide),door=getTownLayout(chapter).buildings.find(b=>b.id==='client').door;
  assert.ok(route.text.includes(guide.houseName));assert.ok(route.path.length<40);assert.equal(JSON.stringify(state),before);
  let count=0;
  while(state.worldState.x!==door.x||state.worldState.y!==door.y+1){
   const next=getTownWalkGuide(state,guide);assert.match(next.text,/[↑←→↓].*へ\d+歩/);assert.ok(next.next);assert.equal(move(state,next.next.dx,next.next.dy),true);assert.ok(++count<40);
  }
  assert.match(getTownWalkGuide(state,guide).text,/上で入ろう/);assert.equal(totalXp(state),0);assert.deepEqual(state.financialScenarios,JSON.parse(before).financialScenarios);
 }
});

test('bridge directions avoid water, walls and guests from every reachable outdoor tile',()=>{
 for(let chapter=0;chapter<=6;chapter++){
  const layout=getTownLayout(chapter),state=createState();state.currentChapter=layout.chapterId;const guide=getStoryGuide(state),queue=[[12,16]],seen=new Set(['12,16']);
  for(let i=0;i<queue.length;i++){
   const [x,y]=queue[i];Object.assign(state.worldState,{x,y});const route=getTownWalkGuide(state,guide);assert.ok(route?.next);
   if(!/上で入ろう/.test(route.text)){const next=structuredClone(state);assert.equal(move(next,route.next.dx,route.next.dy),true,`${chapter} ${x},${y}`);}
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const next=structuredClone(state);if(!move(next,dx,dy))continue;const {x:xx,y:yy}=next.worldState,k=`${xx},${yy}`;if(!seen.has(k)){seen.add(k);queue.push([xx,yy]);}}
  }
 }
});

test('non-house missions and unreachable positions never invent a walking direction',()=>{
 const state=createState();for(const type of ['resume','boss','chapter','expedition'])assert.equal(getTownWalkGuide(state,{action:{type}}),null);
 assert.equal(getTownWalkGuide(state,{action:{type:'house',id:'missing'}}),null);
 state.worldState.x=NaN;assert.equal(getTownWalkGuide(state,getStoryGuide(state)),null);
 state.worldState.x=-9;state.worldState.y=-9;assert.equal(getTownWalkGuide(state,getStoryGuide(state)).next,null);
});

test('destination flags draw only from the current house and never mutate progress',()=>{
 for(let chapter=0;chapter<=6;chapter++){
  const state=createState();state.currentChapter=`CH-${chapter}`;const before=JSON.stringify(state),rects=[],canvas={getContext:()=>({fillStyle:'',fillRect(...args){assert.ok(args.every(Number.isFinite));rects.push(args);}})};
  drawTownWalkGuide(canvas,state,getStoryGuide(state));assert.equal(rects.length,6);assert.equal(JSON.stringify(state),before);
  drawTownWalkGuide(canvas,state,{action:{type:'resume'}});assert.equal(rects.length,6);
 }
});

test('harbor visitors leave both narrow walking lanes open',()=>{
 const state=createState();state.currentChapter='CH-3';Object.assign(state.worldState,{x:12,y:16});
 let route=getTownWalkGuide(state,{houseName:'港バー',action:{type:'house',id:'tavern'}});assert.ok(route.path.length<=16,route.path.length);
 Object.assign(state.worldState,{x:12,y:10});route=getTownWalkGuide(state,{houseName:'武具店',action:{type:'house',id:'shop'}});assert.ok(route.path.length<=11,route.path.length);assert.match(route.text,/武器・防具店/);
 assert.deepEqual(getTownLayout(3).npcs.slice(2),[[8,10],[17,9]]);
});
