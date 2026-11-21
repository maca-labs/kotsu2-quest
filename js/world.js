import {getChapterChanges,tavernAdvisorNames} from './adventure.js';
import {getTownLayout,townTile} from './towns.js';
import {chapterById} from './content.js';
import {drawWalkingCharacter, townNpcName} from './character-art.js';

export const npcPositions=getTownLayout('CH-0').npcs;
export function getTownNpcPositions(chapterId='CH-0'){return getTownLayout(chapterId).npcs;}
export function drawPerson(ctx, x, y, avatar=0, direction=0, frame=0, equipped={}) {
 drawWalkingCharacter(ctx, x, y, 'hero', direction, frame, equipped, avatar);
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
// Broad highlights and stepped shadows stay legible at the map's native 400px width.
function sceneryBrush(c,x,y){
 return (dx,dy,w,h,color)=>{c.fillStyle=color;c.fillRect(x+dx,y+dy,w,h);};
}
function tree(c,x,y,sky,seed){
 const p=sceneryBrush(c,x,y),shade=sky?'#637a93':'#34594a',leaf=sky?'#a0b4bf':'#557c51',light=sky?'#e2e7d6':'#83a363';
 p(3,12,12,3,shade);p(7,8,3,8,'#755e42');p(7,12,1,4,'#b29566');
 if(seed%3===0){
  p(7,0,3,2,shade);p(5,2,7,3,leaf);p(3,5,11,4,shade);p(4,5,7,2,leaf);p(1,10,15,3,shade);
  p(3,8,11,3,leaf);p(6,2,3,2,light);p(3,9,5,1,light);p(10,7,2,2,leaf);
 }else{
  p(4,1,8,12,shade);p(1,4,14,7,shade);p(0,7,3,3,leaf);p(4,0,5,2,leaf);p(3,2,10,6,leaf);
  p(2,5,7,5,leaf);p(5,1,4,2,light);p(2,4,4,2,light);p(10,3,2,1,light);p(8,8,4,2,leaf);
 }
}
const tileGlaze=['#e5a077','#e7ab75','#abbac7','#9bbab9','#dcabc1','#a0bd88','#c5bada'];
function roofTiles(p,width,height,color,light){
 // The ridge is shorter than the eaves. Each lower row overlaps the seams above it.
 for(let row=0;row<height;row+=4){
  const inset=Math.max(0,8-Math.floor(row/3)),span=width-inset*2;
  p(inset,row,span,Math.min(4,height-row),'#4d514e');
  p(inset+1,row,span-3,Math.min(3,height-row),color);
  for(let x=inset+3+(row%8?5:0);x<width-inset-6;x+=12){
   p(x,row,5,1,light);p(x+6,row+1,1,2,'#725f59');
  }
 }
 p(8,0,width-16,2,light);p(0,height-2,width,2,'#485151');
}
function windowBay(p,x,y,width){
 p(x-1,y+1,width+2,12,'#846a54');p(x,y,width,12,'#405c61');
 p(x+2,y+2,width-4,7,'#90b5ac');p(x+3,y+2,4,2,'#dae1bc');p(x+Math.floor(width/2),y+1,1,10,'#5c7874');
 p(x-2,y+11,width+4,2,'#b09368');p(x-1,y+13,width+3,1,'#8b7257');
}
function townBuilding(c,b,ch,colors){
 const w=b.w*16,h=b.h*16,roof=Math.min(29,h-23),p=sceneryBrush(c,b.x*16,b.y*16);
 const timber=ch===2||ch===6?'#758786':'#806850',dx=(b.door.x-b.x)*16;
 p(2,roof-3,w-3,h-roof+3,'#626752');p(3,roof,w-7,h-roof-3,colors.wall);
 p(4,roof,w-9,5,'#b9a582');p(4,h-7,w-8,4,timber);
 for(const post of [6,dx-3,dx+17,w-9])p(post,roof+2,2,h-roof-6,timber);
 windowBay(p,11,Math.min(h-21,roof+7),12);windowBay(p,w-25,Math.min(h-21,roof+7),12);
 if(b.id==='client'||b.id==='elder'){
  for(const sill of [10,w-26]){
   p(sill,h-9,15,4,'#935f47');p(sill-1,h-11,17,2,'#587b52');p(sill+3,h-12,2,2,'#f2c987');p(sill+10,h-12,2,2,'#ebac79');
  }
 }
 roofTiles(p,w,roof,colors.roof,tileGlaze[ch]);
 if(b.id==='shop'){
  p(w-23,1,8,10,'#655b59');p(w-24,0,10,3,'#a99c8c');p(w-21,4,2,6,'#988479');
 }else if(b.id==='elder'){
  p(14,3,7,9,'#7f7564');p(13,2,9,2,'#bdac89');p(15,5,3,2,'#ae9876');
 }
 if(b.id==='tavern'||((ch===1||ch===4)&&b.id==='shop')){
  const stripe=ch===4?'#9b6084':ch===3?'#527b82':'#ac6855';
  p(4,roof-5,w-8,9,'#796857');
  for(let x=5;x<w-6;x+=8){
   const stripeWidth=Math.min(8,w-5-x);p(x,roof-5,stripeWidth,6,(x-5)%16?stripe:'#e5cf9d');
   p(x+1,roof+1,Math.max(1,stripeWidth-2),2,(x-5)%16?stripe:'#cbb68a');
  }
 }else if(ch===2){
  for(let x=8;x<w-5;x+=14){p(x,0,7,5,'#c6c8b3');p(x+5,0,2,6,'#8d9e98');}
 }
 if(b.id==='church'){
  const cx=Math.floor(w/2);p(cx-9,4,18,12,'#696659');p(cx-6,2,12,15,'#dad0ab');
  p(cx-2,0,4,10,'#e5bf72');p(cx-5,3,10,3,'#f3d28a');p(cx-2,10,5,6,'#736e63');
 }
 p(dx,h-19,16,19,timber);p(dx+2,h-17,12,17,'#493f39');p(dx+4,h-15,8,13,'#846348');p(dx+6,h-14,1,11,'#aa8358');
 p(dx+10,h-9,2,2,'#f2d18b');p(dx-1,h-2,18,2,'#c3b491');
 const sx=dx+4,sy=Math.max(roof,h-26);
 if(b.id==='shop'){p(sx,sy,2,10,'#eee2b1');p(sx-3,sy+6,8,2,'#d8b46d');p(sx+10,sy,6,8,'#8fa9b4');p(sx+12,sy+8,2,2,'#d6c491');}
 if(b.id==='tavern'){p(sx-1,sy,9,8,'#e4bf78');p(sx+8,sy+1,3,5,'#e4bf78');p(sx+1,sy+1,5,5,'#a4784f');p(sx-2,sy-2,11,3,'#eee4be');}
 if(b.id==='client'){p(sx-2,sy,14,9,'#ede4b9');p(sx,sy+2,4,2,'#b59c72');p(sx+4,sy+4,5,2,'#b59c72');}
 if(b.id==='elder'){p(sx-2,sy,13,9,'#e4d3a4');p(sx+4,sy,1,9,'#806b4f');p(sx,sy+2,3,1,'#a58c64');p(sx+6,sy+2,3,1,'#a58c64');}
}
function townLandmark(c,l){
 const x=l.x*16,y=l.y*16,w=l.w*16,h=l.h*16,p=(a,b,ww,hh,col)=>{c.fillStyle=col;c.fillRect(x+a,y+b,ww,hh);};
 if(l.kind==='fountain'){
  // Stone apron fills the solid tiles; the rounded bowl sits on top.
  p(0,0,w,h,'#a7aa8f');p(1,1,w-2,h-3,'#c6c4a6');
  const cx=w/2;
  p(5,11,w-10,18,'#626e65');p(2,15,w-4,10,'#758679');p(9,27,w-18,3,'#718074');
  p(5,10,w-10,13,'#e2ddbd');p(2,14,w-4,6,'#c7d0b7');p(7,12,w-14,10,'#488b92');p(5,15,w-10,5,'#62a6a4');
  p(9,14,8,1,'#a8dace');p(w-17,18,8,1,'#a8dace');p(11,23,w-22,2,'#b1c6ac');
  p(cx-6,18,12,3,'#698d83');p(cx-3,9,6,10,'#e4dec0');p(cx+1,10,2,9,'#a3b5a2');
  p(cx-8,7,16,3,'#7aaba2');p(cx-6,6,12,2,'#e2efe0');p(cx-2,1,3,6,'#e0f2d9');p(cx,0,2,4,'#f2f2d4');
  for(const side of [-1,1]){
   p(cx+side*5,4,2,2,'#dfefce');p(cx+side*9,8,1,4,'#afdbc5');p(cx+side*11,14,1,3,'#d3e9cf');
  }
 }
 else if(l.kind==='clock'){
  p(5,h-5,w-10,4,'#85795e');p(8,h-8,w-16,4,'#c4b38a');p(14,22,21,18,'#856749');
  p(16,23,6,17,'#c99b60');p(24,28,6,10,'#655b4b');p(25,29,2,7,'#e6bd76');p(24,36,4,2,'#e6bd76');
  p(10,8,28,17,'#705946');p(14,5,20,23,'#aa8251');p(13,9,22,14,'#e2b875');p(17,6,14,20,'#e2b875');
  p(16,10,16,11,'#f0e5bb');p(19,8,10,15,'#f0e5bb');p(23,10,2,7,'#50625a');p(25,16,5,2,'#53605a');
  p(16,15,2,1,'#9e7955');p(31,15,1,1,'#9e7955');p(23,21,2,1,'#9e7955');
  p(9,6,30,2,'#536b63');p(13,3,22,3,'#63816c');p(18,1,12,2,'#96a57c');p(23,0,2,3,'#e1c778');
 }
 else if(l.kind==='castle'){
  p(0,25,w,h-25,'#87968f');p(2,26,w-4,h-30,'#bbc1ad');
  for(let row=29;row<h-5;row+=8){p(2,row,w-4,1,'#a0ada1');for(let xx=5+(row%16?6:0);xx<w-3;xx+=16)p(xx,row+1,1,5,'#acb5a7');}
  for(const tx of [2,w-20]){
   p(tx,9,17,h-14,'#7b8c89');p(tx+2,10,11,h-17,'#c9ccba');p(tx+3,13,2,h-23,'#e0dfc8');
   for(let row=0;row<5;row++)p(tx+8-row*2,row*2,2+row*4,2,row<3?'#7b96a4':'#597887');
   p(tx-1,10,19,3,'#596f73');p(tx+5,19,4,7,'#5b7677');p(tx+5,37,4,5,'#5b7677');
  }
  p(20,15,w-40,14,'#7e918d');p(20,17,w-40,6,'#bdc6b6');
  for(let xx=21;xx<w-21;xx+=9){p(xx,11,6,7,'#9cafa4');p(xx,11,5,3,'#d3d7be');}
  const cx=w/2;p(cx-12,h-27,24,27,'#a39c80');p(cx-9,h-24,18,24,'#536565');p(cx-6,h-27,12,3,'#647372');
  for(let xx=cx-7;xx<cx+9;xx+=5)p(xx,h-24,2,16,'#89978d');p(cx-8,h-16,17,2,'#9eaa96');
  for(const xx of [21,w-29]){p(xx,29,9,15,'#5e7e91');p(xx+2,32,2,8,'#c1cdaf');p(xx+2,44,5,2,'#5e7e91');}
 }
 else if(l.kind==='lighthouse'){
  const cx=w/2;p(0,0,w,h,'#7f9893');p(2,1,w-4,h-5,'#a7b3a0');p(4,3,w-8,h-10,'#bac0a8');
  for(let row=0;row<8;row++){
   const half=7+Math.floor(row/2),red=row===2||row===3||row===6;
   p(cx-half,15+row*5,half*2,5,red?'#ad6554':'#e3d8b6');p(cx+half-4,15+row*5,4,5,red?'#875748':'#b6b198');
  }
  p(cx-4,h-16,8,8,'#655e50');p(cx-3,33,3,4,'#557078');p(cx+2,22,2,3,'#647c7a');
  p(cx-13,12,26,4,'#4f686e');p(cx-9,5,18,8,'#546c71');p(cx-7,6,14,6,'#f1ce72');p(cx-5,6,4,6,'#fff0ac');p(cx+2,6,2,6,'#8d9279');
  p(cx-11,4,22,2,'#51757c');p(cx-7,2,14,2,'#6d8c8c');p(cx-3,0,6,2,'#cdb67a');
  p(cx-15,h-7,30,4,'#879388');p(cx-11,h-9,22,3,'#d1c9a9');
 }
 else if(l.kind==='market'){
  for(let i=0;i<3;i++){
   const xx=2+i*37,cloth=['#aa6859','#748e9e','#899859'][i];
   p(xx+2,14,31,31,'#7e674e');p(xx+5,17,25,21,'#685c4c');p(xx+6,40,23,3,'#ae8b60');
   for(let row=0;row<4;row++){const inset=3-row;p(xx+inset,2+row*4,35-inset*2,4,cloth);for(let stripe=0;stripe<2;stripe++)p(xx+5+stripe*14-inset,2+row*4,6,4,'#ebd5ae');}
   p(xx,18,35,2,'#826d58');p(xx+3,30,29,4,'#c3a16d');p(xx+4,34,27,2,'#94794f');
   for(let k=0;k<3;k++){p(xx+6+k*8,24-k%2,6,7,['#cdaf78','#ac93b1','#9eb69d'][(i+k)%3]);p(xx+7+k*8,25-k%2,3,1,'#eed9a2');}
  }
 }
 else if(l.kind==='beacon'){
  p(3,h-7,w-6,6,'#8a785c');p(8,h-10,w-16,4,'#c8ab78');p(14,18,21,20,'#a98c63');
  p(15,20,5,18,'#d5af71');p(30,21,4,17,'#816d55');p(24,21,2,17,'#665e50');p(28,21,2,17,'#665e50');
  for(let yy=23;yy<38;yy+=4)p(24,yy,6,1,'#dec394');
  p(7,16,34,4,'#666e5d');p(11,9,26,7,'#526c69');p(14,10,20,6,'#e9bb70');p(18,9,5,7,'#ffe5a0');p(29,10,2,6,'#8c9373');
  p(8,7,32,3,'#466a63');p(13,5,22,3,'#678779');p(22,0,2,6,'#8c724e');p(24,0,11,3,'#db9969');p(28,3,5,2,'#bb7954');
 }
 else{
  p(1,h-9,w-2,8,'#9da9b5');p(4,h-13,w-8,7,'#d5dcce');p(8,h-16,w-16,5,'#b5c0cb');
  for(const [cx,top,length,r,bright,dim]of [[11,23,24,5,'#c2dfd6','#829db8'],[35,16,31,6,'#dbcee1','#a49cbd'],[23,0,48,9,'#e4eee0','#9ab7c8']]){
   for(let row=0;row<length;row+=2){
    const width=Math.min(r,Math.floor(row/2)+1,Math.ceil((length-row)/2));
    p(cx-width,top+row,width,2,bright);p(cx,top+row,width,2,dim);p(cx-1,top+row,2,2,'#f1efcf');
   }
  }
  p(w/2-4,h-17,8,3,'#c6ae78');
 }
}
function harborShip(c){
 const p=sceneryBrush(c,286,180);
 p(8,65,67,3,'#326c80');p(18,68,47,2,'#348299');p(3,60,7,1,'#a3cfc4');p(72,63,9,1,'#a3cfc4');
 p(1,47,80,4,'#614b43');p(4,51,74,5,'#a27a53');p(8,56,65,5,'#805c44');p(15,61,52,4,'#604e44');
 p(3,48,74,2,'#dec38c');p(11,56,59,1,'#c19a64');p(0,45,8,3,'#c3a274');
 for(let x=15;x<72;x+=12){p(x,52,4,3,'#5a5148');p(x,52,4,1,'#e6c28c');}
 p(34,3,3,45,'#755b42');p(34,4,1,43,'#dac28c');p(58,15,2,33,'#896e4e');
 p(33,2,15,3,'#c66850');p(39,5,7,2,'#945b4a');p(58,14,8,2,'#e1c677');
 p(8,12,45,2,'#82664d');p(44,22,32,2,'#927b59');
 for(let row=0;row<7;row++){
  const bow=Math.round(Math.sin(row*Math.PI/7)*3),left=11+bow+Math.floor(row/3),width=38-Math.floor(row/2)*2;
  p(left,14+row*4,width,4,row<5?'#e9dfbb':'#ccbea0');
  p(left+width-5,14+row*4,5,4,'#bbad8d');p(left+3,14+row*4,2,4,'#f6eac8');
 }
 for(let row=0;row<6;row++){
  const width=5+row*4;p(60,24+row*3,width,3,'#d7d7bb');p(59+width,24+row*3,2,3,'#adbaa7');
 }
 for(let i=0;i<10;i++){p(10-i,15+i*3,1,3,'#988363');p(52+i*2,15+i*3,1,3,'#9e9170');}
 p(21,42,11,5,'#786853');p(22,42,9,2,'#d6ba80');
}
function townScenery(c,layout,ch,colors){
 for(let y=0;y<18;y++)for(let x=0;x<25;x++){
  const px=x*16,py=y*16,t=layout.tiles[y][x],p=sceneryBrush(c,px,py);
  const seed=(x*31+y*47+x*y*7+ch*13)%251;
  const above=layout.tiles[y-1]?.[x],below=layout.tiles[y+1]?.[x],left=layout.tiles[y][x-1],right=layout.tiles[y][x+1];
  p(0,0,16,16,colors.ground[0]);
  if(t==='tree'){
   if(ch===2){
    p(0,0,16,16,'#74847e');p(0,1,14,5,'#a8b4a5');p(1,1,12,1,'#c8c6ac');p(4,9,12,5,'#94a29a');p(5,9,11,1,'#b9c2ae');p(0,9,2,5,'#9daaa0');
   }else tree(c,px,py,ch===6,seed);
  }else if(t==='grass'){
   const gx=2+seed%8,gy=4+((seed>>2)%8);
   p(gx-1,gy+1,6,1,colors.ground[1]);p(gx,gy-1,1,2,colors.ground[2]);p(gx+2,gy-2,1,3,colors.ground[1]);
   if(ch===0&&x<3&&y>10){
    for(let yy=2;yy<15;yy+=6){p(0,yy+2,16,2,'#9b8158');p(2,yy,3,3,'#caba71');p(10,yy+1,2,3,'#dee09a');}
   }else if(seed%8===0){
    const flower=ch===6?'#ead9ec':'#e6c682';
    p(gx+3,gy+1,1,3,colors.ground[2]);p(gx+2,gy,3,2,flower);p(gx+5,gy-2,2,2,flower);
   }
  }else if(t==='path'){
   const dock=ch===3&&x>=15||ch===5&&[above,below,left,right].includes('water');
   if(dock){
    p(0,0,16,16,'#bb9f74');p(0,4,16,1,'#947c5b');p(0,10,16,1,'#907657');
    p(seed%4,6,8,1,'#cdb78c');p(2,2,1,1,'#7c6951');p(13,13,1,1,'#7c6951');
   }else{
    p(0,0,16,16,colors.path);
    const gravel=ch===6?'#b0b2c4':'#b09e7d';
    p(2+seed%7,4+seed%9,3,1,gravel);p(10+seed%4,2+seed%3,2,1,'#e3d4ab');
    if(above==='grass')p(0,0,16,1,colors.ground[2]);
    if(below==='grass')p(0,15,16,1,colors.ground[1]);
    if(left==='grass')p(0,0,1,16,colors.ground[1]);
    if(right==='grass')p(15,0,1,16,colors.ground[2]);
   }
  }else if(t==='water'){
   const cloud=ch===6,light=cloud?'#e8ece3':'#83bcc0',mid=cloud?'#d3e0df':'#61a1ad';
   p(0,0,16,16,colors.water);
   const wx=2+seed%6,wy=4+seed%8;
   p(wx-2,wy+1,4,cloud?3:1,mid);p(wx+2,wy,5,cloud?4:1,mid);p(wx+5,wy-1,3,1,light);
   if(above&&above!=='water')p(0,0,16,2,light);
   if(left&&left!=='water')p(0,0,2,16,mid);
   if(right&&right!=='water')p(15,0,1,16,light);
  }
 }
 if(ch===3)harborShip(c);
 for(const b of layout.buildings)townBuilding(c,b,ch,colors);
 townLandmark(c,layout.landmark);
}
// Only immutable terrain is cached. People, chapter rewards and destination
// flags are read from the current state every time someone walks.
const sceneryLayers=new WeakMap();
export function renderWorld(canvas,state,{preview=false}={}){
 const layout=getTownLayout(state.currentChapter),ch=Number(layout.chapterId.slice(3)),c=canvas.getContext('2d');
 c.imageSmoothingEnabled=false;c.clearRect(0,0,400,288);
 if(canvas.ownerDocument&&typeof c.drawImage==='function'){
  let layer=sceneryLayers.get(layout);
  if(!layer){
   layer=canvas.ownerDocument.createElement('canvas');layer.width=400;layer.height=288;
   townScenery(layer.getContext('2d'),layout,ch,townColors[ch]);sceneryLayers.set(layout,layer);
  }
  c.drawImage(layer,0,0);
 }else townScenery(c,layout,ch,townColors[ch]);
 const changes=getChapterChanges(state,layout.chapterId);
 // Development stays on solid building footprints, away from walking routes.
 changes.forEach((change,i)=>{const b=layout.buildings[i%layout.buildings.length],xx=b.x*16+5+(Math.floor(i/layout.buildings.length)%4)*8,yy=(b.y+b.h)*16-7;c.fillStyle=['#f2c776','#a7d6ad','#c1b1dc'][i%3];c.fillRect(xx,yy,5,5);if(/bridge|dock|route/.test(change.kind)){c.fillStyle='#f3d791';c.fillRect(b.x*16+4,b.y*16+4,b.w*16-8,2);}if(/postbox|noticeboard/.test(change.kind)){c.fillStyle='#b97654';c.fillRect(b.x*16+3,b.y*16+29,9,10);c.fillStyle='#eed8a4';c.fillRect(b.x*16+5,b.y*16+32,5,2);}});
 const kinds=new Set(changes.map(item=>item.kind)),courseSigns=[];
 if(ch===5){if([...kinds].some(k=>k.startsWith('domestic-')))courseSigns.push(['account-gate',kinds.has('domestic-open')]);if([...kinds].some(k=>k.startsWith('dealer-')))courseSigns.push(['dealer-scales',kinds.has('dealer-ledger')]);if([...kinds].some(k=>/board|market-history/.test(k)))courseSigns.push(['limit-board',kinds.has('limit-complete-board')]);}
 if(ch===6){if([...kinds].some(k=>k.startsWith('lending-')))courseSigns.push(['lending-clock',kinds.has('lending-returned')]);if([...kinds].some(k=>k.startsWith('leverage-')))courseSigns.push(['leverage-sails',kinds.has('leverage-return')]);}
 courseSigns.forEach(([kind,complete],i)=>{const b=layout.buildings[i%layout.buildings.length];c.save();c.translate(b.x*16+20,b.y*16+17);c.scale(.5,.5);drawCourseLandmark(c,kind,0,0,complete);c.restore();});
 const shop=layout.buildings.find(b=>b.id==='shop');if(shop)drawChest(c,shop.x*16+4,shop.y*16+5,state.worldState.seals.includes(layout.chapterId));if(state.worldState.seals.includes(layout.chapterId)&&shop){const xx=shop.x*16+shop.w*16-9,yy=shop.y*16+6;c.fillStyle='#705740';c.fillRect(xx,yy,2,21);c.fillStyle='#e5bd6e';c.fillRect(xx-12,yy,12,9);c.fillStyle='#fff0b6';c.fillRect(xx-9,yy+2,3,4);}
 layout.npcs.forEach(([x,y],i)=>{
  drawWalkingCharacter(c,x*16,y*16-9,townNpcName(chapterById[layout.chapterId],i));
  if(!preview){c.fillStyle='#ffe3a0';c.fillRect(x*16+7,y*16-17,2,4);c.fillRect(x*16+7,y*16-11,2,1);}
 });
 if(!preview)drawPerson(c,state.worldState.x*16,state.worldState.y*16-9,state.avatar,state.worldState.direction,state.worldState.walkFrame??0,state.equippedItems);
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
 c.save();c.translate(40,48);c.scale(2,2);drawPerson(c,0,0,state.avatar,3,0,state.equippedItems);c.restore();
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
 tavernSeats.forEach(([x,y],i)=>{p(x,y+18,18,7,'#674d38');drawWalkingCharacter(c,x,y,tavernAdvisorNames[i]);p(x+7,y-4,2,2,'#f8df9f');});
}
