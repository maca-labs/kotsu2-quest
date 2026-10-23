import {getRpgView} from './rpg.js';
import {equipmentById} from './content.js';

const format=value=>Number.isFinite(value)?value.toLocaleString('ja-JP'):String(value??'');
const actionCopy={attack:'装備した武器で攻撃。相手も反撃します。',guard:'このターンに受けるダメージを小さくします。',skill:'この戦いで1回だけ、強い攻撃を出します。',flee:'敵から離れます。用事の記録は残ります。'};
const slotName=slot=>slot==='weapon'?'武器':slot==='armor'?'防具':'冒険の装備';
const itemName=id=>equipmentById[id]?.name??id??'なし';

function elements(doc){
 const node=(tag,text='',className='')=>{const n=doc.createElement(tag);if(text!==''&&text!==undefined&&text!==null)n.textContent=String(text);if(className)n.className=className;return n;};
 const button=(label,fn,{primary=false,disabled=false}={})=>{const n=node('button',label,`rpg-button${primary?' is-primary':''}`);n.type='button';n.disabled=disabled;n.addEventListener('click',()=>{if(!n.disabled)fn?.();});return n;};
 const info=(label,value)=>{const row=node('div','','rpg-stat');row.append(node('span',label),node('strong',format(value)));return row;};
 const currency=coins=>{const n=node('p','','rpg-coins');n.append(node('span','所持している冒険コイン'),node('strong',`${format(coins)} 枚`));return n;};
 const note=()=>node('p','冒険コインは、この世界の買物だけに使います。教材の円・ポイント・暗号資産とは別です。','rpg-small');
 const stats=view=>{const n=node('dl','','rpg-stats');for(const[label,value]of [['最大HP',view.stats.maxHp],['攻撃',view.stats.attack],['防御',view.stats.defense],['強打の追加の力',view.stats.skill]])n.append(node('dt',label),node('dd',format(value)));return n;};
 return {node,button,info,currency,note,stats};
}

function pixelPicture(doc,kind,item={}){
 const canvas=doc.createElement('canvas');canvas.width=kind==='shop'?256:kind==='enemy'?160:64;canvas.height=kind==='shop'?96:kind==='enemy'?104:64;canvas.className=`rpg-pixel rpg-pixel-${kind}`;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',kind==='shop'?'ドット絵の武器・防具店':kind==='enemy'?`${item.name}のドット絵`:kind==='hero'?'いまの装備を身につけた旅人':`${item.name??'装備'}のドット絵`);
 const c=canvas.getContext('2d');if(!c)return canvas;c.imageSmoothingEnabled=false;
 const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(kind==='shop'){
  r(0,0,256,96,'#413c37');r(7,6,242,70,'#aa8660');for(let x=10;x<245;x+=18){r(x,8,1,66,'#c3a170');r(x,40,16,2,'#76573e');}r(0,76,256,20,'#635044');for(let x=3;x<256;x+=24)r(x,78,21,1,'#94765b');r(8,56,240,9,'#634536');r(8,65,240,12,'#b08459');r(60,18,4,26,'#d5dec7');r(53,40,18,4,'#dab46c');r(60,44,4,8,'#6a4b39');r(177,20,26,29,'#78999a');r(181,23,18,18,'#d0bf8d');r(187,27,6,18,'#ac8651');r(119,21,23,9,'#41383a');r(116,30,29,20,'#ebbd98');r(122,36,3,3,'#3b3a3a');r(137,36,3,3,'#3b3a3a');r(111,50,39,13,'#698d77');r(126,50,7,13,'#f0d49c');
 }else if(kind==='enemy'){
  r(0,0,160,104,'#293e43');for(let x=0;x<160;x+=24){r(x,8+(x%18),18,30,'#3d5356');r(x+5,12+(x%18),7,9,'#4b6160');}r(0,83,160,21,'#6c725b');r(44,89,75,6,'#3c5146');
  const palette={moss:['#7eac70','#b8cd8a'],bat:['#9c83b8','#d7bed1'],boar:['#b98970','#e2c19b'],golem:['#9ca7a0','#cfcdac'],wisp:['#80b9bd','#d3e5ba'],drake:['#759b9b','#c5cf9c']},[dark,light]=palette[item.kind]??palette.moss;
  if(item.kind==='bat'){r(20,42,48,18,dark);r(29,60,32,12,dark);r(92,42,48,18,dark);r(99,60,32,12,dark);r(64,34,33,49,dark);r(63,25,9,15,light);r(89,25,9,15,light);}
  else if(item.kind==='golem'){r(55,29,52,53,dark);r(45,48,12,32,dark);r(107,48,12,32,dark);r(59,19,44,13,light);r(59,82,16,9,dark);r(88,82,16,9,dark);r(64,58,33,4,light);}
  else if(item.kind==='drake'){r(53,45,57,39,dark);r(88,26,27,35,dark);r(45,64,13,12,dark);r(32,56,16,10,dark);r(62,30,24,23,light);r(100,19,5,11,light);r(61,82,13,9,dark);r(95,82,13,9,dark);}
  else if(item.kind==='boar'){r(42,48,74,35,dark);r(91,39,31,35,dark);r(116,58,13,16,light);r(53,82,10,10,dark);r(98,82,10,10,dark);r(94,27,8,15,dark);r(113,29,8,15,dark);}
  else if(item.kind==='wisp'){r(56,42,50,36,dark);r(63,30,35,17,light);r(75,18,10,16,light);r(61,78,12,11,dark);r(92,78,12,11,dark);r(44,50,12,8,light);r(106,50,12,8,light);}
  else{r(49,54,66,30,dark);r(57,40,50,23,dark);r(68,29,7,14,light);r(91,31,7,13,light);r(44,79,18,10,dark);r(103,79,18,10,dark);r(68,76,28,6,light);}
  r(item.kind==='boar'?103:69,54,5,5,'#263c40');r(item.kind==='boar'?116:90,54,5,5,'#263c40');r(item.kind==='boar'?107:77,65,13,3,light);
  if(item.id?.includes('field:desert:')){r(0,0,160,104,'#5c3e55');for(let y=10;y<90;y+=18){r(5,y,150,3,'#b58164');r(22,y+6,116,2,'#d5ae75');}r(0,89,160,15,'#c3a16b');r(45,53,76,33,'#78607c');r(54,72,16,19,'#564962');r(101,72,14,19,'#564962');for(const [x,y]of [[31,43],[66,23],[101,39]]){r(x,y,29,32,'#b08567');r(x+3,y-8,5,12,'#e5ce8c');r(x+21,y-10,5,14,'#e5ce8c');r(x+4,y+8,7,4,'#e3b7c2');r(x+18,y+8,7,4,'#e3b7c2');r(x+8,y+22,15,4,'#413948');r(x+9,y+22,3,3,'#f7dda0');r(x+20,y+22,3,3,'#f7dda0');}r(119,66,20,10,'#78607c');r(134,54,9,18,'#78607c');}

 }else if(kind==='hero'){
  r(0,0,64,64,'#eee7cf');r(24,6,18,7,'#4f4050');r(20,13,26,11,'#4f4050');r(24,15,18,15,'#edc09c');r(28,21,3,3,'#343b42');r(38,21,3,3,'#343b42');r(22,31,23,22,item.armorId?'#7a9a93':'#bf8c67');r(26,31,15,4,'#e4ca8e');r(17,34,5,13,'#edc09c');r(45,34,5,13,'#edc09c');r(23,53,9,7,'#435364');r(36,53,9,7,'#435364');if(item.weaponId){r(53,16,3,27,'#c2d5ce');r(48,41,13,3,'#d1ac67');r(53,44,3,12,'#72523e');}
 }else if(item.slot==='weapon'||item.slot==='weapon-relic'){
  r(0,0,64,64,'#f0e8ce');r(32,8,6,31,item.id?.includes('iron')?'#c6d4d0':'#c89668');r(34,3,2,7,'#e6e5bd');r(23,38,24,5,'#b79551');r(32,43,6,14,'#6c4c39');r(30,57,10,4,'#b79551');
 }else{
  r(0,0,64,64,'#f0e8ce');r(17,13,31,12,'#a5baa9');r(10,24,13,15,'#6e8b82');r(42,24,13,15,'#6e8b82');r(20,24,25,32,item.id?.includes('mail')?'#8c9f9b':'#8da77a');r(28,12,10,9,'#f0e8ce');r(23,29,18,3,'#cfbc87');r(23,40,18,3,'#cfbc87');
 }
 return canvas;
}

function gearCard({doc,ui,gear,view,onBuy,onEquip,shop=false,onConfirm}){
 const {node,button}=ui,card=node('article','','rpg-gear-card');card.setAttribute('aria-label',gear.name);card.append(pixelPicture(doc,'gear',gear));
 const copy=node('div','','rpg-gear-copy');copy.append(node('h3',gear.name),node('p',slotName(gear.slot),'rpg-small'));
 const effects=[];if(gear.attack)effects.push(`攻撃 +${format(gear.attack)}`);if(gear.defense)effects.push(`防御 +${format(gear.defense)}`);copy.append(node('p',effects.join(' ／ '),'rpg-gear-effect'));if(gear.description)copy.append(node('p',gear.description,'rpg-small'));card.append(copy);
 const commands=node('div','','rpg-gear-commands');
 if(gear.owned){commands.append(node('p',gear.equipped?'装備中':'購入済み・まだ装備していません','rpg-owned'),button(gear.equipped?'装備中':'この装備を身につける',()=>onEquip?.(gear.id),{primary:!gear.equipped,disabled:gear.equipped||view.battle?.status==='active'}));}
 else if(shop){commands.append(node('p',`${format(gear.price)} 冒険コイン`,'rpg-price'),button(gear.canBuy?'この品を買う':'冒険コインが足りません',()=>onConfirm(card,gear),{primary:gear.canBuy,disabled:!gear.canBuy}));}
 card.append(commands);return card;
}

export function renderRpgBattle({document:doc,state,onAction,onContinue,onTown}){
 const ui=elements(doc),{node,button,info,currency,note}=ui,view=getRpgView(state),battle=view.battle,root=node('section','','rpg-ui rpg-battle');root.setAttribute('aria-label','旅の魔物との戦い');
 if(!battle){root.append(node('h2','いま、戦いはありません'),node('p','洞窟で会う魔物を選ぶと、戦いが始まります。'),button('町へ戻る',onTown,{primary:true}));return root;}
 const active=battle.status==='active',title={active:`${battle.enemy.name}が道をふさいだ！`,won:'敵を退けた！',lost:battle.kind==='field'?'強い一撃に倒れた……':'村で一休みしよう',fled:'いったん敵から離れた'}[battle.status];
 root.append(node('h2',title),node('p',active?(battle.fieldKind==='desert'?'とても勝てそうにない！「にげる」なら必ず逃げられる。':'敵の予告を見て、行動を一つ選ぼう。'):battle.status==='won'?'用事の続きを進めよう。':'用事の記録と、持っている道具は残っています。','rpg-instruction'));
 const arena=node('div','','rpg-arena');arena.append(pixelPicture(doc,'enemy',battle.enemy));const foe=node('div','','rpg-combatant');foe.append(node('strong',battle.enemy.name),info('敵のHP',`${format(battle.enemyHP)} / ${format(battle.enemy.maxHp)}`));const enemyHp=node('progress');enemyHp.max=battle.enemy.maxHp;enemyHp.value=battle.enemyHP;enemyHp.setAttribute('aria-label',`${battle.enemy.name}のHP`);foe.append(enemyHp);arena.append(foe);root.append(arena);
 const hero=node('div','','rpg-player-status');hero.append(info(battle.kind==='field'&&battle.status==='lost'?'教会で回復したHP':'あなたのHP',`${format(battle.playerHP)} / ${format(view.maxHp)}`));const hp=node('progress');hp.max=view.maxHp;hp.value=battle.playerHP;hp.setAttribute('aria-label','あなたのHP');hero.append(hp,node('p',`この戦いの装備込みの攻撃 ${format(battle.stats.attack)} ／ 防御 ${format(battle.stats.defense)}`,'rpg-small'));root.append(hero);
 if(active){
  const intent=node('div','','rpg-enemy-intent');intent.setAttribute('role','status');intent.append(node('strong',`敵の予告・ターン ${format(battle.turn)}`),node('p',battle.enemyIntent?.label??'敵の動きを見てみよう。'));root.append(intent);
  const actions=node('div','','rpg-battle-actions');for(const action of battle.actions){const b=button(action.label,()=>onAction?.(action.id,battle.id,battle.turn),{primary:action.id==='attack',disabled:!action.enabled});b.setAttribute('data-rpg-action',action.id);b.append(node('small',action.id==='skill'&&battle.skillUsed?'この戦いでは使用済み':actionCopy[action.id]??''));actions.append(b);}root.append(actions);
 }else{
  const result=node('div','','rpg-battle-result');result.setAttribute('role','status');result.append(node('p',battle.status==='won'?(battle.firstVictory?`初勝利の冒険コイン ${format(battle.coins)}枚を受け取りました。`:'再戦にも勝利。冒険コインは初勝利のときだけ受け取ります。'):battle.status==='fled'?'敵は倒していないので、勝利コインは増えません。':'冒険コインや用事の続きは、そのまま残っています。'));result.append(currency(view.coins));
  if(battle.status==='won')result.append(button(battle.kind==='field'?'道を進む':state.questStates[battle.recordKey]?.completed?'道へ戻る':'用事の続きを進める',onContinue,{primary:true}),button('町の宿へ戻る',onTown));else if(battle.status==='fled')result.append(button('道へ戻る',onContinue,{primary:true}),button('町の宿へ戻る',onTown));else result.append(button(battle.kind==='field'?'教会で目を覚ます':'町の宿へ戻る',onTown,{primary:true}));root.append(result);
 }
 const recent=node('section','','rpg-turn-log');recent.setAttribute('aria-label','直前の行動');recent.append(node('h3','直前の行動'));for(const line of battle.log.slice(-2))recent.append(node('p',line));const log=node('details');log.append(node('summary','この戦いの記録を見る'));for(const line of battle.log)log.append(node('p',line));recent.append(log);root.append(recent,note(),node('p','装備を強くしても、スマホの大切な確認は一つずつ行います。','rpg-small'));return root;
}

export function renderRpgShop({document:doc,state,onBuy,onEquip,onLeave}){
 const ui=elements(doc),{node,button,currency,note,stats}=ui,view=getRpgView(state),root=node('section','','rpg-ui rpg-shop');root.setAttribute('aria-label','武器・防具店');root.append(node('h2','こだま武具店'),pixelPicture(doc,'shop'),node('p','店主「どの装備を見る？ 値段と強さを見比べておくれ。」','rpg-instruction'),currency(view.coins),note());
 const total=node('details','','rpg-equipment-total');total.append(node('summary','いまの装備込みの強さを見る'),stats(view));root.append(total);
 let pending=null;
 const confirm=(card,gear)=>{pending?.remove();const box=node('section','','rpg-purchase-confirm');box.setAttribute('aria-label',`${gear.name}の購入確認`);box.append(node('h4','この品を買いますか？'),node('p',`${gear.name}：${format(gear.price)} 冒険コイン`),node('p',`いま持っている冒険コイン：${format(view.coins)} 枚`),node('p','買ったあとに「装備する」で身につけます。','rpg-small'),button('この内容で買う',()=>onBuy?.(gear.id),{primary:true}),button('買わずに戻る',()=>{box.remove();pending=null;}));card.append(box);pending=box;};
 const shelf=node('div','','rpg-gear-list');for(const gear of view.shop)shelf.append(gearCard({doc,ui,gear,view,onBuy,onEquip,shop:true,onConfirm:confirm}));root.append(shelf,node('p','武器は攻撃、防具は守りを強くします。装備してから旅へ出よう。','rpg-small'),node('p','装備が強くても、大切な確認工程は飛ばしません。','rpg-small'),button('店を出て町へ戻る',onLeave));return root;
}

export function renderRpgEquipment({document:doc,state,onEquip}){
 const ui=elements(doc),{node,button,stats}=ui,view=getRpgView(state),root=node('section','','rpg-ui rpg-equipment');root.setAttribute('aria-label','旅の戦闘装備');root.append(node('h2','旅の装備'),node('p','身につけたい装備を一つ選ぼう。','rpg-instruction'));
 const current=node('section','','rpg-equipped-summary');current.append(pixelPicture(doc,'hero',view.stats),stats(view));const weapon=view.shop.find(gear=>gear.id===view.stats.weaponId),armor=view.shop.find(gear=>gear.id===view.stats.armorId);current.append(node('p',`武器：${weapon?.name??itemName(view.stats.weaponId)}`),node('p',`旅服・よろい：${armor?.name??'まだ身につけていません'}`));root.append(current);
 const list=node('div','','rpg-gear-list');for(const gear of view.shop.filter(gear=>gear.owned))list.append(gearCard({doc,ui,gear,view,onEquip}));
 for(const id of state.inventory??[]){const equipment=equipmentById[id];if(!equipment)continue;const equipped=view.stats.itemIds.includes(id),card=node('article','','rpg-gear-card');card.append(pixelPicture(doc,'gear',{...equipment,slot:equipment.slot==='weapon'?'weapon-relic':equipment.slot}));const copy=node('div','','rpg-gear-copy');copy.append(node('h3',equipment.name),node('p',equipment.description??equipment.effect??'冒険で受け取った装備です。','rpg-small'),node('p',equipped?'装備中・上の強さに反映しています':'所持しています','rpg-owned'));const commands=node('div','','rpg-gear-commands');commands.append(button(equipped?'装備中':'この装備を身につける',()=>onEquip?.(id),{primary:!equipped,disabled:equipped||view.battle?.status==='active'}));card.append(copy,commands);list.append(card);}
 root.append(list,node('p','買っただけでは強さは変わりません。身につけた装備の効果が、上の合計に反映されます。','rpg-small'),node('p','装備は旅の戦闘を助けます。スマホの確認や章の試練は、自分で一つずつ進めます。','rpg-small'));return root;
}
