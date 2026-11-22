import {bosses, simulationConfig} from './content-crypto.js';
import {DAY, roundAmount} from './finance.js';

const boss = bosses.find(chapter => chapter.chapterId === 'CH-6');
const trialTasks = new Set([...boss.tasks, ...Object.values(boss.routeTasks).flat()]);
const cardFields = boss.tasks.find(task => task.id === 'CH6-B3').actions.filter(action => action.type === 'select');
const card = Object.fromEntries(cardFields.map(action => [action.field, action.value]));
const destination = `受取カード　${card.asset} / ${card.network} / ${card.address}`;
const usdc = value => `${value} Mock USDC`;
const routeName = {journey:'運用を見送る道', spot:'現物', hlp:'HLP', stake:'ステーキング', perp:'先物'};

function preparationNote({accounts, data, simulationTime}, route) {
  if (route === 'journey') return '運用を見送ったので、売却も解除もいらないよ。';
  if (data.prepared) return route === 'spot' ? 'HYPEを全部売ったよ。持っているHYPEは' + accounts.hype + '枚。売った代金がUSDCに入ったよ。' : '運用していた分が、出金に使える残高に戻ったよ。';
  switch (route) {
    case 'spot': return `保有中の${accounts.hype} HYPEは、売るとUSDCに変わるよ。`;
    case 'hlp': {
      const days = Math.ceil((data.withdrawableAt - simulationTime) / DAY);
      return `HLPの評価額は${usdc(accounts.hlpValue)}。` + (days > 0 ? `引き出せるまで練習時間であと${days}日。` : 'ロックが解け、引き出せるよ。');
    }
    case 'stake':
      if (accounts.delegatedHYPE) return `${accounts.delegatedHYPE} HYPEを委任中。この試練は、委任から1日たったところ。今、解除できるよ。`;
      if (accounts.stakingHYPE) return `${accounts.stakingHYPE} HYPEはステーキングの手元にあるよ。現物へ戻す申請をすると、そこから7日かかるよ。`;
      if (accounts.waitingHYPE) return `${accounts.waitingHYPE} HYPEは現物への到着待ち。ゲーム内であと${Math.max(0, Math.ceil((data.arrivalAt - simulationTime) / DAY))}日。届くと売れるよ。`;
      return `現物に${accounts.spotHYPE} HYPEが到着。売るとUSDCに変わるよ。`;
    case 'perp': return `取引に使っている証拠金は${usdc(accounts.collateral)}。決済後に戻るよ。`;
  }
}

export function getExitTrialSlip(state, task, action) {
  if (!trialTasks.has(task) || !task.actions.includes(action)) return null;
  const scenario = state?.financialScenarios?.[task.scenarioId];
  if (!scenario) return null;
  const {accounts, data} = scenario;
  const available = `いま出金に使える額は${usdc(accounts.availableUSDC)}。`;
  if (task.id === 'CH6-B1' || task.id === 'CH6-B2') {
    return {
      title:'試練専用の資金',
      route:`選んだ経路は${routeName[task.routeId]}。本編とは別の資金を使うよ。`,
      reference:preparationNote(scenario, task.routeId),
      status:available,
    };
  }

  let title, reference, status;
  if (data.exitStatus === 'not_started') {
    title = '試練専用の出金・申請前';
    reference = data.prepared
      ? `全額${accounts.availableUSDC} − 教材費${simulationConfig.withdrawalCost} ＝ 受取予定${usdc(roundAmount(accounts.availableUSDC - simulationConfig.withdrawalCost))}。`
      : preparationNote(scenario, task.routeId);
    status = available;
  } else {
    reference = `申請${data.exitAmount} − 教材費${accounts.withdrawalFee} ＝ 受取予定${usdc(data.expectedReceipt)}。`;
    if (data.exitStatus === 'processing') {
      title = '試練専用の出金・処理中';
      status = `到着待ち${usdc(accounts.withdrawalPending)}。受取財布はまだ${usdc(accounts.walletUSDC)}。`;
    } else {
      title = '試練専用の受取明細・到着済み';
      status = `今回の到着は${usdc(accounts.walletUSDC - scenario.initialSnapshot.accounts.walletUSDC)}。受取財布の残高は${usdc(accounts.walletUSDC)}。`;
    }
  }
  return {title, route:destination, reference, status};
}
