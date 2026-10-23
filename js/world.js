import {getChapterChanges} from './adventure.js';
const palettes=[['#dc9266','#453f51','#e8b860'],['#72b8bd','#384e62','#e7bd68'],['#e6a4ab','#5a384a','#e4cfa2'],['#bac875','#46523d','#ad764f'],['#9aa1d4','#363e69','#e3ac63'],['#d9a87c','#5f4c45','#d4d8b9'],['#9dcbb4','#364b4e','#d6aa72']];
export const npcPositions=[[8,7],[17,7],[6,12],[18,12]];
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
const tint=[['#668d59','#739b62','#4f784a'],['#638b56','#729b60','#497645'],['#6c8e77','#7f9d83','#527263'],['#628d84','#75a299','#497871'],['#93845c','#a49468','#786847'],['#5e8b80','#6ca795','#427568'],['#777ba2','#8a91b1','#555e88']];
export function mapTile(ch,x,y){if(x===0||x===24||y===0||y===17)return 'tree';if((x>=3&&x<=7&&y>=2&&y<=5)||(x>=16&&x<=21&&y>=2&&y<=5))return 'house';if(ch===5&&x>19&&y>7)return 'water';if(ch===3&&y>=14&&x>10)return 'water';if(ch===6&&((x<3&&y>6)||(x>22&&y>6)))return 'water';if(x===12||y===9||(y===6&&x>4&&x<21)||(y>=6&&y<=12&&(x===8||x===17)))return 'path';return 'grass';}
function tree(c,x,y){c.fillStyle='#755d3d';c.fillRect(x+6,y+8,4,8);c.fillStyle='#315f44';c.fillRect(x+3,y+2,10,10);c.fillRect(x+1,y+5,14,6);c.fillStyle='#4f7c4d';c.fillRect(x+5,y+1,6,4);c.fillRect(x+2,y+5,5,4);}
export function renderWorld(canvas,state){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const ch=Number(state.currentChapter?.slice(3))||0;const colors=tint[ch];c.clearRect(0,0,400,288);
 for(let y=0;y<18;y++)for(let x=0;x<25;x++){const px=x*16,py=y*16,t=mapTile(ch,x,y);c.fillStyle=colors[(x*3+y*7)%3];c.fillRect(px,py,16,16);if(t==='tree')tree(c,px,py);if(t==='grass'){c.fillStyle=colors[2];c.fillRect(px+3,py+9,1,3);c.fillRect(px+5,py+8,1,4);if((x+y*3)%11===0){c.fillStyle='#e6c378';c.fillRect(px+10,py+5,2,2);c.fillStyle='#e8ddbb';c.fillRect(px+9,py+4,1,1);}}if(t==='path'){c.fillStyle=ch===6?'#c4bdc9':'#c7b58b';c.fillRect(px,py,16,16);c.fillStyle='#ad9c7b';c.fillRect(px+2,py+2,11,1);c.fillRect(px+7,py+11,8,1);}if(t==='water'){c.fillStyle=ch===6?'#b0becf':'#4c91a4';c.fillRect(px,py,16,16);c.fillStyle='#86b9bd';c.fillRect(px+2,py+5,7,1);c.fillRect(px+8,py+11,6,1);} }
 for(const h of [{x:3,w:5},{x:16,w:6}]){const x=h.x*16,y=36,w=h.w*16;c.fillStyle='#e4d2a1';c.fillRect(x,y+20,w,44);c.fillStyle='#a77452';c.fillRect(x,y+58,w,6);c.fillStyle=ch===6?'#7e708c':ch===2?'#758393':'#a65d4b';c.fillRect(x-4,y,w+8,26);c.fillRect(x+3,y-6,w-6,6);c.fillStyle='#c5835b';for(let yy=2;yy<26;yy+=6)c.fillRect(x-4,y+yy,w+8,1);c.fillStyle='#806340';c.fillRect(x+w/2-7,y+40,14,24);c.fillStyle='#8da5a0';c.fillRect(x+9,y+33,14,12);c.fillStyle='#f3dda0';c.fillRect(x+15,y+33,2,12);c.fillRect(x+9,y+38,14,2);c.fillStyle='#c7a66f';c.fillRect(x+24,y+63,31,4);}
 // Each original town has its own landmark, built on the same sixteen-pixel grid.
 if(ch===1||ch===4){const x=34,y=177;c.fillStyle='#795d40';c.fillRect(x,y,48,33);c.fillStyle=ch===1?'#e4c183':'#879bb3';c.fillRect(x-4,y-8,56,14);c.fillStyle=ch===1?'#ba6a54':'#d8c6a0';for(let i=0;i<4;i++)c.fillRect(x+i*14,y-8,7,14);c.fillStyle='#e8d8ad';c.fillRect(x+5,y+10,38,9);if(ch===4){for(let i=0;i<3;i++){c.fillStyle=['#c68970','#9ebaa1','#a5a6cb'][i];c.fillRect(x+8+i*11,y+12,8,12);}}}
 if(ch===2){c.fillStyle='#88948a';c.fillRect(269,177,48,34);c.fillStyle='#b4bbae';for(let i=0;i<6;i++)c.fillRect(269+i*8,173,5,8);c.fillStyle='#657a70';c.fillRect(285,192,16,19);if(state.worldState.seals.includes('CH-2')){c.fillStyle='#b79c71';c.fillRect(277,209,32,9);c.fillStyle='#eee0b5';c.fillRect(281,211,24,2);}}
 if(ch===3){c.fillStyle='#805d43';c.fillRect(254,248,48,13);c.fillRect(260,261,35,5);c.fillStyle='#c6a576';c.fillRect(268,233,3,22);c.fillStyle='#e8d3a0';c.fillRect(271,231,21,19);c.fillStyle='#d5b572';c.fillRect(274,234,16,2);}
 if(ch===5){c.fillStyle='#a08459';c.fillRect(296,151,40,8);c.fillRect(302,158,5,14);c.fillRect(327,158,5,14);c.fillStyle='#e8c175';c.fillRect(314,139,4,12);}
 if(ch===6){c.fillStyle='#cad5d7';c.fillRect(23,211,24,6);c.fillRect(15,217,40,8);c.fillRect(344,91,33,7);c.fillRect(337,98,47,7);}
 // The tavern and milestone changes exist before the chapter boss.
 c.fillStyle='#453c32';c.fillRect(268,84,71,17);c.fillStyle='#f7dca0';c.font='10px sans-serif';c.fillText('こもれび亭',274,96);
 const changes=getChapterChanges(state,state.currentChapter);
 changes.forEach((change,i)=>{const xx=38+(i%7)*45,yy=226+Math.floor(i/7)*14;c.fillStyle=['#f2c776','#a7d6ad','#c1b1dc'][i%3];c.fillRect(xx,yy,5,5);c.fillStyle='#5c784e';c.fillRect(xx+2,yy+5,1,5);if(/bridge|dock|route/.test(change.kind)){c.fillStyle='#c8a271';c.fillRect(288,164,49,7);c.fillRect(294,171,4,9);c.fillRect(324,171,4,9);}if(/postbox|noticeboard/.test(change.kind)){c.fillStyle='#bc7254';c.fillRect(149,86,10,14);c.fillStyle='#f2dcad';c.fillRect(151,89,6,3);}if(/shop|market/.test(change.kind)){c.fillStyle='#f8dd91';c.fillRect(60,71,10,7);c.fillRect(294,71,10,7);}});
 // A course adds its own visible object only after an actual confirmed stage.
 if(ch===5){
  const kinds=new Set(changes.map(item=>item.kind));
  if([...kinds].some(k=>k.startsWith('domestic-')))drawCourseLandmark(c,'account-gate',35,174,kinds.has('domestic-open'));
  if([...kinds].some(k=>k.startsWith('dealer-')))drawCourseLandmark(c,'dealer-scales',87,176,kinds.has('dealer-ledger'));
  if([...kinds].some(k=>/board|market-history/.test(k)))drawCourseLandmark(c,'limit-board',144,176,kinds.has('limit-complete-board'));
 }
 if(ch===6){
  const kinds=new Set(changes.map(item=>item.kind));
  if([...kinds].some(k=>k.startsWith('lending-')))drawCourseLandmark(c,'lending-clock',45,174,kinds.has('lending-returned'));
  if([...kinds].some(k=>k.startsWith('leverage-')))drawCourseLandmark(c,'leverage-sails',91,175,kinds.has('leverage-return'));
 }
 // Fountain and openable treasure.
 c.fillStyle='#536c6a';c.fillRect(171,111,58,22);c.fillStyle='#c5c9b1';c.fillRect(174,108,52,20);c.fillStyle='#78a9a9';c.fillRect(178,112,44,12);c.fillStyle='#bcd9c9';c.fillRect(196,104,8,12);c.fillRect(193,105,14,3);
 drawChest(c,222,191,state.worldState.seals.includes(state.currentChapter));
 if(state.worldState.seals.includes(state.currentChapter)){c.fillStyle='#664c3c';c.fillRect(195,34,2,34);c.fillStyle='#e5bd6e';c.fillRect(197,35,14,10);c.fillStyle='#fff0b6';c.fillRect(202,37,3,5);}
 npcPositions.forEach(([x,y],i)=>{drawPerson(c,x*16,y*16-9,(ch+i+1)%7);c.fillStyle='#ffe3a0';c.fillRect(x*16+7,y*16-17,2,4);c.fillRect(x*16+7,y*16-11,2,1);});
 drawPerson(c,state.worldState.x*16,state.worldState.y*16-9,state.avatar,state.worldState.direction,state.worldState.walkFrame??0,state.equippedItems);
}
export function move(state,dx,dy){const x=state.worldState.x+dx,y=state.worldState.y+dy;state.worldState.direction=dy>0?0:dx<0?1:dy<0?2:3;const t=mapTile(Number(state.currentChapter.slice(3)),x,y);if(x<1||x>23||y<1||y>16||['water','tree','house'].includes(t)||npcPositions.some(([nx,ny])=>nx===x&&ny===y))return false;state.worldState.x=x;state.worldState.y=y;state.worldState.walkFrame=((state.worldState.walkFrame??0)+1)%3;return true;}
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
 p(0,0,320,160,'#493e39');for(let y=30;y<160;y+=16)for(let x=0;x<320;x+=32){p(x,y,31,15,(x+y)%3?'#8d6c4e':'#967656');p(x+2,y+13,25,1,'#6f543f');}
 p(0,0,320,30,'#53473b');p(4,25,312,6,'#b08c58');p(7,7,85,17,'#9c7d52');p(9,9,81,12,'#3b5149');
 for(let i=0;i<6;i++){p(14+i*12,10,5,11,['#b88759','#b6b782','#8ba8a0'][i%3]);p(15+i*12,7,3,4,'#e7ce8f');}
 p(142,5,30,20,'#b5824b');p(148,8,18,12,'#eddca6');p(154,10,5,8,'#d09750');p(305,5,5,24,'#c6a66d');p(301,8,12,12,'#f1ce78');
 for(const[x,y]of [[59,67],[126,71],[231,68],[92,135],[173,132],[272,131]]){p(x-18,y-8,34,20,'#553b2e');p(x-20,y-11,38,16,'#c39760');p(x-17,y-9,32,1,'#e1bc7b');p(x-13,y+9,4,9,'#573d2d');p(x+10,y+9,4,9,'#573d2d');p(x-5,y-6,7,5,'#ebd6a5');p(x+6,y-6,4,5,'#d7b66e');}
 tavernSeats.forEach(([x,y],i)=>{p(x,y+18,18,7,'#674d38');drawPerson(c,x,y,i%7);if(i===8){p(x+3,y+3,12,3,'#d8d9c7');p(x+5,y+10,9,5,'#e8e0cc');p(x+7,y+15,5,3,'#e8e0cc');p(x+15,y+7,2,19,'#e1ba6c');}p(x+7,y-4,2,2,'#f8df9f');});
}
