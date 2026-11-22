import {simulationConfig, steps} from './content-crypto.js';
import {DAY, roundAmount} from './finance.js';

const questId = 'HY-STAKE';
const stakeSteps = new Map(steps.filter(step => step.questId === questId).map(step => [step.id, step]));
const candidates = stakeSteps.get('HY-STAKE-S013').choices;
const {delegationLockDays, stakingReturnDays, mainFeeRate} = simulationConfig;
const fmt = value => Number(value).toLocaleString('ja-JP', {maximumFractionDigits:6});
const usdc = value => fmt(value) + ' Mock USDC';
const day = time => fmt(time / DAY) + '日目';
const lab = '委任の塔専用の練習口座。第5章の財布・島の資金とは別です。';

function saleQuote(quantity, price) {
  const gross = roundAmount(quantity * price);
  const fee = roundAmount(gross * mainFeeRate);
  const received = roundAmount(gross - fee);
  return {fee, received, equation:fmt(quantity) + '枚 × ' + fmt(price) + ' − 手数料' + fmt(fee) + ' ＝ ' + usdc(received)};
}

/** Show the last confirmed location. Only an explicitly labelled preview uses a future price or date. */
export function getStakeSlip(state, stepId = null) {
  const record = state?.questStates?.[questId];
  const account = state?.financialScenarios?.stake;
  if (!account || !record || (stepId === null ? !record.completed : !stakeSteps.has(stepId))) return null;
  const number = stepId === null ? null : Number(stepId.slice(-3));
  const {accounts, data, initialSnapshot, eventLog, simulationTime} = account;
  const draft = account.phoneState.formDrafts[questId] ?? {};
  const choice = candidates.find(candidate => candidate.value === draft.validator);
  const route = choice ? '選んだ委任先は' + choice.label + '。' : lab;
  const cash = '使える' + usdc(accounts.availableUSDC);
  const spot = '現物' + fmt(accounts.spotHYPE) + '枚';
  const hand = 'ステーキング手元' + fmt(accounts.stakingHYPE) + '枚';
  const delegated = '委任中' + fmt(accounts.delegatedHYPE) + '枚';
  const waiting = '待機中' + fmt(accounts.waitingHYPE) + '枚';
  const startQuantity = initialSnapshot.accounts.spotHYPE;
  const startPrice = initialSnapshot.data.price;
  const startValue = roundAmount(startQuantity * startPrice);
  const sold = eventLog.find(event => event.kind === 'sell:stake-001');
  if (sold) {
    const quantity = Number(draft.sellQuantity ?? roundAmount(startQuantity + accounts.rewardHYPE));
    const sale = 'ゲーム内' + day(sold.at) + 'の売却明細。' + saleQuote(quantity, data.price).equation + '。';
    let status = '現在は' + spot + '、' + cash + '。';
    if (data.exitStatus === 'processing') status += '出金処理中' + usdc(accounts.withdrawalPending) + '。';
    if (data.exitStatus === 'received') status += 'この経路の財布に' + usdc(accounts.walletUSDC) + '。';
    return {title:'委任の塔・売却済み', route, reference:sale, status};
  }
  if (data.arrivalAt !== null) {
    const request = eventLog.find(event => event.kind === 'withdraw-request:stake-001');
    const clock = 'ゲーム内' + day(request.at) + 'に申請。' + day(data.arrivalAt) + 'まで' + stakingReturnDays + '日待ちます。';
    if (accounts.waitingHYPE > 0) return {title:'現物への到着待ち', route, reference:clock + hand + '、' + cash + '。',
      status:waiting + '、' + spot + '。ゲーム内' + day(simulationTime) + ' → ' + day(data.arrivalAt) + 'に到着予定（あと' + fmt((data.arrivalAt - simulationTime) / DAY) + '日）。'};
    const holdings = spot + '、' + cash + '。';
    if (number >= 38) {
      const quote = saleQuote(draft.sellQuantity ?? accounts.spotHYPE, data.price);
      return {title:'現物を売る前の見積もり', route, reference:'売る予定の内訳は ' + quote.equation + '。',
        status:holdings + '単価' + fmt(data.price) + '・手数料' + fmt(quote.fee) + 'で売ると、受取予定' + usdc(quote.received) + '。'};
    }
    return {title:'現物に到着', route, reference:clock + waiting + '。',
      status:'ゲーム内' + day(data.arrivalAt) + 'に到着。' + holdings};
  }
  if (accounts.stakingHYPE > 0 && data.delegationUnlockAt !== null) {
    return {title:'委任を解除したあとの明細', route,
      reference:delegated + '、' + spot + '、' + cash + '。現物へ戻すには、ここから別の申請をします。',
      status:'ゲーム内' + day(simulationTime) + '、' + hand + '。現物へ戻す申請はこれから。' + stakingReturnDays + '日の待機はまだ開始前。'};
  }
  if (accounts.delegatedHYPE > 0) {
    const clock = 'ゲーム内' + day(simulationTime) + '。' + day(data.delegationUnlockAt) + 'から解除可。';
    if (!accounts.rewardHYPE) return {title:'委任の明細', route,
      reference:spot + '、' + hand + '、' + cash + '。委任を確定した日からゲーム内で' + delegationLockDays + '日待ちます。',
      status:delegated + '。' + clock};
    const held = delegated + '（単発報酬' + fmt(accounts.rewardHYPE) + '枚込み）。';
    const beforeTick = data.price === startPrice;
    if (number === 22 || !beforeTick) {
      const price = beforeTick ? simulationConfig.stakingPrices[1] : data.price;
      const value = roundAmount(accounts.delegatedHYPE * price);
      const valuation = '最初は' + fmt(startQuantity) + '枚 × ' + fmt(startPrice) + ' ＝ ' + usdc(startValue) + '。' +
        '1枚の教材価格が' + fmt(startPrice) + 'から' + fmt(price) + (beforeTick ? 'になると、' : 'に下がり、') +
        fmt(accounts.delegatedHYPE) + '枚 × ' + fmt(price) + ' ＝ 評価額' + usdc(value) + '（最初より' + fmt(roundAmount(startValue - value)) + '減）。';
      if (number === 25 || number === 26) return {title:'委任を解除する前の確認', route, reference:valuation + cash + '。',
        status:delegated + '、ゲーム内' + day(simulationTime) + '・解除可。解除するとステーキング手元へ戻ります。' + spot + 'のまま。'};
      const status = beforeTick ? 'ゲーム内' + day(simulationTime) + '・' + delegated + '。単価' + fmt(price) + 'なら評価' + fmt(value) + '。' + cash + '。' :
        held + 'ゲーム内' + day(simulationTime) + '・解除可。' + cash + '。';
      return {title:beforeTick ? '値下がりしたときの見積もり' : '値下がり後の委任明細', route,
        reference:valuation, status};
    }
    return {title:'単発の教材報酬', route, reference:'委任した' + fmt(roundAmount(accounts.delegatedHYPE - accounts.rewardHYPE)) +
      '枚に' + fmt(accounts.rewardHYPE) + '枚が1回だけ加わりました。' + cash + '。',
      status:held + 'ゲーム内' + day(simulationTime) + '・解除可。'};
  }
  if (accounts.stakingHYPE > 0) {
    const status = hand + '、' + delegated + '。' + cash + '。';
    if (number === 12 || number === 13) return {title:'委任先の候補', route:lab,
      reference:candidates.map(candidate => candidate.label).join(' ／ ') + '。どの候補も選べます。', status};
    return {title:'委任する前のステーキング残高', route,
      reference:spot + '。委任すると、選んだ相手がネットワークを支えるのを応援できます。', status};
  }
  const opening = fmt(startQuantity) + '枚 × 教材価格' + fmt(startPrice) + ' ＝ 評価額' + usdc(startValue) + '。';
  let status = spot + '、' + cash + '。';
  if (number === 8) status += '入力は「' + fmt(stakeSteps.get(stepId).value) + '」。';
  if (draft.quantity !== undefined) status += 'ステーキングへ' + fmt(draft.quantity) + '枚を移す予定。';
  return {title:'委任の塔・現物残高', route:lab, reference:opening, status};
}
