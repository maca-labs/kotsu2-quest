import {simulationConfig, steps} from './content-crypto.js';
import {roundAmount} from './finance.js';

const questId = 'HY-SPOT';
const spotSteps = new Map(steps.filter(step => step.questId === questId).map(step => [step.id, step]));
const fmt = value => Number(value).toLocaleString('ja-JP', {maximumFractionDigits:6});
const usdc = value => fmt(value) + ' Mock USDC';
const funds = accounts => '使える ' + usdc(accounts.availableUSDC) + ' ／ 保有 ' + fmt(accounts.hype) + ' HYPE';
const trade = (quantity, price) => fmt(quantity) + ' HYPE × ' + fmt(price) + ' ＝ ' + usdc(roundAmount(quantity * price));

function limitSlip(main, limit, number) {
  const {accounts, data} = limit;
  const draft = limit.phoneState.formDrafts[questId] ?? {};
  const route = '指値だけの練習口座。元の現物ラボには ' + usdc(main.accounts.availableUSDC) + '。';
  const status = funds(accounts) + ' ／ 注文に予約 ' + usdc(accounts.reservedUSDC) + '。';
  const price = draft.limitPrice;
  const quantity = draft.limitQuantity;
  if (data.orderStatus === 'cancelled') {
    const released = roundAmount(price * quantity);
    const reference = '売買が成立する前に取り消し、予約した ' + usdc(released) + ' が使える残高に戻った。';
    return {title:'指値の小練習・取消済み', route,
      reference:number === 40 ? reference + '「戻る」で元の現物ラボへ。' : reference, status};
  }
  if (data.orderStatus === 'pending') {
    return {title:'指値の小練習・保留中（未約定）', route,
      reference:'1枚 ' + usdc(data.price) + '。買い指値 ' + fmt(price) + ' より高く、' + fmt(quantity) + ' HYPEの注文はまだ成立していない。', status};
  }
  if (price !== undefined && quantity !== undefined) {
    const reservation = roundAmount(price * quantity);
    return {title:'指値の小練習・注文前', route,
      reference:'買い指値 ' + trade(quantity, price) + '。教材価格 ' + fmt(data.price) + ' では保留。',
      status:'今は使える ' + fmt(accounts.availableUSDC) + '・予約 ' + fmt(accounts.reservedUSDC) + ' → 注文後の予定は使える ' + fmt(roundAmount(accounts.availableUSDC - reservation)) + '・予約 ' + usdc(accounts.reservedUSDC + reservation) + '。保有 ' + fmt(accounts.hype) + ' HYPEのまま。'};
  }
  return {title:'指値の小練習・注文前', route, reference:'1枚の教材価格は ' + usdc(data.price) + '。買い指値は、指定した値段以下で買う注文。', status};
}

/** Read the confirmed event, account and form records without moving either practice balance. */
export function getSpotSlip(state, stepId = null) {
  const record = state?.questStates?.[questId];
  if (!record || (stepId === null ? !record.completed : !spotSteps.has(stepId))) return null;
  const main = state.financialScenarios?.spot;
  const limit = state.financialScenarios?.['spot-limit'];
  if (!main || !limit) return null;
  const number = stepId === null ? null : Number(stepId.slice(-3));
  // Each navigation step still displays the account the player is about to leave.
  if (number >= 26 && number <= 40) return limitSlip(main, limit, number);

  const {accounts, data, initialSnapshot, eventLog} = main;
  const draft = main.phoneState.formDrafts[questId] ?? {};
  const route = '現物ラボ専用の練習資金。第5章の入金とは別。';
  const status = funds(accounts) + '。';
  const entryPrice = initialSnapshot.data.price;
  const bought = eventLog.some(event => event.kind === 'buy:spot-001');
  const sold = eventLog.some(event => event.kind === 'sell:spot-001');
  if (sold) {
    const quantity = Number(draft.sellQuantity);
    const result = '確定損失 ' + usdc(-accounts.realizedPnl) + '。';
    const sale = '売却成立 ' + trade(quantity, data.price) + '。';
    if (number === null || number === 41) {
      const atSale = data.exitAmount ?? accounts.availableUSDC;
      const exit = data.exitAmount === undefined ? '出金にはこの現物ラボの残高を使う。' : '出金申請に引き継いだ額は ' + usdc(atSale) + '。';
      return {title:number === null ? '現物ラボの売買明細' : '元の現物ラボ・出金への引き継ぎ',
        route:exit, reference:'購入 ' + trade(draft.quantity, entryPrice) + '。' + sale, status:status + result};
    }
    const next = number === 25 ? '次に開く指値の小練習は別口座。' : '購入に使ったのは ' + usdc(roundAmount(draft.quantity * entryPrice)) + '。';
    return {title:'現物ラボ・売却明細', route, reference:sale + next, status:status + result};
  }
  if (bought) {
    const value = roundAmount(accounts.hype * data.price);
    const unrealized = roundAmount(accounts.hype * (data.price - entryPrice));
    const difference = unrealized === 0 ? '評価損益 0' : '評価損 ' + fmt(-unrealized);
    const pnl = difference + ' ／ 確定損益 ' + usdc(accounts.realizedPnl) + '。';
    if (number >= 18) return {title:'現物ラボ・売却前', route,
      reference:'全数量を売ると ' + trade(accounts.hype, data.price) + ' を受け取る予定。', status:status + pnl};
    return {title:'現物ラボ・保有明細', route,
      reference:'保有分の評価 ' + trade(accounts.hype, data.price) + '。使えるお金と合わせた評価額は ' + usdc(roundAmount(accounts.availableUSDC + value)) + '。',
      status:status + pnl};
  }
  const price = data.price;
  const fee = 'この例の取引手数料は ' + fmt(simulationConfig.mainFeeRate * 100) + '％。';
  let reference = '教材HYPEは1枚 ' + usdc(price) + '。' + fee;
  if (draft.quantity !== undefined) {
    const after = roundAmount(accounts.availableUSDC - draft.quantity * price);
    reference = '支払予定 ' + trade(draft.quantity, price) + '。購入後は ' + usdc(after) + ' が残る予定。' + fee;
  }
  return {title:'現物ラボ・購入前', route, reference, status};
}
