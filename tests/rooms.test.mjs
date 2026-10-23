import test from 'node:test';
import assert from 'node:assert/strict';
import {townDoors,doorAt,roomSpawn,roomStep,nearbyRoomPerson,roomPeople} from '../js/rooms.js';

test('all three houses have distinct reachable doors and a room inhabitant',()=>{
 assert.equal(new Set(townDoors.map(d=>`${d.x},${d.y}`)).size,3);
 for(const door of townDoors){assert.equal(doorAt(door.x,door.y)?.id,door.id);assert.ok(roomPeople(door.id).length);}
 assert.equal(doorAt(12,9),null);
});
test('indoor movement stops at walls, furniture and people without mutating the source',()=>{
 const p={...roomSpawn};assert.equal(roomStep('client',{x:2,y:4},-1,0).moved,false);
 assert.equal(roomStep('client',{x:12,y:8},0,-1).moved,false);
 assert.equal(roomStep('elder',{x:5,y:10},0,-1).moved,false);
 assert.equal(roomStep('client',p,1,1).moved,false);assert.deepEqual(p,roomSpawn);
});
test('walking from the entrance reaches a person and can return through the exit in every room',()=>{
 for(const id of ['client','elder','tavern']){
  let p={...roomSpawn};for(let i=0;i<3;i++)p=roomStep(id,p,0,-1);
  assert.ok(nearbyRoomPerson(id,p));
  p={...roomSpawn};p=roomStep(id,p,0,1);p=roomStep(id,p,0,1);p=roomStep(id,p,0,1);
  assert.equal(p.exit,true);assert.deepEqual([p.x,p.y],[12,15]);
 }
});
