import {getChapterChanges} from './adventure.js';
import {getTownLayout,townTile} from './towns.js';
const palettes=[['#dc9266','#453f51','#e8b860'],['#72b8bd','#384e62','#e7bd68'],['#e6a4ab','#5a384a','#e4cfa2'],['#bac875','#46523d','#ad764f'],['#9aa1d4','#363e69','#e3ac63'],['#d9a87c','#5f4c45','#d4d8b9'],['#9dcbb4','#364b4e','#d6aa72']];
export const npcPositions=getTownLayout('CH-0').npcs;
export function getTownNpcPositions(chapterId='CH-0'){return getTownLayout(chapterId).npcs;}
export function drawPerson(ctx,x,y,palette=0,direction=0,frame=0,equipped={}){
 const [shirt,hair,scarf]=palettes[palette%palettes.length];const p=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
 p(3,21,11,2,'#233e3b55');p(4,3,9,3,hair);p(2,6,13,5,hair);p(4,6,9,7,'#f3c59d');p(3,6,3,3,hair);p(11,6,3,3,hair);if(direction!==2){p(direction===1?4:direction===3?11:6,9,1,2,'#25373e');if(direction===0)p(10,9,1,2,'#25373e');}else p(4,6,9,6,hair);
 p(4,13,9,7,shirt);p(2,14,2,5,'#efbc94');p(13,14,2,5,'#efbc94');p(4,13,9,2,scarf);p(10,14,2,4,scarf);p(4,20,4,3+((frame%3)===1?1:0),'#354554');p(9,20,4,3+((frame%3)===2?1:0),'#354554');p(3,23,5,1,'#b69268');p(9,23,5,1,'#b69268');
 if(equipped.head){p(3,1,11,3,'#e7bd64');p(3,-1,2,3,'#e7bd64');p(8,-2,2,4,'#fce6a0');p(12,-1,2,3,'#e7bd64');}
 if(/rpg-.*armor/.test(equipped.shield??'')){const iron=equipped.shield==='rpg-mail-armor';p(4,14,9,6,iron?'#98b5bc':'#82a67c');p(6,15,5,4,iron?'#d0e0d9':'#bad09c');p(3,14,2,3,iron?'#718f9b':'#638760');}
 else if(equipped.shield){p(-1,15,5,7,'#e8cf8e');p(0,16,3,4,'#7299aa');p(1,21,1,2,'#e8cf8e');}
 if(equipped.weapon==='rainbow-oath'){p(15,6,3,13,'#afd2df');p(16,4,1,4,'#f2e4af');p(14,17,5,2,'#dcac66');p(16,19,1,4,'#6d667c');}
 else if(/rpg-.*sword/.test(equipped.weapon??'')){const iron=equipped.weapon==='rpg-iron-sword';p(15,7,2,12,iron?'#b7d6dc':'#d5a468');p(15,6,1,3,iron?'#e8f1df':'#f5d09a');p(13,18,6,2,'#d3b074');p(15,20,2,4,'#71614c');}
 else if(equipped.weapon)p(15,12,1,12,'#b68b5d');
}
const townColors=[
 {ground:['#668d59','#739b62','#4f784a'],path:'#c7b58b',roof:'#a65d4b',wall:'#e4d2a1',water:'#4c91a4'},
 {ground:['#8d9062','#9ba377','#7b8458'],path:'#d7c596',roof:'#bd7850',wall:'#eddaa4',water:'#5e9ea4'},
 {ground:['#758e7c','#829d8d','#657969'],path:'#bbc1ae',roof:'#687f94',wall:'#c8cfbc',water:'#688f9e'},
 {ground:['#b1a979','#c1b78b','#9b9668'],path:'#c6af79',roof:'#527b84',wall:'#d9d6b3',water:'#397f9d'},
 {ground:['#a39465','#b2a779','#8b8055'],path:'#d4bf8d',roof:'#a16f89',wall:'#e3ceab',water:'#5b9ba5'},
 {ground:['#62978b','#72aa98','#4b7d73'],path:'#b99b65',roof:'#557d67',wall:'#d4c79c',water:'#498da1'},
 {ground:['#8890b0','#9da4bf','#747c9d'],path:'#d2d1da',roof:'#8c80a0',wall:'#dce2df',water:'#a9bed4'}
];
export function mapTile(ch,x,y){return townTile(ch,x,y);}
function tree(c,x,y,sky=false){c.fillStyle=sky?'#899ab4':'#755d3d';c.fillRect(x+6,y+8,4,8);c.fillStyle=sky?'#d8e5df':'#315f44';c.fillRect(x+3,y+2,10,10);c.fillRect(x+1,y+5,14,6);c.fillStyle=sky?'#eff2e0':'#4f7c4d';c.fillRect(x+5,y+1,6,4);c.fillRect(x+2,y+5,5,4);}
function townBuilding(c,b,ch,colors){
 const x=b.x*16,y=b.y*16,w=b.w*16,h=b.h*16,roof=Math.min(27,h-23),p=(a,d,ww,hh,col)=>{c.fillStyle=col;c.fillRect(x+a,y+d,ww,hh);};
 p(0,0,w,h,colors.wall);p(0,h-4,w,4,'#977855');p(0,0,w,roof,colors.roof);p(4,0,w-8,4,ch===6?'#c2b9d0':'#d0a074');
 for(let yy=8;yy<roof;yy+=7)p(2,yy,w-4,1,ch===2?'#8f9ba3':'#c58b67');
 if(ch===1||ch===4){for(let xx=1;xx<w-5;xx+=14)p(xx,roof-8,7,10,ch===1?'#e4c479':'#dacb9d');}
 if(ch===2){for(let xx=0;xx<w;xx+=13)p(xx,0,7,7,'#bbc6bd');}
 if(ch===3){p(4,roof+4,12,12,'#718f9c');p(6,roof+6,8,8,'#b3d2cb');p(w-17,roof+4,12,12,'#718f9c');p(w-15,roof+6,8,8,'#b3d2cb');}
 else{for(const xx of [8,w-20]){p(xx,roof+6,12,11,ch===6?'#9cb1c6':'#83a8a1');p(xx+5,roof+6,2,11,'#f3dda0');p(xx,roof+11,12,2,'#f3dda0');}}
 const dx=(b.door.x-b.x)*16;p(dx+2,h-16,12,16,'#4d4239');p(dx+10,h-9,2,2,'#f2d18b');
 const sx=dx+4,sy=Math.max(roof,h-26);
 if(b.id==='shop'){p(sx,sy,2,10,'#eee2b1');p(sx-3,sy+6,8,2,'#d8b46d');p(sx+10,sy,6,8,'#8fa9b4');p(sx+12,sy+8,2,2,'#d6c491');}
 if(b.id==='tavern'){p(sx-1,sy,9,8,'#e4bf78');p(sx+8,sy+1,3,5,'#e4bf78');p(sx+1,sy+1,5,5,'#a4784f');p(sx-2,sy-2,11,3,'#eee4be');}
 if(b.id==='client'){p(sx-2,sy,14,9,'#ede4b9');p(sx,sy+2,4,2,'#b59c72');p(sx+4,sy+4,5,2,'#b59c72');}
 if(b.id==='elder'){p(sx-2,sy,13,9,'#e4d3a4');p(sx+4,sy,1,9,'#806b4f');p(sx,sy+2,3,1,'#a58c64');p(sx+6,sy+2,3,1,'#a58c64');}
 if(b.id==='church'){p(w/2-2,3,4,16,'#edd18c');p(w/2-8,8,16,4,'#edd18c');}
}
function townLandmark(c,l){
 const x=l.x*16,y=l.y*16,w=l.w*16,h=l.h*16,p=(a,b,ww,hh,col)=>{c.fillStyle=col;c.fillRect(x+a,y+b,ww,hh);};
 if(l.kind==='fountain'){p(0,0,w,h,'#536c6a');p(1,1,w-2,h-4,'#c5c9b1');p(5,5,w-10,h-13,'#78a9a9');p(w/2-4,2,8,h-14,'#bcd9c9');p(w/2-7,5,14,3,'#d4e5c8');}
 else if(l.kind==='clock'){p(5,h-5,w-10,5,'#9d8257');p(16,3,17,h-8,'#8f7553');p(9,3,w-18,25,'#e7d6a0');p(13,7,w-26,17,'#5d746b');p(w/2-1,9,2,9,'#f6dda0');p(w/2,16,7,2,'#f6dda0');p(14,30,w-28,3,'#dfb96d');}
 else if(l.kind==='castle'){p(0,5,w,h-5,'#7b8a8c');p(4,14,w-8,h-18,'#bbc5b9');for(let xx=0;xx<w;xx+=14)p(xx,0,8,12,'#c7d0c3');p(w/2-11,23,22,25,'#708d9c');p(w/2-1,23,3,25,'#dfd09b');p(w/2-11,34,22,3,'#dfd09b');p(10,25,8,13,'#627e8c');p(w-18,25,8,13,'#627e8c');}
 else if(l.kind==='lighthouse'){p(2,h-10,w-4,10,'#8a9387');p(13,15,w-26,h-19,'#e4d9b2');p(13,30,w-26,7,'#a26c5a');p(8,7,w-16,14,'#eee0ac');p(13,10,w-26,8,'#e6bf6b');p(7,3,w-14,5,'#657c86');p(18,0,w-36,3,'#d1c58e');}
 else if(l.kind==='market'){for(let i=0;i<3;i++){const xx=2+i*37;p(xx+2,17,31,h-17,'#9a7850');p(xx,0,35,18,['#b77c70','#869eae','#9ba46c'][i]);p(xx+3,2,6,16,'#eee0b3');p(xx+17,2,6,16,'#eee0b3');p(xx+5,27,9,7,['#c8ac6c','#a497be','#9abca2'][i]);p(xx+18,25,8,9,'#ded6ab');}}
 else if(l.kind==='beacon'){p(2,h-8,w-4,8,'#8b7554');p(13,11,w-26,h-18,'#af9566');p(8,7,w-16,15,'#d9ca8e');p(12,9,w-24,10,'#ecda9c');p(20,1,5,10,'#d4b46c');p(22,1,15,6,'#ebca78');}
 else{p(1,h-10,w-2,10,'#bac5d1');p(6,h-15,w-12,6,'#d6e1df');p(13,10,w-26,h-22,'#b1c7cf');p(18,3,w-36,h-15,'#dce9e1');p(8,22,6,20,'#a1bad0');p(w-14,22,6,20,'#c3b1d4');p(19,0,w-38,4,'#f1e4bd');}
}
function harborShip(c){
 const p=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 p(286,244,88,6,'#2f627a');p(292,232,76,13,'#715340');p(298,243,62,7,'#9d774c');p(289,228,81,5,'#c5a875');p(319,186,4,44,'#a78054');p(342,197,3,33,'#a78054');
 p(324,188,31,31,'#eee0b4');p(327,191,25,3,'#cbb987');p(324,216,31,3,'#cbb987');p(346,200,18,21,'#d8d5b3');p(321,182,18,6,'#b77b69');p(307,230,8,7,'#d9c18a');p(339,230,8,7,'#d9c18a');
}
export function renderWorld(canvas,state){
 const layout=getTownLayout(state.currentChapter),ch=Number(layout.chapterId.slice(3)),colors=townColors[ch],c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,400,288);
 for(let y=0;y<18;y++)for(let x=0;x<25;x++){
  const px=x*16,py=y*16,t=layout.tiles[y][x];c.fillStyle=colors.ground[(x*3+y*7)%3];c.fillRect(px,py,16,16);
  if(t==='tree'){if(ch===2){c.fillStyle='#7e8e87';c.fillRect(px,py,16,16);c.fillStyle='#b0bbb0';c.fillRect(px,py+1,12,5);c.fillRect(px+6,py+9,10,5);}else tree(c,px,py,ch===6);}
  if(t==='grass'){c.fillStyle=colors.ground[2];c.fillRect(px+3,py+9,1,3);c.fillRect(px+5,py+8,1,4);if(ch===0&&x<3&&y>10){c.fillStyle='#aa8755';c.fillRect(px,py+4,16,3);c.fillStyle='#c5ca71';c.fillRect(px+3,py+2,3,5);c.fillRect(px+11,py+2,3,5);}else if((x+y*3)%11===0){c.fillStyle=ch===6?'#e8d7f0':'#e6c378';c.fillRect(px+10,py+5,2,2);}}
  if(t==='path'){c.fillStyle=colors.path;c.fillRect(px,py,16,16);c.fillStyle=ch===6?'#aeb7c7':'#a7936d';c.fillRect(px+2,py+2,11,1);c.fillRect(px+7,py+11,8,1);if(ch===5){c.fillStyle='#94764f';c.fillRect(px,py+6,16,2);}}
  if(t==='water'){c.fillStyle=colors.water;c.fillRect(px,py,16,16);c.fillStyle=ch===6?'#d8e3eb':'#83b8c3';c.fillRect(px+2,py+5,9,2);c.fillRect(px+8,py+11,7,2);if(ch===6){c.fillStyle='#eef0e7';c.fillRect(px,py+3,8,4);c.fillRect(px+7,py+10,9,4);}}
 }
 if(ch===3)harborShip(c);
 for(const b of layout.buildings)townBuilding(c,b,ch,colors);
 townLandmark(c,layout.landmark);
 const changes=getChapterChanges(state,layout.chapterId);
 // Development stays on solid building footprints, away from walking routes.
 changes.forEach((change,i)=>{const b=layout.buildings[i%layout.buildings.length],xx=b.x*16+5+(Math.floor(i/layout.buildings.length)%4)*8,yy=(b.y+b.h)*16-7;c.fillStyle=['#f2c776','#a7d6ad','#c1b1dc'][i%3];c.fillRect(xx,yy,5,5);if(/bridge|dock|route/.test(change.kind)){c.fillStyle='#f3d791';c.fillRect(b.x*16+4,b.y*16+4,b.w*16-8,2);}if(/postbox|noticeboard/.test(change.kind)){c.fillStyle='#b97654';c.fillRect(b.x*16+3,b.y*16+29,9,10);c.fillStyle='#eed8a4';c.fillRect(b.x*16+5,b.y*16+32,5,2);}});
 const kinds=new Set(changes.map(item=>item.kind)),courseSigns=[];
 if(ch===5){if([...kinds].some(k=>k.startsWith('domestic-')))courseSigns.push(['account-gate',kinds.has('domestic-open')]);if([...kinds].some(k=>k.startsWith('dealer-')))courseSigns.push(['dealer-scales',kinds.has('dealer-ledger')]);if([...kinds].some(k=>/board|market-history/.test(k)))courseSigns.push(['limit-board',kinds.has('limit-complete-board')]);}
 if(ch===6){if([...kinds].some(k=>k.startsWith('lending-')))courseSigns.push(['lending-clock',kinds.has('lending-returned')]);if([...kinds].some(k=>k.startsWith('leverage-')))courseSigns.push(['leverage-sails',kinds.has('leverage-return')]);}
 courseSigns.forEach(([kind,complete],i)=>{const b=layout.buildings[i%layout.buildings.length];c.save();c.translate(b.x*16+20,b.y*16+17);c.scale(.5,.5);drawCourseLandmark(c,kind,0,0,complete);c.restore();});
 const shop=layout.buildings.find(b=>b.id==='shop');if(shop)drawChest(c,shop.x*16+4,shop.y*16+5,state.worldState.seals.includes(layout.chapterId));if(state.worldState.seals.includes(layout.chapterId)&&shop){const xx=shop.x*16+shop.w*16-9,yy=shop.y*16+6;c.fillStyle='#705740';c.fillRect(xx,yy,2,21);c.fillStyle='#e5bd6e';c.fillRect(xx-12,yy,12,9);c.fillStyle='#fff0b6';c.fillRect(xx-9,yy+2,3,4);}
 layout.npcs.forEach(([x,y],i)=>{drawPerson(c,x*16,y*16-9,(ch+i+1)%7);c.fillStyle='#ffe3a0';c.fillRect(x*16+7,y*16-17,2,4);c.fillRect(x*16+7,y*16-11,2,1);});
 drawPerson(c,state.worldState.x*16,state.worldState.y*16-9,state.avatar,state.worldState.direction,state.worldState.walkFrame??0,state.equippedItems);
}
export function move(state,dx,dy){
 if(!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1)return false;
 const x=state.worldState.x+dx,y=state.worldState.y+dy;state.worldState.direction=dy>0?0:dx<0?1:dy<0?2:3;const t=mapTile(state.currentChapter,x,y);
 if(x<1||x>23||y<1||y>16||['water','tree','house','fountain'].includes(t)||getTownNpcPositions(state.currentChapter).some(([nx,ny])=>nx===x&&ny===y))return false;
 state.worldState.x=x;state.worldState.y=y;state.worldState.walkFrame=((state.worldState.walkFrame??0)+1)%3;return true;
}
export function drawChest(c,x,y,opened=false){c.fillStyle='#4a3b37';c.fillRect(x,y+4,18,13);c.fillStyle='#b87545';c.fillRect(x+1,y+5,16,10);c.fillStyle='#f1c56b';c.fillRect(x+1,y+5,16,2);c.fillRect(x+3,y+5,2,11);c.fillRect(x+13,y+5,2,11);c.fillRect(x+8,y+8,3,4);if(opened){c.fillStyle='#d69752';c.fillRect(x,y-2,18,5);c.fillStyle='#f5dfa0';c.fillRect(x+4,y+1,10,4);}}
export function drawEquipment(canvas,id){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,64,64);c.fillStyle='#202e39';c.fillRect(0,0,64,64);c.fillStyle='#e9c16e';if(/shield/.test(id)){c.fillRect(17,10,30,34);c.fillRect(21,44,22,7);c.fillRect(27,51,10,5);c.fillStyle='#759ca7';c.fillRect(22,15,20,29);c.fillStyle='#e9c16e';c.fillRect(30,18,4,30);c.fillRect(24,29,16,4);}else if(/crown/.test(id)){c.fillRect(12,28,40,22);c.fillRect(12,18,8,12);c.fillRect(28,12,8,20);c.fillRect(44,18,8,12);c.fillStyle='#f2dfa2';c.fillRect(16,41,32,4);c.fillStyle='#8cbaac';c.fillRect(29,31,6,6);}else if(/rainbow|staff/.test(id)){c.fillStyle='#b8d9dd';for(let i=0;i<9;i++)c.fillRect(16+i*3,44-i*3,6,8);c.fillStyle='#f2cf7e';c.fillRect(15,37,15,5);c.fillStyle='#bf94ba';c.fillRect(12,45,7,12);c.fillStyle='#f5e2b9';c.fillRect(43,12,5,5);}else if(/lantern/.test(id)){c.fillRect(23,12,18,4);c.fillRect(18,22,28,28);c.fillStyle='#f7e09c';c.fillRect(23,26,18,19);c.fillStyle='#ab7047';c.fillRect(15,49,34,4);c.fillRect(21,18,22,4);}else if(/loupe/.test(id)){c.fillRect(16,12,28,28);c.fillStyle='#83b8b6';c.fillRect(21,17,18,18);c.fillStyle='#e4e7c2';c.fillRect(23,19,4,8);c.fillStyle='#ad7a51';c.fillRect(38,38,8,17);}else if(/compass/.test(id)){c.fillRect(14,14,36,36);c.fillStyle='#dadab8';c.fillRect(19,19,26,26);c.fillStyle='#ad5b4d';c.fillRect(29,20,6,21);c.fillStyle='#627d8d';c.fillRect(26,31,12,7);}else{c.fillRect(16,12,33,41);c.fillStyle='#997252';c.fillRect(19,15,27,35);c.fillStyle='#f4dfad';c.fillRect(23,22,19,3);c.fillRect(23,30,19,3);c.fillRect(23,38,13,3);}}
export function drawBoss(canvas,id){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,96,80);const n=id==='hidden'?6:Number(id.slice(3))-1;const cs=['#bc9b67','#8d9ea4','#69aaa7','#bd805b','#9b9ab2','#80a5b4','#c0acd9'];const p=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};p(15,66,65,6,'#101e2b66');const body=cs[n]??cs[0];if(n===3){p(19,26,58,39,body);p(15,21,66,12,'#e0bd6b');p(21,38,54,4,'#533949');p(37,42,6,13,'#f0cd7c');p(24,47,10,6,'#f8f1c7');p(60,47,10,6,'#f8f1c7');}else if(n===1||n===4){p(27,16,43,48,body);p(33,8,31,19,body);p(19,32,12,30,body);p(68,32,12,30,body);p(31,61,14,9,'#556676');p(54,61,14,9,'#556676');p(36,21,7,4,'#f0d68c');p(55,21,7,4,'#f0d68c');p(43,39,12,12,'#dfbe74');}else{p(27,28,39,34,body);p(42,11,32,24,body);p(64,19,18,14,body);p(34,5,8,15,'#e8d0a1');p(63,4,8,13,'#e8d0a1');p(55,18,5,4,'#fff0bd');p(56,19,2,2,'#343b4b');p(14,22,20,23,body);p(6,16,9,17,body);p(21,50,8,18,body);p(60,51,11,18,body);p(10,58,21,7,body);p(6,51,7,9,body);p(38,39,17,21,'#e1cca3');p(35,65,13,5,'#e1cca3');if(n>=5){p(4,31,19,5,'#d0b2d6');p(73,36,20,5,'#d0b2d6');p(7,24,5,13,'#a2c7ba');p(82,28,5,13,'#e0bb82');}}}


// Original pixel enemies; the shields are removed only at validated story milestones.
export function drawEncounter(canvas,state,adventure){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const p=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 p(0,0,320,110,'#243e43');p(0,74,320,36,'#496351');for(let i=0;i<20;i++)p(i*19,77+(i%3)*9,7,2,'#6b805a');
 p(13,20,65,43,'#355357');p(20,13,50,11,'#627a6c');p(37,37,18,26,'#e3ba70');p(98,29,4,48,'#a88959');p(102,30,21,14,'#ba795c');
 c.save();c.translate(43,55);c.scale(1.6,1.6);drawPerson(c,0,0,state.avatar,3,0,state.equippedItems);c.restore();
 const alive=adventure.enemy.hp>0,kind=adventure.enemy.kind;
 if(/account-gate|identity-gate|dealer-scales|market-board|limit-board|lending-clock|leverage-sails/.test(kind))drawCourseLandmark(c,kind,128,45,!alive,adventure.selection);
 if(alive&&/account-gate|identity-gate|dealer-scales|market-board|limit-board|lending-clock|leverage-sails/.test(kind))drawCourseEnemy(c,kind,adventure.selection);
 else if(alive){const body=['route','bridge','chain'].some(k=>kind.includes(k))?'#9b9cbb':kind==='shop'?'#d4a66a':'#98bca9';
 p(221,43,50,30,body);p(229,34,34,42,body);p(219,32,10,17,body);p(262,32,10,17,body);p(218,75,17,6,'#ddd1a5');p(256,75,17,6,'#ddd1a5');p(231,49,6,5,'#263b42');p(253,49,6,5,'#263b42');p(240,62,12,3,'#70565e');
 if(kind==='letter'){p(201,43,20,10,body);p(272,43,24,10,body);p(202,38,8,18,body);p(286,38,8,18,body);}else if(kind==='shop'){p(235,24,7,14,'#e4be6f');p(251,24,7,14,'#e4be6f');p(216,64,60,6,'#e6cb8d');}else{p(236,25,20,9,'#ddbb7c');p(244,19,5,11,'#e8dbab');}
 }else if(/account-gate|identity-gate|dealer-scales|market-board|limit-board|lending-clock|leverage-sails/.test(kind)){
  // A completed exercise leaves a signed record, not an unearned equipment chest.
  p(232,40,35,38,'#e4d8ab');p(236,45,27,3,'#ac946f');p(237,53,10,3,'#7a9982');p(246,50,4,9,'#7a9982');p(249,47,8,4,'#7a9982');p(237,64,23,2,'#af9c76');p(237,69,18,2,'#af9c76');for(let i=0;i<5;i++)p(221+i*12,26+(i%2)*9,3,3,'#f8e6a4');
 }else{p(231,52,36,25,'#b67d4d');p(229,45,40,10,'#e5bd6d');p(245,53,7,13,'#f9dfa1');for(let i=0;i<5;i++)p(221+i*12,26+(i%2)*9,3,3,'#f8e6a4');}
}

// Small original sixteen-pixel-style props. They show evidence, never own it.
export function drawCourseLandmark(c,kind,x,y,complete=false,selection=null){
 const p=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(x+a,y+b,w,h);};
 if(kind==='account-gate'||kind==='identity-gate'){
  p(0,5,37,31,'#6a755d');p(-3,1,43,8,'#b79563');p(4,11,29,24,'#d6d0a2');p(12,17,13,18,complete?'#35544b':'#847866');p(8,12,4,4,complete?'#f5d785':'#a3ad99');p(28,12,3,4,'#b2c7b8');p(25,-6,3,8,'#c4a46a');p(28,-6,9,6,complete?'#f0cd82':'#9fb9b4');
 }else if(kind==='dealer-scales'){
  p(3,0,30,3,'#ddb978');p(17,0,3,27,'#b68c59');p(7,3,2,12,'#c4aa79');p(28,3,2,12,'#c4aa79');p(1,14,15,4,'#e4d4a1');p(23,14,15,4,'#e4d4a1');p(0,18,16,3,'#9baead');p(22,18,16,3,'#b7876b');p(10,27,18,4,'#b68c59');p(3,8,10,5,'#c3d5c7');p(25,8,10,5,'#d8ad7e');
 }else if(kind==='market-board'||kind==='limit-board'){
  p(0,0,39,27,'#8a6948');p(3,3,33,20,'#374e4b');p(4,27,3,9,'#7c5c40');p(32,27,3,9,'#7c5c40');for(let i=0;i<3;i++){p(6,6+i*5,12,3,complete?'#a6c9a7':'#c8b786');p(21,6+i*5,11,3,complete?'#a6c9a7':'#ca9587');}p(18,4,1,17,'#81968a');
 }else if(kind==='lending-clock'){
  p(1,12,35,24,'#99734e');p(-2,8,41,7,'#c6a16c');p(5,18,27,15,'#594c40');p(10,0,18,19,'#e8d49d');p(13,3,12,12,'#4a625d');p(18,5,2,7,'#efdc9a');p(20,10,4,2,'#efdc9a');p(0,33,8,4,'#6e5842');p(29,33,8,4,'#6e5842');if(complete){p(14,22,13,8,'#debc76');p(18,22,2,8,'#f3d993');}
 }else if(kind==='leverage-sails'){
  p(-2,24,42,8,'#b38d5b');p(3,32,31,4,'#826044');p(17,-5,3,30,'#d6b277');const short=selection?.side==='short';const span=selection?.leverage===5?22:selection?.leverage===1?12:17;p(short?-3:21,-3,span,23,complete?'#aaafa0':short?'#b6a7ce':'#a8c9b6');p(short?-3:21,18,span,3,'#e8d7a0');if(complete){p(19,1,12,4,'#d1b47d');p(19,7,10,4,'#d1b47d');}
 }
}
function drawCourseEnemy(c,kind,selection){
 const p=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(kind==='lending-clock'){
  p(220,63,65,14,'#a8bd9d');p(237,37,36,35,'#bc9f70');p(241,41,28,25,'#e4d6a6');p(247,46,16,15,'#55746b');p(254,46,3,10,'#f0d694');p(254,54,8,3,'#f0d694');p(220,50,3,15,'#b3c6a6');p(229,48,3,16,'#b3c6a6');p(219,47,5,5,'#e6daa8');p(228,45,5,5,'#e6daa8');p(220,49,2,2,'#2b4145');p(229,47,2,2,'#2b4145');
 }else if(kind==='leverage-sails'){
  const left=selection?.side==='short',color=left?'#b6a7ce':'#9cbead';p(234,41,32,34,color);p(228,29,16,18,color);p(257,29,16,18,color);p(212,44,23,14,color);p(267,44,23,14,color);p(208,37,8,16,color);p(287,37,8,16,color);p(236,45,5,5,'#253b43');p(259,45,5,5,'#253b43');p(242,56,14,6,'#edd49b');p(left?215:280,27,9,4,'#f4ce81');p(left?215:280,24,4,10,'#f4ce81');p(235,75,10,7,'#cda06a');p(259,75,10,7,'#cda06a');
 }else if(kind==='market-board'||kind==='limit-board'){
  const body=kind==='limit-board'?'#c0ab79':'#a8bdc1';p(227,37,45,39,body);p(218,48,10,21,body);p(272,48,10,21,body);p(218,37,9,8,body);p(273,37,9,8,body);p(235,47,7,5,'#2e4448');p(257,47,7,5,'#2e4448');p(239,59,19,12,'#e4d3a2');p(243,62,12,2,'#897259');p(242,29,16,9,'#cfa978');if(kind==='limit-board'){p(238,19,5,12,'#8fae9f');p(258,19,5,12,'#8fae9f');p(225,77,16,6,'#d7c49c');p(260,77,16,6,'#d7c49c');}else{p(216,72,10,6,body);p(274,72,10,6,body);}
 }else if(kind==='dealer-scales'){
  p(229,39,38,35,'#cda56f');p(223,24,13,23,'#cda56f');p(259,24,13,23,'#cda56f');p(227,31,5,11,'#e4d0a0');p(263,31,5,11,'#e4d0a0');p(232,48,7,5,'#2e4246');p(256,48,7,5,'#2e4246');p(241,57,12,13,'#eddbab');p(244,57,6,4,'#6a584e');p(210,62,23,12,'#cda56f');p(204,55,10,13,'#eddbab');p(229,74,12,7,'#e4d2a3');p(256,74,12,7,'#e4d2a3');
 }else{
  const color=kind==='identity-gate'?'#a8c4c2':'#b39fbb';p(229,38,36,37,color);p(221,29,13,25,color);p(260,29,13,25,color);p(235,48,9,6,'#f2d58e');p(252,48,9,6,'#f2d58e');p(238,49,3,3,'#2a4145');p(255,49,3,3,'#2a4145');p(244,58,10,5,'#d5a575');p(236,68,25,11,'#e0d8b6');p(231,80,14,4,'#bd9367');p(255,80,14,4,'#bd9367');if(kind==='account-gate'){p(215,60,10,20,'#80654d');p(213,59,14,4,'#e0c483');p(237,18,4,18,'#d7c39b');p(235,14,8,8,'#e5d7ad');}else{p(269,57,16,14,'#9c7855');p(272,60,10,8,'#c4dad3');}
 }
}


export const tavernSeats=[[34,44],[112,34],[233,42],[56,108],[139,100],[251,104],[188,39],[195,107],[285,46]];
export function drawTavern(canvas,state={}){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const p=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const ch=Number(getTownLayout(state.currentChapter).chapterId.slice(3)),roomColors=[['#8d6c4e','#967656','#53473b'],['#b39363','#c4a572','#7a5940'],['#8a9898','#a6b2aa','#576b74'],['#6e8b8c','#849e9d','#3d6374'],['#a87d72','#bb9986','#705568'],['#799d80','#94b393','#496f65'],['#a8a8bd','#c3c2d1','#666780']][ch];
 p(0,0,320,160,'#493e39');for(let y=30;y<160;y+=16)for(let x=0;x<320;x+=32){p(x,y,31,15,(x+y)%3?roomColors[0]:roomColors[1]);p(x+2,y+13,25,1,'#6f6c6180');}
 p(0,0,320,30,roomColors[2]);p(4,25,312,6,'#b08c58');p(7,7,85,17,'#9c7d52');p(9,9,81,12,'#3b5149');
 for(let i=0;i<6;i++){p(14+i*12,10,5,11,['#b88759','#b6b782','#8ba8a0'][i%3]);p(15+i*12,7,3,4,'#e7ce8f');}
 p(142,5,30,20,'#b5824b');p(148,8,18,12,'#eddca6');p(154,10,5,8,'#d09750');p(305,5,5,24,'#c6a66d');p(301,8,12,12,'#f1ce78');
 if(ch===0){p(96,6,26,19,'#826546');p(98,11,22,3,'#b79b65');p(98,20,22,3,'#b79b65');}
 if(ch===1){p(185,4,61,20,'#5a674d');for(let i=0;i<4;i++){p(191+i*13,8,7,7,'#e3c470');p(193+i*13,10,3,3,'#a7804d');}}
 if(ch===2){for(const xx of [100,194,262]){p(xx,2,13,22,'#768ca0');p(xx+5,5,3,16,'#e4d4a4');p(xx+2,11,9,3,'#e4d4a4');}}
 if(ch===3){p(190,3,53,20,'#d6c99c');p(194,6,45,14,'#4d94ad');p(197,14,39,2,'#a0c9cd');p(216,6,3,14,'#d6c99c');p(265,6,12,18,'#b08b58');p(261,13,20,3,'#d8b578');}
 if(ch===4){for(let i=0;i<5;i++){p(187+i*17,3,12,19,['#bf8e86','#b0b7a2','#a9a0bf'][i%3]);p(190+i*17,7,6,7,'#f0dfb1');}}
 if(ch===5){p(190,4,87,19,'#8eb4aa');for(let i=0;i<5;i++){p(196+i*16,12,11,3,'#cfbf85');p(200+i*16,6,3,13,'#dae4c4');}}
 if(ch===6){p(190,3,91,20,'#8dabc2');for(let i=0;i<5;i++){p(193+i*17,9+(i%2)*4,19,6,'#e3ebe4');p(198+i*17,6+(i%2)*4,10,4,'#e3ebe4');}}
 for(const[x,y]of [[59,67],[126,71],[231,68],[92,135],[173,132],[272,131]]){p(x-18,y-8,34,20,'#553b2e');p(x-20,y-11,38,16,'#c39760');p(x-17,y-9,32,1,'#e1bc7b');p(x-13,y+9,4,9,'#573d2d');p(x+10,y+9,4,9,'#573d2d');p(x-5,y-6,7,5,'#ebd6a5');p(x+6,y-6,4,5,'#d7b66e');}
 tavernSeats.forEach(([x,y],i)=>{p(x,y+18,18,7,'#674d38');drawPerson(c,x,y,i%7);if(i===8){p(x+3,y+3,12,3,'#d8d9c7');p(x+5,y+10,9,5,'#e8e0cc');p(x+7,y+15,5,3,'#e8e0cc');p(x+15,y+7,2,19,'#e1ba6c');}p(x+7,y-4,2,2,'#f8df9f');});
}
