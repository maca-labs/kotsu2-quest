import {drawPerson} from './world.js';
import {questById} from './content.js';

export const townTravelFeatures=Object.freeze([
 Object.freeze({id:'shop',type:'shop',x:12,y:5,label:'武器・防具店'}),
 Object.freeze({id:'world-exit',type:'exit',x:12,y:17,label:'世界への出口',targetMapId:'world'})
]);
// This optional detour never crosses a road needed to reach a town or cave.
export const desertArea=Object.freeze({title:'砂鳴りの砂漠',left:53,right:59,top:27,bottom:33,sign:Object.freeze({x:52,y:29})});
const sites=[
 ['CH-0','旅立ちの村',8,36,'ことばの小洞',5,40],
 ['CH-1','ポイントの商店街',20,36,'ふた札の洞窟',23,40],
 ['CH-2','証しの城下町',32,28,'うつし灯の洞窟',37,24],
 ['CH-3','通貨の港',48,36,'ふた風の海洞',54,39],
 ['CH-4','カードの市場',48,16,'星包みの洞窟',54,12],
 ['CH-5','鍵の群島',32,8,'みち結びの洞窟',35,4],
 ['CH-6','流動の天空城',12,8,'帰り帆の洞窟',7,4]
].map(([chapterId,title,x,y,caveTitle,cx,cy])=>({chapterId,title,x,y,caveTitle,cx,cy}));
const palettes=[
 {floor:'#71965e',light:'#8eab70',rock:'#7e8071',accent:'#e4c687'},
 {floor:'#78955f',light:'#a2b975',rock:'#948268',accent:'#e8bd76'},
 {floor:'#7b9a8b',light:'#9eb7a0',rock:'#778d8a',accent:'#ccdbbf'},
 {floor:'#689f9b',light:'#91bcb0',rock:'#6b858e',accent:'#eed99a'},
 {floor:'#a19866',light:'#c0ad78',rock:'#958272',accent:'#e6bc94'},
 {floor:'#6b9b8c',light:'#8bb6a1',rock:'#687d8c',accent:'#ebcf83'},
 {floor:'#888daf',light:'#afb1c7',rock:'#7d7894',accent:'#e7dcaf'}
];
const maps=new Map();
const grid=(w,h,value)=>Array.from({length:h},()=>Array(w).fill(value));
const inside=(map,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<map.width&&y<map.height;
const passable=(map,x,y)=>inside(map,x,y)&&!['~','^','T','#'].includes(map.tiles[y][x]);
function freezeMap(map){map.tiles=Object.freeze(map.tiles.map(row=>Array.isArray(row)?row.join(''):row));map.features=Object.freeze(map.features.map(Object.freeze));map.palette=Object.freeze(map.palette);return Object.freeze(map);}
function makeWorld(){
 const width=64,height=48,tiles=grid(width,height,'.');
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  tiles[y][x]=x<3||x>60||y<2||y>44?'~':x>=29&&x<=31&&y>=14?'~':y>=21&&y<=22&&x>=36?'~':'^';
 }
 function point(x,y){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const xx=x+a,yy=y+b;if(xx<1||yy<1||xx>=width-1||yy>=height-1)continue;const tile=tiles[yy][xx];tiles[yy][xx]=tile==='~'||tile==='B'?'B':a===0&&b===0||tile==='='?'=':'.';}}
 function path(points){for(let i=1;i<points.length;i++){let [x,y]=points[i-1];const [tx,ty]=points[i];point(x,y);while(x!==tx||y!==ty){if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);point(x,y);}}}
 // Mountains divide chapter regions; the wide road visits them in chapter order.
 // Chapter selection is still independent of this walking route.
 path([[8,36],[20,36],[20,28],[32,28],[40,28],[40,36],[48,36],[48,16],[32,16],[32,8],[12,8]]);
 for(const site of sites)path([[site.x,site.y],[site.x,site.cy],[site.cx,site.cy]]);
 for(const site of sites)for(const [cx,cy,radius]of [[site.x,site.y,3],[site.cx,site.cy,2]])for(let y=cy-radius;y<=cy+radius;y++)for(let x=cx-radius;x<=cx+radius;x++){
  if(x<3||x>60||y<2||y>44)continue;
  if(tiles[y][x]==='^')tiles[y][x]='.';
 }
 path([[48,29],[desertArea.sign.x,desertArea.sign.y]]);
 for(let y=desertArea.top;y<=desertArea.bottom;y++)for(let x=desertArea.left;x<=desertArea.right;x++)tiles[y][x]='S';
 const features=sites.flatMap(site=>[
  {id:`town:${site.chapterId}`,type:'town',chapterId:site.chapterId,label:site.title,x:site.x,y:site.y,targetMapId:`town:${site.chapterId}`},
  {id:`cave:${site.chapterId}`,type:'cave',chapterId:site.chapterId,label:site.caveTitle,x:site.cx,y:site.cy,targetMapId:`cave:${site.chapterId}`}
 ]);
 return freezeMap({id:'world',title:'こつこつ大地',width,height,tiles,features,palette:{floor:'#71965e',light:'#8ca56e',rock:'#7b8279',accent:'#e7ca86'}});
}
function makeCave(site,index){
 const width=25,height=18,tiles=grid(width,height,'#');
 const room=(left,top,right,bottom)=>{for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)tiles[y][x]='.';};
 room(10,3,14,16);room(4,7,20,10);room(3,5,9,11);room(15,5,21,11);room(9,2,15,6);room(9,12,15,16);tiles[17][12]='=';
 // Different alcoves and side passages give each chapter its own floor plan.
 if(index%2===0){room(5,11,7,14);room(6,13,10,14);}else{room(17,11,19,14);room(14,13,18,14);}
 if(index>=4){room(6,3,10,4);room(6,4,7,6);}if(index===3||index===5){room(18,3,19,6);room(14,3,18,4);}
 tiles[9][4+index*2]='#';
 const features=[
  {id:`exit:${site.chapterId}`,type:'exit',label:'世界へ戻る',x:12,y:17,targetMapId:'world',chapterId:site.chapterId},
  ...[[6,8],[18,8],[12,4]].map(([x,y],i)=>({id:`gate:${site.chapterId}:${i+1}`,type:'quest-gate',chapterId:site.chapterId,label:i===2?'奥の魔物の気配':'案件を抱えた魔物の気配',x,y}))
 ];
 return freezeMap({id:`cave:${site.chapterId}`,title:site.caveTitle,chapterId:site.chapterId,width,height,tiles,features,palette:{...palettes[index]}});
}
maps.set('world',makeWorld());sites.forEach((site,i)=>maps.set(`cave:${site.chapterId}`,makeCave(site,i)));

/** Static immutable map data. Town interiors continue to use world.js/rooms.js. */
export function getRpgMap(mapId){return maps.get(mapId)??null;}
export function isDesert(location){const map=getRpgMap(location?.mapId);return map?.id==='world'&&inside(map,location.x,location.y)&&map.tiles[location.y][location.x]==='S';}
export function getTerrainLabel(location){
 const map=getRpgMap(location?.mapId);if(!map||!inside(map,location.x,location.y))return '';
 return isDesert(location)?`${desertArea.title}（超強敵に注意）`:map.id==='world'?(map.tiles[location.y][location.x]==='='?'大地の道':'大地の草原'):map.title;
}
export function getRpgSpawn(mapId,fromMapId){
 if(mapId==='world'){
  const site=sites.find(s=>fromMapId===`town:${s.chapterId}`||fromMapId===`cave:${s.chapterId}`)??sites[0];
  const cave=fromMapId?.startsWith('cave:');return {mapId,x:cave?site.cx:site.x,y:(cave?site.cy:site.y)+1,direction:0,walkFrame:0};
 }
 if(maps.has(mapId)||sites.some(s=>mapId===`town:${s.chapterId}`))return {mapId,x:12,y:16,direction:2,walkFrame:0};
 return null;
}
export function getRpgCamera(location){
 const map=getRpgMap(location?.mapId);if(!map)return null;
 return {x:Math.max(0,Math.min(map.width-25,location.x-12)),y:Math.max(0,Math.min(map.height-18,location.y-9)),width:25,height:18};
}
export function stepRpgMap(location,dx,dy){
 const map=getRpgMap(location?.mapId),unchanged={location:{...location},moved:false};
 if(!map||!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1||!inside(map,location.x,location.y))return unchanged;
 const direction=dy>0?0:dx<0?1:dy<0?2:3,x=location.x+dx,y=location.y+dy;
 if(!passable(map,x,y))return {location:{...location,direction},moved:false};
 const next={...location,x,y,direction,walkFrame:((location.walkFrame??0)+1)%3},feature=map.features.find(f=>f.x===x&&f.y===y);
 return {location:next,moved:true,...(feature?{feature}:{}),...(feature?.targetMapId?{transition:{mapId:feature.targetMapId}}:{})};
}
export function nearbyRpgFeature(location){
 const map=getRpgMap(location?.mapId);if(!map)return null;
 return map.features.filter(f=>Math.abs(f.x-location.x)+Math.abs(f.y-location.y)<=1).sort((a,b)=>Math.abs(a.x-location.x)+Math.abs(a.y-location.y)-Math.abs(b.x-location.x)-Math.abs(b.y-location.y))[0]??null;
}

function featureArt(c,feature,x,y,palette){
 const p=(a,b,w,h,color)=>{c.fillStyle=color;c.fillRect(x+a,y+b,w,h);};
 if(feature.type==='town'){
  p(-5,2,25,17,'#d7c38d');p(-7,-5,29,10,palette.rock);p(-3,-9,21,5,palette.accent);p(5,9,6,10,'#495a47');p(-2,6,5,6,'#84aaa6');p(13,6,5,6,'#84aaa6');
 }else if(feature.type==='cave'){
  p(-5,0,27,19,palette.rock);p(-1,-5,19,8,palette.rock);p(4,5,9,14,'#253a3a');p(2,17,14,3,palette.accent);
 }else if(feature.type==='exit'){
  p(0,0,16,16,'#cbb786');p(7,3,3,9,'#fff0b9');p(4,8,9,3,'#fff0b9');p(5,11,7,3,'#fff0b9');
 }else{
  p(-1,8,19,9,'#373e48');p(2,2,13,14,palette.accent);p(0,-1,5,7,palette.accent);p(12,-1,5,7,palette.accent);p(4,6,3,3,'#34494b');p(10,6,3,3,'#34494b');p(6,12,5,2,'#786b68');
 }
}
/** Draw only. Returns the exact camera also used for map hit testing. */
export function renderRpgMap(canvas,state,location){
 const map=getRpgMap(location?.mapId),camera=getRpgCamera(location);if(!map||!camera)return null;
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);
 const scaleX=canvas.width/400,scaleY=canvas.height/288;c.save();c.scale(scaleX,scaleY);
 const p=map.palette;
 for(let y=0;y<18;y++)for(let x=0;x<25;x++){
  const wx=x+camera.x,wy=y+camera.y,tile=map.tiles[wy]?.[wx]??'#',px=x*16,py=y*16;
  c.fillStyle=tile==='S'?'#dcb979':tile==='~'?'#4e8b9d':tile==='#'?'#384347':tile==='^'?p.rock:tile==='B'?'#a88c61':tile==='='?'#c9b88b':p.floor;c.fillRect(px,py,16,16);
  if(tile==='~'){c.fillStyle='#8dbdc0';c.fillRect(px+2,py+5,8,1);c.fillRect(px+8,py+12,6,1);}
  else if(tile==='^'||tile==='#'){c.fillStyle=tile==='#'?p.rock:'#a6ada0';c.fillRect(px+3,py+5,10,8);c.fillRect(px+6,py+2,4,5);c.fillStyle='#51605b';c.fillRect(px+8,py+9,5,5);}
  else if(tile==='T'){c.fillStyle='#4f6b45';c.fillRect(px+6,py+7,4,9);c.fillStyle='#325d48';c.fillRect(px+2,py+2,12,9);c.fillStyle=p.light;c.fillRect(px+4,py+1,7,4);}
  else if(tile==='S'){c.fillStyle='#f0d399';c.fillRect(px+2,py+4,10,2);c.fillRect(px+5,py+3,5,1);c.fillStyle='#bd965f';c.fillRect(px+4,py+12,10,1);if((wx+wy*3)%13===0){c.fillStyle='#eee3bf';c.fillRect(px+6,py+6,3,5);c.fillRect(px+4,py+7,7,2);}}
  else if(tile==='B'){c.fillStyle='#dac08c';c.fillRect(px,py+2,16,2);c.fillRect(px,py+11,16,2);}
  else{c.fillStyle=tile==='='?'#b39e75':p.light;c.fillRect(px+3,py+11,4,1);c.fillRect(px+10,py+5,2,2);}
 }
 if(map.id==='world'){
  const sx=(desertArea.sign.x-camera.x)*16,sy=(desertArea.sign.y-camera.y)*16;
  if(sx>=-110&&sx<400&&sy>=-32&&sy<320){
   c.fillStyle='#77573e';c.fillRect(sx+7,sy+4,3,15);c.fillStyle='#5b4034';c.fillRect(sx-6,sy-9,29,16);c.fillStyle='#f5d690';c.fillRect(sx-4,sy-7,25,12);c.fillStyle='#934d3d';c.fillRect(sx+7,sy-6,3,6);c.fillRect(sx+7,sy+2,3,2);
   c.fillStyle='#423d32';c.fillRect(sx-18,sy-28,112,14);c.fillStyle='#fff0c2';c.font='10px sans-serif';c.textAlign='center';c.fillText('この先 砂漠・超強敵 →',sx+38,sy-17);c.textAlign='start';
  }
 }
 const activeRecord=state.questStates?.[state.activeQuestKey],activeChapter=!activeRecord?.completed?questById[activeRecord?.questId]?.chapterId:null;
 for(const feature of map.features){const x=(feature.x-camera.x)*16,y=(feature.y-camera.y)*16;if(x< -32||y< -32||x>400||y>288)continue;const palette=palettes[Number(feature.chapterId?.slice(3))||0];featureArt(c,feature,x,y,palette);if(feature.type==='cave'&&feature.chapterId===activeChapter){
  c.fillStyle='#f6cf78';c.fillRect(x-8,y-8,33,2);c.fillRect(x-8,y+21,33,2);c.fillRect(x-8,y-8,2,31);c.fillRect(x+23,y-8,2,31);c.fillRect(x+22,y-21,2,13);c.fillRect(x+24,y-21,11,7);
 }}
 const visualEquipment={...(state.equippedItems??{}),...(state.rpg?.equipped?.weapon?{weapon:state.rpg.equipped.weapon}:{}),...(state.rpg?.equipped?.armor?{shield:state.rpg.equipped.armor}:{})};
 drawPerson(c,(location.x-camera.x)*16,(location.y-camera.y)*16-9,state.avatar??0,location.direction??0,location.walkFrame??0,visualEquipment);
 c.restore();return camera;
}

/** Add travel entrances to the existing independent chapter town view. */
export function drawTownTravelFeatures(canvas,state={}){
 const c=canvas.getContext('2d'),palette=palettes[Number(state.currentChapter?.slice(3))||0];c.imageSmoothingEnabled=false;
 c.fillStyle='#dfcf9c';c.fillRect(160,49,80,47);c.fillStyle=palette.rock;c.fillRect(156,33,88,24);c.fillStyle=palette.accent;c.fillRect(162,28,76,8);
 c.fillStyle='#5c4b39';c.fillRect(194,80,12,16);c.fillStyle='#edd18d';c.fillRect(203,87,2,2);
 c.fillStyle='#96b9b0';c.fillRect(170,64,13,11);c.fillRect(218,64,13,11);
 // Original sword and shield sign, instead of borrowing another game's icon.
 c.fillStyle='#e5e1be';c.fillRect(187,57,3,13);c.fillRect(184,65,9,2);c.fillStyle='#a4bfc0';c.fillRect(205,58,9,10);c.fillRect(208,68,3,3);
 c.fillStyle='#b7a172';c.fillRect(184,256,32,32);c.fillStyle='#f5d78c';c.fillRect(198,263,4,15);c.fillRect(193,273,14,3);c.fillRect(196,276,8,4);
 c.font='10px sans-serif';c.textAlign='center';c.fillStyle='#243f38';c.fillRect(164,10,72,14);c.fillStyle='#fff0c2';c.fillText('武器・防具店',200,21);
 c.fillStyle='#243f38';c.fillRect(222,269,59,14);c.fillStyle='#fff0c2';c.fillText('世界へ ↓',251,280);c.textAlign='start';
}
