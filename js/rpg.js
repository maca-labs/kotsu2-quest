// Adventure coins are fictional battle loot. They never enter a finance scenario.
import {questById,equipmentById} from './content.js';
const clone=x=>structuredClone(x),need=(ok,message)=>{if(!ok)throw new Error(message);};
export const shopGear=Object.freeze([
 {id:'rpg-copper-sword',name:'こだまの銅剣',slot:'weapon',price:24,attack:4,defense:0,description:'通常攻撃を強くする。確認工程は省かない。'},
 {id:'rpg-cloth-armor',name:'若葉の旅服',slot:'armor',price:20,attack:0,defense:2,description:'敵から受けるダメージを減らす。'},
 {id:'rpg-iron-sword',name:'灯鉄のつるぎ',slot:'weapon',price:60,attack:8,defense:0,description:'道中の強い魔物に備える剣。'},
 {id:'rpg-mail-armor',name:'星糸のよろい',slot:'armor',price:50,attack:0,defense:4,description:'旅服より守りの強いよろい。'}
]);
const gearById=Object.fromEntries(shopGear.map(x=>[x.id,x]));
// Frozen IDs: changing narrative bubbles must not move previously rewarded foes.
export const encounterCheckpoints={
 'PR-01':[0,12],'PO-01':[0,13,19],'PO-02':[0,13],'PO-03':[0,13],'PO-04':[0,10],'PO-05':[0,12],'PO-06':[0,10],
 'BK-01':[0,8,32],'BK-02':[0,10,23],'BK-02-R':[0,6],'TR-01':[0,13,26],'FX-01':[0,12,18],'FX-02':[0,9,20],'FX-02-S':[0,12,18],'FX-03':[0,12],
 'TC-01':[0,13,21],'TC-02':[0,21,32],'DX-01':[0,8,18,33],'DX-02':[0,8,17,23],'DX-03':[0,12,21],'DX-04':[0,10,21],'DX-05':[0,13,27,34],
 'FI-01':[0,15,23],'FI-02':[0,12,21],'FI-03':[0,8,16,26],'CR-01':[0,12,18],'CR-02':[0,13,25],'CR-03':[0,20,32],'CR-04':[0,12,18],
 'HY-SPOT':[0,10,24,34,41],'HY-HLP':[0,15,27],'HY-STAKE':[0,10,20,32,40],'HY-PERP':[0,10,19,29,37,48],'HY-EXIT':[0,13,26],'LD-01':[0,10,22],'LV-01':[0,12,22]
};
const relicStats={
 'traveler-staff':{attack:1},'traveler-notebook':{maxHp:4},'insight-loupe':{attack:2},'identity-shield':{defense:3},
 'tide-compass':{maxHp:4,skill:2},'star-abacus':{defense:1,skill:4},'return-lantern':{defense:1,winHeal:3},'dawn-crown':{maxHp:10,defense:1},'rainbow-oath':{attack:12,skill:4}
};
export function initialRpgState(){return{version:1,location:{mapId:'town:CH-0'},coins:0,hp:32,battle:null,defeatedIds:[],ownedGear:[],equipped:{weapon:null,armor:null},attempts:{},eventLog:[]};}
export function getBattleStats(state){
 const r=state.rpg??initialRpgState(),out={maxHp:32,attack:6,defense:2,skill:4,winHeal:0},items=[];
 const legacy=state.equippedItems??{};
 const chosenWeapon=r.equipped.weapon??legacy.weapon;
 for(const id of [chosenWeapon,legacy.shield,legacy.head,legacy.tool,r.equipped.armor]){
  if(!id||items.includes(id))continue;
  const purchased=gearById[id],owned=purchased?r.ownedGear.includes(id):state.inventory?.includes(id);
  if(!owned)continue;items.push(id);
  const bonus=purchased??relicStats[id]??{};for(const k of Object.keys(out))out[k]+=bonus[k]??0;
 }
 return{...out,weaponId:chosenWeapon??null,armorId:r.equipped.armor??null,itemIds:items};
}
function countProgress(q,record){let n=0;while(n<q.stepIds.length&&record.completedSteps?.[n]===q.stepIds[n])n++;return n;}
function monster(id,tier){const sum=[...id].reduce((n,c)=>n+c.charCodeAt(0),0),i=sum%6;return{id:`foe:${id}`,kind:['moss','bat','boar','golem','wisp','drake'][i],name:['道ふさぎコケリン','夕羽コウモリ','まよいイノシシ','石札ゴーレム','こごえ火の玉','小枝の竜'][i],maxHp:14+tier*4,attack:5+tier,defense:1+Math.floor(tier/2),tier};}
// Road encounters do not need an accepted lesson. IDs and first-win rewards are
// fixed per chapter, so walking/reloading cannot mint lesson XP or repeat loot.
export function getFieldEncounter(kind,chapterId){
 if(!['road','desert'].includes(kind)||!/^CH-[0-6]$/.test(chapterId))return null;
 const id=`field:${kind}:${chapterId}`,tier=Math.min(3,Math.floor(Number(chapterId.slice(3))/2));
 return{id,kind:'field',fieldKind:kind,chapterId,recordKey:null,coins:kind==='desert'?24:12+tier*3,label:kind==='desert'?'砂漠の超強敵':'野道の魔物',enemy:kind==='desert'?{id:`foe:${id}`,kind:'drake',name:'砂暁のガルザドン',maxHp:220,attack:90,defense:8,tier:9}:monster(id,tier)};
}
export function getAvailableEncounters(state){const out=[],r=state.rpg??initialRpgState();for(const[recordKey,record]of Object.entries(state.questStates??{})){
 const q=questById[record.questId];if(!q||!encounterCheckpoints[q.id]||!Number.isFinite(record.acceptedAtReal))continue;
 const progress=countProgress(q,record),checkpoints=encounterCheckpoints[q.id];
 for(let i=0;i<checkpoints.length;i++){const checkpoint=checkpoints[i],id=`enc:${recordKey}:cp:${checkpoint}`,previous=i?`enc:${recordKey}:cp:${checkpoints[i-1]}`:null,defeated=r.defeatedIds.includes(id),available=progress>=checkpoint&&(!previous||r.defeatedIds.includes(previous));
  out.push({id,recordKey,questId:q.id,chapterId:q.chapterId,questTitle:q.title,checkpoint,requiredStepId:checkpoint?q.stepIds[checkpoint-1]:null,progress,available,defeated,previousId:previous,coins:12+Math.min(4,Math.floor(checkpoint/10))*3,enemy:{...monster(id,Math.min(4,Math.floor(checkpoint/10))),...(checkpoint===0?{name:{'CH-0':'しおり角のフミボウ','CH-1':'札はさみのカラビン','CH-2':'写し紋のシルシカ','CH-3':'風見のウネツノ','CH-4':'包み羽のホシフクロ','CH-5':'道結びのミチヨリ','CH-6':'帰り風のクモツバサ'}[q.chapterId]}:{})},label:checkpoint===0?'依頼の入口の門番':checkpoint===q.stepIds.length?'結果を守る最後の魔物':`${checkpoint}工程の先の魔物`});
 }
 }return out;}
const active=r=>r.battle?.status==='active';
const mapChapter=mapId=>mapId==='world'?null:mapId.split(':').slice(1).join(':');
export function validRpgMap(mapId){return mapId==='world'||/^(town|cave|shop):CH-[0-6]$/.test(mapId);}
function addEvent(r,kind,fields={}){r.eventLog.push({id:`rpg:event:${r.eventLog.length+1}`,kind,...clone(fields)});}
function intent(turn,enemy){const phase=(turn-1)%3;return phase===1?{kind:'charge',label:'力をためる。次は強い攻撃！',attack:0}:phase===2?{kind:'strong',label:'強い攻撃が来る。まもるも使える。',attack:enemy.attack+4}:{kind:'attack',label:'ふつうの攻撃が来る。',attack:enemy.attack};}
export function applyRpgCommand(state,c){const r=state.rpg??=initialRpgState();need(r.version===1,'冒険の保存形式が違います。');
 switch(c.type){
 case 'RPG_TRAVEL':{need(!active(r),'戦いを終えるか、にげるを選んでから移動しよう。');need(validRpgMap(c.mapId),'この行き先は見つかりません。');const before=r.location.mapId,from=mapChapter(before),to=mapChapter(c.mapId);need(before==='world'||c.mapId==='world'||from===to,'別の章へは世界地図から出発しよう。');r.location={mapId:c.mapId};if(to)state.currentChapter=to;addEvent(r,'travel',{mapId:c.mapId});break;}
 case 'RPG_BATTLE_START':{need(!active(r),'いまの魔物との戦いを終えよう。');need(r.hp>0,'村の宿で休んでから、もう一度出発しよう。');const enc=getAvailableEncounters(state).find(x=>x.id===c.encounterId);need(enc?.available,'依頼を受け、必要な操作の区切りまで進んでから会おう。');need(r.location.mapId===`cave:${enc.chapterId}`||(enc.checkpoint>0&&r.location.mapId==='world'&&state.currentChapter===enc.chapterId),'この魔物のいる洞窟か、同じ章の世界地図へ出発しよう。');state.activeQuestKey=enc.recordKey;const qs=state.questStates[enc.recordKey];if(['journey','spot','hlp','stake','perp'].includes(qs?.routeId))state.selectedRoute=qs.routeId;state.currentChapter=enc.chapterId;const attempt=(r.attempts[enc.id]??0)+1;r.attempts[enc.id]=attempt;const stats=getBattleStats(state);r.hp=Math.min(r.hp,stats.maxHp);r.battle={id:`battle:${enc.id}:attempt:${attempt}`,encounterId:enc.id,recordKey:enc.recordKey,chapterId:enc.chapterId,turn:1,status:'active',enemy:clone(enc.enemy),enemyHp:enc.enemy.maxHp,stats:clone(stats),skillUsed:false,coins:enc.coins,firstVictory:!enc.defeated,log:[`${enc.enemy.name}が道をふさいだ！`]};addEvent(r,'battle-start',{battleId:r.battle.id,encounterId:enc.id,attempt});break;}
 case 'RPG_FIELD_START':{need(!active(r),'いまの魔物との戦いを終えよう。');need(r.hp>0,'村の宿で休んでから、もう一度出発しよう。');const enc=getFieldEncounter(c.kind,c.chapterId);need(enc,'この野道の魔物は見つかりません。');need(r.location.mapId==='world'&&state.currentChapter===enc.chapterId,'いまの章の世界地図を歩いてから魔物に会おう。');need(c.encounterId===undefined||c.encounterId===enc.id,'野道の魔物の記録が違います。');const attempt=(r.attempts[enc.id]??0)+1;r.attempts[enc.id]=attempt;const stats=getBattleStats(state);r.hp=Math.min(r.hp,stats.maxHp);r.battle={id:`battle:${enc.id}:attempt:${attempt}`,encounterId:enc.id,kind:'field',fieldKind:enc.fieldKind,recordKey:null,chapterId:enc.chapterId,turn:1,status:'active',enemy:clone(enc.enemy),enemyHp:enc.enemy.maxHp,stats:clone(stats),skillUsed:false,coins:enc.coins,firstVictory:!r.defeatedIds.includes(enc.id),log:[enc.fieldKind==='desert'?`砂から${enc.enemy.name}が現れた！ とても強い。にげるなら必ず逃げられる。`:`野道に${enc.enemy.name}が現れた！`]};addEvent(r,'battle-start',{battleId:r.battle.id,encounterId:enc.id,attempt});break;}
 case 'RPG_BATTLE_ACTION':{const b=r.battle;need(b?.status==='active','この戦いは終わっています。');need(c.battleId===b.id&&Number.isInteger(c.turn)&&c.turn===b.turn,'戦いが進んでいます。今の行動を開き直そう。');need(['attack','guard','skill','flee'].includes(c.action),'こうげき・まもる・わざ・にげるから選ぼう。');const beforeTurn=b.turn,log=[];
  if(c.action==='flee'){b.status='fled';log.push('いったん敵から離れた。道の同じ場所から歩き直せる。用事の記録は残っている。');}
  else{
   if(c.action==='attack'||c.action==='skill'){need(c.action!=='skill'||!b.skillUsed,'この戦いのわざは使いました。こうげきか、まもるを選ぼう。');const damage=Math.max(1,b.stats.attack-b.enemy.defense+(c.action==='skill'?b.stats.skill:0));b.enemyHp=Math.max(0,b.enemyHp-damage);if(c.action==='skill')b.skillUsed=true;log.push(`${c.action==='skill'?'きりふだの強打':'こうげき'}！ ${damage}ダメージ。`);}
   else log.push('しっかり身を守った。');
   if(b.enemyHp===0){b.status='won';if(!r.defeatedIds.includes(b.encounterId)){r.defeatedIds.push(b.encounterId);r.coins+=b.coins;addEvent(r,'loot',{encounterId:b.encounterId,coins:b.coins,rewardId:`rpg:loot:${b.encounterId}:first`});log.push(`初勝利！ 冒険コインを${b.coins}枚受け取った。`);}else log.push('再戦に勝った。コインは初勝利のときだけ。');r.hp=Math.min(b.stats.maxHp,r.hp+b.stats.winHeal);}
   else{const next=intent(beforeTurn,b.enemy);if(next.kind==='charge')log.push(`${b.enemy.name}は力をためている。`);else{const raw=Math.max(1,next.attack-b.stats.defense),damage=c.action==='guard'?Math.ceil(raw/2):raw;r.hp=Math.max(0,r.hp-damage);log.push(`${next.kind==='strong'?'強い攻撃':'敵の攻撃'}！ ${damage}ダメージ。`);if(r.hp===0){b.status='lost';if(b.kind==='field'){r.location={mapId:'town:CH-0'};state.currentChapter='CH-0';state.worldState.x=19;state.worldState.y=16;r.hp=getBattleStats(state).maxHp;addEvent(r,'revive',{battleId:b.id,mapId:'town:CH-0'});log.push('始まりの町の教会で目を覚ました。HPは全回復！ 装備・コイン・用事の記録は、そのまま残っている。');}else{r.location={mapId:`town:${b.chapterId}`};state.currentChapter=b.chapterId;log.push('村の人が宿へ運んでくれた。コインも案件の続きも残っている。休んで再挑戦できる。');}}}}
  }
  b.turn++;b.log=[...b.log,...log].slice(-10);addEvent(r,'battle-action',{battleId:b.id,turn:beforeTurn,action:c.action,status:b.status});break;}
 case 'RPG_BUY':{need(!active(r),'買い物は戦いを終えてから。');need(r.location.mapId.startsWith('shop:'),'村の道具屋へ行こう。');const gear=gearById[c.gearId];need(gear,'この品物は売っていません。');need(!r.ownedGear.includes(gear.id),'この品物はもう持っています。');need(r.coins>=gear.price,'冒険コインが足りません。金融教材の円やコインは使いません。');r.coins-=gear.price;r.ownedGear.push(gear.id);addEvent(r,'purchase',{gearId:gear.id,price:gear.price,rewardId:`rpg:purchase:${gear.id}:first`});break;}
 case 'RPG_EQUIP':{need(!active(r),'装備は戦いの前に整えよう。');const gear=gearById[c.gearId];if(gear){need(r.ownedGear.includes(gear.id),'先にこの装備を道具屋で手に入れよう。');r.equipped[gear.slot]=gear.id;}else{const old=equipmentById[c.gearId];need(old&&state.inventory.includes(old.id),'持っている装備を選ぼう。');state.equippedItems[old.slot]=old.id;if(old.slot==='weapon')r.equipped.weapon=null;}r.hp=Math.min(r.hp,getBattleStats(state).maxHp);addEvent(r,'equip',{gearId:c.gearId});break;}
 case 'RPG_REST':{need(!active(r),'戦いを終えてから村の宿で休もう。');need(r.location.mapId.startsWith('town:'),'村の宿で休もう。');r.hp=getBattleStats(state).maxHp;addEvent(r,'rest');break;}
 default:need(false,'冒険の操作が見つかりません。');
 }
 return state;
}
export function getRpgView(state){const r=state.rpg??initialRpgState(),stats=getBattleStats(state),chapter=mapChapter(r.location.mapId),b=r.battle;const battle=b?{...clone(b),playerHp:r.hp,playerHP:r.hp,enemyHP:b.enemyHp,maxHp:b.stats.maxHp,enemyIntent:b.status==='active'?intent(b.turn,b.enemy):null,actions:[{id:'attack',label:'こうげき',enabled:b.status==='active'},{id:'guard',label:'まもる',enabled:b.status==='active'},{id:'skill',label:'わざ・強打',enabled:b.status==='active'&&!b.skillUsed},{id:'flee',label:'にげる',enabled:b.status==='active'}]}:null;
 return{coins:r.coins,hp:r.hp,maxHp:stats.maxHp,stats,location:clone(r.location),battle,encounters:getAvailableEncounters(state).filter(e=>!chapter||e.chapterId===chapter),shop:shopGear.map(g=>({...g,owned:r.ownedGear.includes(g.id),equipped:r.equipped[g.slot]===g.id,canBuy:!active(r)&&r.location.mapId.startsWith('shop:')&&!r.ownedGear.includes(g.id)&&r.coins>=g.price})),ownedGear:[...r.ownedGear],equipped:clone(r.equipped),canRest:!active(r)&&r.location.mapId.startsWith('town:'),currencyLabel:'冒険コイン（戦闘専用）'};
}
