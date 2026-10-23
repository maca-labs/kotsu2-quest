import test from 'node:test';
import assert from 'node:assert/strict';
import {getRpgMap,getRpgSpawn,getRpgCamera,stepRpgMap,nearbyRpgFeature,renderRpgMap,drawTownTravelFeatures,townTravelFeatures} from '../js/rpg-world.js';
import {townDoors} from '../js/rooms.js';

const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const key=p=>`${p.x},${p.y}`;
function reachable(mapId,{avoidPortals=false}={}){
 const spawn=getRpgSpawn(mapId),queue=[spawn],seen=new Map([[key(spawn),spawn]]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of directions){
  const result=stepRpgMap(queue[i],dx,dy);if(!result.moved||seen.has(key(result.location)))continue;
  seen.set(key(result.location),result.location);if(!avoidPortals||!result.transition)queue.push(result.location);
 }
 return seen;
}

test('all seven towns and seven caves are walkable from the first village without forcing another portal',()=>{
 const map=getRpgMap('world'),seen=reachable('world',{avoidPortals:true});
 assert.deepEqual([map.width,map.height],[64,48]);assert.equal(map.features.filter(f=>f.type==='town').length,7);assert.equal(map.features.filter(f=>f.type==='cave').length,7);
 assert.equal(new Set(map.features.map(key)).size,14);
 for(const feature of map.features){assert.ok(seen.has(key(feature)),feature.id);assert.equal(feature.chapterId,feature.targetMapId.split(':').at(-1));}
 assert.equal(getRpgMap('unknown'),null);assert.equal(getRpgSpawn('unknown'),null);
});

test('every portal has a safe return one tile south and walking onto it produces only a transition request',()=>{
 for(const feature of getRpgMap('world').features){
  const returned=getRpgSpawn('world',feature.targetMapId),before=structuredClone(returned);
  assert.deepEqual([returned.x,returned.y],[feature.x,feature.y+1]);assert.equal(nearbyRpgFeature(returned)?.id,feature.id);
  const entered=stepRpgMap(returned,0,-1);assert.equal(entered.moved,true);assert.deepEqual(entered.transition,{mapId:feature.targetMapId});assert.deepEqual(returned,before);
  assert.equal(stepRpgMap(returned,0,1).transition,undefined,feature.id);
 }
});

test('seven different cave maps connect entrance, all three quest gates and exit without changing the caller',()=>{
 const layouts=new Set(),colors=new Set();
 for(let chapter=0;chapter<=6;chapter++){
  const id=`cave:CH-${chapter}`,map=getRpgMap(id),seen=reachable(id),spawn=getRpgSpawn(id);
  layouts.add(map.tiles.join('\n'));colors.add(map.palette.floor);assert.deepEqual([map.width,map.height],[25,18]);
  assert.equal(map.features.filter(f=>f.type==='quest-gate').length,3);
  for(const feature of map.features)assert.ok(seen.has(key(feature)),`${id} ${feature.id}`);
  const returned=stepRpgMap(spawn,0,1);assert.equal(returned.transition.mapId,'world');assert.equal(returned.location.y,17);assert.equal(spawn.y,16);
  // Every drawn floor cell is reachable, including alcoves; there are no trapped pockets.
  for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)if(!['~','^','T','#'].includes(map.tiles[y][x]))assert.ok(seen.has(`${x},${y}`),`${id} inaccessible floor ${x},${y}`);
 }
 assert.equal(layouts.size,7);assert.equal(colors.size,7);
});

test('collision rejects walls, water, noncardinal input and out of bounds while map data stays immutable',()=>{
 const world=getRpgMap('world'),cave=getRpgMap('cave:CH-0'),spawn=getRpgSpawn('cave:CH-0');
 for(const [location,dx,dy]of [[{mapId:'world',x:3,y:4},-1,0],[{mapId:cave.id,x:3,y:5},-1,0],[{mapId:cave.id,x:0,y:0},-1,0],[spawn,1,1],[spawn,NaN,0]]){
  const before=structuredClone(location);assert.equal(stepRpgMap(location,dx,dy).moved,false);assert.deepEqual(location,before);
 }
 assert.throws(()=>{world.features[0].x=100;});assert.throws(()=>{cave.tiles[0]='.';});
 const gate=cave.features.find(f=>f.type==='quest-gate'),result=stepRpgMap({mapId:cave.id,x:gate.x,y:gate.y+1},0,-1);
 assert.equal(result.feature.type,'quest-gate');assert.equal(result.feature.chapterId,'CH-0');assert.equal(result.encounterId,undefined);
});

test('camera follows the player and clamps to all world edges; towns and caves fit without page panning',()=>{
 for(const location of [{mapId:'world',x:0,y:0},{mapId:'world',x:63,y:47},{mapId:'world',x:32,y:24}]){
  const camera=getRpgCamera(location);assert.ok(camera.x>=0&&camera.y>=0);assert.ok(camera.x+camera.width<=64&&camera.y+camera.height<=48);assert.ok(location.x>=camera.x&&location.x<camera.x+25);assert.ok(location.y>=camera.y&&location.y<camera.y+18);
 }
 assert.deepEqual(getRpgCamera(getRpgSpawn('cave:CH-6')),{x:0,y:0,width:25,height:18});assert.equal(getRpgCamera({mapId:'unknown'}),null);
 for(let chapter=0;chapter<=6;chapter++)assert.deepEqual(getRpgSpawn(`town:CH-${chapter}`),{mapId:`town:CH-${chapter}`,x:12,y:16,direction:2,walkFrame:0});
});

test('local pixel maps and travel signs draw with finite coordinates without mutating progress',()=>{
 const operations=[],context=new Proxy({},{get:(_target,name)=>name==='measureText'?()=>({width:30}):(...args)=>{if(['fillRect','clearRect','scale'].includes(name))for(const value of args)assert.ok(Number.isFinite(value));operations.push(name);},set:()=>true});
 const canvas={width:400,height:288,getContext:()=>context},state={currentChapter:'CH-3',avatar:2,equippedItems:{weapon:'traveler-staff'},rpg:{equipped:{weapon:'travel-blade',armor:'trail-shield'}},questStates:{},rewardEvents:[]},before=structuredClone(state);
 for(const id of ['world',...Array.from({length:7},(_,i)=>`cave:CH-${i}`)])assert.ok(renderRpgMap(canvas,state,getRpgSpawn(id)));
 drawTownTravelFeatures(canvas,state);assert.ok(operations.filter(op=>op==='fillRect').length>1000);assert.deepEqual(state,before);
 assert.deepEqual(townTravelFeatures.map(f=>[f.id,f.x,f.y]),[['shop',12,5],['world-exit',12,17]]);
 for(const feature of townTravelFeatures)assert.ok(!townDoors.some(door=>door.x===feature.x&&door.y===feature.y));
});

test('the active unfinished request marks only its destination cave without requiring prior chapters',()=>{
 const highlights=[],context=new Proxy({},{get:(target,name)=>name==='fillRect'?((...args)=>{if(target.fillStyle==='#f6cf78')highlights.push(args);}):typeof target[name]!=='undefined'?target[name]:()=>{},set:(target,name,value)=>{target[name]=value;return true;}});
 const canvas={width:400,height:288,getContext:()=>context},location=getRpgSpawn('world'),state={avatar:0,equippedItems:{},activeQuestKey:'PR-01',questStates:{'PR-01':{questId:'PR-01',completed:false}}},before=structuredClone(state);
 renderRpgMap(canvas,state,location);assert.ok(highlights.length>0);assert.deepEqual(state,before);
 highlights.length=0;renderRpgMap(canvas,{...state,questStates:{'PR-01':{questId:'PR-01',completed:true}}},location);assert.equal(highlights.length,0);
 highlights.length=0;renderRpgMap(canvas,{...state,activeQuestKey:null},location);assert.equal(highlights.length,0);
});
