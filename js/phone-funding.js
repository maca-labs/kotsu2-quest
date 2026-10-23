import {fundingScenarioSummary,fundingHandoffReference} from './finance-funding.js';
import {steps as fundingSteps} from './content-funding.js';

const format=value=>typeof value==='number'?value.toLocaleString('ja-JP',{maximumFractionDigits:6}):String(value??'');
const valueAt=id=>fundingSteps.find(step=>step.id===id)?.value;
const same=(actual,expected)=>{const value=String(actual??'').normalize('NFKC').trim();return value!==''&&(typeof expected==='number'?Number(value)===expected:value===String(expected));};
const names={MichiNet:'みち道（MichiNet）',Arbitrum:'Arbitrum',MCHI:'ミチコイン MCHI','MCHI/USDC':'MCHI → Mock USDC'};
const shown=value=>names[value]??value;
const sender='朝日 ミナト（架空の成人）';

/** Read the actual draft and settled/pending ledger. No balances are calculated here. */
export function getFundingView(state,step){
 if(!step?.id?.startsWith('FI-'))return null;
 const scenario=state.financialScenarios?.['funding-japan'];if(!scenario)return null;
 const n=Number(step.id.slice(-3)),questId=step.questId??step.id.slice(0,5);
 const stage=questId==='FI-01'?(n<=15?'deposit':'purchase'):questId==='FI-02'?'withdraw':n<=8?'swap':n<=16?'bridge':n<=23?'gas':'handoff';
 const draft=scenario.phoneState?.formDrafts?.funding??{},q=scenario.data.quotes;
 const input=(key,label)=>({key,label,value:Object.hasOwn(draft,key)&&String(draft[key]).trim()!==''?shown(draft[key]):'未入力',unentered:!Object.hasOwn(draft,key)||String(draft[key]).trim()===''});
 const row=(label,value)=>({label,value});
 const specs={
  deposit:{title:'円の振込',fields:[['depositRecipient','入力した入金先'],['depositJPY','入力した金額（円）']],expected:{depositRecipient:valueAt('FI-01-S006'),depositJPY:valueAt('FI-01-S008')},conditions:[row('受取カードの入金先',valueAt('FI-01-S006')),row('今回の名義',sender),row('教材で送る円',valueAt('FI-01-S008')),row('教材の振込費（円）',0)],keys:['bankJPY','depositPendingJPY','domesticJPY'],copy:'入金先と金額を受取カードと見比べます。「確定」の前には、まだ銀行から送っていません。'},
  purchase:{title:'教材コインの購入',fields:[['purchaseAsset','選んだ資産'],['purchaseQuantity','入力した枚数']],expected:{purchaseAsset:q.purchase.asset,purchaseQuantity:q.purchase.quantity},conditions:[row('教材見積の資産',shown(q.purchase.asset)),row('1枚の教材価格（円）',q.purchase.unitJPY),row('教材見積の枚数',q.purchase.quantity),row('支払う予定の合計（円）',q.purchase.totalJPY),row('教材の購入費（円）',0)],keys:['domesticJPY','domesticMCHI'],copy:'入力した資産と枚数を見積書と見比べます。買ったあとのコインは交換所内です。自分の財布とは別です。'},
  withdraw:{title:'自分の財布への出庫',fields:[['withdrawAsset','選んだ資産'],['withdrawNetwork','選んだ道'],['withdrawAddress','入力した自分の宛先'],['withdrawQuantity','入力した枚数']],expected:{withdrawAsset:q.withdraw.asset,withdrawNetwork:q.withdraw.network,withdrawAddress:q.withdraw.address,withdrawQuantity:q.withdraw.gross},conditions:[row('受取カードの資産',shown(q.withdraw.asset)),row('受取カードの道',shown(q.withdraw.network)),row('受取カードの宛先',q.withdraw.address),row('出庫する予定の枚数',q.withdraw.gross),row('申請した枚数から引く教材費（枚）',q.withdraw.fee),row('届く予定の枚数',q.withdraw.net)],keys:['domesticMCHI','withdrawPendingMCHI','walletMCHI','withdrawalFeeMCHI'],copy:'資産・道・宛先を、一つずつ受取カードと見比べます。費用は送る枚数に含まれます。処理中のコインはまだ使えません。'},
  swap:{title:'資産の種類を替える',fields:[['swapPair','選んだ交換の組合せ'],['swapQuantity','入力したMCHIの枚数']],expected:{swapPair:q.swap.pair,swapQuantity:q.swap.input},conditions:[row('教材見積の組合せ',shown(q.swap.pair)),row('交換する予定のMCHI',q.swap.input),row('1 MCHIで受け取る教材USDC',q.swap.rate),row('教材の交換費（Mock USDC）',q.swap.fee),row('受取予定（Mock USDC）',q.swap.output),row('交換後も同じ道',shown(q.swap.network))],keys:['walletMCHI','swapPendingUSDC','michiUSDC'],copy:'替えるのは資産の種類です。受け取るUSDCも、まだ同じ「みち道」にあります。'},
  bridge:{title:'USDCの道を替える',fields:[['bridgeNetwork','選んだ到着先の道']],expected:{bridgeNetwork:q.bridge.network},conditions:[row('資産の種類',q.bridge.asset),row('出発する道',shown(q.bridge.sourceNetwork)),row('受取カードの道',shown(q.bridge.network)),row('自分の受取宛先',q.bridge.address),row('送る予定（Mock USDC）',q.bridge.gross),row('申請額から引く教材費（Mock USDC）',q.bridge.fee),row('到着予定（Mock USDC）',q.bridge.net)],keys:['michiUSDC','bridgePendingUSDC','arbitrumUSDC','pathFeeUSDC'],copy:'USDCという種類は同じまま、使う道を替えます。到着予定と、実際に届いた残高を分けて見ます。'},
  gas:{title:'ガス用の別の資産を用意',fields:[['gasPayment','入力した支払額（Mock USDC）']],expected:{gasPayment:q.gas.costUSDC},conditions:[row('同じ道に用意する',shown(q.gas.network)),row('使う予定のMock USDC',q.gas.costUSDC),row('用意する予定のMock ETH',q.gas.outputETH)],keys:['arbitrumUSDC','gasPendingETH','walletETH','gasCostUSDC'],copy:'ガスは道を使う処理の費用です。USDCから、別の種類のガス用ETHを用意します。USDCとETHの数は足しません。'},
  handoff:{title:'同じ資金の引継ぎ',fields:[],expected:{},conditions:[row('引継ぐ教材USDC',fundingHandoffReference.expectedInitialBalances.walletUSDC),row('引継ぐガス用Mock ETH',fundingHandoffReference.expectedInitialBalances.walletETH),row('道','Arbitrum')],keys:['arbitrumUSDC','walletETH','handoffUSDC'],copy:'次の旅で使う同じ資金の記録です。もう一度お金をもらう操作ではありません。移管した後は、準備台帳の財布は空になります。'}
 };
 const spec=specs[stage],inputs=spec.fields.map(([key,label])=>input(key,label));
 const status=stage==='handoff'?(scenario.data.handoff?'transferred':'not_started'):scenario.data[`${stage}Status`];
 const hasInput=inputs.some(field=>!field.unentered),quoteReady=Object.entries(spec.expected).every(([key,value])=>same(draft[key],value));
 const statusText=status==='transferred'?'移管済み — 追加配布はありません':status==='processing'?'送信済み・処理中 — まだ受取先では使えません':status==='received'?'到着済み — 台帳の受取先に記録されました':status==='filled'?'購入済み — コインは交換所内にあります':stage==='handoff'?'まだ移管していません':hasInput?'入力中 — まだ確定していません':'まだ入力していません';
 return {stage,title:spec.title,status,statusText,inputs,conditions:spec.conditions,quoteReady,copy:spec.copy,rows:fundingScenarioSummary(scenario).filter(item=>spec.keys.includes(item.key))};
}

/** Generic controls remain responsible for every existing individual operation. */
export function renderFundingPanel({document:doc,state,step}){
 const view=getFundingView(state,step);if(!doc||!view)return null;
 const node=(tag,text='',className='')=>{const n=doc.createElement(tag);if(text)n.textContent=String(text);if(className)n.className=className;return n;};
 const root=node('section','','extension-phone-panel funding-phone-panel');root.setAttribute('aria-label',`${view.title}の確認画面`);
 const header=node('header','','extension-app-head');header.append(node('strong',view.title),node('span','架空の教材','extension-demo'));root.append(header);
 const body=node('div','','extension-app-body');root.append(body);
 const status=node('p',view.statusText,'extension-status');status.setAttribute('role','status');body.append(status);
 const box=(title,rows,copy)=>{const section=node('section','','extension-box');section.append(node('h4',title));if(copy)section.append(node('p',copy));const list=node('dl','','extension-ledger');for(const item of rows){list.append(node('dt',item.label),node('dd',format(item.value),item.unentered?'funding-unentered':''));}section.append(list);return section;};
 if(view.inputs.length)body.append(box('今回、入力した内容',view.inputs,view.stage==='deposit'?`振込の名義：${sender}`:null));
 body.append(box(view.stage==='handoff'?'次の旅へつなぐ教材条件':'受取カード・教材の見積書（確定前の予定）',view.conditions));
 if(view.inputs.length)body.append(node('p',view.quoteReady?'入力内容は今回の教材条件と一致しています。下の台帳は、すでに記録された状態です。':'未入力や違う内容は、上の受取カード・見積書と見比べよう。予定の数字だけでは、送信・受取済みになりません。','funding-comparison'));
 body.append(box('台帳に記録された、いまの置き場所',view.rows),node('p',view.copy));
 return {element:root,handlesAction:false};
}
