import {drawPerson} from './world.js';
import {getTownLayout} from './towns.js';

const taverns=Object.freeze(Object.fromEntries([
 ['居酒屋 ひとつぶ','ひとつぶ','居酒屋'],
 ['立ち呑み 銅貨横丁','銅貨横丁','立ち呑み'],
 ['酒処 あかし灯','あかし灯','酒処'],
 ['港バー しおかぜ','しおかぜ','港バー'],
 ['大衆酒場 星札小路','星札小路','大衆酒場'],
 ['島バル 鍵の入り江','鍵の入り江','島バル'],
 ['雲上亭','雲上亭','亭']
].map(([name,sign,kind],chapter)=>[`CH-${chapter}`,Object.freeze({name,sign,kind})])));
const chapterKey=chapterId=>getTownLayout(chapterId).chapterId;
export function getTavern(chapterId='CH-0'){return taverns[chapterKey(chapterId)];}

// Furniture uses the same tile rectangles for drawing and collision. Rugs,
// windows and floor patterns are decoration and do not block the walking floor.
const tavernInteriors=[
 {wall:'#725241',floor:['#ad8255','#a47b4e'],trim:'#dab982',furniture:[['hearth',9,7,4,1],['table',4,8,4,1],['table',17,8,4,1],['barrel',3,12,1,2],['barrel',21,12,1,2]]},
 {wall:'#455954',floor:['#9c9479','#aaa18a'],trim:'#e4c275',furniture:[['counter',3,8,7,1],['counter',17,8,5,1],['counter',21,10,1,4],['barrel',3,12,2,1]]},
 {wall:'#626a75',floor:['#9b9f9c','#b3b6ac'],trim:'#e2cb94',furniture:[['pillar',4,8,1,2],['pillar',8,8,1,2],['pillar',17,8,1,2],['pillar',21,8,1,2],['stone-table',10,4,5,1],['lamp',3,13,1,1],['lamp',22,13,1,1],['stone-table',6,11,3,1]]},
 {wall:'#42616d',floor:['#a28161','#b2926e'],trim:'#dec58e',furniture:[['counter',3,4,7,2],['boat',19,8,3,2],['table',4,8,3,1],['table',16,11,3,1],['barrel',3,13,2,1]]},
 {wall:'#755a60',floor:['#a58c76','#b49b7f'],trim:'#e1c98e',furniture:[['cards',3,8,7,1],['cards',16,8,6,1],['cards',9,4,6,1],['crate',3,12,2,2],['crate',21,12,2,2],['cards',9,11,3,1]]},
 {wall:'#507969',floor:['#b5a87e','#c5b78b'],trim:'#f0da9e',furniture:[['plant',3,5,2,2],['plant',20,5,2,2],['plant',3,12,2,2],['plant',20,12,2,2],['table',6,8,3,1],['table',16,8,3,1],['basin',10,4,3,1]]},
 {wall:'#6b6c8e',floor:['#b4b2c0','#c7c5d0'],trim:'#e9ddb5',furniture:[['sofa',3,7,4,1],['sofa',4,8,1,1],['sofa',18,7,4,1],['sofa',20,8,2,1],['cloud-table',9,8,2,1],['cloud-table',16,10,2,1],['lamp',3,12,1,1],['lamp',21,12,1,1],['sofa',9,4,6,1]]}
];
const tavernInterior=chapterId=>tavernInteriors[Number(chapterKey(chapterId).slice(3))];
const furnitureBlocks=(piece,x,y)=>{const [,left,top,width,height]=piece;return x>=left&&x<left+width&&y>=top&&y<top+height;};

// Original rooms. Their position is presentation state; quest progress stays in the engine.
const doorLabels={client:'依頼人の家',tavern:'酒場',elder:'長老の家',church:'はじまりの教会'};
export function getTownDoors(chapterId='CH-0'){
 const layout=getTownLayout(chapterId);
 return Object.freeze(layout.buildings.filter(building=>building.id!=='shop').map(building=>Object.freeze({id:building.id,...building.door,label:doorLabels[building.id],...(building.id==='church'?{chapterId:layout.chapterId}:{})})));
}
export const townDoors=getTownDoors('CH-0');
export const roomSpawn={x:12,y:12,direction:2,walkFrame:0};
export const roomExit={x:12,y:15};
export function doorAt(x,y,chapterId){return getTownDoors(chapterId).find(d=>d.x===x&&d.y===y&&(!d.chapterId||(chapterId!==undefined&&d.chapterId===chapterKey(chapterId))))??null;}
export function roomPeople(id,chapterId='CH-0'){return id==='tavern'?
 [[5,6],[11,6],[18,6],[6,10],[18,10],[6,13],[18,13],[11,10],[15,8]].map(([x,y],index)=>({x,y,index,kind:'tavern'})):
 [{x:12,y:7,index:0,kind:id==='church'?'church':id==='elder'?'elder':'client',...(id==='church'?{name:'神官ミル'}:{})}];}
export function roomTitle(id,clientName='依頼人',chapterId='CH-0'){return id==='church'?'はじまりの教会':id==='client'?`${clientName}の家`:id==='elder'?'長老の家':getTavern(chapterId).name;}
export function roomStep(id,position,dx,dy,chapterId='CH-0'){
 if(!['client','elder','tavern','church'].includes(id)||!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1)return {...position,moved:false,exit:false};
 const x=position.x+dx,y=position.y+dy,direction=dy>0?0:dx<0?1:dy<0?2:3;
 if(x===roomExit.x&&y===roomExit.y)return {...position,x,y,direction,moved:true,exit:true};
 const blocked=x<2||x>22||y<4||y>14||roomPeople(id,chapterId).some(n=>n.x===x&&n.y===y)||
  (id==='tavern'?tavernInterior(chapterId).furniture.some(piece=>furnitureBlocks(piece,x,y)):((x>=4&&x<=7||x>=17&&x<=20)&&y>=8&&y<=9))||(id==='church'&&x>=11&&x<=13&&y===5);
 return blocked?{...position,direction,moved:false,exit:false}:{x,y,direction,walkFrame:((position.walkFrame??0)+1)%3,moved:true,exit:false};
}
export function nearbyRoomPerson(id,position,chapterId='CH-0'){return roomPeople(id,chapterId).find(n=>Math.abs(n.x-position.x)+Math.abs(n.y-position.y)<=2)??null;}
export function drawTownDoors(canvas,highlight=false,clientHouse='依頼人の家',chapterId){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 const doors=getTownDoors(chapterId).filter(door=>!door.chapterId||(chapterId!==undefined&&door.chapterId===chapterKey(chapterId)));
 for(const d of doors){const x=d.x*16,y=d.y*16;c.fillStyle=highlight&&d.id==='client'?'#f8db83':'#c9a76b';c.fillRect(x-2,y-3,20,20);c.fillStyle='#4c3c32';c.fillRect(x+2,y,12,16);c.fillStyle='#f4cf80';c.fillRect(x+10,y+7,2,2);}
 c.font='10px sans-serif';c.textAlign='center';
 for(const d of doors){const label=d.id==='client'?clientHouse:d.id==='tavern'?getTavern(chapterId).sign:d.label;if(d.id==='church'){c.fillStyle='#30423b';c.fillRect(272,222,84,13);c.fillStyle='#fff0c2';c.fillText(label,314,232);continue;}const width=Math.max(63,c.measureText(label).width+8);c.fillStyle='#30423b';c.fillRect(d.x*16+8-width/2,d.y*16-17,width,13);c.fillStyle='#fff0c2';c.fillText(label,d.x*16+8,d.y*16-7);}
 c.textAlign='start';
}

function drawTavernFurniture(rect,piece){
 const [kind,tx,ty,tw,th]=piece,x=tx*16,y=ty*16,w=tw*16,h=th*16;
 rect(x,y,w,h,'#51483b');
 if(kind==='plant'){
  rect(x+3,y+2,w-6,h-9,'#547959');rect(x+7,y,w-14,h-7,'#719b64');rect(x+5,y+h-8,w-10,8,'#ba8c66');rect(x+3,y+h-9,w-6,3,'#d4af7c');
 }else if(kind==='hearth'){
  rect(x+1,y+1,w-2,h-2,'#9b9984');rect(x+6,y+3,w-12,h-6,'#4b4140');for(let i=10;i<w-6;i+=12){rect(x+i,y+6,6,6,'#de9c58');rect(x+i+2,y+4,3,6,'#f7d17d');}
 }else if(kind==='pillar'){
  rect(x+1,y,w-2,h,'#aeb5b0');rect(x+4,y+3,w-8,h-6,'#c8cbc1');rect(x,y,w,4,'#d9d8bf');rect(x,y+h-4,w,4,'#7d8988');
 }else if(kind==='lamp'){
  rect(x+3,y+1,w-6,h-2,'#9a9d9d');rect(x+4,y+3,w-8,7,'#efcf78');rect(x+7,y+10,3,4,'#695c53');
 }else if(kind==='barrel'||kind==='crate'){
  rect(x+1,y+1,w-2,h-2,'#a98059');for(let i=5;i<w;i+=8)rect(x+i,y+2,1,h-4,'#d2ad75');rect(x+1,y+4,w-2,3,'#6b685c');rect(x+1,y+h-7,w-2,3,'#6b685c');
 }else if(kind==='boat'){
  rect(x+2,y+2,w-4,h-4,'#8c7356');rect(x+5,y+5,w-10,h-10,'#c0a277');rect(x+10,y+7,w-20,3,'#e2d2a3');rect(x+8,y+9,3,h-14,'#645849');rect(x+w-11,y+9,3,h-14,'#645849');
 }else if(kind==='sofa'){
  rect(x+1,y+1,w-2,h-2,'#9493b2');rect(x+3,y+4,w-6,h-6,'#c9bfd0');rect(x+1,y+1,w-2,4,'#e1d2d8');rect(x+2,y+5,3,h-7,'#aa9fb9');
 }else if(kind==='basin'){
  rect(x+1,y+1,w-2,h-2,'#bcc8a1');rect(x+5,y+4,w-10,h-8,'#6eaaa0');rect(x+11,y+5,7,3,'#d1dfbc');
 }else{
  const stone=kind==='stone-table'||kind==='cloud-table';rect(x+1,y+1,w-2,h-3,stone?'#c9c5b6':'#b99460');rect(x+2,y+2,w-4,2,stone?'#e6dcc0':'#d6b57d');
  for(let i=5;i<w-8;i+=16){rect(x+i,y+5,kind==='cards'?9:5,kind==='cards'?7:6,kind==='cards'?'#f1dfb2':kind==='counter'?'#7a9d8d':'#e8d3a4');rect(x+i+2,y+6,2,3,kind==='cards'?'#9a6676':'#bbd1b3');}
 }
}

function drawTavernInterior(c,chapterId){
 const key=chapterKey(chapterId),index=Number(key.slice(3)),plan=tavernInterior(key),rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 rect(0,0,400,288,'#27383c');rect(24,36,352,220,plan.wall);rect(32,64,336,176,plan.floor[0]);
 for(let y=64;y<240;y+=16)for(let x=32;x<368;x+=32){rect(x,y,Math.min(31,368-x),15,plan.floor[(x/32+y/16)%2]);rect(x+2,y+13,Math.min(26,366-x),1,plan.wall);}
 rect(32,44,336,20,plan.wall);rect(40,31,320,13,plan.trim);
 const window=(x,y,w,h,sky)=>{rect(x,y,w,h,plan.trim);rect(x+3,y+3,w-6,h-6,sky);rect(x+w/2-1,y+2,3,h-4,plan.trim);};
 if(index===0){window(48,66,40,28,'#85a899');window(312,66,40,28,'#85a899');for(let x=112;x<288;x+=24){rect(x,68,15,20,'#906a4d');rect(x+2,71,11,3,'#d9bd80');}}
 if(index===1){for(const x of [48,112,256,320])window(x,66,26,20,'#8fb1b2');rect(136,66,112,17,'#80694b');for(let x=143;x<242;x+=13){rect(x,70,5,10,'#a8c1a0');rect(x+1,67,3,4,'#dcc58c');}}
 if(index===2){for(let x=32;x<368;x+=32){rect(x,64,Math.min(30,368-x),11,'#7e888c');if(x+16<368)rect(x+16,77,Math.min(30,352-x),10,'#899396');}window(48,67,40,27,'#8db0bc');window(312,67,40,27,'#8db0bc');}
 if(index===3){for(const x of [48,224]){window(x,66,128,31,'#6d9fac');rect(x+4,83,120,10,'#5e8eaa');for(let xx=x+10;xx<x+112;xx+=25)rect(xx,87,14,2,'#c2d8ce');}rect(190,67,20,24,'#d9c697');rect(199,66,3,25,'#7a6954');rect(192,70,6,12,'#f0dfb0');}
 if(index===4){for(const x of [48,256]){rect(x,67,96,28,'#6c5960');for(let xx=x+5;xx<x+90;xx+=19){rect(xx,71,13,19,'#e9d3a0');rect(xx+3,75,7,8,['#a77879','#799686'][xx%2]);}}}
 if(index===5){rect(32,64,336,24,'#81b6ab');for(let x=40;x<364;x+=30){rect(x,79,24,2,'#c2dfc2');rect(x,66,3,27,'#ab9362');}rect(32,88,336,4,'#e0c58a');rect(132,93,135,6,'#d1bf8b');}
 if(index===6){for(const x of [48,168,288]){window(x,66,64,28,'#a7b6cc');rect(x+6,80,50,10,'#e1e5da');rect(x+14,75,34,11,'#f1ede2');}rect(132,131,136,44,'#d6c7c2');rect(140,136,120,34,'#e5d6cb');}
 for(const piece of plan.furniture)drawTavernFurniture(rect,piece);
 c.fillStyle='#fff1c3';c.font='10px sans-serif';c.textAlign='center';c.fillText(getTavern(key).name,200,54);c.textAlign='start';
}

export function renderRoom(canvas,state,room){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,400,288);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(room.id==='tavern')drawTavernInterior(c,state.currentChapter);else{
 rect(0,0,400,288,'#27383c');rect(24,36,352,220,'#493e3c');rect(32,48,336,192,'#a27d56');
 for(let y=64;y<240;y+=16)for(let x=32;x<368;x+=32){rect(x,y,Math.min(31,368-x),15,(x+y)%3?'#9a7754':'#a58059');rect(x+2,y+13,Math.min(26,366-x),1,'#7f6147');}
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
 }
 rect(184,230,32,24,'#d9bb77');rect(190,240,20,16,'#3b4d45');rect(196,245,8,3,'#f4d780');rect(198,248,4,6,'#f4d780');
 roomPeople(room.id,state.currentChapter).forEach((n,i)=>{drawPerson(c,n.x*16,n.y*16-9,room.id==='elder'?5:(i+1)%7);if(room.id==='church'){rect(n.x*16+3,n.y*16-8,11,4,'#ebe4cb');rect(n.x*16+4,n.y*16+5,9,7,'#eee4c4');rect(n.x*16+8,n.y*16+5,2,7,'#87aaa7');}rect(n.x*16+7,n.y*16-18,3,6,'#f5d47f');rect(n.x*16+7,n.y*16-10,3,2,'#f5d47f');});
 drawPerson(c,room.position.x*16,room.position.y*16-9,state.avatar,room.position.direction,room.position.walkFrame,state.equippedItems);
 c.fillStyle='#fff1c3';c.font='10px sans-serif';c.fillText('出口 ↓',230,251);
}
