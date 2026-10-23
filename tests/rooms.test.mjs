import test from 'node:test';
import assert from 'node:assert/strict';
import {townDoors,getTownDoors,doorAt,roomSpawn,roomExit,roomStep,nearbyRoomPerson,roomPeople,roomTitle,renderRoom,drawTownDoors,getTavern} from '../js/rooms.js';
import {getTownLayout} from '../js/towns.js';

test('seven towns have different tavern names and short centered signs while room titles and doors remain compatible',()=>{
 const expected=['居酒屋 ひとつぶ','立ち呑み 銅貨横丁','酒処 あかし灯','港バー しおかぜ','大衆酒場 星札小路','島バル 鍵の入り江','雲上亭'];
 assert.equal(new Set(expected).size,7);const names=[],kinds=[];
 for(let chapter=0;chapter<=6;chapter++){
  const id=`CH-${chapter}`,tavern=getTavern(id),text=[],rects=[];
  names.push(tavern.name);kinds.push(tavern.kind);assert.equal(tavern.name,expected[chapter]);assert.equal(roomTitle('tavern','依頼人',id),tavern.name);assert.ok(tavern.sign.length<=5);
  const door=getTownDoors(id).find(item=>item.id==='tavern'),center=door.x*16+8,top=door.y*16-17;
  assert.equal(roomTitle('client','灯里',id),'灯里の家');assert.equal(roomTitle('elder','依頼人',id),'長老の家');assert.equal(roomTitle('church','依頼人',id),'はじまりの教会');assert.equal(doorAt(door.x,door.y,id)?.id,'tavern');
  const ctx={fillRect(x,y,width,height){rects.push({x,y,width,height});},fillText(label,x,y){text.push({label,x,y});},measureText(label){return {width:label.length*10};}};
  drawTownDoors({getContext:()=>ctx},false,'依頼人の家',id);
  const signs=text.filter(line=>line.x===center&&line.y===door.y*16-7);assert.deepEqual(signs,[{label:tavern.sign,x:center,y:door.y*16-7}]);assert.ok(text.every(line=>!line.label.includes('こもれび')));
  const plaque=rects.find(rect=>rect.y===top&&rect.x+rect.width/2===center);assert.ok(plaque);assert.ok(plaque.width<=64);assert.ok(plaque.y+plaque.height<door.y*16-3);
 }
 assert.equal(new Set(names).size,7);assert.equal(new Set(kinds).size,7);assert.equal(getTavern('unknown').name,expected[0]);assert.equal(roomTitle('tavern'),expected[0]);assert.equal(townDoors.find(door=>door.id==='tavern').label,'酒場');
});

test('all houses have distinct doors and inhabitants; the chapel is only in the starting village',()=>{
 assert.equal(new Set(townDoors.map(d=>`${d.x},${d.y}`)).size,4);
 for(const door of townDoors){assert.equal(doorAt(door.x,door.y,door.chapterId)?.id,door.id);assert.ok(roomPeople(door.id).length);}
 assert.equal(doorAt(19,15),null);assert.equal(doorAt(19,15,'CH-0')?.id,'church');for(let i=1;i<=6;i++)assert.equal(doorAt(19,15,`CH-${i}`),null);
 assert.equal(doorAt(12,9),null);
 assert.deepEqual(townDoors.map(({id,x,y})=>({id,x,y})),[{id:'client',x:5,y:5},{id:'tavern',x:19,y:5},{id:'elder',x:5,y:15},{id:'church',x:19,y:15}]);
 for(let chapter=0;chapter<=6;chapter++){
  const layout=getTownLayout(chapter),doors=getTownDoors(chapter);assert.ok(!doors.some(door=>door.id==='shop'));assert.deepEqual(doors.map(({id,x,y})=>({id,x,y})),layout.buildings.filter(building=>building.id!=='shop').map(building=>({id:building.id,...building.door})));
  for(const door of doors)assert.equal(doorAt(door.x,door.y,chapter)?.id,door.id);
 }
 assert.deepEqual(getTownDoors('unknown'),townDoors);assert.equal(getTavern(5).name,getTavern('CH-5').name);
});
test('indoor movement stops at walls, furniture and people without mutating the source',()=>{
 const p={...roomSpawn};assert.equal(roomStep('client',{x:2,y:4},-1,0).moved,false);
 assert.equal(roomStep('client',{x:12,y:8},0,-1).moved,false);
 assert.equal(roomStep('elder',{x:5,y:10},0,-1).moved,false);
 assert.equal(roomStep('client',p,1,1).moved,false);assert.deepEqual(p,roomSpawn);
});
test('walking from the entrance reaches a person and can return through the exit in every room',()=>{
 for(const id of ['client','elder','tavern','church']){
  let p={...roomSpawn};for(let i=0;i<3;i++)p=roomStep(id,p,0,-1);
  assert.ok(nearbyRoomPerson(id,p));
  p={...roomSpawn};p=roomStep(id,p,0,1);p=roomStep(id,p,0,1);p=roomStep(id,p,0,1);
  assert.equal(p.exit,true);assert.deepEqual([p.x,p.y],[12,15]);
 }
});

test('the chapel aisle connects the revival point, priest, and exit while pews and altar block walking',()=>{
 assert.equal(roomTitle('church'),'はじまりの教会');assert.equal(roomPeople('church')[0].kind,'church');
 assert.equal(roomStep('church',{x:12,y:6},0,-1).moved,false);assert.equal(roomStep('church',{x:12,y:8},0,-1).moved,false);assert.equal(roomStep('church',{x:5,y:10},0,-1).moved,false);
 let p={...roomSpawn};for(let i=0;i<3;i++)p=roomStep('church',p,0,-1);assert.equal(nearbyRoomPerson('church',p)?.name,'神官ミル');
 const operations=[],ctx=new Proxy({},{get:(_t,n)=>n==='measureText'?()=>({width:40}):(...args)=>{if(n==='fillRect')assert.ok(args.every(Number.isFinite));operations.push(n);},set:()=>true});
 const canvas={getContext:()=>ctx},state={avatar:0,equippedItems:{}};renderRoom(canvas,state,{id:'church',position:roomSpawn});drawTownDoors(canvas,false,'依頼人の家','CH-0');assert.ok(operations.length>100);
});

test('all seven tavern interiors have different furniture geometry and every drawn piece blocks walking',()=>{
 const geometries=[],features=[[9,7],[3,8],[4,8],[19,8],[3,8],[3,5],[3,7]];
 for(let chapter=0;chapter<=6;chapter++){
  const id=`CH-${chapter}`,rectangles=[],labels=[],ctx={fillStyle:'',clearRect(){},fillRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(w>=0&&h>=0);rectangles.push({x,y,w,h,color:this.fillStyle});},fillText(label){labels.push(label);}};
  const state={currentChapter:id,avatar:0,equippedItems:{}},before=structuredClone(state);renderRoom({getContext:()=>ctx},state,{id:'tavern',position:roomSpawn});assert.deepEqual(state,before);assert.ok(labels.includes(getTavern(id).name));
  const floor=rectangles.filter(rect=>rect.h===15&&rect.y>=64&&rect.y<240&&rect.y%16===0);assert.ok(floor.length>=100);for(const tile of floor)assert.ok(tile.x>=32&&tile.x+tile.w<=368,`${id} floor edge`);
  if(chapter===2)for(const brick of rectangles.filter(rect=>['#7e888c','#899396'].includes(rect.color)))assert.ok(brick.x>=32&&brick.x+brick.w<=368,'stone wall edge');
  const furniture=rectangles.filter(rect=>rect.color==='#51483b');assert.ok(furniture.length>=4);geometries.push(JSON.stringify(furniture.map(({x,y,w,h})=>[x,y,w,h])));
  for(const piece of furniture)for(let y=piece.y/16;y<(piece.y+piece.h)/16;y++)for(let x=piece.x/16;x<(piece.x+piece.w)/16;x++)assert.equal(roomStep('tavern',{x:x-1,y},1,0,id).moved,false,`${id} furniture ${x},${y}`);
  const [x,y]=features[chapter];assert.equal(roomStep('tavern',{x:x-1,y},1,0,id).moved,false);
 }
 assert.equal(new Set(geometries).size,7);
});

test('every tavern guest can actually be selected from a reachable tile and every interior returns through the same exit',()=>{
 for(let chapter=0;chapter<=6;chapter++){
  const id=`CH-${chapter}`,people=roomPeople('tavern',id),before=structuredClone(roomSpawn),queue=[{...roomSpawn}],seen=new Set([`${roomSpawn.x},${roomSpawn.y}`]),heard=new Set();let exit=false;
  assert.deepEqual(people.map(person=>person.index),[0,1,2,3,4,5,6,7,8]);
  for(let i=0;i<queue.length;i++){
   const position=queue[i],nearby=nearbyRoomPerson('tavern',position,id);if(nearby)heard.add(nearby.index);
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
    const next=roomStep('tavern',position,dx,dy,id);if(next.exit){assert.deepEqual([next.x,next.y],[roomExit.x,roomExit.y]);exit=true;continue;}
    if(next.moved&&!seen.has(`${next.x},${next.y}`)){seen.add(`${next.x},${next.y}`);queue.push(next);}
   }
  }
  assert.equal(exit,true,id);assert.equal(heard.size,9,`${id} guests ${[...heard]}`);assert.deepEqual(roomSpawn,before);
  for(const person of people){assert.ok(!seen.has(`${person.x},${person.y}`));assert.ok(queue.some(tile=>Math.abs(tile.x-person.x)+Math.abs(tile.y-person.y)<=2));}
 }
});
