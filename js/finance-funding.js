// A fully fictional domestic-funding lesson. No real exchange, chain or quote API.
const SCENARIO='funding-japan', HOUR=3_600_000;
const clone=value=>structuredClone(value);
const need=(condition,message)=>{if(!condition)throw new Error(message);};
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((out,key)=>(out[key]=v[key],out),{}):v);
export const fundingHandoffReference=Object.freeze({
  kind:'same-funds-reference',sourceScenarioId:SCENARIO,targetScenarioId:'journey',
  expectedInitialBalances:{walletUSDC:1000,walletETH:0.001},additionalCredit:false,
});
export function initialFundingScenarios(){
 const initial={accounts:{bankJPY:200000,depositPendingJPY:0,domesticJPY:0,domesticMCHI:0,withdrawPendingMCHI:0,walletMCHI:0,withdrawalFeeMCHI:0,swapPendingUSDC:0,michiUSDC:0,bridgePendingUSDC:0,arbitrumUSDC:0,pathFeeUSDC:0,gasPendingETH:0,walletETH:0,gasCostUSDC:0},
  data:{depositStatus:'not_started',purchaseStatus:'not_started',withdrawStatus:'not_started',swapStatus:'not_started',bridgeStatus:'not_started',gasStatus:'not_started',handoff:null,
   quotes:{purchase:{asset:'MCHI',unitJPY:1000,quantity:104,totalJPY:104000},withdraw:{asset:'MCHI',network:'MichiNet',address:'DEMO-WALLET-A',gross:104,fee:1,net:103},swap:{pair:'MCHI/USDC',network:'MichiNet',input:103,rate:10,fee:0,output:1030},bridge:{asset:'USDC',sourceNetwork:'MichiNet',network:'Arbitrum',address:'DEMO-WALLET-A',gross:1030,fee:20,net:1010},gas:{network:'Arbitrum',costUSDC:10,outputETH:0.001}}},simulationTime:0};
 return {[SCENARIO]:{initialSnapshot:clone(initial),...clone(initial),eventLog:[],phoneState:{formDrafts:{},flags:{}}}};
}
const fieldByStep={
 'FI-01-S006':'depositRecipient','FI-01-S008':'depositJPY','FI-01-S017':'purchaseAsset','FI-01-S019':'purchaseQuantity',
 'FI-02-S004':'withdrawAsset','FI-02-S007':'withdrawNetwork','FI-02-S009':'withdrawAddress','FI-02-S011':'withdrawQuantity',
 'FI-03-S002':'swapPair','FI-03-S004':'swapQuantity','FI-03-S011':'bridgeNetwork','FI-03-S019':'gasPayment',
};
const definitions=[];
const event=(stepId,kind,apply,guard)=>definitions.push({stepId,kind,apply,guard});
const expect=(draft,expected)=>{for(const[key,value]of Object.entries(expected)){const actual=draft[key];const equal=typeof value==='number'?typeof actual!=='object'&&String(actual??'').normalize('NFKC').trim()!==''&&Number(String(actual).normalize('NFKC'))===value:String(actual??'').normalize('NFKC').trim()===value;need(equal,`「${fieldLabels[key]||'入力した内容'}」を、今回の受取カード・見積書と合わせよう。正しい入力は残っています。`);}};
const quote=(s,name)=>need(stable(s.data.quotes[name])===stable(initialFundingScenarios()[SCENARIO].data.quotes[name]),'教材の見積書と費用・受取額が一致しません。見積書を開き直そう。');
const occurred=(s,kind)=>need(s.eventLog.some(e=>e.kind===kind),'先にこの資金の送信・受取を確認しよう。');
event('FI-01-S011','deposit:request',s=>{s.accounts.bankJPY-=120000;s.accounts.depositPendingJPY=120000;s.data.depositStatus='processing';},(s,d)=>{expect(d,{depositRecipient:'DEMO-JPY-GATE',depositJPY:120000});need(s.accounts.bankJPY>=120000,'銀行にある架空の円が足りません。');});
event('FI-01-S013','deposit:receive',s=>{occurred(s,'deposit:request');s.accounts.domesticJPY+=s.accounts.depositPendingJPY;s.accounts.depositPendingJPY=0;s.data.depositStatus='received';s.simulationTime+=HOUR;});
event('FI-01-S022','purchase:fill',s=>{occurred(s,'deposit:receive');s.accounts.domesticJPY-=104000;s.accounts.domesticMCHI+=104;s.data.purchaseStatus='filled';},(s,d)=>{expect(d,{purchaseAsset:'MCHI',purchaseQuantity:104});quote(s,'purchase');need(s.accounts.domesticJPY>=104000,'先に、国内の架空交換所に円が届いたことを確かめよう。');});
event('FI-02-S017','withdraw:request',s=>{occurred(s,'purchase:fill');s.accounts.domesticMCHI-=104;s.accounts.withdrawPendingMCHI=103;s.accounts.withdrawalFeeMCHI+=1;s.data.withdrawStatus='processing';},(s,d)=>{expect(d,{withdrawAsset:'MCHI',withdrawNetwork:'MichiNet',withdrawAddress:'DEMO-WALLET-A',withdrawQuantity:104});quote(s,'withdraw');need(s.accounts.domesticMCHI>=104,'交換所のMCHI残高を確かめよう。');});
event('FI-02-S019','withdraw:receive',s=>{occurred(s,'withdraw:request');s.accounts.walletMCHI+=s.accounts.withdrawPendingMCHI;s.accounts.withdrawPendingMCHI=0;s.data.withdrawStatus='received';s.simulationTime+=HOUR;});
event('FI-03-S006','swap:request',s=>{occurred(s,'withdraw:receive');s.accounts.walletMCHI-=103;s.accounts.swapPendingUSDC=1030;s.data.swapStatus='processing';},(s,d)=>{expect(d,{swapPair:'MCHI/USDC',swapQuantity:103});quote(s,'swap');need(s.accounts.walletMCHI>=103,'自分の練習ウォレットに届いたMCHIを確認しよう。');});
event('FI-03-S007','swap:receive',s=>{occurred(s,'swap:request');s.accounts.michiUSDC+=s.accounts.swapPendingUSDC;s.accounts.swapPendingUSDC=0;s.data.swapStatus='received';s.simulationTime+=HOUR;});
event('FI-03-S014','bridge:request',s=>{occurred(s,'swap:receive');s.accounts.michiUSDC-=1030;s.accounts.bridgePendingUSDC=1010;s.accounts.pathFeeUSDC+=20;s.data.bridgeStatus='processing';},(s,d)=>{expect(d,{bridgeNetwork:'Arbitrum'});quote(s,'bridge');need(s.accounts.michiUSDC>=1030,'みち道にあるUSDCと、道替えの費用を確かめよう。');});
event('FI-03-S015','bridge:receive',s=>{occurred(s,'bridge:request');s.accounts.arbitrumUSDC+=s.accounts.bridgePendingUSDC;s.accounts.bridgePendingUSDC=0;s.data.bridgeStatus='received';s.simulationTime+=HOUR;});
event('FI-03-S021','gas:request',s=>{occurred(s,'bridge:receive');s.accounts.arbitrumUSDC-=10;s.accounts.gasPendingETH=0.001;s.accounts.gasCostUSDC+=10;s.data.gasStatus='processing';},(s,d)=>{expect(d,{gasPayment:10});quote(s,'gas');need(s.accounts.arbitrumUSDC>=10,'ガス準備に使う10 Mock USDCが足りません。');});
event('FI-03-S022','gas:receive',s=>{occurred(s,'gas:request');s.accounts.walletETH+=s.accounts.gasPendingETH;s.accounts.gasPendingETH=0;s.data.gasStatus='received';s.simulationTime+=HOUR;});
event('FI-03-S026','handoff:reference',s=>{occurred(s,'gas:receive');need(s.accounts.arbitrumUSDC===1000&&s.accounts.walletETH===0.001,'引き継ぐ1000 Mock USDCと0.001 Mock ETHを照合しよう。');need(!s.accounts.depositPendingJPY&&!s.accounts.withdrawPendingMCHI&&!s.accounts.swapPendingUSDC&&!s.accounts.bridgePendingUSDC&&!s.accounts.gasPendingETH,'処理中の資金が残っています。到着明細を開こう。');s.accounts.arbitrumUSDC=0;s.accounts.walletETH=0;s.data.handoff=clone(fundingHandoffReference);});
function applyEvent(s,def){def.apply(s);s.eventLog.push({id:`${SCENARIO}:${def.kind}`,scenarioId:SCENARIO,kind:def.kind,stepId:def.stepId,at:s.simulationTime});}
function assertAccounts(accounts){need(accounts&&typeof accounts==='object'&&!Array.isArray(accounts),'資金の記録の形式が違います。');for(const value of Object.values(accounts))need(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e9,'資金に負の数か範囲外の値があります。');}
export function applyFundingStep(state,step,value,context={}){
 if(!step?.id?.startsWith('FI-'))return false;
 const s=state.financialScenarios?.[SCENARIO];need(s,'資金準備の練習台帳が見つかりません。');
 s.phoneState ||= {formDrafts:{},flags:{}};s.phoneState.formDrafts ||= {};const draft=s.phoneState.formDrafts.funding ||= {};
 const field=fieldByStep[step.id];if(field&&value!==undefined){need(['string','number'].includes(typeof value)&&String(value).length<=100,'練習欄には表示された短い値を入れよう。');draft[field]=value;}
 const def=definitions.find(d=>d.stepId===step.id);if(!def)return false;
 if(s.eventLog.some(e=>e.id===`${SCENARIO}:${def.kind}`))return false;
 def.guard?.(s,draft);
 if(def.kind==='handoff:reference'&&state.financialScenarios?.journey){const base=state.financialScenarios.journey.initialSnapshot?.accounts;need(base?.walletUSDC===1000&&base?.walletETH===0.001,'既存の旅の開始状態と、資金準備の引継ぎ額が一致しません。');}
 applyEvent(s,def);assertAccounts(s.accounts);return true;
}
export function validateFundingScenarios(scenarios){
 const s=scenarios?.[SCENARIO],expected=initialFundingScenarios()[SCENARIO];need(s&&typeof s==='object'&&!Array.isArray(s),'資金準備の台帳がありません。');
 need(stable(s.initialSnapshot)===stable(expected.initialSnapshot),'資金準備の開始資金が変更されています。');
 need(Array.isArray(s.eventLog)&&s.eventLog.length<=definitions.length,'資金準備の履歴が多すぎるか、形式が違います。');
 const seen=new Set();for(const e of s.eventLog){const def=definitions.find(d=>d.kind===e?.kind);need(def&&!seen.has(e.id)&&e.id===`${SCENARIO}:${def.kind}`&&e.scenarioId===SCENARIO&&e.stepId===def.stepId,'資金準備の履歴に未知・重複した操作があります。');seen.add(e.id);applyEvent(expected,def);need(stable(e)===stable(expected.eventLog.at(-1)),'資金準備の履歴の時刻か内容が一致しません。');}
 assertAccounts(s.accounts);need(stable(s.accounts)===stable(expected.accounts)&&stable(s.data)===stable(expected.data)&&s.simulationTime===expected.simulationTime,'資金準備の残高・費用・現在地・処理中の記録が一致しません。');return true;
}
const fieldLabels={depositRecipient:'円の入金先',depositJPY:'送る円',purchaseAsset:'買う教材コイン',purchaseQuantity:'買う枚数',withdrawAsset:'出庫する資産',withdrawNetwork:'出庫の道',withdrawAddress:'自分の練習宛先',withdrawQuantity:'出庫する枚数',swapPair:'交換する組合せ',swapQuantity:'交換する枚数',bridgeNetwork:'道替え先',gasPayment:'ガス準備に使う数量'};
const accountLabels={bankJPY:'練習銀行の円',depositPendingJPY:'入金の途中にある円',domesticJPY:'国内の架空交換所にある円',domesticMCHI:'交換所のMCHI',withdrawPendingMCHI:'出庫の途中にあるMCHI',walletMCHI:'自分の財布のMCHI（みち道）',withdrawalFeeMCHI:'支払済みの出庫費（MCHI）',swapPendingUSDC:'交換の処理中（Mock USDC）',michiUSDC:'みち道のMock USDC',bridgePendingUSDC:'道替えの途中（Mock USDC）',arbitrumUSDC:'ArbitrumのMock USDC',pathFeeUSDC:'支払済みの道替え費（Mock USDC）',gasPendingETH:'準備中のガス用Mock ETH',walletETH:'Arbitrumのガス用Mock ETH',gasCostUSDC:'ガスとの交換に使ったMock USDC'};
export function fundingScenarioSummary(s){if(!s)return [];const rows=Object.entries(s.accounts).map(([key,value])=>({key,label:accountLabels[key]||key,value}));if(s.data.handoff)rows.push({key:'handoffUSDC',label:'旅へ移管済みの記録（追加配布ではありません）',value:1000});return rows;}
