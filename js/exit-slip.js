import {simulationConfig, steps} from './content-crypto.js';
import {roundAmount} from './finance.js';

const exitSteps = new Map(steps.filter(step => step.questId === 'HY-EXIT').map(step => [step.id, step]));
const target = Object.freeze({
  asset: exitSteps.get('HY-EXIT-S006').value,
  network: exitSteps.get('HY-EXIT-S008').value,
  address: exitSteps.get('HY-EXIT-S010').value,
});

const labs = {
  journey: {name:'運用見送り', ready:'運用を見送ったので、売却も解除も不要。'},
  spot: {name:'現物ラボ', held:['hype','reservedUSDC'], release:'保有分の売却や未成立の注文の取消', event:'sell:spot-001', ready:'現物を売却済み。HYPEは0枚。このラボで受け取る財布は、第5章の財布とは別だよ。'},
  hlp: {name:'HLPラボ', held:['hlpUnits'], release:'ロックが明けてからの引き出し', event:'withdraw:hlp-001', ready:'ロックが明け、HLPから引き出し済み。'},
  stake: {name:'ステーキングラボ', held:['delegatedHYPE','stakingHYPE','waitingHYPE','spotHYPE'], release:'委任の解除・現物への到着・売却', event:'sell:stake-001', ready:'委任を解除し、現物に戻ったHYPEを売却済み。'},
  perp: {name:'先物ラボ', held:['collateral'], release:'建玉の全決済', event:'close:perp-001', ready:'建玉をすべて決済し、証拠金が手元に戻った。'},
};

const fmt = value => value.toLocaleString('ja-JP', {maximumFractionDigits:6});
const usdc = value => fmt(value) + ' Mock USDC';

/** Resolve the record on the receipt, including a chapter-only rehearsal kept beside the main journey. */
export function getExitLedger(state, recordKey, stepId = null) {
  const record = state?.questStates?.[recordKey];
  if (record?.questId !== 'HY-EXIT' || !Object.hasOwn(labs, record.routeId)) return null;
  const {routeId, scenarioOverride} = record;
  const journeyMain = recordKey === 'HY-EXIT:journey-main' && routeId === 'journey' && scenarioOverride === undefined;
  if (!journeyMain && recordKey !== 'HY-EXIT:' + routeId) return null;
  if (scenarioOverride !== undefined && !(routeId === 'journey' && scenarioOverride === 'chapter6-journey')) return null;
  if (stepId === null ? !record.completed : !exitSteps.has(stepId)) return null;
  const ledger = state.financialScenarios?.[scenarioOverride ?? routeId];
  if (!ledger) return null;
  const {accounts, data, eventLog} = ledger;
  const amount = data.exitAmount ?? accounts.availableUSDC;
  const fee = data.exitAmount === undefined ? simulationConfig.withdrawalCost : accounts.withdrawalFee;
  const receipt = data.expectedReceipt ?? Math.max(0, roundAmount(amount - fee));
  const received = data.exitStatus === 'received';
  const previousWallet = received ? roundAmount(accounts.walletUSDC - receipt) : accounts.walletUSDC;
  const lab = labs[routeId];
  let release = lab.ready;
  if (lab.held?.some(key => accounts[key] > 0)) release = lab.name + 'に資金が残っている。' + lab.release + 'を確かめよう。';
  else if (lab.event && !eventLog.some(event => event.kind === lab.event)) release = 'このラボの残高には、いま取引や預け入れに使っている分はありません。';
  return {
    number: stepId === null ? null : Number(stepId.slice(-3)),
    name: scenarioOverride ? '第6章だけの練習・運用見送り' : lab.name,
    accounts, phase:data.exitStatus, amount, fee, receipt, previousWallet, release, target,
    draft:ledger.phoneState?.formDrafts?.['HY-EXIT'] ?? {},
  };
}

export function getExitSlip(state, recordKey, stepId = null) {
  const view = getExitLedger(state, recordKey, stepId);
  if (!view) return null;
  const {number, name, accounts, phase, amount, fee, receipt, previousWallet, release} = view;
  const route = 'ハイリキ（HyperCore） → ' + target.network + ' → 自分の練習財布 ' + target.address;
  const gas = accounts.walletETH === undefined ? '' : ' ガス用 ' + fmt(accounts.walletETH) + ' Mock ETH。';
  const places = 'ハイリキ ' + fmt(accounts.availableUSDC) + '／財布 ' + usdc(accounts.walletUSDC) + '。';
  const breakdown = '申請' + fmt(amount) + ' − 教材費' + fmt(fee) + ' ＝ ' + (phase === 'received' ? '今回の受取' : '受取予定') + usdc(receipt) + '。';
  if (phase === 'received') {
    const wallet = '財布は元の' + fmt(previousWallet) + '＋今回' + fmt(receipt) + '＝' + usdc(accounts.walletUSDC) + '。';
    return {title:name + '・' + (number === null ? 'ルカに渡す受取明細' : '財布に到着'), route, reference:breakdown,
      status:'ハイリキ ' + fmt(accounts.availableUSDC) + '／' + wallet + (number === null || number === 22 || number >= 25 ? gas : '')};
  }
  if (phase === 'processing') {
    return {title:name + '・出金処理中', route, reference:breakdown,
      status:'ハイリキ ' + fmt(accounts.availableUSDC) + '／途中 ' + fmt(accounts.withdrawalPending) + '／財布 ' + usdc(accounts.walletUSDC) + '。'};
  }
  const title = name + '・出金前';
  if (amount <= fee) return {title, route, reference:places, status:'出金には、教材費' + usdc(fee) + 'を超える残高が必要。'};
  if (number <= 2) return {title, route, reference:release, status:places + gas};
  if (number === 3) return {title, route, reference:places, status:release};
  let check = breakdown;
  if (number <= 6 || number === 15) check = '受取カードの資産はMock ' + target.asset + '。';
  else if (number <= 8 || number === 16) check = '受取カードの道は' + target.network + '。';
  else if (number <= 10 || number === 17) check = '受け取るのは自分の財布 ' + target.address + '。';
  return {title, route, reference:places, status:check};
}
