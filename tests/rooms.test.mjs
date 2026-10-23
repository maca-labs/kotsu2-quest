import test from 'node:test';
import assert from 'node:assert/strict';
import {townDoors,doorAt,roomSpawn,roomStep,nearbyRoomPerson,roomPeople,roomTitle,renderRoom,drawTownDoors} from '../js/rooms.js';

test('all houses have distinct doors and inhabitants; the chapel is only in the starting village',()=>{
 assert.equal(new Set(townDoors.map(d=>`${d.x},${d.y}`)).size,4);
 for(const door of townDoors){assert.equal(doorAt(door.x,door.y,door.chapterId)?.id,door.id);assert.ok(roomPeople(door.id).length);}
 assert.equal(doorAt(19,15),null);assert.equal(doorAt(19,15,'CH-0')?.id,'church');for(let i=1;i<=6;i++)assert.equal(doorAt(19,15,`CH-${i}`),null);
 assert.equal(doorAt(12,9),null);
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
