import {getRpgView} from './rpg.js';

const attackLine={attack:/^こうげき！ (\d+)ダメージ。$/,skill:/^きりふだの強打！ (\d+)ダメージ。$/};
const counterLine=/^(?:敵の攻撃|強い攻撃)！ (\d+)ダメージ。$/;
const latestDamage=(lines,pattern)=>{for(let i=lines.length-1;i>=0;i--){const match=lines[i].match(pattern);if(match)return Number(match[1]);}return 0;};
const actionName={attack:'こうげき！',skill:'きりふだの強打！',guard:'しっかり身を守った。',flee:'敵から離れる！'};

// Read the committed result. Never dispatch, replay a turn, or calculate damage
// from HP differences: an overkill, victory heal, or church revive changes them.
function turnFeedback(beforeState,afterState,action){
 const before=getRpgView(beforeState).battle,after=getRpgView(afterState).battle;
 const event=afterState.rpg?.eventLog?.at(-1);
 if(!before||!after||before.status!=='active'||before.id!==after.id||after.turn!==before.turn+1||!actionName[action]||event?.kind!=='battle-action'||event.battleId!==before.id||event.turn!==before.turn||event.action!==action)return null;
 const won=after.status==='won',lost=after.status==='lost',fled=after.status==='fled',charged=!won&&!fled&&before.enemyIntent?.kind==='charge';
 return {before,after,won,lost,fled,charged,action,attackDamage:attackLine[action]?latestDamage(after.log,attackLine[action]):0,counterDamage:!won&&!fled&&!charged?latestDamage(after.log,counterLine):0,heroHpAtImpact:lost?0:after.playerHP,healed:won?Math.max(0,after.playerHP-before.playerHP):0};
}

export function mountBattleTurn({document:doc,root,beforeState,afterState,action,onComplete,reducedMotion=false}){
 const host=doc.defaultView??globalThis,timers=new Set(),extras=[],listeners=[];
 const data=turnFeedback(beforeState,afterState,action),q=selector=>root.querySelector(selector);
 const sprite=q('[data-battle-enemy]'),stage=q('[data-battle-enemy-stage]'),hero=q('[data-battle-hero]'),message=q('[data-battle-message]');
 const messageMinHeight=message?.style?.minHeight??'',messageHeight=message?.getBoundingClientRect?.().height;
 if(message?.style&&messageHeight>0)message.style.minHeight=`${Math.ceil(messageHeight)}px`;
 const controls=[...root.querySelectorAll('button')].map(button=>({button,disabled:button.disabled}));
 let destroyed=false,completed=false;
 const connected=()=>!destroyed&&root.isConnected;
 const node=(tag,text,className)=>{const element=doc.createElement(tag);element.textContent=text??'';if(className)element.className=className;return element;};
 const later=(delay,fn)=>{const timer=host.setTimeout(()=>{timers.delete(timer);if(connected())fn();else destroy();},delay);timers.add(timer);};
 const say=text=>{if(message)message.textContent=text;};
 const effect=(target,className,on=true)=>target?.classList.toggle(className,on);
 const popup=(target,value,kind)=>{if(!target)return;const element=node('span',String(value),`rpg-damage-number is-${kind}`);element.setAttribute('aria-hidden','true');target.append(element);extras.push(element);return element;};
 function hp(who,value,max){const bar=q(`[data-battle-${who}-hp]`),text=q(`[data-battle-${who}-hp-text]`);if(bar)bar.value=value;if(text)text.textContent=`${value.toLocaleString('ja-JP')} / ${max.toLocaleString('ja-JP')}`;}
 function clean(){
  for(const timer of timers)host.clearTimeout(timer);timers.clear();
  for(const remove of listeners)remove();for(const element of extras)element.remove();
  for(const {button,disabled} of controls)button.disabled=disabled;
  for(const target of [root,sprite,hero,stage])for(const name of ['is-battle-animating','battle-motion-reduced','is-striking','is-hit','is-guarding','is-fleeing','is-defeated','is-charging'])effect(target,name,false);
  root.removeAttribute('aria-busy');root.removeAttribute('data-turn-effect');
  if(message?.style)message.style.minHeight=messageMinHeight;
 }
 function destroy(){if(destroyed)return;destroyed=true;clean();}
 function finish(){if(destroyed||completed)return;const visible=root.isConnected;completed=true;destroy();if(visible)onComplete?.();}
 root.setAttribute('aria-busy','true');root.setAttribute('data-turn-effect',action);effect(root,'is-battle-animating');effect(root,'battle-motion-reduced',reducedMotion);
 for(const {button} of controls)button.disabled=true;
 const skip=node('button','結果をすぐ見る','rpg-button rpg-turn-skip');skip.type='button';skip.setAttribute('data-battle-skip','');
 const skipClick=event=>{event.preventDefault();event.stopPropagation();finish();};skip.addEventListener('click',skipClick);listeners.push(()=>skip.removeEventListener('click',skipClick));
 // Reuse the existing intent box so animation never inserts a new vertical row
 // under the player's finger or triggers the browser's scroll anchoring.
 const intent=q('[data-battle-intent]');if(intent)intent.append(skip);else root.append(skip);extras.push(skip);
 if(!data){later(0,finish);return {destroy};}
 say(actionName[action]);
 const hitEnemy=()=>{
  if(!data.attackDamage)return;
  if(!reducedMotion){effect(sprite,'is-hit');const slash=node('span','','rpg-battle-slash');slash.setAttribute('aria-hidden','true');stage?.append(slash);extras.push(slash);}
  popup(stage,data.attackDamage,'enemy');hp('enemy',data.after.enemyHP,data.after.enemy.maxHp);say(`${actionName[action]} ${data.attackDamage}ダメージ。`);
 };
 const defeatEnemy=()=>{
  effect(sprite,'is-hit',false);effect(sprite,'is-defeated');
  say(`${data.after.enemy.name}を倒した！${data.healed?` HPが${data.healed}回復。`:''}`);
  if(reducedMotion){if(sprite)sprite.hidden=true;}else later(180,()=>{if(sprite)sprite.hidden=true;});
  hp('hero',data.after.playerHP,data.before.stats.maxHp);
 };
 const counter=()=>{
  effect(sprite,'is-hit',false);effect(hero,'is-striking',false);
  if(data.charged){if(!reducedMotion)effect(sprite,'is-charging');say(`${data.after.enemy.name}は力をためている。`);return;}
  if(!data.counterDamage)return;
  if(!reducedMotion)effect(hero,'is-hit');popup(hero,data.counterDamage,'hero');hp('hero',data.heroHpAtImpact,data.before.stats.maxHp);
  say(`${data.before.enemyIntent?.kind==='strong'?'強い攻撃':'敵の攻撃'}！ ${data.counterDamage}ダメージ。${data.lost?' 倒れた……。':''}`);
 };
 if(reducedMotion){
  later(20,()=>{
   hitEnemy();if(data.won)defeatEnemy();else if(!data.fled)counter();
   const lines=[actionName[action]];if(data.attackDamage)lines.push(`敵に${data.attackDamage}ダメージ。`);if(data.counterDamage)lines.push(`あなたに${data.counterDamage}ダメージ。`);if(data.charged)lines.push('敵は力をためている。');if(data.won)lines.push('敵を倒した！');if(data.lost)lines.push('倒れた……。');if(data.fled)lines.push('道へ戻ろう。');say(lines.join(' '));
  });later(340,finish);return {destroy};
 }
 if(data.fled){effect(hero,'is-fleeing');later(440,finish);return {destroy};}
 if(action==='guard')effect(hero,'is-guarding');else effect(hero,'is-striking');
 if(data.attackDamage)later(150,hitEnemy);
 if(data.won){later(420,defeatEnemy);later(1040,finish);}
 else{
  later(action==='guard'?360:570,counter);
  later(880,()=>{effect(hero,'is-hit',false);if(data.lost){effect(hero,'is-defeated');say(data.after.kind==='field'?'倒れた……。始まりの教会で目を覚ます。':'倒れた……。村の人が宿へ運んでくれた。');}});
  later(data.lost?1280:1120,finish);
 }
 return {destroy};
}
