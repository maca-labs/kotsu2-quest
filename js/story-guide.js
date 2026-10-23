import {chapters,chapterById,quests,questById,stepById} from './content.js';
import {chapterResumeKey,questAvailable,questState,bossAvailable} from './engine.js';
import {getAdventure,questBrief} from './adventure.js';

// A town's next invitation is a view of the existing record, never a new quest,
// reward, balance or saved flag. All labels below describe plans until completed.
const chapterStories={
 'CH-0':{title:'消えた言葉を、ミナと取り戻そう',story:'郵便屋ミナが困っています。メールの合言葉をメモへ写せば、村の掲示板に用事を戻せそうです。',house:'郵便屋の家',groups:[['ミナの話を聞く',[]],['メールの言葉を写す',['PR-01']],['旅人の手帳を受け取る',['PR-01']]]},
 'CH-1':{title:'閉じた商店の連絡帳を開こう',story:'店主ハルの商店へ、注文の知らせが届きません。連絡先を確かめ、買い物の記録と贈り物を取り戻しましょう。',house:'店主の家',groups:[['連絡帳を開く',['PO-01']],['注文と控えを残す',['PO-02','PO-03','PO-04']],['贈り物を受け取る',['PO-05','PO-06']]]},
 'CH-2':{title:'止まった城の水門を開こう',story:'帳場のスイは、申込書と本人の情報が合わず困っています。自分の二つの口座へ振り込み、受取まで確かめると水門を動かせそうです。',house:'帳場の家',groups:[['申込書をそろえる',['BK-01']],['本人確認を終える',['BK-02']],['振込と受取を確かめる',['TR-01']]]},
 'CH-3':{title:'港の船を、確かな記録で送り出そう',story:'船長ナギの港では、通貨の名前や取引の量が混ざっています。向きと量を確かめ、持っている取引を閉じて、船のいかりをほどきましょう。',house:'船長の家',groups:[['通貨と量を見分ける',['FX-01']],['持つ取引を閉じる',['FX-02']],['案件の条件を確かめる',['FX-03']]]},
 'CH-4':{title:'星札市場に、正直な品物を届けよう',story:'道具屋コハクの市場は、カードの傷や費用が分からず暗いまま。相場と品物を調べ、発送してお金が届くところまで見届けましょう。',house:'道具屋の家',groups:[['相場と品物を調べる',['TC-01']],['出品から入金まで見届ける',['TC-02']]]},
 'CH-5':{title:'国内の円から、群島までの道をつなごう',story:'灯台の町では、仕入れ窓口と島へ向かう荷物の道が止まっています。架空の口座づくり、円の入金、練習財布への移動を一つずつ確かめましょう。',house:'灯台守の家',groups:[['申込と本人確認を学ぶ',['DX-01','DX-02']],['円から練習資金を運ぶ',['FI-01','FI-02','FI-03']],['資産と送り道を確かめる',['CR-01','CR-02','CR-03','CR-04']]]},
 'CH-6':{title:'自分の道を選び、帰りの船まで見届けよう',story:'学者ソラが、天空城から帰る道を調べています。現物・HLP・ステーキング・先物のどれか一つ、または運用を見送る道を選べます。',house:'学者の家',groups:[]},
};
const routeQuests={spot:'HY-SPOT',hlp:'HY-HLP',stake:'HY-STAKE',perp:'HY-PERP'};
const routeLabels={journey:'今回は運用を見送る',spot:'現物の売買を学ぶ',hlp:'HLPの預入と引出しを学ぶ',stake:'ステーキングの委任と帰りを学ぶ',perp:'先物の建玉と決済を学ぶ'};
const completed=(state,id)=>!!questState(state,id)?.completed;

function chapterMilestones(state,id,currentIndex){
 const config=chapterStories[id];
 if(id==='CH-0'){
  const talked=!!questState(state,'PR-01')||state.worldState.talked.some(x=>x.startsWith('npc:CH-0:0:'));
  return [
   {label:'お願いの話を聞く',state:talked?'done':'current'},
   {label:'メールの言葉を写す',state:completed(state,'PR-01')?'done':talked?'current':'later'},
   {label:'旅人の手帳を受け取る',state:state.inventory.includes('traveler-notebook')?'done':'later'},
  ];
 }
 if(id==='CH-6'){
  const route=routeLabels[state.selectedRoute]?state.selectedRoute:'journey',lab=routeQuests[route];
  const exitDone=completed(state,'HY-EXIT');
  return [
   {label:routeLabels[route],state:route==='journey'?(exitDone?'done':'current'):completed(state,lab)?'done':'current'},
   {label:'帰りの受取まで確かめる',state:exitDone?'done':currentIndex===1?'current':'later'},
   {label:'町の最後の確認に挑む',state:state.bossStates[id]?.completed?'done':currentIndex===2?'current':'later'},
  ];
 }
 const groups=config.groups.map(([label,ids],i)=>({label,state:ids.every(qid=>completed(state,qid))?'done':i===currentIndex?'current':'later'}));
 groups.push({label:'町の最後の確認に挑む',state:state.bossStates[id]?.completed?'done':currentIndex===config.groups.length?'current':'later'});
 return groups;
}

function suggestedQuest(state,id){
 if(id==='CH-0')return completed(state,'PR-01')?null:questById['PR-01'];
 if(id==='CH-6'){
  const lab=routeQuests[state.selectedRoute];
  if(lab&&!completed(state,lab))return questById[lab];
  return completed(state,'HY-EXIT')?null:questById['HY-EXIT'];
 }
 if(id==='CH-5'){
  for(const qid of ['DX-01','DX-02']){
   const q=questById[qid];if(!completed(state,qid)&&questAvailable(state,q))return q;
  }
 }
 return quests.find(q=>q.chapterId===id&&!q.extra&&!q.extension&&!completed(state,q.id)&&questAvailable(state,q))??null;
}

function questGroupIndex(quest,id){
 if(id==='CH-6')return quest.id==='HY-EXIT'?1:0;
 return chapterStories[id].groups.findIndex(([,ids])=>ids.includes(quest.id));
}

function nextTown(state,id){
 if(id==='CH-0')return 'CH-1';
 const following=chapters[chapters.findIndex(c=>c.id===id)+1];
 if(following&&!state.worldState.seals.includes(following.id))return following.id;
 const next=chapters.find(c=>c.id!==id&&c.id!=='CH-0'&&!state.worldState.seals.includes(c.id));
 return next?.id??null;
}

// The usual NPC command already records conversations and awards its first XP
// once. A conversation after this quest's actual final step is the report; no
// new saved flag, reward or required learning operation is introduced here.
function reportedToClient(state,quest){
 const journal=state.journal??[],lastStep=quest.stepIds.at(-1);
 const finishedAt=journal.findLastIndex(entry=>entry.command?.type==='STEP'&&entry.command.id===lastStep);
 if(finishedAt<0)return false;
 return journal.slice(finishedAt+1).some(({command})=>command?.type==='NPC'&&command.index===0&&(command.chapterId??state.currentChapter)===quest.chapterId);
}

function unreportedRequest(state,chapterId){
 const journal=state.journal??[];
 const cleared=state.bossStates[chapterId]?.completed||state.worldState.seals.includes(chapterId);
 const lastBoss=journal.findLastIndex(row=>row.command?.type==='BOSS'&&row.command.id===chapterId);
 return Object.entries(state.questStates)
  .map(([key,record])=>({key,record,quest:questById[record.questId]}))
  .filter(({record,quest})=>record.completed&&quest?.chapterId===chapterId&&!reportedToClient(state,quest))
  .map(entry=>({...entry,finishedAt:journal.findLastIndex(row=>row.command?.type==='STEP'&&row.command.id===entry.quest.stepIds.at(-1))}))
  .filter(entry=>!cleared||entry.finishedAt>lastBoss)
  .sort((a,b)=>b.finishedAt-a.finishedAt||(b.key===state.activeQuestKey?1:0)-(a.key===state.activeQuestKey?1:0))[0]??null;
}

/** One clear invitation for the current town. Calls neither dispatch nor storage. */
export function getStoryGuide(state,{chapterId,view='world'}={}){
 const id=chapterById[chapterId??state.currentChapter]?chapterId??state.currentChapter:'CH-0';
 const config=chapterStories[id],base={eyebrow:id==='CH-0'?'はじめのミッション':`第${id.slice(3)}章のミッション`,title:config.title,story:config.story,houseName:config.house};
 const houseHint=`家の扉へ歩くか、地図の下の「${config.house}へ」から入れます。知らない言葉は酒場で聞けます。`;
 if(view==='home'&&!state.started)return {...base,eyebrow:'はじめてなら、ここから',title:'まずは郵便屋ミナの、小さなお願いから',story:chapterStories['CH-0'].story,houseName:chapterStories['CH-0'].house,instruction:'序章で、メールを開く・写す・保存する操作を一緒に練習しよう。好きな章から始めても大丈夫です。',actionLabel:'おすすめの序章へ出発',action:{type:'chapter',id:'CH-0'},milestones:[{label:'郵便屋の家で話を聞く',state:'current'},{label:'スマホで言葉を取り戻す',state:'later'},{label:'手帳を手に次の町へ',state:'later'}]};
 const resumeKey=chapterResumeKey(state,id);
 if(resumeKey){
  const record=state.questStates[resumeKey],quest=questById[record.questId],step=stepById[quest.stepIds[record.index]],brief=questBrief(quest),adventure=getAdventure(state,quest,step);
  return {...base,questId:quest.id,recordKey:resumeKey,routeId:record.routeId,client:brief.client,title:`${brief.client}の用事を、つづけよう`,story:`${brief.incident} ${brief.goal}`,instruction:`次の操作：${step.instruction} 途中の入力を残したまま、練習スマホへ戻れます。`,actionLabel:'いまのスマホ練習へ',action:{type:'resume',id:resumeKey},milestones:[{label:'依頼を受ける',state:'done'},{label:adventure?.currentStage?.title??'結果を一つずつ確かめる',state:'current'},{label:'結果を村人へ知らせる',state:'later'}],controlsHint:'町へ戻っても続きは残ります。「これは何？」や「酒場で聞く」から相談できます。'};
 }
 if(id==='CH-0'&&completed(state,'PR-01'))return {...base,title:'手帳を手に、次の町へ出発しよう',story:'メールの言葉が掲示板へ戻り、ミナから旅人の手帳をもらいました。次は商店のハルが、あなたを待っています。',instruction:'第1章の商店へ行こう。行き先を変えたいときは「章を選ぶ」から選べます。',actionLabel:'第1章の商店の町へ',action:{type:'chapter',id:'CH-1'},milestones:chapterMilestones(state,id),controlsHint:'受けた依頼や途中の作業は、手帳のように「依頼帳」から開けます。'};
 const report=unreportedRequest(state,id),finished=report?.quest;
 if(finished){
  const brief=questBrief(finished),reaction=getAdventure({...state,activeQuestKey:report.key},finished)?.latestReaction;
  return {...base,questId:finished.id,recordKey:report.key,routeId:report.record.routeId,client:brief.client,title:`結果を、${brief.client}へ知らせよう`,story:reaction?.text??'頼まれた用事を終えました。依頼人が、結果を待っています。',instruction:`${config.house}へ戻り、${brief.client}に結果を話そう。終えた操作は保存済みで、もう一度やり直す必要はありません。`,actionLabel:`${brief.client}へ結果を知らせる`,action:{type:'house',id:'client',index:0,questId:finished.id,recordKey:report.key,routeId:report.record.routeId},milestones:[{label:'頼まれた用事を終える',state:'done'},{label:'依頼人へ結果を話す',state:'current'},{label:'次の用事や町の最後の確認へ',state:'later'}],controlsHint:houseHint};
 }
 if(id!=='CH-0'&&!state.bossStates[id]?.completed&&bossAvailable(state,id))return {...base,title:'町の最後の封印を、確かめてほどこう',story:'町の用事が片付きました。最後は条件の違う5つの確認です。利益や速さではなく、一つずつ見直す力で町を守ります。',instruction:'章の試練へ進もう。5つを終えると、章印と町の人からの装備を受け取れます。',actionLabel:'町の最後の確認へ',action:{type:'boss',id},milestones:chapterMilestones(state,id,id==='CH-6'?2:config.groups.length),controlsHint:'間違えても、その場で直せます。必要な確認は装備でも飛ばしません。'};
 if(id!=='CH-0'&&(state.bossStates[id]?.completed||state.worldState.seals.includes(id))){
  if(state.worldState.seals.length===6&&!state.bossStates.hidden?.completed)return {...base,title:'六つの章印が、虹の道を照らした',story:'町の人と積み重ねた確認が、最後の道しるべになりました。任意の「虹の守護竜」へ挑めます。未受講のラボは、未受講のまま残ります。',instruction:'隠しボスへ進むか、好きな町の用事を続けられます。',actionLabel:'虹の守護竜の試練へ',action:{type:'boss',id:'hidden'},milestones:[{label:'六つの章印を集める',state:'done'},{label:'虹の守護竜の確認に挑む',state:'current'},{label:'虹誓の大剣を受け取る',state:'later'}]};
  const next=nextTown(state,id);
  return {...base,title:'町に戻った笑顔を、次の旅へ',story:'最後の確認を終え、章印と装備を受け取りました。未受講の寄り道や、ほかのラボも後から選べます。',instruction:next?`${chapterById[next].title}へ出発しよう。ほかの町から選んでも大丈夫です。`:'六つの町をいつでも訪ねられます。気になる用事や別条件の復習を選ぼう。',actionLabel:next?'次の町へ出発':'郵便屋のいる、旅立ちの村へ',action:{type:'chapter',id:next??'CH-0'},milestones:chapterMilestones(state,id),controlsHint:'章印は保存されています。未受講の講座が、自動で学習済みになることはありません。'};
 }
 const quest=suggestedQuest(state,id);
 if(quest){
  const brief=questBrief(quest),route=id==='CH-6'?(state.selectedRoute in routeLabels?state.selectedRoute:'journey'):null;
  const routeNote=id==='CH-6'?(route==='journey'?' 今は、運用を見送って帰りの受取を学ぶ道です。ラボを学びたいときは、この町の「学びたい道」から変えられます。':` 今は「${routeLabels[route]}」の道です。ほかのラボは未受講のままで大丈夫です。`):'';
  const fundingNote=quest.id==='FI-01'?' 次は申込済みという設定の「こみち交換所」で、口座づくりとは別の財布を使い、円の入金から学びます。':'';
  const clientName=id==='CH-0'?'ミナ':brief.client;
  return {...base,questId:quest.id,client:brief.client,title:quest.id==='PR-01'?config.title:`${brief.client}の困りごとを聞こう`,story:`${brief.incident} ${brief.goal}${fundingNote}${routeNote}`,instruction:`${config.house}で、${clientName}に話を聞こう。用事の内容を聞いてから、自分のペースで受けられます。`,actionLabel:`${config.house}へ`,action:{type:'house',id:'client',index:0,questId:quest.id},milestones:chapterMilestones(state,id,questGroupIndex(quest,id)),controlsHint:houseHint};
 }
 return {...base,instruction:'町の人に、次の用事を聞いてみよう。好きな町へ出かけても大丈夫です。',actionLabel:`${config.house}へ`,action:{type:'house',id:'client',index:0},milestones:chapterMilestones(state,id),controlsHint:houseHint};
}
