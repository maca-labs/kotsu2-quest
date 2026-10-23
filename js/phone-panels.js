import {scenarioForStep,scenarioSummary} from './finance.js';
import {practiceProfile,comparisonPanels} from './content-points.js';

const appNames={memo:'旅人のメモ',mail:'ゲーム内メール',browser:'まいにちストア',points:'コツコツモール',bank:'ほしあかり銀行',wallet:'練習ウォレット',hyper:'そらの運用ラボ',fx:'ほしぞらFX',market:'星札マーケット',gift:'練習ギフト',exchange:'ポイント交換所'};
export const phoneFieldLabels={asset:'送る資産',receiveAsset:'受け取る資産',network:'送るネットワーク',receiveNetwork:'受け取るネットワーク',address:'練習用の宛先',quantity:'数量',sellQuantity:'売却する数量',withdrawQuantity:'引き出す数量',moveDestination:'移動先',delegateQuantity:'委任する数量',undelegateQuantity:'委任を解除する数量',returnQuantity:'現物へ戻す数量',validator:'預け先の候補',collateral:'配分する証拠金',leverage:'倍率',side:'買い・売り',symbol:'銘柄',orderType:'注文方法',stopPrice:'SLの発動価格',closeQuantity:'決済する数量',limitPrice:'指値の価格',limitQuantity:'指値の数量',returnHorizon:'戻したい時期',route:'学ぶ経路',wallet:'練習用ウォレット',available:'使える残高',received:'受け取った数量',expected:'受取予定の数量',valuation:'評価額',profit:'確定した利益',loss:'損失額',funding:'資金調達料',notional:'建玉金額',totalHype:'HYPEの合計数量',receivedSpot:'現物へ届いた数量',extraQuantity:'追加で預ける数量'};

/** Native local-only app surfaces. onAction is called only after an explicit user operation. */
export function renderPhonePanel({document:doc,state,step,quest,onAction,onNavigate}) {
 if(!step||!doc)return null;
 const el=(tag,text='',style='')=>{const n=doc.createElement(tag);if(text)n.textContent=String(text);if(style)n.style.cssText=style;return n;};
 const root=el('section','','border:1px solid #c8d9d1;border-radius:12px;background:#f9fcfa;margin:0 0 18px;overflow:hidden;color:#233d35;font-family:system-ui,sans-serif');
 root.className='native-phone-panel';root.setAttribute('aria-label',`${appNames[step.appId]||'練習アプリ'}の画面`);
 const head=el('div','','padding:12px 14px;background:#dbeae2;border-bottom:1px solid #c4d7cd;display:flex;gap:8px;align-items:center;justify-content:space-between');
 head.append(el('strong',/スマホホーム/.test(step.screenTitle??'')?'練習スマホ':appNames[step.appId]||'練習スマホ'),el('span','DEMO','font-size:11px;letter-spacing:.13em;border:1px solid #91af9e;padding:3px 5px;border-radius:4px'));root.append(head);
 const body=el('div','','padding:14px;display:grid;gap:11px');root.append(body);
 const text=(s,small=false)=>el('p',s,`margin:0;line-height:1.7;font-size:${small?13:16}px;overflow-wrap:anywhere`);
 const box=(title,copy)=>{const n=el('div','','padding:12px;background:white;border:1px solid #d8e2dc;border-radius:8px');if(title)n.append(el('strong',title,'display:block;font-size:15px;margin-bottom:5px'));if(copy)n.append(text(copy));return n;};
 const row=(label,value)=>{const n=el('div','','display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:7px 0;border-bottom:1px solid #e4eae6');n.append(el('span',label,'font-size:13px'),el('strong',value,'text-align:right;overflow-wrap:anywhere'));return n;};
 const button=(label,fn,primary=false)=>{const b=el('button',label,`min-height:44px;padding:9px 12px;border:1px solid ${primary?'#34775b':'#bed0c4'};border-radius:7px;background:${primary?'#326e55':'white'};color:${primary?'white':'#274b3b'};font:inherit;cursor:pointer;line-height:1.4`);b.type='button';b.addEventListener('click',fn);return b;};
 const actionButton=(label,value=step.value)=>button(label,()=>onAction?.(value),true);
 const fmt=n=>typeof n==='number'?n.toLocaleString('ja-JP',{maximumFractionDigits:6}):String(n??'');
 const route=state.questStates?.[state.activeQuestKey]?.routeId||state.selectedRoute||'journey';
 let scenario;try{scenario=state.financialScenarios?.[scenarioForStep(step,{routeId:route},state)];}catch{}
 const accounts=scenario?.accounts||{};
 const ledger=(keys)=>{const n=el('div','','background:white;border-radius:8px;padding:4px 10px');for(const r of scenarioSummary(scenario).filter(r=>!keys||keys.includes(r.key)).slice(0,7))n.append(row(r.label,fmt(r.value)));return n;};
 const pixel=(kind,width=144,height=96)=>{const c=el('canvas','','display:block;image-rendering:pixelated;width:100%;max-width:240px;margin:auto;border-radius:6px;background:#edf2e8');c.width=width;c.height=height;c.setAttribute('role','img');c.setAttribute('aria-label',kind==='person'?'画面内の架空人物':kind==='id'?'教材専用の本人確認カード':kind==='cards'?'オリジナルの星札3枚':'練習用の日用品セット');const x=c.getContext('2d');if(!x)return c;
  const r=(a,b,w,h,color)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};
  if(kind==='person'||kind==='id'){r(0,0,width,height,'#e1ede7');if(kind==='id'){r(5,7,width-10,height-14,'#fff9e6');r(9,11,width-18,11,'#739b8d');}const ox=kind==='id'?20:width/2-16,oy=kind==='id'?31:13;r(ox+7,oy,19,8,'#3f3a40');r(ox+3,oy+8,28,22,'#f1c7a2');r(ox+3,oy+7,5,11,'#3f3a40');r(ox+26,oy+7,5,11,'#3f3a40');r(ox+9,oy+15,3,3,'#3f3a40');r(ox+22,oy+15,3,3,'#3f3a40');r(ox+13,oy+24,8,2,'#a87363');r(ox-1,oy+31,36,29,'#668ea3');r(ox+12,oy+30,9,21,'#f3edd9');if(kind==='id'){for(let j=0;j<4;j++)r(65,35+j*10,58-j*6,3,'#bcc9bb');r(100,74,27,5,'#91b394');}}
  else if(kind==='cards'){r(0,0,width,height,'#e9e8de');for(let j=0;j<3;j++){const a=11+j*39,b=12+(j%2)*5;r(a,b,37,64,'#625583');r(a+3,b+3,31,58,'#d9c897');r(a+6,b+7,25,31,['#8aa9a1','#b7876d','#8195b3'][j]);r(a+13,b+14,11,4,'#fff4bd');r(a+16,b+10,4,15,'#fff4bd');for(let k=0;k<3;k++)r(a+7,b+43+k*5,23-k*4,2,'#776748');}r(120,72,5,2,'#e5d4a3');}
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

 if(/ホームへ|最近使ったアプリ|アプリの一覧/.test(step.instruction||'')){
  body.append(text('練習アプリを選ぶ'));const grid=el('div','','display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px');
  for(const[id,name]of Object.entries(appNames).slice(0,9))grid.append(button(name,()=>navigate(id)));body.append(grid);
 }
 if(/スマホホーム/.test(step.screenTitle??'')){const grid=el('div','','display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px');for(const [id,name]of Object.entries({memo:'メモ',mail:'メール',browser:'ブラウザー',bank:'銀行',fx:'FX',market:'カード市場',wallet:'ウォレット',hyper:'運用ラボ',gift:'ギフト'})){const chapter=Number(quest?.chapterId?.slice(3))||0;if(['bank','fx','market'].includes(id)&&chapter<({bank:2,fx:3,market:4}[id]))continue;if(['wallet','hyper'].includes(id)&&quest?.partId!=='crypto')continue;if(id==='gift'&&chapter<1)continue;const target=step.instruction.includes(name)||(id==='market'&&step.instruction.includes('市場'))||(id==='hyper'&&step.instruction.includes('取引練習'));const icon=button(name,()=>target?onAction?.(step.value):onNavigate?.(id),target);grid.append(icon);}body.append(grid);return {element:root,handlesAction:true};}
 if(step.appId==='mail'){
  const mails=Object.entries(state.phoneState?.mailById||{});let selected=mails.find(([id,m])=>/注文/.test(step.instruction||'')&&/注文/.test(m.subject||m.title||''))||mails.at(-1);
  const fake=quest?.id==='CR-02';if(fake)selected=['crypto-fake',{from:'おたすけ緊急係（架空）',subject:'復旧のご案内',body:'復元情報を教えてください。',warning:true}];
  body.append(el('div','受信トレイ','font-size:12px;font-weight:700;letter-spacing:.08em'));
  if(selected){const[id,m]=selected;if(/受信一覧|受信トレイ/.test(step.screenTitle??'')){body.append(button((m.read?'':'● ')+(m.subject||m.title||'練習メール'),()=>onAction?.(step.value),true));return {element:root,handlesAction:true};}const message=box(m.subject||m.title||'旅人さんへのお知らせ');message.append(text(`差出人：${m.from||'ゲーム内の案内係'}`,true),text(m.body||m.text||'このお知らせは練習用です。'));
   if(m.code)message.append(box('メールの確認コード',String(m.code)));
   if(m.warning)message.append(text('この要求には応じず、本文の外のボタンから案内を閉じよう。',true));body.append(message);
   if(/コピー/.test(step.instruction||'')){body.append(actionButton('このメールの練習コードをコピー',step.value??m.code));handlesAction=true;}
   else if(/スター/.test(step.instruction||'')){body.append(actionButton('注文メールにスターを付ける',step.value));handlesAction=true;}
   else if(/この案内を閉じる/.test(step.instruction||'')){body.append(actionButton('この案内を閉じる'));handlesAction=true;}
   else if(/通知を開く|メールを開く|受信.*開く/.test(step.instruction||'')&&step.type==='tap'){body.append(actionButton('このメールを開く'));handlesAction=true;}
  }else body.append(box('受信トレイ','新しい案内が届くと、ここに表示されます。'));
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
  if(quest?.id==='CR-01'){const map=el('div','','display:grid;grid-template-columns:1fr;gap:5px');for(const label of ['銀行の円','暗号資産を扱うサービス','ウォレットで操作する残高','HyperCore内の残高','選んだ運用と、帰りの船'])map.append(box(label));body.append(map);}
  else if(quest?.id==='CR-03'||quest?.id==='HY-EXIT'){
   const destination=quest.id==='HY-EXIT'?'DEMO-WALLET-A':'DEMO-VAULT-A',receiver=box('今回の受取カード');receiver.append(row('資産','Mock USDC'),row('ネットワーク','Arbitrum'),row('練習用の宛先',destination));if(quest.id==='CR-03')receiver.append(row('最低額（教材値）','10 Mock USDC'),row('必要ガス（教材値）','0.0001 Mock ETH'));receiver.append(row('教材手数料','1 Mock USDC・送信額から控除'));body.append(receiver,ledger());
  }else if(quest?.id==='CR-02'){body.append(box('接続先：そらの取引練習','練習用識別子 DEMO-WALLET-A'),box('接続と資産の移動','接続の許可、取引の有効化、入金は別の確認です。'),ledger(['walletUSDC','walletETH','availableUSDC']));}
  else if(quest?.id==='CR-04'){
   for(const[title,copy]of [['現物','資産そのものを保有。値下がりがあります。'],['HLP','戦略の損益を共有。直近預入から4日のロック。'],['HYPEステーキング','数量と評価額は別。委任1日と出金7日は別。'],['無期限先物（任意）','証拠金・資金調達料・清算を学びます。'],['今回は運用しない','未運用の資金で、出金と受取だけ練習できます。']])body.append(box(title,copy));
  }else if(quest?.id==='HY-STAKE'){
   body.append(box('HYPEの現在地','現物 → ステーキング → 委任 → ステーキング → 待機 → 現物'),ledger(['spotHYPE','stakingHYPE','delegatedHYPE','waitingHYPE','availableUSDC']),box('預け先の候補（すべて架空）','灯台ノード / 森の歯車 / 星波ノード。候補の稼働状態と教材手数料を見比べます。'));
  }else if(quest?.id==='HY-HLP'){body.append(box('HLP — 戦略の損益を共有','固定利息ではありません。預入の評価額と、今使える手元残高を分けます。'),ledger(['availableUSDC','hlpUnits','hlpValue']),box('出金ロック',`教材時間${Math.floor((scenario?.simulationTime||0)/86400000)}日目。最後の預入から4日を数えます。`));}
  else{const price=scenario?.data?.price??scenario?.data?.markPrice??scenario?.data?.perp?.position?.markPrice??100;body.append(box(quest?.id==='HY-PERP'?'教材トークン / 分離証拠金':'教材HYPE / 現物',`教材の表示価格 ${fmt(price)} Mock USDC。実相場ではありません。`));
   if(quest?.id==='HY-SPOT'){const order=box('注文の状態',scenario?.data?.orderStatus||(/指値/.test(step.instruction||'')?'指値は価格条件がそろうまで保留です。':'成行は今回の教材価格で注文します。'));body.append(order);}
   body.append(ledger());if(quest?.id==='HY-PERP')body.append(box('注文の内訳','証拠金・倍率・建玉金額・数量を、別の値として確認します。SLの発動と約定も分けます。'));
  }
 }else if(step.appId==='market'||quest?.id?.startsWith('TC-')){
  const product=box(comparisonPanels.cards.productName);product.append(pixel('cards'),row('版',comparisonPanels.cards.edition),row('状態',comparisonPanels.cards.condition),text('裏面右下の小さな傷も、説明へ正直に残します。',true));body.append(product);
  if(quest?.id==='TC-01')body.append(box('売れた記録（同じ版・近い状態）','2,900円 / 3,000円 / 3,100円'),box('仕入の明細','商品2,000円・入荷送料200円。売れ残りや値下がりも考えます。'));
  else body.append(box('出品と発送','希望価格3,000円 / 販売手数料10% / 梱包50円 / 発送200円'),box('荷物の準備','袋：水濡れを防ぐ / 台紙：折れを防ぐ。発送済みでも、入金の確認が必要です。'));
  body.append(ledger());
 }else if(step.appId==='fx'){
  body.append(box('通貨ペアの注文パネル','USD/JPY（米ドル/円） / EUR/JPY（ユーロ/円）'),box('数量の単位','この教材では1 lot = 1,000通貨。買い・売り、新規・決済は別の操作です。'),ledger());
 }else if(step.appId==='browser'||step.appId==='points'){
  if(quest?.id==='PO-02'){for(const offer of comparisonPanels.shoppingOffers)body.append(box(`${offer.name} · ${offer.points} P`,`追加費用${offer.additionalCost.toLocaleString('ja-JP')}円 / ${offer.description}`));}
  else if(quest?.id==='PO-03'){const goods=box('日用品セット');goods.append(pixel('goods'),row('洗剤','900円'),row('ティッシュ','600円'),row('石けん大','500円'),row('送料','0円'));body.append(goods);}
  else body.append(box('練習ブラウザー','kotsukotsu.example.invalid / ゲーム内だけの架空サービス'),box('会員プロフィール',`${practiceProfile.name} / ${practiceProfile.email}`));
  if(step.id==='P008'){body.append(actionButton('この架空サービスの利用条件を開く'));handlesAction=true;}
  if(step.id==='P009')body.append(box('コツコツモール — 練習の利用条件','このサービスはゲームの中だけの教材です。架空の成人プロフィールと練習パスワードを使います。登録しただけでポイントは増えません。案件ごとの条件を確認し、買った記録と受取まで確かめます。実際の注文や支払いは行いません。'));
  if(quest?.id!=='PO-01')body.append(ledger());
 }else if(step.appId==='gift'||step.appId==='exchange'){
  body.append(box('交換先を見比べる','最低交換数・単位・手数料・有効期限・使う予定を確認します。'),ledger());
 }else if(step.appId==='memo'){
  body.append(box('いまの依頼',quest?.title||'小さな一歩'),box('ゲーム内クリップボード',state.phoneState?.clipboard||'まだ何もコピーしていません。'));
  if(quest?.id==='PR-01'){
   const memo=box('ミナの買い物メモ','きょうは郵便屋さんから、大切な知らせが届く日。メールを開いて、届いた言葉をこのメモへ残そう。');
   if(step.id==='PR-01-002'){const paper=el('div','','max-height:230px;overflow:auto;border-top:1px dashed #b6c8ba;margin-top:10px');paper.append(text('持ち物：旅人の杖、空っぽの手帳袋。',true),el('div','道の先には、お店と港と空の島。まずは、この村の小さな用事を片づけよう。','padding:35px 0 55px;line-height:1.8;font-size:14px'),actionButton('今日の用事を開く'));memo.append(paper);handlesAction=true;}
   else memo.append(box('今日の用事','郵便屋ミナからのメールを開く。合言葉をゲーム内コピーして、メモへ写して保存する。'));
   body.append(memo);
   if(state.phoneState?.mailById?.['intro-mail']?.read)body.append(box('読んだメールの控え','合言葉は、開いたメール本文で確かめられます。入力にはゲーム内コピーを使えます。'));
  }
 }
 if(!body.childNodes.length)return null;
 return {element:root,handlesAction};
}
