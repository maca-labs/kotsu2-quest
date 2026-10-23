// Original town plans. One immutable source owns both the visible footprints
// and walking collisions; these maps never change learning or financial state.
const building=(id,x,y,w,h,dx)=>({id,x,y,w,h,door:{x:dx,y:y+h-1}});
const definitions=[
 {name:'旅立ちの村',theme:'village',description:'畑と木立に囲まれた、はじまりの村。南東に教会がある。',
  buildings:[building('client',3,2,5,4,5),building('tavern',16,2,6,4,19),building('elder',3,13,4,3,5),building('shop',10,2,5,4,12),building('church',17,13,5,3,19)],
  npcs:[[8,7],[17,7],[6,12],[18,12]],landmark:{kind:'fountain',x:11,y:7,w:3,h:2}},
 {name:'ポイントの商店街',theme:'shopping',description:'にぎやかな商店街。店は北東、酒場は東の通りに並ぶ。',
  buildings:[building('client',2,3,5,3,4),building('tavern',17,8,6,4,20),building('elder',3,11,5,4,5),building('shop',15,2,6,4,18)],
  npcs:[[9,6],[15,10],[9,13],[16,14]],landmark:{kind:'clock',x:10,y:3,w:3,h:3}},
 {name:'証しの城下町',theme:'castle',description:'石の城壁と青い屋根の城下町。中央の小城を左右の道から回れる。',
  buildings:[building('client',3,3,5,4,5),building('tavern',16,3,6,4,19),building('elder',2,11,5,4,4),building('shop',16,11,6,4,19)],
  npcs:[[9,8],[15,8],[8,12],[15,13]],landmark:{kind:'castle',x:10,y:2,w:5,h:4}},
 {name:'通貨の港',theme:'harbor',description:'東には青い海。桟橋の向こうに帆船と灯台が見える港町。',
  buildings:[building('client',2,2,5,4,4),building('tavern',8,2,6,4,11),building('elder',2,10,5,4,4),building('shop',8,11,6,4,11)],
  npcs:[[7,7],[13,8],[7,12],[14,10]],landmark:{kind:'lighthouse',x:20,y:3,w:3,h:4}},
 {name:'カードの市場',theme:'market',description:'色とりどりの天幕がある市場。四方の店を広場の道がつなぐ。',
  buildings:[building('client',2,2,5,4,4),building('tavern',2,10,5,4,4),building('elder',17,10,5,4,19),building('shop',17,2,5,4,19)],
  npcs:[[8,7],[16,7],[8,12],[16,12]],landmark:{kind:'market',x:9,y:3,w:7,h:3}},
 {name:'鍵の群島',theme:'islands',description:'水路で分かれた小島の町。木の橋を渡って家や酒場へ向かおう。',
  buildings:[building('client',2,2,5,4,4),building('tavern',19,11,4,4,21),building('elder',2,11,5,4,4),building('shop',12,2,4,4,14)],
  npcs:[[7,6],[13,7],[7,13],[16,12]],landmark:{kind:'beacon',x:20,y:2,w:3,h:3}},
 {name:'流動の天空城',theme:'sky',description:'雲海に浮かぶ町。白い石の橋と結晶の塔が、浮島を結んでいる。',
  buildings:[building('client',4,2,4,4,6),building('tavern',16,2,5,4,18),building('elder',4,11,4,4,6),building('shop',15,10,5,4,17)],
  npcs:[[9,7],[15,7],[9,12],[14,14]],landmark:{kind:'crystal',x:11,y:2,w:3,h:4}}
];
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
function makeLayout(definition,index){
 const tiles=Array.from({length:18},(_,y)=>Array.from({length:25},(_,x)=>x===0||x===24||y===0||y===17?'tree':'grass'));
 const fill=(x,y,w,h,tile)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>0&&xx<24&&yy>0&&yy<17)tiles[yy][xx]=tile;};
 const path=(x,y,tx,ty)=>{tiles[y][x]='path';while(x!==tx||y!==ty){if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);tiles[y][x]='path';}};
 if(index===0){fill(1,1,1,11,'tree');fill(23,1,1,11,'tree');}
 if(index===1){fill(1,1,7,1,'tree');fill(22,2,2,4,'tree');}
 if(index===2){fill(1,1,8,1,'tree');fill(16,1,8,1,'tree');}
 if(index===3)fill(15,1,9,16,'water');
 if(index===4){fill(1,7,3,2,'tree');fill(21,7,3,2,'tree');}
 if(index===5){fill(9,1,2,16,'water');fill(17,1,2,16,'water');fill(1,8,23,2,'water');}
 if(index===6){fill(1,1,3,16,'water');fill(21,1,3,16,'water');fill(9,2,2,4,'water');fill(4,8,3,2,'water');fill(19,7,2,2,'water');}
 // A central route and the south side of every door remain connected.
 path(12,16,12,6);path(2,9,22,9);
 for(const b of definition.buildings){const {x,y}=b.door;path(x,y+1,12,y+1);path(12,y+1,12,16);}
 for(const [x,y]of definition.npcs){path(x,y,12,y);path(12,y,12,16);}
 if(index===0){path(8,6,8,12);path(17,6,17,12);path(5,6,19,6);}
 if(index===3){
  // A two-tile pier ends before the ship; the surrounding sea stays solid.
  fill(15,1,9,16,'water');fill(14,9,6,2,'path');
 }
 if(index===5){path(4,6,21,6);path(4,15,12,15);path(12,16,21,16);path(21,16,21,15);}
 for(const b of definition.buildings)fill(b.x,b.y,b.w,b.h,'house');
 const landmark=definition.landmark;fill(landmark.x,landmark.y,landmark.w,landmark.h,['castle','lighthouse','market'].includes(landmark.kind)?'house':'fountain');
 // A stable old spawn and south gate make old saves safe to resume.
 tiles[10][12]='path';tiles[16][12]='path';tiles[17][12]='path';
 return freeze({...definition,chapterId:`CH-${index}`,tiles});
}
const layouts=definitions.map(makeLayout);
function chapterIndex(chapterId){const n=typeof chapterId==='number'?chapterId:typeof chapterId==='string'&&/^CH-[0-6]$/.test(chapterId)?Number(chapterId.slice(3)):NaN;return Number.isInteger(n)&&n>=0&&n<=6?n:0;}
export function getTownLayout(chapterId='CH-0'){return layouts[chapterIndex(chapterId)];}
export function townTile(chapterId,x,y){return Number.isInteger(x)&&Number.isInteger(y)?getTownLayout(chapterId).tiles[y]?.[x]??'tree':'tree';}
