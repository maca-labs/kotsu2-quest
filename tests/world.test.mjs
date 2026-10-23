import test from 'node:test';
import assert from 'node:assert/strict';
import {move,npcPositions,mapTile,renderWorld,drawBoss,drawEquipment,drawEncounter,drawTavern,drawCourseLandmark} from '../js/world.js';
const state=()=>({currentChapter:'CH-0',avatar:0,worldState:{x:12,y:10,direction:0,seals:[]},equippedItems:{weapon:'traveler-staff'}});
test('walking respects walls, houses, water and all NPCs in every original map',()=>{
 for(let chapter=0;chapter<=6;chapter++)for(let y=1;y<17;y++)for(let x=1;x<24;x++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const s=state();s.currentChapter=`CH-${chapter}`;s.worldState.x=x;s.worldState.y=y;const nextX=x+dx,nextY=y+dy;const blocked=nextX<1||nextX>23||nextY<1||nextY>16||['water','tree','house'].includes(mapTile(chapter,nextX,nextY))||npcPositions.some(([nx,ny])=>nx===nextX&&ny===nextY);assert.equal(move(s,dx,dy),!blocked);assert.deepEqual([s.worldState.x,s.worldState.y],blocked?[x,y]:[nextX,nextY]);}
});
test('four directions and three walk frames are reachable without changing learning rewards',()=>{const s=state();const dirs=new Set(),frames=new Set();for(let i=0;i<3;i++)for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]]){move(s,dx,dy);dirs.add(s.worldState.direction);frames.add(s.worldState.walkFrame);}assert.equal(dirs.size,4);assert.equal(frames.size,3);assert.equal(s.worldState.seals.length,0);});
test('all maps, enemies and equipment draw from original local pixels',()=>{let rectangles=0;const ctx={clearRect(){},fillRect(){rectangles++;},fillText(){},save(){},restore(){},translate(){},scale(){}};const canvas={getContext:()=>ctx};for(let chapter=0;chapter<=6;chapter++){const s=state();s.currentChapter=`CH-${chapter}`;renderWorld(canvas,s);if(chapter)drawBoss(canvas,s.currentChapter);}drawBoss(canvas,'hidden');drawTavern(canvas,state());drawEncounter(canvas,state(),{enemy:{hp:20,maxHp:40,kind:'letter'}});drawEncounter(canvas,state(),{enemy:{hp:0,maxHp:40,kind:'letter'}});for(const id of ['traveler-staff','traveler-notebook','insight-loupe','proof-shield','tide-compass','star-abacus','return-lantern','dawn-crown','rainbow-oath'])drawEquipment(canvas,id);assert.ok(rectangles>6000);});

test('new course props and enemies use distinct local pixels without modifying progress',()=>{
 const drawings=[],s=state(),before=structuredClone(s);let drawing=[];
 const ctx={clearRect(){},fillRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));drawing.push([x,y,w,h,this.fillStyle]);},fillText(){},save(){},restore(){},translate(){},scale(){}};
 const canvas={getContext:()=>ctx};
 for(const kind of ['account-gate','identity-gate','dealer-scales','market-board','limit-board','lending-clock','leverage-sails']){
  drawing=[];drawEncounter(canvas,s,{enemy:{hp:20,maxHp:40,kind},selection:{side:'short',leverage:5}});drawings.push(JSON.stringify(drawing));
  drawCourseLandmark(ctx,kind,0,0,true,{side:'short',leverage:5});
 }
 assert.equal(new Set(drawings).size,7);assert.deepEqual(s,before);
 drawing=[];drawCourseLandmark(ctx,'leverage-sails',0,0,false,{side:'long',leverage:1});const left=JSON.stringify(drawing);
 drawing=[];drawCourseLandmark(ctx,'leverage-sails',0,0,false,{side:'short',leverage:5});assert.notEqual(JSON.stringify(drawing),left);
});
