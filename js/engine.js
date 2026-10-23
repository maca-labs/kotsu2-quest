import {quests,steps,chapters,bosses,objectives,questById,stepById,chapterById,equipmentById,modeUnlockConfig,contentEffect,crypto,points} from './content.js';
import {initialScenarios,applyFinancialStep,validateFinancialState} from './finance.js';
import {applyExtensionReview,extensionScenarioIds,extensionReviewConditionsChanged} from './finance-extension.js';
export const SAVE_KEY='kotsukotsuQuest.save.v3';
export const CONTENT_VERSION='kotsukotsu-rpg-3';
const clone=x=>structuredClone(x);
const fail=message=>{throw new Error(message);};
const LEGACY_SCENARIO_IDS=['intro-phone','points-shopping','bank-application','bank-kyc-retake','bank-transfer','fx-order','fx-sell-variant','fx-offer','cards-trade','journey','spot','spot-limit','hlp','stake','perp','perp-sl','perp-funding','perp-liquidation','boss-ch5-transfer','boss-ch6-journey','boss-ch6-spot','boss-ch6-hlp','boss-ch6-stake','boss-ch6-perp'];
const LEGACY_COMMANDS=new Set(['START','UNLOCK','CHAPTER','NPC','SAVE_OFFER','ACCEPT','STEP','UNTIMED','ROUTE','BOSS','REVIEW_ACTION','REVIEW','EQUIP','SETTINGS']);
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function createState(){return {schemaVersion:3,contentVersion:CONTENT_VERSION,navigationVersion:2,revision:0,started:false,avatar:0,unlockedParts:['intro','points','crypto'],currentChapter:'CH-0',selectedRoute:'journey',activeQuestKey:null,worldState:{x:12,y:10,direction:0,seals:[],talked:[],opened:[]},questStates:{},rewardEvents:[],masteryEvidence:{},inventory:['traveler-staff'],equippedItems:{weapon:'traveler-staff',shield:null,head:null,tool:null},financialScenarios:initialScenarios(),phoneState:{activeApp:'home',recentApps:[],mailById:{'intro-mail':{subject:'旅人さんへ、小さなお願い',body:'合言葉は「一歩ずつ」。メモに写してみよう。',code:'一歩ずつ',read:false}},notifications:[],clipboard:'',keyboard:null,browserTabs:{},formDrafts:{},scrollPositions:{}},settings:{sound:false,volume:0.18,reducedMotion:false,textLarge:false,hideTime:false,durationHours:24,timeBonus:true},realClockState:{lastObservedAt:0},bossStates:{},reviewStates:{},journal:[]};}
export const totalXp=s=>s.rewardEvents.reduce((sum,e)=>sum+e.xp,0);
export const level=s=>1+Math.floor(totalXp(s)/100);
export function reward(state,id,xp){if(!state.rewardEvents.some(r=>r.id===id))state.rewardEvents.push({id,xp});}
function obtain(state,item){if(!item||!equipmentById[item.id])return;if(!state.inventory.includes(item.id)){state.inventory.push(item.id);state.equippedItems[item.slot]=item.id;reward(state,`equipment:${item.id}`,0);state.worldState.opened.push(item.id);}}
function evidence(state,domain,index,kind){const d=state.masteryEvidence[domain]??={guided:[],transfer:[]};if(!d[kind].includes(+index))d[kind].push(+index);}
export function mastery(state,domain){const d=state.masteryEvidence[domain];return d?(d.guided.length+d.transfer.length)*10:0;}
export const stateKey=(q,route='journey',state)=>{
 if(q.id!=='HY-EXIT')return q.id;
 const original=`${q.id}:${route}`,previous=state?.questStates[original];
 // A later entry lesson has its own actual funds. Keep the completed chapter-only
 // exercise intact, then rehearse the same required exit actions with those funds.
 if(route==='journey'&&previous?.scenarioOverride==='chapter6-journey'&&previous.completed&&state?.questStates['CR-03']?.completed)return `${q.id}:journey-main`;
 return original;
};
export function questState(s,id,route=s.selectedRoute){const q=questById[id];return q?s.questStates[stateKey(q,route,s)]:undefined;}
// Visiting a chapter and learning its skills are separate: navigation grants no evidence.
export function chapterAvailable(state,id){return !!chapterById[id];}
export function questAvailable(state,q,{legacyContent=false}={}){
 if(!q||!chapterAvailable(state,q.chapterId))return false;
 // A started old quest remains resumable when new introductory lessons are added.
 if(questState(state,q.id))return true;
 if(q.id==='HY-EXIT'){if(state.selectedRoute==='journey')return true;return !!questState(state,{'spot':'HY-SPOT','hlp':'HY-HLP','stake':'HY-STAKE','perp':'HY-PERP'}[state.selectedRoute])?.completed;}
 const sameChapter=(q.prerequisites??[]).filter(id=>(q.extension||questById[id]?.chapterId===q.chapterId)&&!(legacyContent&&id.startsWith('FI-')));
 if(!q.extra&&!q.extension&&q.chapterId!=='CH-6'){
  const sequence=quests.filter(item=>item.chapterId===q.chapterId&&!item.extra&&!item.extension&&!(legacyContent&&item.id.startsWith('FI-'))),index=sequence.findIndex(item=>item.id===q.id);
  if(index>0)sameChapter.push(sequence[index-1].id);
 }
 return sameChapter.every(id=>questState(state,id)?.completed);
}
export function activeStep(state){const qs=state.questStates[state.activeQuestKey];return qs&&!qs.completed?stepById[questById[qs.questId].stepIds[qs.index]]:null;}
export function chapterResumeKey(state,chapterId=state.currentChapter){const matches=key=>{const qs=state.questStates[key];return qs&&!qs.completed&&questById[qs.questId]?.chapterId===chapterId;};if(matches(state.activeQuestKey))return state.activeQuestKey;return Object.keys(state.questStates).find(matches)??null;}
export function normalized(v){return String(v??'').normalize('NFKC').trim();}
export function validateAction(step,value){
 if(['input','select'].includes(step.type)){
  if(step.value==='any'||step.value==='*'||step.acceptAny||step.acceptAnyChoice){if(!normalized(value))fail('練習用の候補を選ぼう。');if(step.choices?.length&&!step.choices.some(c=>normalized(typeof c==='object'?c.value:c)===normalized(value)))fail('表示された練習用候補から選ぼう。');return;}
  const expected=step.value;
  if(expected!==undefined&&expected!==null){const ok=typeof expected==='number'?Number(value)===expected&&/^-?(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(normalized(value)):normalized(value)===normalized(expected);if(!ok)fail(step.error??`「${step.fieldLabel??(/[ぁ-んァ-ヶ一-龠]/.test(step.field??'')?step.field:'入力した内容')}」を練習カードと比べよう。入力は残っているので直せるよ。`);}
  else if(!normalized(value))fail('練習値を入れよう。');
 }
 if(step.type==='check'&&value!==true&&value!=='true')fail('内容を読んだら、確認欄に印を付けよう。');
}
function observeClock(s,now){if(!Number.isFinite(now)||now<0)fail('時計の値を確認できません。');if(now<=s.realClockState.lastObservedAt-300000){for(const q of Object.values(s.questStates))if(!q.completed&&q.timedChallengeEnabled)q.timeBonusStatus='clock-unverified';}s.realClockState.lastObservedAt=Math.max(now,s.realClockState.lastObservedAt);}
function finishQuest(s,q,qs,now){qs.completed=true;qs.completedAtReal=now;reward(s,`quest:${q.id}:first`,q.extra?0:40);if(!q.extra&&qs.timedChallengeEnabled){if(qs.timeBonusStatus!=='clock-unverified'&&qs.acceptedAtReal<=now&&now<=qs.deadlineAtReal){reward(s,`time:${q.id}:first`,10);qs.timeBonusAwarded=true;qs.timeBonusStatus='awarded';}else if(qs.timeBonusStatus!=='clock-unverified')qs.timeBonusStatus='expired';}if(q.chapterId==='CH-0')obtain(s,chapterById['CH-0']?.equipment);}
function guided(s,q,step){for(const [domain,map]of Object.entries(q.guidedObjectiveMap??{})){if(typeof map==='object')for(const [i,ids]of Object.entries(map))if((Array.isArray(ids)?ids:[ids]).includes(step.id))evidence(s,domain,i,'guided');}}
export function bossTasks(state,id){const b=bosses.find(x=>x.chapterId===id);return b?.routeTasks?.[state.bossStates[id]?.routeId??state.selectedRoute]??b?.tasks??[];}
export function bossAvailable(s,id,{legacyContent=false}={}){if(id==='hidden')return s.worldState.seals.length===6;if(!chapterAvailable(s,id)||id==='CH-0')return false;if(s.bossStates[id]?.completed)return true;if(id==='CH-6')return !!questState(s,'HY-EXIT')?.completed;return quests.filter(q=>q.chapterId===id&&!q.extra&&!q.extension&&!(legacyContent&&q.id.startsWith('FI-'))).every(q=>questState(s,q.id)?.completed);}
function bossDomain(id){return {'CH-1':'points','CH-2':'bankKyc','CH-3':'fx','CH-4':'cards','CH-5':'crypto_basics','CH-6':'crypto_exit'}[id];}
function hiddenTasks(){return [
 {id:'H1',title:'小さな条件を見つける',instruction:'商品2,000円、割引100円、送料100円。対象金額を直そう。',fields:[{key:'eligible',label:'送料を除く対象金額（円）',type:'number',initialValue:2000,value:1900}]},
 {id:'H2',title:'本人の情報を見比べる',instruction:'練習カードの氏名は「ホシノ アオイ」。申込の名義を直そう。',fields:[{key:'name',label:'氏名カナ',type:'text',initialValue:'ホシノ ハル',value:'ホシノ アオイ'}]},
 {id:'H3',title:'費用も数える',instruction:'振込3,000円、費用110円。送る側の支出を計算しよう。',fields:[{key:'amount',label:'合計支出（円）',type:'number',initialValue:3000,value:3110}]},
 {id:'H4',title:'取引を終える',instruction:'新規取引1,000通貨に対し、500通貨を決済済み。残りを決済しよう。',fields:[{key:'close',label:'残りの決済数量（通貨）',type:'number',value:500}]},
 {id:'H5',title:'荷物の現在地',instruction:'ウォレット900、サービス内99。出金に使えるサービス内残高を入力しよう。',fields:[{key:'place',label:'サービス内の残高（Mock USDC）',type:'number',value:99}]},
 {id:'H6',title:'届いた記録を見る',instruction:'申請額99、費用1。受取明細の98と照合しよう。',fields:[{key:'received',label:'受取明細（Mock USDC）',type:'number',value:98}]}];}
export function getBossTasks(s,id){return id==='hidden'?hiddenTasks():bossTasks(s,id);}
export function dispatch(state,command,now=Date.now(),record=true,replayOptions={}){
 const replay=record==='replay';const s=replay?state:clone({...state,journal:[]});if(!replay)s.journal=[...state.journal];observeClock(s,now);const c=command;
 switch(c.type){
 case 'START':s.started=true;s.avatar=Math.min(2,Math.max(0,Number(c.avatar)||0));break;
 case 'UNLOCK':{const code=normalized(c.code).toUpperCase();if(!code)fail('解禁コードを入力しよう。');const part=Object.keys(modeUnlockConfig).find(p=>modeUnlockConfig[p]===code);if(!part)fail('コードが違うようです。文字を確かめよう。');if(!s.unlockedParts.includes(part))s.unlockedParts.push(part);break;}
 case 'CHAPTER':if(!chapterAvailable(s,c.id))fail('この章は見つかりません。');s.currentChapter=c.id;s.worldState.x=12;s.worldState.y=10;break;
 case 'NPC':{const n=Number((c.chapterId??s.currentChapter).slice(3));if(!Number.isInteger(c.index)||c.index<0||c.index>3||n<0||n>6)fail('町の人が見つかりません。');const id=`npc:${c.chapterId??s.currentChapter}:${c.index}:first`;const chapter=chapterById[c.chapterId??s.currentChapter];if(!chapterAvailable(s,chapter.id))fail('この町はまだ開いていません。');const topic=chapter.npcs?.[c.index]?.topicId??(c.index<3?`${chapter.npcId}:${c.index}:first-help`:null);if(topic)reward(s,`npc:${topic}:first`,3);if(!s.worldState.talked.includes(id))s.worldState.talked.push(id);break;}
 case 'SAVE_OFFER':s.phoneState.offerConditionsSavedAt=now;s.phoneState.offerConditionCard={id:'fx-offer-001',pair:'USDJPY',newQuantity:1000,fullClose:true,reward:300};break;
 case 'ACCEPT':{const q=questById[c.id];if(!q||!questAvailable(s,q,replayOptions))fail('先に依頼帳の前の用事を終えよう。');if(!s.worldState.talked.some(id=>id.startsWith(`npc:${q.chapterId}:`)))fail('町の人に話を聞いてから受注しよう。');if(q.offerCardRequired&&!Number.isFinite(s.phoneState.offerConditionsSavedAt))fail('先に案件の条件を開き、手帳に控えよう。');if(q.id.startsWith('HY-')&&q.id!=='HY-EXIT')s.selectedRoute={'HY-SPOT':'spot','HY-HLP':'hlp','HY-STAKE':'stake','HY-PERP':'perp'}[q.id];const key=stateKey(q,s.selectedRoute,s);let qs=s.questStates[key];if(!qs){const enabled=!!c.timed&&!q.extra&&q.timedChallenge?.enabled!==false&&s.settings.timeBonus;const hours=s.settings.durationHours;s.questStates[key]=qs={questId:q.id,routeId:s.selectedRoute,index:0,completedSteps:[],completed:false,acceptedAtReal:now,durationHoursAtAccept:hours,deadlineAtReal:now+hours*3600000,timedChallengeEnabled:enabled,timeBonusStatus:enabled?'active':'off',timeBonusAwarded:false};if(q.id==='HY-EXIT'&&s.selectedRoute==='journey'&&!questState(s,'CR-03')?.completed&&!replayOptions.legacyContent)qs.scenarioOverride='chapter6-journey';}s.activeQuestKey=key;if(qs.completed)fail('この依頼は達成済みです。条件を変えた確認課題を開けます。');s.phoneState.activeApp=stepById[q.stepIds[qs.index]]?.appId??'home';if(q.id.startsWith('HY-')&&q.id!=='HY-EXIT')s.selectedRoute={'HY-SPOT':'spot','HY-HLP':'hlp','HY-STAKE':'stake','HY-PERP':'perp'}[q.id];break;}
 case 'STEP':{const step=activeStep(s);if(!step||step.id!==c.id)fail('画面が更新されています。今の工程を開き直そう。');validateAction(step,c.value??step.value);const qs=s.questStates[s.activeQuestKey],q=questById[qs.questId];if(q.id==='FX-02'&&!Number.isFinite(s.phoneState.offerConditionsSavedAt))fail('先に案件の条件を手帳に控えよう。');const context={routeId:qs.routeId??s.selectedRoute,scenarioOverride:qs.scenarioOverride,quest:q};applyFinancialStep(s,step,c.value??step.value,context);contentEffect(s,step,c.value??step.value,context);if(step.field&&['input','select'].includes(step.type))s.phoneState.formDrafts[`${q.scenarioId}:${step.field}`]=c.value;if(step.id==='CR-04-S018'&&['journey','spot','hlp','stake','perp'].includes(c.value))s.selectedRoute=c.value;qs.completedSteps.push(step.id);qs.index++;reward(s,`step:${step.id}`,2);guided(s,q,step);if(qs.index===q.stepIds.length)finishQuest(s,q,qs,now);break;}
 case 'UNTIMED':{const qs=s.questStates[c.key??s.activeQuestKey];if(!qs)fail('依頼がありません。');qs.timedChallengeEnabled=false;qs.timeBonusStatus='off';break;}
 case 'ROUTE':if(!['journey','spot','hlp','stake','perp'].includes(c.route))fail('経路が違います。');s.selectedRoute=c.route;break;
 case 'BOSS':{const id=c.id;if(!bossAvailable(s,id,replayOptions))fail('依頼の結果を確認すると、章の試練が開くよ。');const b=s.bossStates[id]??={index:0,actionIndex:0,routeId:s.selectedRoute,completed:false,snapshots:{}};if(b.completed)break;const ts=getBossTasks(s,id),task=ts[b.index];if(!task||task.id!==c.taskId)fail('今の確認課題を開き直そう。');if(task.actions?.length){const action=task.actions[b.actionIndex];if(action.id!==c.actionId)fail('今の操作を確認しよう。');validateAction(action,c.value);applyFinancialStep(s,action,c.value,{routeId:b.routeId,bossId:id,boss:true,snapshot:b.snapshots});b.actionIndex++;if(b.actionIndex<task.actions.length)break;}else for(const f of task.fields??[])validateAction({...f,type:f.type==='select'?'select':'input',field:f.label},c.values?.[f.key]);const d=bossDomain(id);if(task.objectiveEvidence?.length){for(const e of task.objectiveEvidence)evidence(s,e.domain,e.objectiveIndex,'transfer');}else if(d)evidence(s,d,b.index,'transfer');b.index++;b.actionIndex=0;if(b.index===ts.length){b.completed=true;if(id==='hidden'){reward(s,'boss:hidden:first',100);obtain(s,equipmentById['rainbow-oath']);}else{reward(s,`boss:${id}:first`,50);if(!s.worldState.seals.includes(id))s.worldState.seals.push(id);obtain(s,chapterById[id]?.equipment);}}break;}
 case 'RESTART_REVIEW':{const q=questById[c.id];if(!q||!questState(s,q.id)?.completed||!q.reviewVariant?.tasks?.length)fail('初回の依頼を終えてから確認しよう。');delete s.reviewStates[q.id];break;}
 case 'REVIEW_ACTION':{const q=questById[c.id];if(!q||!questState(s,q.id)?.completed)fail('初回の依頼を終えてから確認しよう。');const rv=q.reviewVariant,ts=rv?.tasks;if(!ts?.length)fail('確認課題がありません。');const rs=s.reviewStates[q.id]??={index:0,actionIndex:0,snapshot:clone(rv.initialSnapshot??{}),completed:false,variantId:rv.id};if(rs.completed)break;const task=ts[rs.index],action=task.actions?.[rs.actionIndex]??task;if(task.id!==c.taskId||action.id!==c.actionId)fail('今の確認課題を開き直そう。');validateAction(action,c.value??action.value);crypto.applyReviewEffect?.(rs.snapshot,action);points.applyReviewEffect?.(rs.snapshot,action,c.value??action.value);applyExtensionReview(rs.snapshot,action,c.value??action.value);rs.actionIndex++;if(task.actions&&rs.actionIndex<task.actions.length)break;if(q.id!=='LV-01'||extensionReviewConditionsChanged(s,rs.snapshot)){if(task.objectiveEvidence?.length){for(const e of task.objectiveEvidence)evidence(s,e.domain,e.objectiveIndex,'transfer');}else evidence(s,task.domain??(q.partId==='intro'?'smartphone':q.domain),task.objectiveIndex??rs.index,'transfer');}rs.index++;rs.actionIndex=0;if(rs.index===ts.length)rs.completed=true;break;}
 case 'REVIEW':{const q=questById[c.id];if(!q||!questState(s,q.id)?.completed)fail('初回の依頼を終えてから確認しよう。');const rv=q.reviewVariant;const fields=rv?.fields??[];if(!fields.length)fail('章ボスから条件の違う確認課題へ進めるよ。');for(const f of fields)validateAction({...f,type:'input',field:f.label},c.values?.[f.key]);s.reviewStates[q.id]={completed:true,variantId:rv.id??`${q.id}-variant`};for(const [domain,map]of Object.entries(q.guidedObjectiveMap??{}))for(const i of Object.keys(map))evidence(s,domain,i,'transfer');break;}
 case 'EQUIP':{const e=equipmentById[c.id];if(!e||!s.inventory.includes(c.id))fail('まだ持っていない装備です。');s.equippedItems[e.slot]=c.id;break;}
 case 'SETTINGS':for(const [k,v]of Object.entries(c.values??{})){if(!(k in s.settings))fail('設定の項目が違います。');if(k==='durationHours'){if(!Number.isFinite(v)||v<1||v>168)fail('時間は1〜168の間にしよう。');}else if(k==='volume'){if(!Number.isFinite(v)||v<0||v>1)fail('音量は0〜1です。');}else if(typeof v!=='boolean')fail('設定値が違います。');s.settings[k]=v;}break;
 default:fail('未登録の操作です。');
 }
 s.revision++;if(record)s.journal.push({command:clone(command),at:now});return s;
}
function checkTree(v,depth=0){if(depth>35)fail('保存データが深すぎます。');if(typeof v==='number'&&(!Number.isFinite(v)||Math.abs(v)>1e13))fail('保存データの数値が範囲外です。');if(typeof v==='string'&&v.length>12000)fail('保存データの文字が長すぎます。');if(Array.isArray(v)&&v.length>10000)fail('保存データの件数が多すぎます。');if(v&&typeof v==='object')for(const[k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))fail('保存データのキーが不正です。');checkTree(x,depth+1);}}
export function parseSave(text){
 if(new TextEncoder().encode(text).length>2*1024*1024)fail('保存データは2 MiBまでです。');
 let raw;try{raw=JSON.parse(text);}catch{fail('JSONの形式が壊れています。');}
 checkTree(raw);
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schemaVersion!==3||raw.contentVersion!==CONTENT_VERSION)fail('この保存形式には対応していません。元のデータは残しています。');
 if(!Array.isArray(raw.journal)||raw.journal.length>10000)fail('操作記録を読み取れません。');
 if(!raw.financialScenarios||typeof raw.financialScenarios!=='object'||Array.isArray(raw.financialScenarios))fail('金融記録を読み取れません。');
 const count=raw.journal.length+(raw.rewardEvents?.length??0)+Object.values(raw.financialScenarios).reduce((n,x)=>n+(Array.isArray(x?.eventLog)?x.eventLog.length:0),0);
 if(count>10000)fail('記録は合計10,000件までです。');
 const legacy=raw.navigationVersion===undefined;
 if(!legacy&&raw.navigationVersion!==2)fail('この章選択の保存形式には対応していません。');
 let legacyLength=legacy?raw.journal.length:0;
 if(raw.migration!==undefined){
  if(legacy||!raw.migration||Object.keys(raw.migration).some(k=>k!=='legacyV3JournalLength')||!Number.isInteger(raw.migration.legacyV3JournalLength)||raw.migration.legacyV3JournalLength<0||raw.migration.legacyV3JournalLength>raw.journal.length)fail('旧記録の引継ぎ情報が正しくありません。');
  legacyLength=raw.migration.legacyV3JournalLength;
 }
 let s=createState();const legacyParts=['intro'];
 for(const [index,e]of raw.journal.entries()){
  if(!e||!e.command||typeof e.command.type!=='string')fail('操作記録が壊れています。');
  const old=index<legacyLength,c=e.command;
  if(old){
   if(!LEGACY_COMMANDS.has(c.type)||['ACCEPT','REVIEW','REVIEW_ACTION'].includes(c.type)&&(!questById[c.id]||c.id.startsWith('FI-'))||c.type==='STEP'&&(!stepById[c.id]||stepById[c.id].questId.startsWith('FI-')))fail('旧記録に存在しない操作です。');
   if(c.type==='UNLOCK'){const code=normalized(c.code).toUpperCase(),part=Object.keys(modeUnlockConfig).find(k=>modeUnlockConfig[k]===code);if(part&&!legacyParts.includes(part))legacyParts.push(part);}
  }
  s=dispatch(s,c,e.at,'replay',{legacyContent:old});
 }
 for(const key of ['questStates','rewardEvents','inventory','equippedItems','bossStates','reviewStates','masteryEvidence','settings','realClockState','started','avatar','activeQuestKey','selectedRoute'])if(canonical(s[key])!==canonical(raw[key]))fail(`保存データの${key}と操作記録が一致しません。元のデータは残しています。`);
 if(!Array.isArray(raw.unlockedParts)||new Set(raw.unlockedParts).size!==raw.unlockedParts.length||canonical(raw.unlockedParts)!==canonical(legacy?legacyParts:s.unlockedParts))fail('教材の解放記録と操作記録が一致しません。');
 // Every original scenario is mandatory. Only newly added, untouched defaults may be hydrated.
 const expectedIds=Object.keys(s.financialScenarios),newDefaults=initialScenarios();
 if(LEGACY_SCENARIO_IDS.some(id=>!Object.hasOwn(raw.financialScenarios,id)))fail('元の金融記録が不足しています。');
 for(const id of Object.keys(raw.financialScenarios))if(!expectedIds.includes(id))fail('未知の金融記録があります。');
 for(const id of expectedIds){
  if(Object.hasOwn(raw.financialScenarios,id)){
   if(canonical(s.financialScenarios[id])!==canonical(raw.financialScenarios[id]))fail('金融記録と操作記録が一致しません。元のデータは残しています。');
  }else if((!legacy&&!extensionScenarioIds.includes(id))||s.financialScenarios[id].eventLog.length||canonical(s.financialScenarios[id])!==canonical(newDefaults[id]))fail('金融記録が不足しています。');
 }
 validateFinancialState(s.financialScenarios);
 if(raw.revision!==s.revision)fail('保存の更新番号が一致しません。');
 if(!raw.phoneState||typeof raw.phoneState!=='object'||Array.isArray(raw.phoneState))fail('スマホの記録が壊れています。');
 const p=clone(raw.phoneState);
 for(const k of ['recentApps','notifications'])if(!Array.isArray(p[k]))fail('スマホの一覧形式が壊れています。');
 for(const k of ['mailById','formDrafts','scrollPositions','browserTabs'])if(!p[k]||typeof p[k]!=='object'||Array.isArray(p[k]))fail('スマホの入力記録が壊れています。');
 if(typeof p.clipboard!=='string'||p.recentApps.some(x=>typeof x!=='string'))fail('アプリやコピーの記録が壊れています。');
 for(const val of Object.values(p.formDrafts))if(val===null||!['string','number','object','boolean'].includes(typeof val)||Array.isArray(val))fail('入力欄の記録が壊れています。');
 const apps=['home','memo','mail','browser','bank','fx','market','wallet','hyper','gift','points','exchange','auth'];if(!apps.includes(p.activeApp))p.activeApp='home';s.phoneState={...s.phoneState,...p};
 if(!raw.worldState||typeof raw.worldState!=='object')fail('地図の記録が壊れています。');
 for(const key of ['seals','talked','opened'])if(canonical(raw.worldState[key])!==canonical(s.worldState[key]))fail('町の記録と操作記録が一致しません。');
 if(!Number.isInteger(raw.worldState.x)||raw.worldState.x<0||raw.worldState.x>24||!Number.isInteger(raw.worldState.y)||raw.worldState.y<0||raw.worldState.y>17||!Number.isInteger(raw.worldState.direction)||raw.worldState.direction<0||raw.worldState.direction>3)fail('地図の位置が違います。');
 Object.assign(s.worldState,{x:raw.worldState.x,y:raw.worldState.y,direction:raw.worldState.direction});
 if(!chapterAvailable(s,raw.currentChapter))fail('保存された章が見つかりません。');s.currentChapter=raw.currentChapter;
 if(legacyLength)s.migration={legacyV3JournalLength:legacyLength};
 return s;
}
