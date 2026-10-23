import test from 'node:test';
import assert from 'node:assert/strict';
import {townDoors,doorAt,roomSpawn,roomStep,nearbyRoomPerson,roomPeople,roomTitle,renderRoom,drawTownDoors,getTavern} from '../js/rooms.js';

test('seven towns have different tavern names and short centered signs while room titles and doors remain compatible',()=>{
 const expected=['居酒屋 ひとつぶ','立ち呑み 銅貨横丁','酒処 あかし灯','港バー しおかぜ','大衆酒場 星札小路','島バル 鍵の入り江','雲上亭'];
 assert.equal(new Set(expected).size,7);const names=[],kinds=[];
 for(let chapter=0;chapter<=6;chapter++){
  const id=`CH-${chapter}`,tavern=getTavern(id),text=[],rects=[];
  names.push(tavern.name);kinds.push(tavern.kind);assert.equal(tavern.name,expected[chapter]);assert.equal(roomTitle('tavern','依頼人',id),tavern.name);assert.ok(tavern.sign.length<=5);
  assert.equal(roomTitle('client','灯里',id),'灯里の家');assert.equal(roomTitle('elder','依頼人',id),'長老の家');assert.equal(roomTitle('church','依頼人',id),'はじまりの教会');assert.equal(doorAt(19,5,id)?.id,'tavern');
  const ctx={fillRect(x,y,width,height){rects.push({x,y,width,height});},fillText(label,x,y){text.push({label,x,y});},measureText(label){return {width:label.length*10};}};
  drawTownDoors({getContext:()=>ctx},false,'依頼人の家',id);
  const signs=text.filter(line=>line.x===312&&line.y===73);assert.deepEqual(signs,[{label:tavern.sign,x:312,y:73}]);assert.ok(text.every(line=>!line.label.includes('こもれび')));
  const plaque=rects.find(rect=>rect.y===63&&rect.x+rect.width/2===312);assert.ok(plaque);assert.ok(plaque.width<=64);assert.ok(plaque.y+plaque.height<77);
 }
 assert.equal(new Set(names).size,7);assert.equal(new Set(kinds).size,7);assert.equal(getTavern('unknown').name,expected[0]);assert.equal(roomTitle('tavern'),expected[0]);assert.equal(townDoors.find(door=>door.id==='tavern').label,'酒場');
});

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
