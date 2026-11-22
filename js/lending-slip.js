import {quests} from './content-extension.js';
import {getExtensionView} from './finance-extension.js';
import {DAY, roundAmount} from './finance.js';

const quest = quests.find(item => item.id === 'LD-01');
const route = 'こもれび貸出窓口の練習資金（Mock USDC）';
const amount = value => value.toLocaleString('ja-JP', {maximumFractionDigits:6});
const approximate = value => value.toLocaleString('ja-JP', {maximumFractionDigits:2});
const percent = value => value.toLocaleString('ja-JP', {style:'percent', maximumFractionDigits:6});
const slip = (title, reference, status) => ({title, route, reference, status});

function beforeLending(stepId, account, quote) {
  const {annualRate, termDays, dayCount} = account.data;
  const {availableUSDC, lentPrincipal} = account.accounts;
  const cash = '申込前。手元' + amount(availableUSDC) + '、貸出中' + amount(lentPrincipal) + '。';
  const terms = '教材の年率' + percent(annualRate) + 'は1年分。今回は1年' + dayCount + '日のうち、' + termDays + '日分の利息を計算するよ。';
  const interest = amount(quote.principal) + ' × ' + annualRate + ' × ' + termDays + ' ÷ ' + dayCount +
    '。利息は約' + approximate(quote.interest) + '（明細では' + amount(quote.interest) + '）。';
  const plan = '貸す予定' + amount(quote.principal) + '。確定すると、手元に' + amount(roundAmount(availableUSDC - quote.principal)) + 'が残るよ。';
  switch (stepId) {
    case 'LD-01-S001':
      return slip('貸す前の手元', 'あなたが貸す側だよ。貸すお金を「元本」、貸した相手が元本に足して返す分を「利息」と呼ぶよ。', cash);
    case 'LD-01-S002':
      return slip('貸す相手との約束', '元本' + amount(quote.principal) + 'を貸す約束だよ。' + terms, cash);
    case 'LD-01-S003':
      return slip('利息は何日分？', terms + interest, cash);
    case 'LD-01-S004':
      return slip('貸す前に確かめること', '借りた相手が返せなくなると、貸したお金を失うことがあるよ。今回は約束どおりに返る架空の例だよ。', cash);
    case 'LD-01-S005':
      return slip('貸すコインを選ぶ', '使うのは、この窓口のMock USDCだよ。' + plan, cash);
    case 'LD-01-S006':
    case 'LD-01-S007':
      return slip('貸す元本を入力する', '貸出額の欄に、手元から貸す分だけ入れよう。' + plan, cash);
    case 'LD-01-S009':
      return slip('貸している間に使える額', '満期は、約束した' + termDays + '日が終わる日。この契約では、それまでは貸した分を返してもらえないよ。', cash + plan);
    default:
      return slip('貸出申込の見積もり',
        '手元' + amount(availableUSDC) + '。教材の年率' + percent(annualRate) + 'は1年分。' + interest,
        amount(quote.principal) + 'を' + termDays + '日貸すと、手元に' + amount(roundAmount(availableUSDC - quote.principal)) +
          'が残る。利息は約' + approximate(quote.interest) + '。元本と合わせて戻る予定は' + amount(quote.total) + '。');
  }
}

/** Render the main lesson's ledger. The separate review has its own principal and account. */
export function getLendingSlip(state, stepId = null) {
  const record = state?.questStates?.[quest.id];
  const account = state?.financialScenarios?.[quest.scenarioId];
  if (!account || !record || (stepId === null ? !record.completed : !quest.stepIds.includes(stepId))) return null;
  const {accounts, data} = account;
  const view = getExtensionView(state, {questId:quest.id});
  const quote = Object.fromEntries(view.quote.map(row => [row.key, row.value]));
  const cash = '手元' + amount(accounts.availableUSDC);
  const lent = '貸出中の元本' + amount(accounts.lentPrincipal);
  switch (data.status) {
    case 'ready':
      return beforeLending(stepId, account, quote);
    case 'lending': {
      const daysLeft = Math.ceil((data.maturesAtSimulation - account.simulationTime) / DAY);
      const remaining = '満期まであと' + daysLeft + '日。この契約では、満期前に返還を申し込めないよ。';
      return slip('貸出中の明細', stepId === 'LD-01-S014' ? remaining + '教材の時計を満期まで進めよう。' : remaining,
        lent + 'は、いま使えないよ。' + cash + '。');
    }
    case 'matured':
      return slip('満期・これから返還申請', data.termDays + '日がたち、返してもらう手続きを始められるよ。元本' + amount(accounts.lentPrincipal) +
        'と利息' + amount(quote.interest) + 'で、戻る予定は' + amount(quote.total) + '。',
        'まだ受け取っていないよ。' + cash + '。');
    case 'returning':
    case 'arrived': {
      const ready = data.status === 'arrived';
      const breakdown = '元本' + amount(accounts.pendingPrincipal) + ' ＋ 利息' + amount(accounts.pendingInterest) +
        ' ＝ ' + amount(roundAmount(accounts.pendingPrincipal + accounts.pendingInterest)) + '。';
      return slip(ready ? '返還の処理済み・受取待ち' : '返還申請済み・処理中', breakdown +
        (ready ? 'お知らせが届いたよ。明細を確かめて受け取ろう。' : '返してほしいと頼んだよ。窓口が処理しているよ。'),
        '手元への入金はまだ。' + cash + '。');
    }
    case 'received': {
      const principal = account.eventLog.find(event => event.kind === 'lending-apply').parameters.lendingAmount;
      const interest = accounts.interestReceived;
      const returned = roundAmount(principal + interest);
      const kept = roundAmount(accounts.availableUSDC - returned);
      return slip(stepId ? '受取後の明細' : 'ソラに見せる返還明細',
        '戻った額は、元本' + amount(principal) + ' ＋ 利息' + amount(interest) + ' ＝ ' + amount(returned) + '。' +
          (stepId ? lent + '。' : 'ソラにはこの明細を見せよう。お金は貸出窓口に残るよ。'),
        '残していた' + amount(kept) + ' ＋ 戻った' + amount(returned) + ' ＝ 今の手元' + amount(accounts.availableUSDC) + '。');
    }
    default:
      return null;
  }
}
