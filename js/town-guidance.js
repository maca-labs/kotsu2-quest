import {getTownLayout} from './towns.js';

const solid=new Set(['house','water','tree','fountain']);
const directions=[{dx:0,dy:-1,label:'上',arrow:'↑'},{dx:-1,dy:0,label:'左',arrow:'←'},{dx:1,dy:0,label:'右',arrow:'→'},{dx:0,dy:1,label:'下',arrow:'↓'}];
// Guidance reads the same obstacles as walking. It never moves the player or
// completes a lesson, and crossing a bridge is still an actual walking action.
export function getTownWalkGuide(state,guide){
 if(guide?.action?.type!=='house')return null;
 const layout=getTownLayout(state.currentChapter),building=layout.buildings.find(b=>b.id===guide.action.id);
 if(!building)return null;
 const name=building.id==='client'?guide.houseName??'依頼人の家':({elder:'長老の家',church:'はじまりの教会',shop:'武器・防具店',tavern:'酒場'})[building.id];
 const {x,y}=state.worldState??{},goal={x:building.door.x,y:building.door.y+1};
 if(!Number.isInteger(x)||!Number.isInteger(y))return null;
 const key=(a,b)=>`${a},${b}`,queue=[{x,y,path:[]}],seen=new Set([key(x,y)]);
 let path=null;
 for(let i=0;i<queue.length;i++){
  const node=queue[i];if(node.x===goal.x&&node.y===goal.y){path=node.path;break;}
  for(const direction of directions){
   const xx=node.x+direction.dx,yy=node.y+direction.dy,k=key(xx,yy);
   if(xx<1||xx>23||yy<1||yy>16||seen.has(k)||solid.has(layout.tiles[yy]?.[xx])||layout.npcs.some(([nx,ny])=>nx===xx&&ny===yy))continue;
   seen.add(k);queue.push({x:xx,y:yy,path:[...node.path,direction]});
  }
 }
 if(path===null)return {name,building,text:`${name}へ。道が分からないときは「くわしく」。`,path:[],next:null};
 path=[...path,directions[0]];const next=path[0];let count=0;
 for(const direction of path){if(direction!==next)break;count++;}
 const text=path.length===1?`${name}：↑ 上で入ろう`:`${name}へ：${next.arrow} ${next.label}へ${count}歩`;
 return {name,building,text,path,next};
}

export function drawTownWalkGuide(canvas,state,guide){
 const route=getTownWalkGuide(state,guide);if(!route)return;
 const c=canvas.getContext('2d'),b=route.building,x=b.x*16,y=b.y*16,w=b.w*16,h=b.h*16;
 c.fillStyle='#ffe08b';c.fillRect(x-1,y-1,w+2,2);c.fillRect(x-1,y+h-1,w+2,2);c.fillRect(x-1,y-1,2,h+2);c.fillRect(x+w-1,y-1,2,h+2);
 // A small flag above the destination complements the readable house name.
 c.fillRect(x+3,y-10,2,10);c.fillRect(x+5,y-10,11,6);
}
