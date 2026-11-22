import {fundingScenarioSummary,fundingHandoffReference} from './finance-funding.js';
import {steps as fundingSteps} from './content-funding.js';

const format=value=>typeof value==='number'?value.toLocaleString('ja-JP',{maximumFractionDigits:6}):String(value??'');
const valueAt=id=>fundingSteps.find(step=>step.id===id)?.value;
const same=(actual,expected)=>{const value=String(actual??'').normalize('NFKC').trim();return value!==''&&(typeof expected==='number'?Number(value)===expected:value===String(expected));};
const names={MichiNet:'みち道（MichiNet）',Arbitrum:'Arbitrum',MCHI:'ミチコイン MCHI','MCHI/USDC':'MCHI → Mock USDC'};
const shown=value=>names[value]??value;
const sender='朝日 ミナト（架空の成人）';

function fundingStage(step) {
 const n=Number(step.id.slice(-3)),questId=step.questId??step.id.slice(0,5);
 if(questId==='FI-01')return n<=15?'deposit':'purchase';
 if(questId==='FI-02')return 'withdraw';
 if(n<=8)return 'swap';
 if(n<=16)return 'bridge';
 return n<=23?'gas':'handoff';
}

const yen=value=>format(value)+'円';
const mchi=value=>'MCHI '+format(value)+'枚';
const usdc=value=>format(value)+' Mock USDC';
const eth=value=>format(value)+' Mock ETH';

function transferProgress(status,pending,before='まだ送っていません。') {
 if(status==='processing')return pending+'を預かり中。';
 if(status==='received')return '到着済み。';
 return before;
}

function journeyBalance(accounts) {
 let text=`旅の財布Aに${usdc(accounts.walletUSDC)}と${eth(accounts.walletETH)}。`;
 if(accounts.incomingUSDC>0)text+=`HyperCoreへ${usdc(accounts.incomingUSDC)}を届けている途中です。`;
 if(accounts.availableUSDC>0)text+=`HyperCoreで使えるのは${usdc(accounts.availableUSDC)}。`;
 if(accounts.withdrawalPending>0)text+=`財布Aへ${usdc(accounts.withdrawalPending)}が戻る途中です。`;
 return text;
}

/** A receipt beside the current control, or the last receipt of a reported quest. */
export function getFundingSlip(state,questId,stepId=null) {
 const scenario=state?.financialScenarios?.['funding-japan'];
 const step=stepId===null?fundingSteps.findLast(item=>item.questId===questId)
  :fundingSteps.find(item=>item.questId===questId&&item.id===stepId);
 if(!scenario||!step)return null;
 const {accounts:a,data}=scenario,q=data.quotes;
 switch(fundingStage(step)){
  case 'deposit':return {
   title:'円の受取カード',
   route:'あかり練習銀行 → こみち交換所（架空）。あかつき取引所の申込とは別の練習です。',
   reference:`入金先 ${valueAt('FI-01-S006')}。振込人は${sender}。送るのは${yen(valueAt('FI-01-S008'))}。`,
   status:transferProgress(data.depositStatus,yen(a.depositPendingJPY))+`いま銀行に${yen(a.bankJPY)}、交換所に${yen(a.domesticJPY)}。`
  };
  case 'purchase':return {
   title:'教材コインの購入控え',
   route:'こみち交換所の円 → 同じ交換所のミチコイン。あかつき取引所とは別の架空の窓口です。',
   reference:`見積もりは1枚${yen(q.purchase.unitJPY)}。${mchi(q.purchase.quantity)}で${yen(q.purchase.totalJPY)}。`,
   status:(data.purchaseStatus==='filled'?'購入済み。':'まだ購入していません。')+`いま銀行に${yen(a.bankJPY)}。交換所に${yen(a.domesticJPY)}と${mchi(a.domesticMCHI)}。`
  };
  case 'withdraw':return {
   title:'財布Aの受取カード',
   route:'こみち交換所 → 自分の財布A',
   reference:`${shown(q.withdraw.network)}の ${q.withdraw.address}。送る${mchi(q.withdraw.gross)}のうち費用は${format(q.withdraw.fee)}枚。到着予定は${format(q.withdraw.net)}枚。`,
   status:transferProgress(data.withdrawStatus,mchi(a.withdrawPendingMCHI))+`いま交換所に${mchi(a.domesticMCHI)}、財布Aに${mchi(a.walletMCHI)}。`
  };
  case 'swap':return {
   title:'コインの交換控え',
   route:`財布AのMCHI → 同じ財布AのMock USDC。道は${shown(q.swap.network)}のままです。`,
   reference:`宛先 ${q.withdraw.address}。${mchi(q.swap.input)}を渡し、${usdc(q.swap.output)}を受け取る予定です。`,
   status:transferProgress(data.swapStatus,usdc(a.swapPendingUSDC),'交換する前です。')+`いま財布Aに${mchi(a.walletMCHI)}と${usdc(a.michiUSDC)}。`
  };
  case 'bridge':return {
   title:'道替えの受取カード',
   route:`財布Aの${shown(q.bridge.sourceNetwork)} → 同じ財布Aの${q.bridge.network}。コインはMock USDCのままです。`,
   reference:`宛先 ${q.bridge.address}。${usdc(q.bridge.gross)}から費用${format(q.bridge.fee)}を引き、到着予定は${usdc(q.bridge.net)}。`,
   status:transferProgress(data.bridgeStatus,usdc(a.bridgePendingUSDC))+`いま、みち道に${usdc(a.michiUSDC)}、${q.bridge.network}に${usdc(a.arbitrumUSDC)}。`
  };
  case 'gas':return {
   title:'ガス用コインの交換控え',
   route:`財布AのMock USDC → 同じ財布AのMock ETH。道は${q.gas.network}です。`,
   reference:`宛先 ${q.bridge.address}。${usdc(q.gas.costUSDC)}で、道を使う費用として${eth(q.gas.outputETH)}を用意します。`,
   status:transferProgress(data.gasStatus,eth(a.gasPendingETH),'ガス用コインを用意する前です。')+`いま財布Aに${usdc(a.arbitrumUSDC)}と${eth(a.walletETH)}。`
  };
  case 'handoff':{
   const journey=state.financialScenarios.journey;
   const prepared=fundingHandoffReference.expectedInitialBalances;
   let status=`準備の財布Aに${usdc(a.arbitrumUSDC)}と${eth(a.walletETH)}。`;
   if(data.handoff){
    status='引継ぎ済み。'+(journey?.accounts?journeyBalance(journey.accounts):'準備の記録は閉じました。残高は次の旅の財布Aで確かめよう。');
   }else if(journey?.accounts&&(journey.accounts.walletUSDC!==prepared.walletUSDC||journey.accounts.walletETH!==prepared.walletETH)){
    status+='以前の旅の記録も残っています。'+journeyBalance(journey.accounts);
   }
   return {
    title:'旅へ引き継ぐ控え',
    route:'準備の財布A → 次の旅でも同じ財布A',
    reference:`${q.bridge.network}の ${q.bridge.address}。用意した${usdc(prepared.walletUSDC)}と${eth(prepared.walletETH)}は、一度だけ数えます。`,
    status
   };
  }
 }
}

/** Read the actual draft and settled/pending ledger. No balances are calculated here. */
export function getFundingView(state,step){
 if(!step?.id?.startsWith('FI-'))return null;
 const scenario=state.financialScenarios?.['funding-japan'];if(!scenario)return null;
 const stage=fundingStage(step);
 const draft=scenario.phoneState?.formDrafts?.funding??{},q=scenario.data.quotes;
 const input=(key,label)=>({key,label,value:Object.hasOwn(draft,key)&&String(draft[key]).trim()!==''?shown(draft[key]):'未入力',unentered:!Object.hasOwn(draft,key)||String(draft[key]).trim()===''});
 const row=(label,value)=>({label,value});
 const specs={
  deposit:{title:'円の振込',fields:[['depositRecipient','入力した入金先'],['depositJPY','入力した金額（円）']],expected:{depositRecipient:valueAt('FI-01-S006'),depositJPY:valueAt('FI-01-S008')},conditions:[row('受取カードの入金先',valueAt('FI-01-S006')),row('振込人名義（申し込んだ人の名前）',sender),row('教材で送る円',valueAt('FI-01-S008')),row('教材の振込費（円）',0)],keys:['bankJPY','depositPendingJPY','domesticJPY'],copy:'入金先と金額を受取カードと見比べます。「確定」の前には、まだ銀行から送っていません。'},
  purchase:{title:'教材コインの購入',fields:[['purchaseAsset','選んだ資産'],['purchaseQuantity','入力した枚数']],expected:{purchaseAsset:q.purchase.asset,purchaseQuantity:q.purchase.quantity},conditions:[row('教材見積の資産',shown(q.purchase.asset)),row('1枚の教材価格（円）',q.purchase.unitJPY),row('教材見積の枚数',q.purchase.quantity),row('支払う予定の合計（円）',q.purchase.totalJPY),row('教材の購入費（円）',0)],keys:['domesticJPY','domesticMCHI'],copy:'購入するコインの種類と枚数を、見積書と比べよう。購入したコインは交換所内の残高に入ります。自分の練習財布には、まだ移りません。'},
  withdraw:{title:'自分の財布への出庫',fields:[['withdrawAsset','選んだ資産'],['withdrawNetwork','選んだ道'],['withdrawAddress','入力した自分の宛先'],['withdrawQuantity','入力した枚数']],expected:{withdrawAsset:q.withdraw.asset,withdrawNetwork:q.withdraw.network,withdrawAddress:q.withdraw.address,withdrawQuantity:q.withdraw.gross},conditions:[row('受取カードの資産',shown(q.withdraw.asset)),row('受取カードの道',shown(q.withdraw.network)),row('受取カードの宛先',q.withdraw.address),row('出庫する予定の枚数',q.withdraw.gross),row('申請した枚数から引く教材費（枚）',q.withdraw.fee),row('届く予定の枚数',q.withdraw.net)],keys:['domesticMCHI','withdrawPendingMCHI','walletMCHI','withdrawalFeeMCHI'],copy:'資産・道・宛先を、一つずつ受取カードと見比べます。費用は送る枚数に含まれます。処理中のコインはまだ使えません。'},
  swap:{title:'資産の種類を替える',fields:[['swapPair','選んだ交換の組合せ'],['swapQuantity','入力したMCHIの枚数']],expected:{swapPair:q.swap.pair,swapQuantity:q.swap.input},conditions:[row('教材見積の組合せ',shown(q.swap.pair)),row('交換する予定のMCHI',q.swap.input),row('1 MCHIで受け取る教材USDC',q.swap.rate),row('教材の交換費（Mock USDC）',q.swap.fee),row('受取予定（Mock USDC）',q.swap.output),row('交換後も同じ道',shown(q.swap.network))],keys:['walletMCHI','swapPendingUSDC','michiUSDC'],copy:'MCHIをMock USDCに交換します。交換後も、使うネットワークは「みち道」のままです。いま持っている数量は、下の残高で確かめよう。'},
  bridge:{title:'USDCの道を替える',fields:[['bridgeNetwork','選んだ到着先の道']],expected:{bridgeNetwork:q.bridge.network},conditions:[row('資産の種類',q.bridge.asset),row('出発する道',shown(q.bridge.sourceNetwork)),row('受取カードの道',shown(q.bridge.network)),row('自分の受取宛先',q.bridge.address),row('送る予定（Mock USDC）',q.bridge.gross),row('申請額から引く教材費（Mock USDC）',q.bridge.fee),row('到着予定（Mock USDC）',q.bridge.net)],keys:['michiUSDC','bridgePendingUSDC','arbitrumUSDC','pathFeeUSDC'],copy:'USDCという種類は同じまま、使う道を替えます。到着予定と、実際に届いた残高を分けて見ます。'},
  gas:{title:'ガス用の別の資産を用意',fields:[['gasPayment','入力した支払額（Mock USDC）']],expected:{gasPayment:q.gas.costUSDC},conditions:[row('同じ道に用意する',shown(q.gas.network)),row('使う予定のMock USDC',q.gas.costUSDC),row('用意する予定のMock ETH',q.gas.outputETH)],keys:['arbitrumUSDC','gasPendingETH','walletETH','gasCostUSDC'],copy:'ガスは道を使う処理の費用です。USDCから、別の種類のガス用ETHを用意します。USDCとETHの数は足しません。'},
  handoff:{title:'同じ資金の引継ぎ',fields:[],expected:{},conditions:[row('引継ぐ教材USDC',fundingHandoffReference.expectedInitialBalances.walletUSDC),row('引継ぐガス用Mock ETH',fundingHandoffReference.expectedInitialBalances.walletETH),row('道','Arbitrum')],keys:['arbitrumUSDC','walletETH','handoffUSDC'],copy:'用意した資金を、次の練習で使う資金として記録します。すでに次の練習を進めている場合、その残高は増やしません。同じ資金を前の練習と二重には使えません。'}
 };
 const spec=specs[stage],inputs=spec.fields.map(([key,label])=>input(key,label));
 const status=stage==='handoff'?(scenario.data.handoff?'transferred':'not_started'):scenario.data[`${stage}Status`];
 const hasInput=inputs.some(field=>!field.unentered),quoteReady=Object.entries(spec.expected).every(([key,value])=>same(draft[key],value));
 const statusText=status==='transferred'?'移管済み — 追加配布はありません':status==='processing'?'送信済み・処理中 — まだ受取先では使えません':status==='received'?'到着済み — 台帳の受取先に記録されました':status==='filled'?'購入済み — コインは交換所内にあります':stage==='handoff'?'まだ移管していません':hasInput?'入力中 — まだ確定していません':'まだ入力していません';
 return {stage,title:spec.title,status,statusText,inputs,conditions:spec.conditions,quoteReady,copy:stage==='deposit'&&status==='received'?'こみち交換所に届いた円を、今回の入金明細と見比べよう。':stage==='deposit'&&status==='processing'?'銀行から送りました。入金先で使えるのは到着してからです。':spec.copy,rows:fundingScenarioSummary(scenario).filter(item=>spec.keys.includes(item.key))};
}

/** Generic controls remain responsible for every existing individual operation. */
export function renderFundingPanel({document:doc,state,step}){
 const view=getFundingView(state,step);if(!doc||!view)return null;
 const node=(tag,text='',className='')=>{const n=doc.createElement(tag);if(text)n.textContent=String(text);if(className)n.className=className;return n;};
 const root=node('details','','extension-phone-panel funding-phone-panel funding-current');root.setAttribute('aria-label',`${view.title}の確認画面`);
 root.append(node('summary','入力した内容と詳しい明細','extension-app-head'));
 const body=node('div','','extension-app-body');root.append(body);
 const status=node('p',view.statusText,'extension-status');status.setAttribute('role','status');body.append(status);
 const box=(title,rows,copy)=>{const section=node('section','','extension-box');section.append(node('h4',title));if(copy)section.append(node('p',copy));const list=node('dl','','extension-ledger');for(const item of rows){list.append(node('dt',item.label),node('dd',format(item.value),item.unentered?'funding-unentered':''));}section.append(list);return section;};
 if(view.inputs.length)body.append(box('今回、入力した内容',view.inputs,view.stage==='deposit'?`振込人名義（申し込んだ人の名前）：${sender}`:null));
 body.append(box(view.stage==='handoff'?'次の旅へつなぐ教材条件':'受取カード・教材の見積書（確定前の予定）',view.conditions));
 if(view.inputs.length)body.append(node('p',view.quoteReady?'入力内容は今回の教材条件と一致しています。いま使える残高と、処理中の金額は下で確かめよう。':'未入力や違う内容は、上の受取カード・見積書と見比べよう。予定の数字だけでは、送信・受取済みになりません。','funding-comparison'));
 body.append(box('資金がある場所と、いまの残高',view.rows),node('p',view.copy));
 return {element:root,handlesAction:false};
}
