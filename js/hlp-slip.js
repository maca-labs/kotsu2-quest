import {quests, simulationConfig} from './content-crypto.js';
import {DAY, roundAmount} from './finance.js';

const quest = quests.find(item => item.id === 'HY-HLP');
const review = quest.reviewVariant;
const lockDays = simulationConfig.hlpLockDays;
const fmt = value => Number(value).toLocaleString('ja-JP', {maximumFractionDigits:6});
const usdc = value => fmt(value) + ' Mock USDC';
const day = value => fmt(value) + '日目';
const strategy = 'HLPに預けると、取引を支える戦略の利益も損失も分け合います。';
const rule = '引き出せるのは、最後に預けた日からゲーム内で' + lockDays + '日後。';

function deadline(now, last, unlock) {
  return 'ゲーム内' + day(now) + '。最後の預入は' + day(last) + '、引出しは' + day(unlock) + 'から。';
}

function eligibility(now, unlock) {
  const left = unlock - now;
  return left > 0 ? 'あと' + fmt(left) + '日。まだ引き出せません。' : 'ゲーム内' + day(now) + '。待ち時間は終了。全額を引き出せます。';
}

function valuation(units, price, value) {
  return '模擬' + fmt(units) + '口 × 単価' + fmt(price) + ' ＝ 評価額' + usdc(value) + '。';
}

function depositPreview(available, amount, price) {
  return '預ける予定' + fmt(amount) + '（模擬' + fmt(roundAmount(amount / price)) + '口）。確定後の手元は' + usdc(roundAmount(available - amount)) + '。';
}

function withdrawal(available, value, received) {
  return '手元' + fmt(available) + ' ＋ ' + (received ? '受取' : '受取予定') + fmt(value) + ' ＝ ' + usdc(roundAmount(available + value)) + '。';
}

/** Read only the HLP lab's account and its confirmed events, including after the exit quest. */
export function getHlpSlip(state, stepId = null) {
  const record = state?.questStates?.[quest.id];
  const account = state?.financialScenarios?.hlp;
  if (!account || !record || (stepId === null ? !record.completed : !quest.stepIds.includes(stepId))) return null;
  const {accounts, data, initialSnapshot, eventLog} = account;
  const number = stepId === null ? null : Number(stepId.slice(-3));
  const draft = account.phoneState.formDrafts[quest.id] ?? {};
  const now = account.simulationTime / DAY;
  const route = 'HLP本編だけの練習資金。金額の単位はMock USDC。';
  const principal = Number(draft.quantity);
  const exited = eventLog.find(event => event.kind === 'withdraw:hlp-001');

  if (exited) {
    const freeBefore = roundAmount(initialSnapshot.accounts.availableUSDC - principal);
    const received = roundAmount(principal + accounts.realizedPnl);
    return {title:'HLP本編・引出し明細', route:'ゲーム内' + day(data.lastDepositAt / DAY) + 'に預け、' + day(exited.at / DAY) + 'にHLPからラボの手元へ戻しました。',
      reference:'預けた額' + fmt(principal) + '。' + valuation(principal / initialSnapshot.data.unitPrice, data.unitPrice, received),
      status:withdrawal(freeBefore, received, true) + '引出し時の確定損失' + usdc(-accounts.realizedPnl) + '。'};
  }

  if (data.lastDepositAt === null) {
    const status = 'ゲーム内' + day(now) + '。手元' + usdc(accounts.availableUSDC) + '、預入はまだ0。';
    if (draft.quantity !== undefined) return {title:'HLP本編・預ける前の確認', route, reference:status,
      status:depositPreview(accounts.availableUSDC, principal, data.unitPrice)};
    return {title:'HLP本編・預ける前', route, reference:number >= 4 ? rule : strategy, status};
  }

  const last = data.lastDepositAt / DAY;
  const unlock = data.withdrawableAt / DAY;
  const clock = deadline(now, last, unlock);
  const funds = '預けた額' + fmt(principal) + '、手元で使える額' + usdc(accounts.availableUSDC) + '。';
  const worth = valuation(accounts.hlpUnits, data.unitPrice, accounts.hlpValue);
  if (now >= unlock) return {title:'HLP本編・引出し可能', route:clock,
    reference:funds + worth,
    status:eligibility(now, unlock) + withdrawal(accounts.availableUSDC, accounts.hlpValue, false)};
  const loss = roundAmount(principal - accounts.hlpValue);
  const valuationNote = loss > 0 ? '評価損' + fmt(loss) + '、手元と合わせた評価額' + usdc(roundAmount(accounts.availableUSDC + accounts.hlpValue)) + '。' : '';
  let note = '';
  if (number === 11) note = '口（くち）は預けた分を数える単位。評価額は、その分のいまの値打ちです。';
  if (number === 14) note = '1口の単価が' + fmt(initialSnapshot.data.unitPrice) + 'から' + fmt(data.unitPrice) + 'に下がりました。';
  return {title:'HLP本編・預入中', route:funds, reference:note + worth + valuationNote, status:clock + eligibility(now, unlock)};
}

const inputAmount = field => Number(review.tasks.flatMap(task => task.actions).find(action => action.type === 'input' && action.field === field).value);
const initialDeposit = inputAmount('quantity');
const additionalDeposit = inputAmount('extraQuantity');

/** The alternate exercise has its own clock, price, confirmed events and starting funds. */
export function getHlpReviewSlip(state, task, action) {
  if (!state?.questStates?.[quest.id]?.completed) return null;
  const progress = state.reviewStates?.[quest.id];
  const currentTask = review.tasks[progress?.index ?? 0];
  const index = progress?.actionIndex ?? 0;
  if (progress?.completed) {
    if (task != null || action != null || !progress.snapshot?.eventLog.includes('review:hlp:withdraw')) return null;
  } else if (!task || !action || task.id !== currentTask?.id || action.id !== currentTask.actions[index]?.id) return null;

  const snapshot = progress?.snapshot ?? review.initialSnapshot;
  const {available, units, price, simulationDay:now, unlockDay:unlock, eventLog} = snapshot;
  const route = '追加課題専用の練習資金。1口の単価は' + usdc(price) + 'に固定。';
  if (eventLog.includes('review:hlp:withdraw')) {
    const amount = initialDeposit + additionalDeposit;
    return {title:'追加課題・引出し明細', route,
      reference:'ゲーム内' + day(review.initialSnapshot.simulationDay) + 'に' + fmt(initialDeposit) + 'を預け、' + day(unlock - lockDays) + 'に' + fmt(additionalDeposit) + 'を追加。' + day(now) + 'に全額を引き出しました。',
      status:withdrawal(available - amount, amount, true) + 'HLPに残るのは' + fmt(units) + '口。'};
  }
  if (!eventLog.includes('review:hlp:deposit')) {
    const planning = task.id === 'RV-HLP-2' && index >= 2;
    const before = 'ゲーム内' + day(now) + '。手元' + usdc(available) + '、預入はまだ0。';
    return {title:'追加課題・初回の預入前', route, reference:planning ? before : strategy,
      status:planning ? depositPreview(available, initialDeposit, price) : before};
  }

  const held = roundAmount(units * price);
  const clock = deadline(now, unlock - lockDays, unlock);
  const funds = '預けた額' + fmt(held) + '、手元' + usdc(available) + '。';
  if (eventLog.includes('review:hlp:add')) {
    if (now >= unlock) return {title:'追加課題・全額を引出し可能', route:clock, reference:funds + valuation(units, price, held),
      status:eligibility(now, unlock) + withdrawal(available, held, false)};
    const oldUnlock = review.initialSnapshot.simulationDay + lockDays;
    return {title:'追加課題・全額の引出し日が更新', route:clock,
      reference:funds + valuation(units, price, held) + '預けた分をまとめて、最後の預入から' + lockDays + '日数えます。',
      status:'全額' + fmt(held) + 'の引出しは' + day(unlock) + 'から。元の' + day(oldUnlock) + 'でもあと' + (unlock - oldUnlock) + '日。今はあと' + (unlock - now) + '日。'};
  }
  if (task.id === 'RV-HLP-4' && index >= 3) {
    const next = now + lockDays;
    const after = held + additionalDeposit;
    return {title:'追加課題・追加する前の確認', route:clock,
      reference:'いま預入' + fmt(held) + '、手元' + fmt(available) + '。' + fmt(additionalDeposit) + '追加後は預入' + fmt(after) + '、手元' + usdc(available - additionalDeposit) + 'の予定。',
      status:'最後の預入が' + day(now) + 'に変わるため、全額' + fmt(after) + 'の引出し日が' + day(unlock) + 'から' + day(next) + 'に延びます。'};
  }
  return {title:'追加課題・初回の預入中', route:funds, reference:valuation(units, price, held) + '手元と合わせた評価額' + usdc(available + held) + '。',
    status:clock + eligibility(now, unlock)};
}
