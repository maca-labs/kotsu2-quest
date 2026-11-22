import {getPhoneGuideView} from './phone-guide.js';
import {scenarioForStep,scenarioSummary} from './finance.js';
import {practiceProfile,comparisonPanels} from './content-points.js';
import {getStepOpenAppId,getPhoneHomeApps,getPhoneSurfaceAppId,phoneAppName} from './phone-navigation.js';
import {getFxSelectionSummary} from './fx-guidance.js';
import {journeyTransfer} from './journey-slip.js';

const appNames={memo:'旅人のメモ',mail:'ゲーム内メール',browser:'まいにちストア',points:'コツコツモール',bank:'ほしあかり銀行',wallet:'練習ウォレット',hyper:'そらの運用ラボ',fx:'ほしぞらFX',market:'星札マーケット',gift:'練習ギフト',exchange:'ポイント交換所'};
export const phoneFieldLabels={asset:'送る資産',receiveAsset:'受け取る資産',network:'送るネットワーク',receiveNetwork:'受け取るネットワーク',address:'練習用の宛先',quantity:'数量',sellQuantity:'売却する数量',withdrawQuantity:'引き出す数量',moveDestination:'移動先',delegateQuantity:'委任する数量',undelegateQuantity:'委任を解除する数量',returnQuantity:'現物へ戻す数量',validator:'預け先の候補',collateral:'配分する証拠金',leverage:'倍率',side:'買い・売り',symbol:'銘柄',orderType:'注文方法',stopPrice:'SLの発動価格',closeQuantity:'決済する数量',limitPrice:'指値の価格',limitQuantity:'指値の数量',returnHorizon:'戻したい時期',route:'学ぶ経路',wallet:'練習用ウォレット',available:'使える残高',received:'受け取った数量',expected:'受取予定の数量',valuation:'評価額',profit:'確定した利益',loss:'損失額',funding:'資金調達料',notional:'建玉金額',totalHype:'HYPEの合計数量',receivedSpot:'現物へ届いた数量',extraQuantity:'追加で預ける数量'};

export function selectQuestMail(state,quest,step={}){const ids={'PR-01':'intro-mail','PO-01':'registration-mail','BK-01':'bank-verification','PO-03':'order-mail','PO-04':'order-mail','PO-05':'approval-mail','PO-06':'gift-mail'},id=step.mailId??ids[quest?.id],mail=id&&state.phoneState?.mailById?.[id];return mail?[id,mail]:null;}

function marketPhoto(doc,back){
 const canvas=doc.createElement('canvas');
 canvas.width=144;canvas.height=82;
 canvas.style.cssText='display:block;image-rendering:pixelated;width:100%;max-width:236px;height:auto;margin:6px auto;border-radius:5px';
 canvas.setAttribute('role','img');
 canvas.setAttribute('aria-label',back?'星札3枚の裏面。右端のカードの右下に、小さな白いすり傷がある。':'星札3枚の表面。星の絵が並ぶ星版2026のセット。');
 const ctx=canvas.getContext('2d');
 if(!ctx)return canvas;
 const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 rect(0,0,144,82,'#e5e2d7');
 for(let i=0;i<3;i++){
  const x=9+43*i,y=7+(i===1?3:0);
  rect(x+2,y+3,38,63,'#b5b3a7');
  rect(x,y,38,63,'#493e5c');rect(x+2,y+2,34,59,'#d3b982');
  if(back){
   rect(x+4,y+4,30,55,'#36455c');rect(x+7,y+7,24,49,'#506784');
   rect(x+11,y+25,16,10,'#d4b578');rect(x+15,y+21,8,18,'#d4b578');rect(x+17,y+26,4,8,'#506784');
   if(i===2){rect(x+26,y+52,3,2,'#fff9e4');rect(x+29,y+50,3,2,'#fff9e4');rect(x+32,y+49,2,1,'#fff9e4');}
  }else{
   rect(x+5,y+6,28,32,['#4d8d8a','#a56b50','#717ca3'][i]);
   rect(x+11,y+20,16,4,'#fff0bc');rect(x+17,y+13,4,17,'#fff0bc');
   for(let j=0;j<3;j++)rect(x+7,y+43+5*j,22-3*j,2,'#79694d');
  }
 }
 return canvas;
}

/** Native local-only app surfaces. onAction is called only after an explicit user operation. */
export function renderPhonePanel({document:doc,state,step,quest,onAction,onNavigate}) {
 if(!step||!doc)return null;
 const el=(tag,text='',style='')=>{const n=doc.createElement(tag);if(text)n.textContent=String(text);if(style)n.style.cssText=style;return n;};
 const root=el('section','','border:1px solid #c8d9d1;border-radius:12px;background:#f9fcfa;margin:0 0 18px;overflow:hidden;color:#233d35;font-family:system-ui,sans-serif');
 const journeyQuest=quest?.id?.startsWith('CR-');
 const surface=getPhoneSurfaceAppId(step);
 let appName=appNames[surface]||'練習スマホ';
 if(journeyQuest)appName=step.displayAppId==='switcher'?'最近使ったアプリ':phoneAppName(surface,quest.id)??appName;
 if(/スマホホーム/.test(step.screenTitle??''))appName='練習スマホ';
 root.className='native-phone-panel';root.setAttribute('aria-label',`${appName}の画面`);
 const head=el('div','','padding:12px 14px;background:#dbeae2;border-bottom:1px solid #c4d7cd;display:flex;gap:8px;align-items:center;justify-content:space-between');
 head.append(el('strong',appName),el('span','DEMO','font-size:11px;letter-spacing:.13em;border:1px solid #91af9e;padding:3px 5px;border-radius:4px'));root.append(head);
 const body=el('div','','padding:14px;display:grid;gap:11px');root.append(body);
 const text=(s,small=false)=>el('p',s,`margin:0;line-height:1.7;font-size:${small?13:16}px;overflow-wrap:anywhere`);
 const box=(title,copy)=>{const n=el('div','','padding:12px;background:white;border:1px solid #d8e2dc;border-radius:8px');if(title)n.append(el('strong',title,'display:block;font-size:15px;margin-bottom:5px'));if(copy)n.append(text(copy));return n;};
 const row=(label,value)=>{const n=el('div','','display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:7px 0;border-bottom:1px solid #e4eae6');n.append(el('span',label,'font-size:13px'),el('strong',value,'text-align:right;overflow-wrap:anywhere'));return n;};
 const button=(label,fn,primary=false)=>{const b=el('button',label,`min-height:44px;padding:9px 12px;border:1px solid ${primary?'#34775b':'#bed0c4'};border-radius:7px;background:${primary?'#326e55':'white'};color:${primary?'white':'#274b3b'};font:inherit;cursor:pointer;line-height:1.4`);b.type='button';if(primary)b.setAttribute('data-guide-target','true');b.addEventListener('click',fn);return b;};
 const actionButton=(label,value=step.value)=>button(label,()=>onAction?.(value),true);
 const fmt=n=>typeof n==='number'?n.toLocaleString('ja-JP',{maximumFractionDigits:6}):String(n??'');
 const route=state.questStates?.[state.activeQuestKey]?.routeId||state.selectedRoute||'journey';
 let scenario;try{scenario=state.financialScenarios?.[scenarioForStep(step,{routeId:route},state)];}catch{}
 const accounts=scenario?.accounts||{};
 const ledger=(keys)=>{const n=el('div','','background:white;border-radius:8px;padding:4px 10px');for(const r of scenarioSummary(scenario).filter(r=>!keys||keys.includes(r.key)).slice(0,7))n.append(row(r.label,fmt(r.value)));return n;};
 const pixel=(kind,width=144,height=96)=>{const c=el('canvas','','display:block;image-rendering:pixelated;width:100%;max-width:240px;margin:auto;border-radius:6px;background:#edf2e8');c.width=width;c.height=height;c.setAttribute('role','img');c.setAttribute('aria-label',kind==='person'?'画面内の架空人物':kind==='id'?'教材専用の本人確認カード':'練習用の日用品セット');const x=c.getContext('2d');if(!x)return c;
  const r=(a,b,w,h,color)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};
  if(kind==='person'||kind==='id'){r(0,0,width,height,'#e1ede7');if(kind==='id'){r(5,7,width-10,height-14,'#fff9e6');r(9,11,width-18,11,'#739b8d');}const ox=kind==='id'?20:width/2-16,oy=kind==='id'?31:13;r(ox+7,oy,19,8,'#3f3a40');r(ox+3,oy+8,28,22,'#f1c7a2');r(ox+3,oy+7,5,11,'#3f3a40');r(ox+26,oy+7,5,11,'#3f3a40');r(ox+9,oy+15,3,3,'#3f3a40');r(ox+22,oy+15,3,3,'#3f3a40');r(ox+13,oy+24,8,2,'#a87363');r(ox-1,oy+31,36,29,'#668ea3');r(ox+12,oy+30,9,21,'#f3edd9');if(kind==='id'){for(let j=0;j<4;j++)r(65,35+j*10,58-j*6,3,'#bcc9bb');r(100,74,27,5,'#91b394');}}
  else{r(0,0,width,height,'#e5efe7');r(13,35,28,48,'#87b3a8');r(17,25,20,13,'#54786c');r(18,53,18,14,'#f6efce');r(50,49,42,34,'#e4d5ad');r(55,41,32,10,'#f7f4e8');r(61,55,21,6,'#9eae9e');r(104,58,27,25,'#dfb39c');r(109,52,18,9,'#9d7163');}
  return c;};
 const navigate=id=>onNavigate?.(id);
 let handlesAction=false;

 if(step.phoneScreen==='switcher'){
  const apps=box('最近使ったアプリ','メールと、入力していたアプリは別の場所です。戻っても入力は残っています。');
  apps.append(actionButton(step.openAppId==='memo'?'旅人のメモ — 入力していた画面':'ブラウザー — 入力中のコツコツモール'));
  apps.append(button('メールを見直す',()=>navigate('mail')));body.append(apps);
  return {element:root,handlesAction:true};
 }

 if(!journeyQuest&&/ホームへ|最近使ったアプリ|アプリの一覧/.test(step.instruction||'')){
  body.append(text('練習アプリを選ぶ'));const grid=el('div','','display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px');
  for(const[id,name]of Object.entries(appNames).slice(0,9))grid.append(button(name,()=>navigate(id)));body.append(grid);
 }
 if(/スマホホーム/.test(step.screenTitle??'')){const grid=el('div','','display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px');const wanted=getStepOpenAppId(step);for(const [id,name]of getPhoneHomeApps(quest,step)){const target=id===wanted;const icon=button(name,()=>target?onAction?.(step.value):onNavigate?.(id),target);icon.setAttribute('data-phone-app',id);grid.append(icon);}body.append(grid);return {element:root,handlesAction:true};}
 if(quest?.id==='CR-01'){
  const number=Number(step.id.slice(-3));
  if(number<=5){
   const map=box('銀行から自分の財布まで');map.append(row('銀行の明細','円'),row('交換所で買う教材コイン','MCHI'),row('いま財布で操作するコイン','Mock USDC・Mock ETH'));body.append(map);
  }else if(number<=9){
   const map=box('自分の財布と、コインを送る道');map.append(row('財布の識別子',journeyTransfer.wallet),row('いまコインがある道',journeyTransfer.network));body.append(map);
  }else if(number<=13){
   body.append(box('ハイリキの中の地図','HyperCoreは、入金した資産で取引や運用をする場所。HyperEVMはアプリを動かす別の場所です。'));
  }else if(number<=16){
   body.append(box('自分の財布の残高明細',journeyTransfer.wallet+' ／ '+journeyTransfer.network),ledger(['walletUSDC','walletETH']));
  }else{
   body.append(box('送る前の確認メモ','どの財布から、どのコインを、どの道で、どの宛先に送るか。ガスを払うコインの単位も見よう。'));
  }
 }else if(quest?.id==='CR-02'){
  const number=Number(step.id.slice(-3));
  const mailBody=number===19||(step.appId==='mail'&&step.screenTitle==='本文');
  if((number>=16&&number<=19)||mailBody){
   const message=box(number===16?'新着メール':'復旧のご案内');
   if(number===16)message.append(text('「サポート」から知らせが1件届いています。'));
   else message.append(row('差出人の表示名','サポート'),number>=18?row('差出人の詳細','おたすけ緊急係（架空）'):text('差出人名を開くと、名乗っている相手を詳しく見られます。'));
   if(mailBody)message.append(text('本文「復元情報を教えてください」'),text('本文を離れる操作は、メッセージの外にあります。',true));
   body.append(message);
  }else if(number===20){
   body.append(box('ゲーム内メール・受信トレイ','偽の案内を閉じました。練習スマホのホームから、自分で取引練習アプリを開けます。'));
  }else if(number>=22){
   body.append(box('ゲーム内ヘルプ','練習ウォレットの復元情報は、誰かに渡すと財布を操作されるおそれがあります。連絡が来たら、本文を閉じてアプリのヘルプを開けます。'));
  }else if(number===9){
   body.append(box('練習ウォレット・接続済み','接続の確認が終わりました。「アプリ切替」から、接続を求めたアプリに戻れます。'));
  }else if(number===10){
   body.append(box('最近使ったアプリ','開いていた取引練習アプリに戻ると、次に取引を有効にできます。'));
  }else{
   const permission=box('接続を求めるアプリ');permission.append(row('サービス名','そらの取引練習'),row('自分の練習ウォレット',journeyTransfer.wallet));
   body.append(permission,box('許可する内容',number<=8?'接続すると、この識別子をアプリに表示できます。':'取引を有効にすると、アプリで注文を練習できます。'));
  }
 }else if(quest?.id==='CR-03'){
  const number=Number(step.id.slice(-3));
  const draft=scenario?.phoneState?.formDrafts?.['CR-03']??{};
  if(number<=7){
   const receive=box('ハイリキ（HyperCore）の受取カード');
   receive.append(row('受け取る資産','Mock '+journeyTransfer.asset),row('受け取る道',journeyTransfer.network),row('入金用の宛先',journeyTransfer.recipient));
   if(number>=6)receive.append(row('今回の最低額',fmt(journeyTransfer.minimum)+' Mock USDC'));
   body.append(receive);
  }else if(number===8){
   body.append(box('コピーした入金用の宛先',draft.clipboard??'まだコピーしていません。'));
  }else if(number<=25){
   const send=box('自分の練習ウォレットから送る');
   send.append(row('送信元',journeyTransfer.wallet),row('送る資産',draft.asset?'Mock '+draft.asset:'未選択'),row('送る道',draft.network??'未選択'),row('宛先',draft.address??'未入力'));
   if(number>=17)send.append(row('送信数量',draft.quantity===undefined?'未入力':fmt(Number(draft.quantity))+' Mock USDC'));
   body.append(send);
  }else if(number>=31){
   body.append(box('送信元の残高明細',journeyTransfer.wallet),ledger(['walletUSDC','walletETH']));
  }else{
   const receipt=box(scenario?.data?.depositStatus==='received'?'ハイリキの到着記録':'ハイリキへの入金を処理中');
   receipt.append(row('今回の入金先',journeyTransfer.recipient),row('処理中',fmt(accounts.incomingUSDC)+' Mock USDC'),row('使える残高',fmt(accounts.availableUSDC)+' Mock USDC'));body.append(receipt);
  }
 }else if(step.appId==='mail'){
  const selected=selectQuestMail(state,quest,step);
  body.append(el('div','受信トレイ','font-size:12px;font-weight:700;letter-spacing:.08em'));
  if(selected){const[id,m]=selected;if(m.read===false||/受信一覧|受信トレイ/.test(step.screenTitle??'')){body.append(button((m.read?'':'● ')+(quest?.id==='PR-01'?'郵便屋の練習メール：':'')+(m.subject||m.title||'練習メール'),()=>onAction?.(step.value),true));return {element:root,handlesAction:true};}const message=box(m.subject||m.title||'旅人さんへのお知らせ');message.append(text(`差出人：${quest?.id==='PR-01'?'郵便屋ミナ（練習）':m.from||'ゲーム内の案内係'}`,true),text(m.body||m.text||'このお知らせは練習用です。'));
   if(m.code)message.append(box(quest?.id==='PR-01'?'メールの合言葉':'メールの確認コード',String(m.code)));
   if(m.warning)message.append(text('この要求には応じず、本文の外のボタンから案内を閉じよう。',true));body.append(message);
   if(/コピー/.test(step.instruction||'')){body.append(actionButton(step.questId==='PR-01'?'合言葉をコピー':'このメールの練習コードをコピー',step.value??m.code));handlesAction=true;}
   else if(/スター/.test(step.instruction||'')){body.append(actionButton('注文メールにスターを付ける',step.value));handlesAction=true;}
   else if(/この案内を閉じる/.test(step.instruction||'')){body.append(actionButton('この案内を閉じる'));handlesAction=true;}
   else if(/通知を開く|メールを開く|受信.*開く/.test(step.instruction||'')&&step.type==='tap'){body.append(actionButton('このメールを開く'));handlesAction=true;}
  }else body.append(box('受信トレイ','新しい案内が届くと、ここに表示されます。'));
 }else if(quest?.id==='FX-03'){body.append(box('コツコツモール · FX練習案件','先に控えた条件と、FXで終えた取引の記録を比べます。注文や送金はここでは行いません。'),ledger(['pendingPoints','approvedPoints']));
 }else if(quest?.id?.startsWith('BK-02')){
  const card=box('練習用カード — 成人の架空データ');card.append(pixel('id'),row('氏名',practiceProfile.name),row('生年月日',practiceProfile.birthday),row('有効期限',practiceProfile.documentExpires));body.append(card);
  if(step.field==='cardPosition'||step.field==='facePosition'){
   const face=step.field==='facePosition',frame=el('div','','position:relative;padding:16px;border:3px dashed #638f7d;border-radius:16px;background:#eaf1ed');frame.append(pixel(face?'person':'id'),text(face?'画面内の人物を枠へ合わせます。実カメラは使いません。':'画面内のカードを読取り枠へ合わせます。',true));body.append(frame,button(face?(step.value==='bright'?'人物を明るい場所の枠へ動かす':'人物を顔の枠に合わせる'):'カードを読取り枠に置く',()=>onAction?.(step.value??'inside'),true),button('枠の外に置いて比べる',()=>onAction?.('outside')));handlesAction=true;
  }else if(/顔|正面|右|左|まばたき/.test(step.instruction||'')){body.append(pixel('person'),text('画面内の架空人物だけを動かす練習です。',true));}
  else body.append(text('申込内容とカードを見比べます。入力する番号も教材に表示された練習値です。',true));
 }else if(step.appId==='bank'){
  body.append(box('普通預金の練習',`${practiceProfile.bank} / ${practiceProfile.branch}`));
  if(quest?.id==='TR-01'){const recipient=box('今回の振込先カード');recipient.append(row('支店',practiceProfile.branch),row('口座の種類',practiceProfile.accountType),row('口座番号',practiceProfile.accountNumber),row('受取人',practiceProfile.kana));body.append(recipient,ledger());}
  else body.append(box('申込者の練習プロフィール',`${practiceProfile.name}（成人）\n${practiceProfile.address}`),box('申込状況',scenario?.data?.status||'受付 → 本人確認 → 審査 → 完了通知'));
 }else if(step.appId==='wallet'||step.appId==='hyper'){
  body.append(text('非公式の学習用シミュレーション。表示資金はすべて架空。',true));
  if(quest?.id==='HY-EXIT'){
   const receiver=box('今回の受取カード');receiver.append(row('資産','Mock USDC'),row('ネットワーク','Arbitrum'),row('練習用の宛先','DEMO-WALLET-A'),row('教材手数料','1 Mock USDC・送信額から控除'));body.append(receiver,ledger());
  }else if(quest?.id==='CR-04'){
   const number=Number(step.id.slice(-3));
   if(number>=2&&number<=3)body.append(box('現物','買ったコインの値段が下がると、同じ枚数でも売って受け取れる額は減ります。'));
   else if(number>=5&&number<=6)body.append(box('HLP','戦略の利益も損失も分け合います。この教材では、最後に預けた日から4日後に引き出せます。'));
   else if(number>=8&&number<=10)body.append(box('HYPEステーキング','枚数が増えても、値下がりすれば全体の評価額は減ります。委任を解除できるまで1日、現物へ戻すときにさらに7日かかります。'));
   else if(number>=12&&number<=13)body.append(box('無期限先物（任意）','担保にしたお金で値動きへの取引をします。保有中に費用がかかることや、損失が大きくなると取引が自動で終わることがあります。'));
   else body.append(box('運用方法を比べる','現物・HLP・ステーキング・先物のほか、今回は運用せず出金を練習する道があります。'));
  }else if(quest?.id==='HY-STAKE'){
   body.append(box('HYPEの現在地','現物 → ステーキング → 委任 → ステーキング → 待機 → 現物'),ledger(['spotHYPE','stakingHYPE','delegatedHYPE','waitingHYPE','availableUSDC']),box('預け先の候補（すべて架空）','灯台ノード / 森の歯車 / 星波ノード。候補の稼働状態と教材手数料を見比べます。'));
  }else if(quest?.id==='HY-HLP'){body.append(box('HLP — 戦略の損益を共有','固定利息ではありません。預入の評価額と、今使える手元残高を分けます。'),ledger(['availableUSDC','hlpUnits','hlpValue']),box('出金ロック',`教材時間${Math.floor((scenario?.simulationTime||0)/86400000)}日目。最後の預入から4日を数えます。`));}
  else{const price=scenario?.data?.price??scenario?.data?.markPrice??scenario?.data?.perp?.position?.markPrice??100;body.append(box(quest?.id==='HY-PERP'?'教材トークン / 分離証拠金':'教材HYPE / 現物',`教材の表示価格 ${fmt(price)} Mock USDC。実相場ではありません。`));
   if(quest?.id==='HY-SPOT'){const order=box('注文の状態',scenario?.data?.orderStatus||(/指値/.test(step.instruction||'')?'指値は価格条件がそろうまで保留です。':'成行は今回の教材価格で注文します。'));body.append(order);}
   body.append(ledger());if(quest?.id==='HY-PERP')body.append(box('注文の内訳','証拠金・倍率・建玉金額・数量を、別の値として確認します。SLの発動と約定も分けます。'));
  }
 }else if(quest?.id==='TC-01'||quest?.id==='TC-02'){
  const item=comparisonPanels.cards;
  const number=Number(step.id.slice(-3));
  const buying=quest.id==='TC-01';
  const draft=scenario?.phoneState?.formDrafts?.[quest.id]??{};
  const inspectFront=buying?'TC-01-009':'TC-02-003',inspectBack=buying?'TC-01-010':'TC-02-004';
  const inspections=state.phoneState?.cardInspections??[];
  if(buying&&number<=8){
   if(number<=3)body.append(box('商品を探す','市場で調べる名前は「星の旅人セット」です。'));
   else{
    const result=box(draft.query??'星の旅人セット');
    if(draft.salesFilter==='sold')result.append(row('価格の種類','売れた商品'));
    if(draft.edition)result.append(row('版と枚数',draft.edition+'・3枚'));
    if(draft.condition==='minor-scratches')result.append(row('状態',item.condition));
    if(number===8)result.append(row('同じ条件で売れた値段',item.soldComparables.map(v=>fmt(v)+'円').join(' ／ ')));
    body.append(result);
   }
  }else if((buying&&number<=12)||(!buying&&number>=3&&number<=6)){
   const product=box(item.productName);
   if(inspections.includes(inspectFront)){
    const back=inspections.includes(inspectBack);
    product.append(marketPhoto(doc,back),text(back?'裏面：右下に小さなすり傷があります。':'表面：同じ版のカードが3枚そろっています。'));
   }else product.append(text(buying?'候補Aの写真を開いて、版と枚数を確かめよう。':'届いた3枚を手に取って、写真と見比べよう。'));
   if(step.id===inspectFront||step.id===inspectBack){
    const openPhoto=actionButton(step.label);
    openPhoto.style.marginBlockStart='4em';
    product.append(openPhoto);handlesAction=true;
   }
   body.append(product);
  }else if(buying){
   body.append(box('仕入れ先から届くときの費用',`カード代 ${fmt(item.purchasePrice)}円 ＋ 届けてもらう送料 ${fmt(item.inboundShipping)}円`));
  }else if(number===1||number===2){
   body.append(box(number===1?'注文した品物・到着待ち':'星札マーケットからの到着通知',number===1?item.productName:'注文した3枚が届きました。包みを開けて中身を確かめよう。'));
  }else if(number<=22){
   const listing=box(number===21||number===22?'出品する内容':'出品の下書き');
   if(number===7||number===8){
    const back=number===8;
    listing.append(marketPhoto(doc,back),text(back?'選べる裏面写真：右下の傷が見えます。':'選べる表面写真：3枚の版と絵が見えます。'));
   }
   const attached=[draft.frontPhoto==='card-front'?'表面':'',draft.backPhoto==='card-back'?'裏面':''].filter(Boolean);
   listing.append(row('添付した写真',attached.join('・')||'まだありません'));
   if(draft.productName)listing.append(row('商品名',draft.productName));
   if(draft.edition)listing.append(row('版',draft.edition));
   if(draft.condition==='minor-scratches')listing.append(row('状態',item.condition));
   if(draft.description)listing.append(text(draft.description));
   if(draft.salePrice)listing.append(row('売りたい値段',fmt(Number(draft.salePrice))+'円'));
   if(draft.delivery==='tracked-200')listing.append(row('配送方法','追跡あり・'+fmt(item.outboundShipping)+'円'));
   body.append(listing);
  }else if(number===23)body.append(box('出品中',item.productName+'を出品しました。買ってくれる人を待っています。'));
  else if(number===24)body.append(box('星札マーケットからの購入通知','このセットを買った人がいます。これから梱包して届けます。'));
  else if(number<=28){
   const parcel=box('発送の準備');
   parcel.append(row('折れを防ぐ台紙',draft.bendProtection?'つけました':'これから'),row('水を防ぐ袋',draft.waterProtection?'入れました':'これから'));
   body.append(parcel);
  }else if(number===29)body.append(box('発送した荷物',item.productName+'を送りました。買った人が受け取るのを待っています。'));
  else if(number===30)body.append(box('星札マーケットからの受取通知','買った人がカードを受け取りました。売上の明細を開けます。'));
 }else if(step.appId==='fx'){
  const selection=getFxSelectionSummary(state,step);if(selection){const current=box(selection.title);for(const item of selection.rows)current.append(row(item.label,item.value));body.append(current);for(const explanation of selection.cards)body.append(box(explanation.title,explanation.text));}else{const position=scenario?.data?.position,fill=scenario?.data?.fills?.at(-1),pairName=pair=>({USDJPY:'USD/JPY 米ドル/円',EURJPY:'EUR/JPY ユーロ/円'}[pair]??pair);body.append(box('いまの建玉',position?`${pairName(position.pair)} · ${position.side==='buy'?'買い':'売り'} · ${fmt(position.baseQuantity)}通貨 · 開始${fmt(position.entryPrice)}円`:'未決済の建玉は0件です。'));if(fill)body.append(box('直前に成立した記録',`${fill.kind==='new'?'新規':'決済'}${fill.side==='buy'?'買い':'売り'} · ${fmt(fill.baseQuantity)}通貨 · ${fmt(fill.price??fill.entryPrice)}円`));}body.append(box('数量の単位','この教材では1 lot = 1,000通貨。買い・売り、新規・決済は別の操作です。'),ledger());
 }else if(step.appId==='browser'||step.appId==='points'){
  if(quest?.id==='PO-02'){for(const offer of comparisonPanels.shoppingOffers)body.append(box(`${offer.name} · ${offer.points} P`,`追加費用${offer.additionalCost.toLocaleString('ja-JP')}円 / ${offer.description}`));}
  else if(quest?.id==='PO-03'){const goods=box('日用品セット');goods.append(pixel('goods'),row('洗剤','900円'),row('ティッシュ','600円'),row('石けん大','500円'),row('送料','0円'));body.append(goods);}
  else body.append(box('練習ブラウザー','kotsukotsu.example.invalid / ゲーム内だけの架空サービス'),box('会員プロフィール',`${practiceProfile.name} / ${practiceProfile.email}`));
  if(step.id==='P008'){body.append(actionButton('この架空サービスの利用条件を開く'));handlesAction=true;}
  if(step.id==='P009')body.append(box('コツコツモール — 練習の利用条件','このサービスはゲームの中だけの教材です。架空の成人プロフィールと練習パスワードを使います。登録しただけでポイントは増えません。案件ごとの条件を確認し、買った記録と受取まで確かめます。実際の注文や支払いは行いません。'));
  if(quest?.id==='PO-01'&&getPhoneGuideView(state,quest,step)?.pasted)body.append(box('確認コードの欄へ写した内容',String(state.phoneState?.formDrafts?.['PO-01']?.registrationCode??'')));if(quest?.id!=='PO-01')body.append(ledger());
 }else if(step.appId==='gift'||step.appId==='exchange'){
  body.append(box('交換先を見比べる','最低交換数・単位・手数料・有効期限・使う予定を確認します。'),ledger());
 }else if(step.appId==='memo'){
  body.append(box('いまの依頼',quest?.title||'小さな一歩'),box('ゲーム内の一時メモ（コピーした言葉）',getPhoneGuideView(state,quest,step)?.copyText??'この用事の言葉は、まだコピーしていません。'));
  if(quest?.id==='PR-01'){
   const memo=box('ミナの買い物メモ','きょうは郵便屋さんから、大切な知らせが届く日。メールを開いて、届いた言葉をこのメモへ残そう。');
   if(step.id==='PR-01-002'){const paper=el('div','','max-height:230px;overflow:auto;border-top:1px dashed #b6c8ba;margin-top:10px');paper.append(text('持ち物：旅人の杖、空っぽの手帳袋。',true),el('div','道の先には、お店と港と空の島。まずは、この村の小さな用事を片づけよう。','padding:35px 0 55px;line-height:1.8;font-size:14px'),actionButton('今日の用事を開く'));memo.append(paper);handlesAction=true;}
   else memo.append(box('今日の用事','郵便屋ミナからのメールを開く。合言葉をゲーム内コピーして、メモへ写して保存する。'));
   body.append(memo);if(getPhoneGuideView(state,quest,step)?.pasted)body.append(box('メモの欄へ写した言葉',String(state.phoneState?.formDrafts?.['PR-01']?.introPhrase??'')));
   if(state.phoneState?.mailById?.['intro-mail']?.read)body.append(box('読んだメールの控え','合言葉は、開いたメール本文で確かめられます。入力にはゲーム内コピーを使えます。'));
  }
 }
 if(!body.childNodes.length)return null;
 return {element:root,handlesAction};
}
