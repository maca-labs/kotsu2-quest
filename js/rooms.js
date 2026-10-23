import {drawPerson} from './world.js';

const taverns=Object.freeze(Object.fromEntries([
 ['居酒屋 ひとつぶ','ひとつぶ','居酒屋'],
 ['立ち呑み 銅貨横丁','銅貨横丁','立ち呑み'],
 ['酒処 あかし灯','あかし灯','酒処'],
 ['港バー しおかぜ','しおかぜ','港バー'],
 ['大衆酒場 星札小路','星札小路','大衆酒場'],
 ['島バル 鍵の入り江','鍵の入り江','島バル'],
 ['雲上亭','雲上亭','亭']
].map(([name,sign,kind],chapter)=>[`CH-${chapter}`,Object.freeze({name,sign,kind})])));
export function getTavern(chapterId='CH-0'){return taverns[chapterId]??taverns['CH-0'];}

// Original rooms. Their position is presentation state; quest progress stays in the engine.
export const townDoors=[
 {id:'client',x:5,y:5,label:'依頼人の家'},
 {id:'tavern',x:19,y:5,label:'酒場'},
 {id:'elder',x:5,y:15,label:'長老の家'},
 {id:'church',x:19,y:15,label:'はじまりの教会',chapterId:'CH-0'}
];
export const roomSpawn={x:12,y:12,direction:2,walkFrame:0};
export const roomExit={x:12,y:15};
export function doorAt(x,y,chapterId){return townDoors.find(d=>d.x===x&&d.y===y&&(!d.chapterId||d.chapterId===chapterId))??null;}
export function roomPeople(id){return id==='tavern'?
 [[5,6],[11,6],[18,6],[6,10],[18,10],[6,13],[18,13],[11,10],[15,8]].map(([x,y],index)=>({x,y,index,kind:'tavern'})):
 [{x:12,y:7,index:0,kind:id==='church'?'church':id==='elder'?'elder':'client',...(id==='church'?{name:'神官ミル'}:{})}];}
export function roomTitle(id,clientName='依頼人',chapterId='CH-0'){return id==='church'?'はじまりの教会':id==='client'?`${clientName}の家`:id==='elder'?'長老の家':getTavern(chapterId).name;}
export function roomStep(id,position,dx,dy){
 if(!['client','elder','tavern','church'].includes(id)||!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1)return {...position,moved:false,exit:false};
 const x=position.x+dx,y=position.y+dy,direction=dy>0?0:dx<0?1:dy<0?2:3;
 if(x===roomExit.x&&y===roomExit.y)return {...position,x,y,direction,moved:true,exit:true};
 const blocked=x<2||x>22||y<4||y>14||roomPeople(id).some(n=>n.x===x&&n.y===y)||
  (id==='tavern'?((x>=4&&x<=7||x>=17&&x<=20)&&y===8):((x>=4&&x<=7||x>=17&&x<=20)&&y>=8&&y<=9))||(id==='church'&&x>=11&&x<=13&&y===5);
 return blocked?{...position,direction,moved:false,exit:false}:{x,y,direction,walkFrame:((position.walkFrame??0)+1)%3,moved:true,exit:false};
}
export function nearbyRoomPerson(id,position){return roomPeople(id).find(n=>Math.abs(n.x-position.x)+Math.abs(n.y-position.y)<=2)??null;}
export function drawTownDoors(canvas,highlight=false,clientHouse='依頼人の家',chapterId){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 // A third small original house sits at the south-west edge of the town.
 c.fillStyle='#d8c797';c.fillRect(48,215,64,38);c.fillStyle='#765a50';c.fillRect(44,207,72,17);c.fillStyle='#b28965';c.fillRect(51,202,58,6);
 c.fillStyle='#506d61';c.fillRect(58,228,13,12);c.fillStyle='#f2d78f';c.fillRect(63,228,2,12);
 for(const d of townDoors.filter(door=>!door.chapterId||door.chapterId===chapterId)){const x=d.x*16,y=d.y*16;c.fillStyle=highlight&&d.id==='client'?'#f8db83':'#c9a76b';c.fillRect(x-2,y-3,20,20);c.fillStyle='#4c3c32';c.fillRect(x+2,y,12,16);c.fillStyle='#f4cf80';c.fillRect(x+10,y+7,2,2);}
 c.font='10px sans-serif';c.textAlign='center';
 for(const [d,label]of [[townDoors[0],clientHouse],[townDoors[1],getTavern(chapterId).sign],[townDoors[2],'長老の家']]){const width=Math.max(63,c.measureText(label).width+8);c.fillStyle='#30423b';c.fillRect(d.x*16+8-width/2,d.y*16-17,width,13);c.fillStyle='#fff0c2';c.fillText(label,d.x*16+8,d.y*16-7);}
 if(chapterId==='CH-0'){c.fillStyle='#30423b';c.fillRect(272,222,84,13);c.fillStyle='#fff0c2';c.fillText('はじまりの教会',314,232);}
 c.textAlign='start';
}
export function renderRoom(canvas,state,room){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,400,288);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 rect(0,0,400,288,'#27383c');rect(24,36,352,220,'#493e3c');rect(32,48,336,192,'#a27d56');
 for(let y=64;y<240;y+=16)for(let x=32;x<368;x+=32){rect(x,y,31,15,(x+y)%3?'#9a7754':'#a58059');rect(x+2,y+13,26,1,'#7f6147');}
 rect(32,44,336,20,'#6b5442');rect(40,31,320,13,'#8c6d4d');
 for(const x of [48,312]){rect(x,65,40,30,'#c9bc99');rect(x+4,68,32,22,'#7eaaa9');rect(x+18,68,3,22,'#eed99d');rect(x+4,78,32,3,'#eed99d');}
 // Books and original furnishings distinguish the rooms.
 for(let x=100;x<296;x+=14){rect(x,65,10,22,['#a98168','#94b3a1','#a6a0c0'][x%3]);rect(x+2,69,6,2,'#e8d6a2');}
 for(const x of [64,272]){rect(x,128,64,29,'#674d3b');rect(x-3,124,70,20,room.id==='tavern'?'#c69b62':'#c4aa7e');rect(x+5,129,14,8,'#f0dfaf');rect(x+24,130,10,7,'#b8d0bd');}
 if(room.id==='elder'){rect(177,129,46,20,'#cab68b');rect(183,132,15,12,'#f2e6ba');rect(201,132,15,12,'#f2e6ba');rect(198,132,2,12,'#85714f');}
 if(room.id==='client'){rect(175,139,48,11,'#d0b474');rect(183,134,33,12,'#ece0b6');rect(187,137,23,2,'#a49371');}
 if(room.id==='church'){
  // A broad central aisle stays open from the entrance to the priest.
  rect(174,144,52,84,'#b9a38a');rect(180,145,40,82,'#e1d3ad');rect(178,80,48,19,'#718f8e');rect(174,77,56,6,'#d6d3b3');rect(194,65,8,14,'#f1d37e');rect(188,70,20,4,'#f1d37e');
  for(const x of [52,316]){rect(x,69,30,18,'#789bae');rect(x+11,69,7,18,'#e9d49f');rect(x,75,30,4,'#e9d49f');}
 }
 rect(184,230,32,24,'#d9bb77');rect(190,240,20,16,'#3b4d45');rect(196,245,8,3,'#f4d780');rect(198,248,4,6,'#f4d780');
 roomPeople(room.id).forEach((n,i)=>{drawPerson(c,n.x*16,n.y*16-9,room.id==='elder'?5:(i+1)%7);if(room.id==='church'){rect(n.x*16+3,n.y*16-8,11,4,'#ebe4cb');rect(n.x*16+4,n.y*16+5,9,7,'#eee4c4');rect(n.x*16+8,n.y*16+5,2,7,'#87aaa7');}rect(n.x*16+7,n.y*16-18,3,6,'#f5d47f');rect(n.x*16+7,n.y*16-10,3,2,'#f5d47f');});
 drawPerson(c,room.position.x*16,room.position.y*16-9,state.avatar,room.position.direction,room.position.walkFrame,state.equippedItems);
 c.fillStyle='#fff1c3';c.font='10px sans-serif';c.fillText('出口 ↓',230,251);
}
