import {getExtensionView} from './finance-extension.js';

const format=value=>typeof value==='number'?value.toLocaleString('ja-JP',{maximumFractionDigits:6}):String(value??'');
const orderStatus={pending:'未約定・まだ売買していません',cancelled:'取消済み',filled:'約定・売買が成立'};
const sideName=side=>side==='sell'?'売り':'買い';

/** Real local HTML controls. This view never calculates or mutates money. */
export function renderExtensionPanel({document:doc,state,step,quest,onAction,onNavigate,onAppNavigate,previewVenue=null,reviewSnapshot}){
 if(!step?.extension||!doc)return null;
 const view=getExtensionView(state,step,{reviewSnapshot});if(!view)return null;
 const node=(tag,text='',className='')=>{const n=doc.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};
 const root=node('section','','extension-phone-panel');root.setAttribute('aria-label',`${view.title}の教材画面`);
 const reviewLabel=view.scenarioId==='leverage-choice'&&!view.changedConditions?'方向と倍率の復習':'別条件の確認';
 const top=node('header','','extension-app-head');top.append(node('strong',view.title),node('span',view.isReview?reviewLabel:'架空の教材','extension-demo'));root.append(top);
 const body=node('div','','extension-app-body');root.append(body);
 const p=(t)=>node('p',t);
 const box=(title,copy)=>{const n=node('section','','extension-box');n.append(node('h4',title));if(copy)n.append(p(copy));return n;};
 const button=(text,fn,primary=false)=>{const n=node('button',text,primary?'extension-button primary':'extension-button');n.type='button';n.addEventListener('click',fn);return n;};
 const action=(label=step.label,value=step.value)=>button(label,()=>onAction?.(value),true);
 const lines=items=>{const list=node('dl','','extension-ledger');for(const r of items??[]){list.append(node('dt',r.label),node('dd',format(r.value)));}return list;};
 const orderBook=()=>{if(!view.orderBook)return null;const book=box(view.orderBook.label,'待機枚数は、板に並んで待っている相手の注文数です。自分が入力する枚数とは別です。');for(const [kind,label]of [['asks','売り注文 — 買いたい人が見る側'],['bids','買い注文 — 売りたい人が見る側']]){const table=node('table','',`extension-order-book ${kind}`);table.append(node('caption',label));const head=node('thead'),headRow=node('tr');for(const title of ['1枚の値段（円）','待機枚数（枚）'])headRow.append(node('th',title));head.append(headRow);table.append(head);const body=node('tbody');for(const row of view.orderBook[kind]??[]){const tr=node('tr');tr.append(node('td',format(row.price)),node('td',format(row.quantity)));body.append(tr);}table.append(body);book.append(table);}return book;};
 let handlesAction=false;
 const status=node('p',view.status,'extension-status');status.setAttribute('role','status');body.append(status);
 if(view.isReview){body.append(p('本編とは別の確認用コピーです。元のお金・XP・時計は変わりません。'));if(view.scenarioId==='leverage-choice'&&!view.changedConditions)body.append(p('同じ条件でも復習できます。方向・倍率・値動きのどれかを変えて結果まで確かめると、別条件の確認として記録します。'));}

 if(view.venue){
  const tabs=node('nav','','extension-venue-tabs');tabs.setAttribute('aria-label','売買画面の切替');
  for(const [v,label]of [['dealer','販売所'],['board','板取引所']]){
   const b=button(label,()=>step.venueSwitch&&v===step.value?onAction?.(v):onNavigate?.(v));b.setAttribute('aria-pressed',String((previewVenue??view.venue)===v));tabs.append(b);
  }
  body.append(tabs);
  if(step.venueSwitch){body.append(p('販売所はお店が相手。板取引所では、並んだ注文の値段と枚数を見ます。'));handlesAction=true;}
  if(previewVenue&&previewVenue!==view.venue){
   const peek=box(`${previewVenue==='dealer'?'販売所':'板取引所'}を見学中`,'取引は元の画面へ戻って続けます。見学だけでは注文や残高は変わりません。');
   const v=view.venues?.[previewVenue];if(v)peek.append(lines([{label:'買うときの1枚の値段（教材円）',value:v.ask},{label:'売るときの1枚の値段（教材円）',value:v.bid},{label:'教材の明示手数料（円）',value:v.fee}]));
   if(previewVenue==='board'){const book=orderBook();if(book)peek.append(book);}
   peek.append(button('元の作業画面へ戻る',()=>onNavigate?.(null),true));body.append(peek);return {element:root,handlesAction:true};
  }
 }

 if(view.account){
  const profile=view.account.profile??{};
  const current=step.phoneEffect;
  const mailOpened=reviewSnapshot?.mailOpened??state.phoneState?.mailById?.['domestic-registration']?.read;
  const clipboard=reviewSnapshot?.clipboard??state.phoneState?.clipboard??'';
  if(current==='home'){
   body.append(p('入力した内容は残っています。ホームからメールを探しましょう。'),action('スマホのホームへ'));handlesAction=true;
  }else if(current==='mail'){
   body.append(action('ゲーム内メールを開く'));handlesAction=true;
  }else if(current==='open-mail'){
   const inbox=box('受信トレイ','あかつき取引所から確認メールが届いています。');inbox.append(action('あかつき取引所の確認メールを開く'));body.append(inbox);handlesAction=true;
  }else if(current==='copy-code'||current==='switcher'){
   if(mailOpened){const mail=box('あかつき取引所のメール確認','この確認コードは、あかつき取引所の入力画面へ写すためのものです。');mail.append(node('strong',String(profile.verificationCode),'extension-code'));body.append(mail);}
   if(current==='copy-code'){body.append(action('このメールの確認コードをコピー'));handlesAction=true;}
   else{body.append(action('下部のアプリ切替を開く'));handlesAction=true;}
  }else if(current==='browser'){
   const cards=box('最近使ったアプリ','メールの中のリンクではなく、入力していたアプリへ戻ります。');
   cards.append(action('あかつき取引所 — 入力中のブラウザー'));if(onAppNavigate)cards.append(button('メールの内容を見直す',()=>onAppNavigate('mail')));body.append(cards);handlesAction=true;
  }else if(step.field==='verificationCode'&&step.type==='input'){
   const code=box('メールから持ってきたコード',clipboard?'ゲーム内でコピー済みです。':'まだコピーされていません。メール本文を開いてコピーしましょう。');
   if(clipboard)code.append(button('ゲーム内コードを貼り付け',()=>onAction?.(clipboard),true));body.append(code);handlesAction=true;
  }else if(step.phoneScreen==='terms'||step.field==='termsAccepted'){
   body.append(box('練習サービスの利用条件','これはゲーム内だけの架空サービスです。申込者は内蔵の架空成人です。実名・本物のパスワード・秘密の情報は入力しません。口座の申込受付、本人確認の審査、利用開始は別々です。実際のお金は動きません。'));
  }else if(quest?.id==='DX-02'||step.questId==='DX-02'){
   const face=step.field==='selfie'||step.phoneScreen==='identity-face';
   const card=box(face?'画面内の架空人物':'教材専用の本人確認カード','実カメラは使いません。カードも人物も、この画面だけの教材です。');
   card.append(identityPicture(doc,face?'person':step.phoneScreen==='identity-back'?'back':'front'),lines([{label:'教材の氏名',value:profile.fullName},{label:'生年月日',value:profile.birthDate},{label:'住所・部屋番号',value:profile.address},{label:'教材の日付',value:profile.today},{label:'カードの有効期限',value:profile.documentExpires}]));body.append(card);
   if(step.identityControl){const choices=node('div','','extension-choices');for(const c of step.choices)choices.append(button(c.label,()=>onAction?.(c.value),c.value===step.value));body.append(choices);handlesAction=true;}
   if(/審査|履歴|結果|利用/.test(step.instruction))body.append(box('口座の状態','申込受付 → 本人確認を提出 → 審査中 → 承認通知を確認 → 利用可能。通知を見る前に入金や売買ができたことにはしません。'));
  }else{
   const fields=['email','password','fullName','birthDate','address','phone','occupation','purpose'];
   const labels={email:'練習メール',password:'練習パスワード',fullName:'氏名',birthDate:'生年月日',address:'住所・部屋番号',phone:'練習電話番号',occupation:'仕事',purpose:'利用の目的'};
   if(step.field&&fields.includes(step.field)){
    const value=step.field==='occupation'?'会社員':step.field==='purpose'?'教材内の練習':profile[step.field];
    body.append(box('今回の教材カード',`${labels[step.field]}：${value??''}`));
   }else body.append(box('国内の架空取引サービス','銀行口座とは別に、このサービスを使うための申込をします。申込受付だけでは、まだ利用を始められません。'));
   if(/申込内容|プロフィール|一致/.test(step.instruction))body.append(lines(['fullName','birthDate','address','phone'].map(key=>({label:labels[key],value:profile[key]}))));
  }
 }else{
  if(view.venue){
   const v=view.venues?.[view.venue];
   if(v){const prices=box(view.venue==='dealer'?'販売所 — お店が示す二つの値段':'板取引所 — この教材の注文');prices.append(lines([{label:'買うときの1枚の値段（円）',value:v.ask},{label:'売るときの1枚の値段（円）',value:v.bid}]));if(view.venue==='board')prices.append(p('ここでは一つの注文を全枚数で成立させる教材です。実際の板では、希望枚数すべてが同じ値段で成立するとは限りません。'));body.append(prices);}
   if(view.venue==='board'){const book=orderBook();if(book)body.append(book);}
  }
  if(view.quote?.length){const title=view.scenarioId==='lending-lab'?'今回の貸出条件':view.scenarioId==='leverage-choice'?'選んだ条件の内訳':'今回の注文の見積り';const q=box(title);q.append(lines(view.quote));body.append(q);}
  if(view.scenarioId==='lending-lab'){
   body.append(box('元本と利息','元本は自分が貸したお金。利息は契約にそって別に計算する分です。貸出中と返還処理中のお金を、手元の使える残高に重ねません。'));
   if(step.phoneScreen==='lending-early'){const early=box('満期前の返還窓口','この教材の契約では、満期前に返還を申し込めません。元本は貸出中のままです。');const unavailable=button('満期前の返還はできません',()=>{});unavailable.disabled=true;early.append(unavailable);body.append(early);}
  }
  if(view.metrics)body.append(box('損益の読み方','ロングは上がると利益、下がると損失。ショートはその逆です。倍率が大きいほど同じ値動きで損益も大きくなります。利益が出る方を当てる課題ではありません。'));
  if(view.position){const position=box('現在の建玉 — まだ閉じていない取引',view.position.open?'この数量の取引を保有中です。':'いま保有している建玉はありません。残量はゼロです。');position.append(lines([{label:'現在の建玉数量（残量）',value:view.position.quantity},{label:'現在の建玉金額（Mock USDC）',value:view.position.notional},{label:'現在配分中の証拠金（Mock USDC）',value:view.position.collateral}]));body.append(position);}
  if(view.leverageHistory?.length){const history=box('決済した取引の履歴 — 過去の記録','下の数量は、すでに閉じた取引の記録です。現在の残量に足しません。');for(const item of view.leverageHistory){const record=node('section','','extension-history-record');record.append(lines([{label:'終えた取引の方向',value:item.side==='short'?'ショート（売り）':'ロング（買い）'},{label:'終えた取引の倍率',value:`${format(item.leverage)}倍`},{label:'始めた価格（Mock USDC）',value:item.entryPrice},{label:'決済した価格（Mock USDC）',value:item.exitPrice},{label:'決済した数量（過去）',value:item.quantity},{label:'配分した証拠金（過去）',value:item.collateral},{label:'確定した損益（Mock USDC）',value:item.netPnl},{label:'返却された資金（Mock USDC）',value:item.returned},{label:'終えた方法',value:item.reason==='liquidation'?'清算':'全決済'}]));history.append(record);}body.append(history);}
  if(view.rows?.length){const money=box('この練習だけの残高');money.append(lines(view.rows));body.append(money);}
  if(view.orders?.length){const orders=box('注文の受付・取消・成立');for(const o of view.orders)orders.append(p(`${sideName(o.side)} / ${format(o.quantity)}枚 / 指値${format(o.price)}円 / ${orderStatus[o.status]??o.status}`));body.append(orders);}
  if(view.fills?.length){const fills=box('約定履歴 — 成立した売買');for(const f of view.fills)fills.append(p(`${sideName(f.side)} ${format(f.quantity)}枚 × ${format(f.price)}円 / 代金${format(f.total)}円 / 教材費${format(f.fee)}円`));body.append(fills);}
 }
 const note=node('details','','extension-notices');note.append(node('summary','教材の条件・気をつけること'));for(const t of view.notices??[])note.append(p(t));body.append(note);
 return {element:root,handlesAction};
}

function identityPicture(doc,kind){
 const c=doc.createElement('canvas');c.width=160;c.height=104;c.className='extension-identity-pixel';c.setAttribute('role','img');c.setAttribute('aria-label',kind==='person'?'画面内の架空成人':kind==='back'?'教材カードの裏面':'教材カードの表面');const x=c.getContext('2d');if(!x)return c;
 const r=(a,b,w,h,color)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};r(0,0,160,104,'#e3eee7');r(6,6,148,92,'#fffae7');
 if(kind==='person'){r(42,15,76,70,'#bfd2c7');r(65,25,30,10,'#3d3544');r(61,35,38,29,'#e9bf9c');r(67,43,4,4,'#3d3544');r(89,43,4,4,'#3d3544');r(72,56,16,3,'#9d6b61');r(54,64,52,22,'#6c8baf');}
 else{r(13,13,134,13,'#6b9184');if(kind==='front'){r(16,34,37,50,'#cbded2');r(25,39,19,7,'#3d3544');r(22,46,25,18,'#e9bf9c');r(19,64,31,16,'#6c8baf');}for(let i=0;i<5;i++)r(kind==='front'?64:18,38+i*10,kind==='front'?72-i*4:124-i*6,3,'#a5b7ac');r(117,83,24,7,'#c2a25e');}
 x.strokeStyle='#5c947f';x.lineWidth=3;x.strokeRect(7,7,146,90);return c;
}
