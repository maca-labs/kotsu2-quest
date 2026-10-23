import test from 'node:test';
import assert from 'node:assert/strict';
import {getTownLayout,townTile} from '../js/towns.js';

const directions=[[1,0],[-1,0],[0,1],[0,-1]],solid=new Set(['house','tree','water','fountain']);
function reachable(chapter){
 const layout=getTownLayout(chapter),queue=[[12,16]],seen=new Set(['12,16']);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of directions){const [x,y]=queue[i],xx=x+dx,yy=y+dy,key=`${xx},${yy}`;if(xx<1||xx>23||yy<1||yy>16||seen.has(key)||solid.has(townTile(chapter,xx,yy))||layout.npcs.some(([nx,ny])=>nx===xx&&ny===yy))continue;seen.add(key);queue.push([xx,yy]);}
 return seen;
}
function cells(rect){const result=[];for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)result.push(`${x},${y}`);return result;}

test('the seven immutable towns have distinct geography and building arrangements',()=>{
 const plans=[],terrain=[];
 for(let ch=0;ch<7;ch++){
  const layout=getTownLayout(`CH-${ch}`);assert.equal(layout,getTownLayout(ch));assert.equal(layout.chapterId,`CH-${ch}`);assert.equal(layout.npcs.length,4);assert.equal(layout.tiles.length,18);assert.ok(layout.tiles.every(row=>row.length===25));
  assert.equal(layout.buildings.length,ch===0?5:4);assert.equal(new Set(layout.buildings.map(b=>b.id)).size,layout.buildings.length);
  plans.push(JSON.stringify(layout.buildings));terrain.push(JSON.stringify(layout.tiles));
  assert.ok(Object.isFrozen(layout));assert.ok(Object.isFrozen(layout.tiles[0]));assert.ok(Object.isFrozen(layout.buildings[0].door));assert.throws(()=>{layout.tiles[1][1]='water';});
 }
 assert.equal(new Set(plans).size,7);assert.equal(new Set(terrain).size,7);for(const value of [undefined,null,-1,7,'CH-7','town:CH-0',NaN])assert.equal(getTownLayout(value),getTownLayout(0));
 assert.equal(townTile(0,-1,0),'tree');assert.equal(townTile(0,12.5,10),'tree');
});

test('all building footprints, landmarks and NPCs are separate and match solid tiles',()=>{
 for(let ch=0;ch<7;ch++){
  const layout=getTownLayout(ch),occupied=new Set();
  for(const b of layout.buildings){
   assert.equal(b.door.y,b.y+b.h-1);assert.ok(b.door.x>=b.x&&b.door.x<b.x+b.w);
   for(const key of cells(b)){assert.equal(occupied.has(key),false,`CH-${ch} overlap ${key}`);occupied.add(key);const [x,y]=key.split(',').map(Number);assert.equal(townTile(ch,x,y),'house');}
  }
  for(const key of cells(layout.landmark)){assert.equal(occupied.has(key),false,`CH-${ch} landmark ${key}`);occupied.add(key);const [x,y]=key.split(',').map(Number);assert.ok(solid.has(townTile(ch,x,y)));}
  for(const [x,y]of layout.npcs){assert.equal(occupied.has(`${x},${y}`),false);assert.ok(!solid.has(townTile(ch,x,y)));occupied.add(`${x},${y}`);}
 }
});

test('every door approach, NPC neighbor and old spawn can be reached from the south gate',()=>{
 for(let ch=0;ch<7;ch++){
  const layout=getTownLayout(ch),seen=reachable(ch);
  assert.equal(townTile(ch,12,17),'path');assert.equal(townTile(ch,12,16),'path');assert.ok(seen.has('12,10'));
  for(const b of layout.buildings)assert.ok(seen.has(`${b.door.x},${b.door.y+1}`),`CH-${ch} ${b.id}`);
  for(const [x,y]of layout.npcs)assert.ok(directions.some(([dx,dy])=>seen.has(`${x+dx},${y+dy}`)),`CH-${ch} NPC ${x},${y}`);
 }
});

test('the starting village preserves the church, shop and NPC coordinates used by old saves',()=>{
 const layout=getTownLayout(0);assert.deepEqual(layout.buildings.find(b=>b.id==='church').door,{x:19,y:15});assert.deepEqual(layout.buildings.find(b=>b.id==='shop').door,{x:12,y:5});assert.deepEqual(layout.npcs,[[8,7],[17,7],[6,12],[18,12]]);assert.ok(reachable(0).has('19,16'));
});

test('the harbor has a broad impassable sea, a two-tile pier and a lighthouse',()=>{
 const layout=getTownLayout(3);assert.equal(layout.landmark.kind,'lighthouse');
 for(let y=11;y<=16;y++)for(let x=15;x<=23;x++)assert.equal(townTile(3,x,y),'water');
 for(let y=9;y<=10;y++)for(let x=15;x<=19;x++)assert.equal(townTile(3,x,y),'path');
 assert.equal(townTile(3,20,9),'water');assert.ok(reachable(3).has('19,9'));
});

test('the islands have water channels with bridge routes and the sky town has cloud edges',()=>{
 assert.equal(townTile(5,9,3),'water');assert.equal(townTile(5,17,3),'water');assert.equal(townTile(5,9,6),'path');assert.equal(townTile(5,17,6),'path');assert.equal(townTile(5,13,8),'water');assert.equal(townTile(5,12,8),'path');
 assert.equal(townTile(6,2,12),'water');assert.equal(townTile(6,22,12),'water');assert.equal(townTile(6,10,3),'water');assert.ok(reachable(6).has('12,16'));
});
