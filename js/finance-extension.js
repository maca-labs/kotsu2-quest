// All accounts, people, prices and rates in this module are fictional lessons.
import {steps as extensionSteps} from './content-extension.js';
import {openPerp,closePerp,perpMetrics,parseAmount,roundAmount,DAY} from './finance.js';
const clone=x=>structuredClone(x);
const need=(ok,message)=>{if(!ok)throw new Error(message);};
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const ids=['domestic-account','domestic-dealer','domestic-market','domestic-limit','lending-lab','leverage-choice'];
export const extensionScenarioIds=Object.freeze([...ids]);
const profile={email:'minato@akatsuki.example.invalid',password:'DEMO-START-42',verificationCode:'482615',fullName:'朝日 ミナト',birthDate:'1994-04-12',address:'練習県れんしゅう市サンプル町1-2-3 201号',phone:'09000001234',occupation:'employee',purpose:'practice',documentExpires:'2031-03-31',today:'2026-10-23'};
const titles={'domestic-account':'あかつき取引所の口座','domestic-dealer':'販売所の買い値と売り値','domestic-market':'板の成行注文','domestic-limit':'板の指値注文','lending-lab':'貸出と満期の受取','leverage-choice':'方向と倍率の練習'};
function scenario(id,accounts,data){const base={accounts,data:{scenarioId:id,...data},simulationTime:0};return{initialSnapshot:clone(base),...clone(base),eventLog:[],phoneState:{formDrafts:{},flags:{}}};}
export function initialExtensionScenarios(){return{
 'domestic-account':scenario('domestic-account',{}, {status:'not_started',emailVerified:false,accountCount:0,kycStatus:'not_started',profile:clone(profile)}),
 'domestic-dealer':scenario('domestic-dealer',{jpy:100000,coin:0,reservedJPY:0,reservedCoin:0,realizedPnl:0},{venue:'dealer',status:'ready',exerciseQuantity:10,ask:102,bid:100,fee:0,fills:[]}),
 'domestic-market':scenario('domestic-market',{jpy:100000,coin:0,reservedJPY:0,reservedCoin:0,realizedPnl:0},{venue:'board',status:'ready',exerciseQuantity:10,price:100,fee:0,fills:[]}),
 'domestic-limit':scenario('domestic-limit',{jpy:100000,coin:0,reservedJPY:0,reservedCoin:0,realizedPnl:0},{venue:'board',status:'ready',exerciseQuantity:10,price:100,fee:0,orders:[],fills:[]}),
 'lending-lab':scenario('lending-lab',{availableUSDC:1000,lentPrincipal:0,pendingPrincipal:0,pendingInterest:0,interestReceived:0},{status:'ready',lendingAmount:100,annualRate:.12,termDays:30,dayCount:365,precision:6,acceptedAtSimulation:null,maturesAtSimulation:null}),
 'leverage-choice':scenario('leverage-choice',{availableUSDC:1000,collateral:0,unrealizedPnl:0,realizedPnl:0},{status:'ready',perp:null,entryPrice:100,feeRate:0,fundingRate:0})
};}
const actionScenario={
 'account-register':'domestic-account','account-verify':'domestic-account','account-submit':'domestic-account','kyc-submit':'domestic-account','kyc-advance':'domestic-account','kyc-receive':'domestic-account',
 'dealer-buy':'domestic-dealer','dealer-sell':'domestic-dealer','market-buy':'domestic-market','market-move':'domestic-market','market-sell':'domestic-market',
 'limit-buy-place':'domestic-limit','limit-buy-cancel':'domestic-limit','limit-buy-replace':'domestic-limit','limit-buy-fill':'domestic-limit','limit-sell-place':'domestic-limit','limit-sell-fill':'domestic-limit',
 'lending-apply':'lending-lab','lending-advance':'lending-lab','lending-request':'lending-lab','lending-settle':'lending-lab','lending-receive':'lending-lab',
 'leverage-open':'leverage-choice','leverage-mark':'leverage-choice','leverage-close':'leverage-choice'
};
const questScenario={'DX-01':'domestic-account','DX-02':'domestic-account','DX-03':'domestic-dealer','DX-04':'domestic-market','DX-05':'domestic-limit','LD-01':'lending-lab','LV-01':'leverage-choice'};
const allowedFields=new Set([...Object.keys(profile),'termsAccepted','idType','idFront','idBack','selfie','venue','quantity','side','orderType','limitPrice','lendingAmount','returnMethod','collateral','leverage','markPrice','asset']);
const numericFields=new Set(['quantity','limitPrice','lendingAmount','collateral','leverage','markPrice']);
function normal(value){need(['string','number','boolean'].includes(typeof value),'練習欄には短い文字か数字を入れよう。');if(typeof value==='number')need(Number.isFinite(value),'数字の形を確かめよう。');return typeof value==='string'?value.normalize('NFKC').trim():value;}
function cleanField(field,value){value=normal(value);need(String(value).length<=160,'練習欄の文字が長すぎます。');if(numericFields.has(field))return parseAmount(value,{max:1000000,decimals:6});return value;}
function expect(d,values){for(const[k,v]of Object.entries(values))need(d[k]===v,`入力した${({quantity:'枚数',venue:'売買画面',side:'買い・売りの向き',orderType:'注文方法',limitPrice:'希望の価格',lendingAmount:'貸す額',collateral:'証拠金',leverage:'倍率',verificationCode:'メールの数字',idType:'本人確認書類',idFront:'表の写真',idBack:'裏の写真',selfie:'人物写真'})[k]??'練習情報'}を、今回のカードと比べよう。入力は残っています。`);}
function requireEvent(s,action){need(s.eventLog.some(e=>e.kind===action),'先に前の結果を確認しよう。');}
function tradeInputs(s,d,side,type){expect(d,{venue:s.data.venue,quantity:s.data.exerciseQuantity,side,...(s.data.scenarioId==='domestic-dealer'?{}:{orderType:type})});need(Number.isInteger(d.quantity)&&d.quantity>0,'枚数は正の整数で入れよう。');}
function fill(s,side,price,q,source){const total=roundAmount(price*q);if(side==='buy'){need(s.accounts.jpy>=total,'使える円が足りません。予約中の額も確かめよう。');s.accounts.jpy=roundAmount(s.accounts.jpy-total);s.accounts.coin=roundAmount(s.accounts.coin+q);}else{need(s.accounts.coin>=q,'使えるコインの枚数が足りません。');s.accounts.coin=roundAmount(s.accounts.coin-q);s.accounts.jpy=roundAmount(s.accounts.jpy+total);}s.data.fills.push({side,price,quantity:q,total,fee:0,source});s.data.status=side==='buy'?'bought':'sold';if(side==='sell'){const buy=s.data.fills.find(f=>f.side==='buy');if(buy)s.accounts.realizedPnl=roundAmount(total-buy.total);}}
function lendingInterest(s){return roundAmount(s.data.lendingAmount*s.data.annualRate*s.data.termDays/s.data.dayCount);}
function syncLeverage(s,p){s.data.perp=p;s.accounts.availableUSDC=p.available;s.accounts.collateral=p.position?.collateral??0;s.accounts.unrealizedPnl=p.position?perpMetrics(p.position).unrealizedPnl:0;s.accounts.realizedPnl=p.realizedPnl;}
function execute(s,action,d){
 const a=s.accounts,q=s.data.exerciseQuantity;
 switch(action){
 case 'account-register':expect(d,{email:s.data.profile.email,password:s.data.profile.password,termsAccepted:true});need(s.data.status==='not_started','登録済みのメールを確認しよう。');s.data.status='registered';break;
 case 'account-verify':requireEvent(s,'account-register');expect(d,{verificationCode:s.data.profile.verificationCode});s.data.emailVerified=true;s.data.status='verified';break;
 case 'account-submit':need(s.data.emailVerified,'届いたメールの数字で、先に認証しよう。');expect(d,Object.fromEntries(['fullName','birthDate','address','phone','occupation','purpose'].map(k=>[k,s.data.profile[k]])));s.data.status='submitted';break;
 case 'kyc-submit':need(s.data.status==='submitted','口座の申込を先に確定しよう。');expect(d,{idType:'valid-demo-id',idFront:'clear',idBack:'clear',selfie:'clear-centered'});s.data.kycStatus='processing';s.data.status='reviewing';break;
 case 'kyc-advance':requireEvent(s,'kyc-submit');need(s.data.kycStatus==='processing','審査中の申込を確認しよう。');s.simulationTime+=DAY;break;
 case 'kyc-receive':requireEvent(s,'kyc-advance');need(s.data.kycStatus==='processing','審査中の申込を確認しよう。');s.data.kycStatus='approved';s.data.status='active';s.data.accountCount=1;break;
 case 'dealer-buy':tradeInputs(s,d,'buy','market');fill(s,'buy',s.data.ask,q,'dealer');break;
 case 'dealer-sell':requireEvent(s,'dealer-buy');tradeInputs(s,d,'sell','market');fill(s,'sell',s.data.bid,q,'dealer');break;
 case 'market-buy':tradeInputs(s,d,'buy','market');fill(s,'buy',s.data.price,q,'board-market');break;
 case 'market-move':requireEvent(s,'market-buy');s.data.price=105;break;
 case 'market-sell':requireEvent(s,'market-move');tradeInputs(s,d,'sell','market');fill(s,'sell',s.data.price,q,'board-market');break;
 case 'limit-buy-place':case 'limit-buy-replace':{
  tradeInputs(s,d,'buy','limit');expect(d,{limitPrice:95});if(action==='limit-buy-replace')requireEvent(s,'limit-buy-cancel');
  need(!s.data.orders.some(o=>o.status==='pending'),'前の注文を取り消すか、成立した結果を確認しよう。');const total=95*q;need(a.jpy>=total,'予約に使う円が足りません。');a.jpy-=total;a.reservedJPY+=total;s.data.orders.push({id:action==='limit-buy-place'?'buy-1':'buy-2',side:'buy',price:95,quantity:q,reserved:total,status:'pending'});s.data.status='pending';break;}
 case 'limit-buy-cancel':{const o=s.data.orders.find(o=>o.id==='buy-1');need(o?.status==='pending','取り消せる注文はありません。');a.jpy+=o.reserved;a.reservedJPY-=o.reserved;o.status='cancelled';s.data.status='cancelled';break;}
 case 'limit-buy-fill':{requireEvent(s,'limit-buy-replace');const o=s.data.orders.find(o=>o.id==='buy-2');need(o?.status==='pending','待っている買い注文を確認しよう。');s.data.price=95;a.reservedJPY-=o.reserved;a.coin+=o.quantity;o.status='filled';s.data.fills.push({side:'buy',price:95,quantity:o.quantity,total:o.reserved,fee:0,source:'board-limit'});s.data.status='bought';break;}
 case 'limit-sell-place':{requireEvent(s,'limit-buy-fill');tradeInputs(s,d,'sell','limit');expect(d,{limitPrice:105});need(a.coin>=q,'予約するコインが足りません。');need(!s.data.orders.some(o=>o.status==='pending'),'前の注文の結果を確認しよう。');a.coin-=q;a.reservedCoin+=q;s.data.orders.push({id:'sell-1',side:'sell',price:105,quantity:q,reserved:q,status:'pending'});s.data.status='pending';break;}
 case 'limit-sell-fill':{requireEvent(s,'limit-sell-place');const o=s.data.orders.find(o=>o.id==='sell-1');need(o?.status==='pending','待っている売り注文を確認しよう。');s.data.price=105;a.reservedCoin-=o.quantity;a.jpy+=o.quantity*105;o.status='filled';s.data.fills.push({side:'sell',price:105,quantity:o.quantity,total:o.quantity*105,fee:0,source:'board-limit'});a.realizedPnl=q*10;s.data.status='sold';break;}
 case 'lending-apply':expect(d,{asset:'USDC',lendingAmount:s.data.lendingAmount});need(s.data.status==='ready'&&a.availableUSDC>=d.lendingAmount,'貸せる残高と申込の状態を確かめよう。');a.availableUSDC=roundAmount(a.availableUSDC-d.lendingAmount);a.lentPrincipal=d.lendingAmount;s.data.acceptedAtSimulation=s.simulationTime;s.data.maturesAtSimulation=s.simulationTime+30*DAY;s.data.status='lending';break;
 case 'lending-advance':requireEvent(s,'lending-apply');need(s.data.status==='lending','貸出中の契約を開こう。');s.simulationTime=s.data.maturesAtSimulation;s.data.status='matured';break;
 case 'lending-request':requireEvent(s,'lending-apply');need(['lending','matured'].includes(s.data.status)&&s.simulationTime>=s.data.maturesAtSimulation,'満期前には返してもらえません。練習の時間を進めよう。');a.pendingPrincipal=a.lentPrincipal;a.lentPrincipal=0;a.pendingInterest=lendingInterest(s);s.data.status='returning';break;
 case 'lending-settle':requireEvent(s,'lending-request');need(s.data.status==='returning','返還の処理中の明細を確認しよう。');s.simulationTime+=3600000;s.data.status='arrived';break;
 case 'lending-receive':requireEvent(s,'lending-settle');need(s.data.status==='arrived','先に返還を申し込み、処理中の明細を確認しよう。');a.availableUSDC=roundAmount(a.availableUSDC+a.pendingPrincipal+a.pendingInterest);a.interestReceived=roundAmount(a.interestReceived+a.pendingInterest);a.pendingPrincipal=0;a.pendingInterest=0;s.data.status='received';break;
 case 'leverage-open':expect(d,{collateral:100});need(['long','short'].includes(d.side)&&[1,2,5].includes(d.leverage),'方向と倍率を選ぼう。');need(!s.data.perp,'前の建玉を使い回さず、別の確認課題で試そう。');syncLeverage(s,openPerp({available:a.availableUSDC,collateral:100,leverage:d.leverage,entryPrice:100,side:d.side==='long'?1:-1,feeRate:0}));s.data.status='open';break;
 case 'leverage-mark':requireEvent(s,'leverage-open');need([95,105].includes(d.markPrice),'今回の値動きを選ぼう。');need(s.data.perp?.position,'保有中の建玉を確認しよう。');s.data.perp.position.markPrice=d.markPrice;syncLeverage(s,s.data.perp);s.data.status='marked';break;
 case 'leverage-close':requireEvent(s,'leverage-mark');need(s.data.perp?.position,'この建玉はすでに終わっています。');syncLeverage(s,closePerp(s.data.perp,s.data.perp.position.markPrice));s.data.status='closed';break;
 default:need(false,'この練習操作は見つかりません。');
 }
}
function assertScenario(s){need(s&&s.accounts&&s.data&&s.phoneState,'練習台帳の形が違います。');for(const[k,n]of Object.entries(s.accounts))need(typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e9&&(['unrealizedPnl','realizedPnl'].includes(k)||n>=0),'残高や予約の数字を確認できません。');need(Number.isFinite(s.simulationTime)&&s.simulationTime>=0,'練習の日付が不正です。');}
function parameters(s,step,value){const draft={...s.phoneState.formDrafts};if(step.field&&step.type!=='focus'){need(allowedFields.has(step.field),'この入力欄は登録されていません。');draft[step.field]=cleanField(step.field,value);}return draft;}
function applyToScenario(original,step,value){const s=clone(original),draft=parameters(s,step,value);s.phoneState.formDrafts=draft;const action=step.extensionAction;if(!action){assertScenario(s);return{s,changed:false};}
 if(action==='venue-select'){need(['dealer','board'].includes(draft.venue),'販売所か板を選ぼう。');s.phoneState.flags.previewVenue=draft.venue;return{s,changed:false};}
 need(actionScenario[action]===s.data.scenarioId,'この操作と資金の置き場所が一致しません。');
 const eventId=`${s.data.scenarioId}:${action}`;if(s.eventLog.some(e=>e.id===eventId))return{s:original,changed:false};
 execute(s,action,draft);assertScenario(s);s.eventLog.push({id:eventId,scenarioId:s.data.scenarioId,kind:action,stepId:step.id,at:s.simulationTime,parameters:clone(draft)});return{s,changed:true};
}
export function applyExtensionStep(state,step,value){const id=questScenario[step?.questId]??step?.scenarioId;if(!ids.includes(id))return false;need(state.financialScenarios?.[id],'追加練習の台帳が見つかりません。');const result=applyToScenario(state.financialScenarios[id],step,value);state.financialScenarios[id]=result.s;return result.changed;}
function makeReview(snapshot){const id=snapshot.scenarioId;need(ids.includes(id),'確認課題の練習場所が見つかりません。');const s=initialExtensionScenarios()[id];if(snapshot.exerciseQuantity!==undefined){const q=parseAmount(snapshot.exerciseQuantity);need(Number.isInteger(q)&&q>0&&q<=100,'確認課題の枚数が不正です。');s.data.exerciseQuantity=q;}
 if(snapshot.lendingAmount!==undefined){const p=parseAmount(snapshot.lendingAmount);need(p<=1000,'貸出の確認額が残高を超えています。');s.data.lendingAmount=p;}
 if(snapshot.profile)s.data.profile={...s.data.profile,...clone(snapshot.profile)};
 if(snapshot.kycOnly||snapshot.accountStatus==='submitted'){s.data.status='submitted';s.data.emailVerified=true;}
 s.initialSnapshot={accounts:clone(s.accounts),data:clone(s.data),simulationTime:0};return s;
}
export function applyExtensionReview(snapshot,action,value){if(!ids.includes(snapshot?.scenarioId))return false;if(action.phoneEffect==='open-mail')snapshot.mailOpened=true;if(action.phoneEffect==='copy-code'){need(snapshot.mailOpened,'届いた確認メールを開いてからコピーしよう。');snapshot.clipboard=(snapshot.profile?.verificationCode??profile.verificationCode);}const before=snapshot.scenario??makeReview(snapshot);const result=applyToScenario(before,action,value);snapshot.scenario=result.s;return result.changed;}
export function extensionReviewConditionsChanged(state,snapshot){
 if(snapshot?.scenarioId!=='leverage-choice')return true;
 const main=state.financialScenarios?.['leverage-choice']?.phoneState?.formDrafts??{},review=snapshot.scenario?.phoneState?.formDrafts??{};
 if(!['long','short'].includes(main.side)||!['long','short'].includes(review.side)||![1,2,5].includes(Number(main.leverage))||![1,2,5].includes(Number(review.leverage))||![95,105].includes(Number(main.markPrice))||![95,105].includes(Number(review.markPrice)))return false;
 return main.side!==review.side||Number(main.leverage)!==Number(review.leverage)||Number(main.markPrice)!==Number(review.markPrice);
}
export function validateExtensionScenarios(scenarios){const fresh=initialExtensionScenarios();for(const id of ids){const s=scenarios?.[id];need(s&&Array.isArray(s.eventLog)&&s.eventLog.length<=50,'追加練習の台帳が不足しています。');need(stable(s.initialSnapshot)===stable(fresh[id].initialSnapshot),'追加練習の初期資金は変更できません。');const expected=fresh[id],seen=new Set();for(const e of s.eventLog){need(e&&actionScenario[e.kind]===id&&e.id===`${id}:${e.kind}`&&!seen.has(e.id)&&typeof e.stepId==='string'&&extensionSteps.some(st=>st.id===e.stepId&&st.extensionAction===e.kind&&questScenario[st.questId]===id),'追加練習の履歴が未知か重複しています。');need(stable(Object.keys(e).sort())===stable(['id','scenarioId','kind','stepId','at','parameters'].sort()),'追加練習のイベントに未知の内容があります。');seen.add(e.id);need(e.parameters&&typeof e.parameters==='object'&&!Array.isArray(e.parameters),'注文内容の記録がありません。');for(const[k,v]of Object.entries(e.parameters)){need(allowedFields.has(k)&&stable(cleanField(k,v))===stable(v),'注文内容の型が違います。');}execute(expected,e.kind,e.parameters);expected.eventLog.push(clone(e));need(e.at===expected.simulationTime,'追加練習の時刻と履歴が違います。');}assertScenario(s);need(stable(s.accounts)===stable(expected.accounts)&&stable(s.data)===stable(expected.data)&&s.simulationTime===expected.simulationTime,'追加練習の残高・予約・履歴が一致しません。');}return true;}
const labels={jpy:'使える円（円）',coin:'使える教材コイン（枚）',reservedJPY:'注文で予約中の円（円）',reservedCoin:'注文で予約中のコイン（枚）',availableUSDC:'使える残高（Mock USDC）',lentPrincipal:'貸出中の元本（Mock USDC）',pendingPrincipal:'返還の処理中・元本（Mock USDC）',pendingInterest:'返還の処理中・利息（Mock USDC）',interestReceived:'受取済みの利息（Mock USDC）',collateral:'配分中の証拠金（Mock USDC）',unrealizedPnl:'値動きによる損益（Mock USDC）',realizedPnl:'確定した損益'};
export function extensionScenarioSummary(s){if(!s||!ids.includes(s.data?.scenarioId))return[];return Object.entries(s.accounts).map(([key,value])=>({key,label:labels[key]??key,value}));}
const statusNames={not_started:'まだ申し込んでいません',registered:'メールの認証待ち',verified:'メール認証済み',submitted:'口座の申込済み',reviewing:'本人確認の審査中',active:'利用できます',ready:'操作前',bought:'購入済み',sold:'売却済み',pending:'指値の注文待ち',cancelled:'注文を取り消しました',lending:'貸出中',matured:'満期になりました',returning:'返還の処理中',arrived:'受取の明細が届きました',received:'受取済み',open:'建玉を保有中',marked:'値動きを確認しました',closed:'決済済み'};
export function getExtensionView(state,step,options={}){const rs=options.reviewSnapshot;const id=rs?.scenarioId??questScenario[step?.questId]??step?.scenarioId;const s=rs?(rs.scenario??makeReview(rs)):state.financialScenarios?.[id];if(!s||!ids.includes(id))return null;const d={...s.phoneState.formDrafts},p=s.data.perp?.position,history=s.data.perp?.history?.at(-1),boardAsk=s.data.price===105?106:(s.data.price??100),boardBid=s.data.price===105?105:boardAsk-1;const view={title:titles[id],scenarioId:id,status:statusNames[s.data.status]??s.data.status,rows:extensionScenarioSummary(s),quote:[],orders:clone(s.data.orders??[]),fills:clone(s.data.fills??[]),notices:['架空の教材です。実サービスの価格・費用・年率ではありません。'],isReview:!!rs,venues:{dealer:{ask:102,bid:100,fee:0},board:{ask:boardAsk,bid:boardBid,fee:0}}};
 if(id==='domestic-account'){view.account={status:s.data.status,emailVerified:s.data.emailVerified,kycStatus:s.data.kycStatus,accountCount:s.data.accountCount,profile:clone(s.data.profile)};}
 if(id.startsWith('domestic-')&&id!=='domestic-account'){const q=s.data.exerciseQuantity,side=d.side??'buy',price=id==='domestic-dealer'?(d.venue==='board'?(side==='sell'?boardBid:boardAsk):(side==='sell'?100:102)):d.orderType==='limit'?(Number(d.limitPrice)||95):(side==='sell'?boardBid:boardAsk);view.quote=[{key:'quantity',label:'今回の枚数',value:q},{key:'price',label:side==='sell'?'売るときの1枚の価格（円）':'買うときの1枚の価格（円）',value:price},{key:'total',label:'代金（円）',value:roundAmount(q*price)},{key:'fee',label:'教材の明示手数料（円）',value:0}];view.venue=d.venue??s.data.venue;view.orderBook={label:'架空教材の板（価格ごとに待つ注文）',asks:[{price:boardAsk,quantity:10},{price:boardAsk+1,quantity:20},{price:boardAsk+2,quantity:30}],bids:[{price:boardBid,quantity:15},{price:boardBid-1,quantity:25},{price:boardBid-2,quantity:35}]};if(id==='domestic-dealer')view.notices.push('買い値と売り値の差を、別の手数料として重ねて引きません。');if(id==='domestic-limit')view.notices.push('予約中はまだ売買できていません。この教材だけ、値動きを進めて成立する成功例です。');}
 if(id==='lending-lab'){view.quote=[{key:'principal',label:'貸す元本（Mock USDC）',value:s.data.lendingAmount},{key:'rate',label:'教材の年率',value:'12%'},{key:'term',label:'期間',value:'30練習日（1年を365日とする単利）'},{key:'interest',label:'満期の予定利息（Mock USDC）',value:lendingInterest(s)},{key:'total',label:'満期の元本と利息（Mock USDC）',value:roundAmount(s.data.lendingAmount+lendingInterest(s))}];view.lending={acceptedAtSimulation:s.data.acceptedAtSimulation,maturesAtSimulation:s.data.maturesAtSimulation,simulationTime:s.simulationTime};view.notices.push('途中で返してもらえない契約です。貸した先が返せない危険があります。今回は返ってくる成功例で、元本保証ではありません。');}
 if(id==='leverage-choice'){
  if(rs)view.changedConditions=extensionReviewConditionsChanged(state,rs);
  const opened=s.eventLog.find(e=>e.kind==='leverage-open')?.parameters,L=p?.leverage??Number(opened?.leverage??d.leverage),side=p?.side===1?'long':p?.side===-1?'short':opened?.side??d.side??null,closed=!!history;
  view.metrics={side,leverage:[1,2,5].includes(L)?L:null,positionOpen:!!p,quantity:p?.quantity??0,notional:p?.notional??0,collateral:p?.collateral??0,unrealizedPnl:s.accounts.unrealizedPnl,realizedPnl:s.accounts.realizedPnl,available:s.accounts.availableUSDC,markPrice:p?.markPrice??history?.fillPrice??100};
  view.position={open:!!p,quantity:p?.quantity??0,notional:p?.notional??0,collateral:p?.collateral??0,side:p?(p.side===1?'long':'short'):null,leverage:p?.leverage??null,entryPrice:p?.entryPrice??null,markPrice:p?.markPrice??null};
  view.leverageHistory=(s.data.perp?.history??[]).map(h=>({side:opened?.side??side,leverage:L,entryPrice:100,exitPrice:h.fillPrice,quantity:roundAmount((opened?.collateral??100)*L/100),notional:roundAmount((opened?.collateral??100)*L),collateral:opened?.collateral??100,grossPnl:h.grossPnl,netPnl:h.netPnl,returned:h.returned,reason:h.reason}));
  view.quote=[{key:'side',label:closed?'終えた取引の方向':'方向',value:side==='long'?'上がると利益になる買い（ロング）':side==='short'?'下がると利益になる売り（ショート）':'まだ選んでいません'},{key:'leverage',label:closed?'終えた取引の倍率':'倍率',value:[1,2,5].includes(L)?`${L}倍`:'まだ選んでいません'},{key:'collateral',label:closed?'現在配分中の証拠金':'今回の注文で配分する証拠金',value:closed?0:100},{key:'notional',label:closed?'現在の建玉金額':'値動きを受ける金額',value:closed?0:[1,2,5].includes(L)?100*L:0},{key:'quantity',label:closed?'現在の建玉数量（残量）':'値動きを受ける数量',value:closed?0:p?.quantity??([1,2,5].includes(L)?L:0)}];
  view.notices.push('この選択練習では手数料・資金調達料は0。固定の先物講座で、損切り・資金調達料・簡略化した清算を別に練習します。');
 }

 return view;
}
