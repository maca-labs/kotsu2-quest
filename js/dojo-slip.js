import {steps} from './content-extension.js';
import {getExtensionView} from './finance-extension.js';
import {openPerp, perpMetrics, closePerp, roundAmount} from './finance.js';

const questId = 'LV-01';
const lesson = new Map(steps.filter(step => step.questId === questId).map(step => [step.id, step]));
const collateralInput = lesson.get('LV-01-S004').value;
const priceChoices = lesson.get('LV-01-S014').choices.map(choice => Number(choice.value));
const down = Math.min(...priceChoices);
const up = Math.max(...priceChoices);
const route = 'そらの先物稽古場だけの練習資金（Mock USDC）';
const fmt = amount => amount.toLocaleString('ja-JP', {maximumFractionDigits:6});
const direction = side => side === 'short' ? 'ショート' : 'ロング';
const outcome = pnl => pnl === 0 ? '損益0' : (pnl < 0 ? '損失' : '利益') + fmt(Math.abs(pnl));
const slip = (title, reference, status) => ({title, route, reference, status});

function selected(state, step, draft) {
  const confirmed = draft[step.field];
  if (confirmed !== undefined) return confirmed;
  const current = state.phoneState?.formDrafts?.['selection:' + step.id];
  return step.choices.find(choice => String(choice.value) === current)?.value ?? null;
}

function unitPosition(side, entryPrice) {
  return openPerp({available:entryPrice, collateral:entryPrice, leverage:1, entryPrice, side:side === 'short' ? -1 : 1}).position;
}

function perUnit(side, entry, price) {
  const pnl = perpMetrics(unitPosition(side, entry), price).unrealizedPnl;
  const short = side === 'short';
  return fmt(entry) + 'で' + (short ? '売る' : '買う') + '向きで始め、' + fmt(price) +
    'で' + (short ? '買い戻す' : '売る') + '計算。1枚分につき差額' + fmt(Math.abs(pnl)) + 'を' + (pnl < 0 ? '払う' : '受け取る') + '。';
}

function comparison(position) {
  const result = price => outcome(perpMetrics(position, price).unrealizedPnl);
  return fmt(up) + 'なら' + result(up) + '、' + fmt(down) + 'なら' + result(down) + '。';
}

function beforeOrder(state, step, account) {
  const draft = account.phoneState.formDrafts;
  const available = account.accounts.availableUSDC;
  const entry = account.data.entryPrice;
  const collateral = draft.collateral ?? collateralInput;
  const cash = '手元' + fmt(available);
  const side = step.field === 'side' ? selected(state, step, draft) : draft.side;
  const leverage = step.field === 'leverage' ? selected(state, step, draft) : draft.leverage;
  const both = 'ロングは上がると得、下がると損。ショートは上がると損、下がると得。';
  if (step.field === 'side') {
    if (!side) return slip('取引の向きを選ぶ', both, '向きは未選択。' + cash + '、まだ注文前。');
    const perCoin = unitPosition(side, entry);
    return slip('取引の向きの試算', perUnit(side, entry, up) + ' コインを受け渡さず、値段の差だけをやり取りするよ。',
      direction(side) + '1枚の試算。' + comparison(perCoin));
  }
  if (!side) {
    if (step.field === 'collateral') return slip('証拠金を入力する',
      '証拠金は、取引のために手元から分けておくお金。欄に' + fmt(collateralInput) + 'を入れよう。',
      cash + '。注文するまでは、取引に使っているお金は0。');
    return slip('稽古場の元手', 'ここでは、コインを受け渡さず、取引を始めた値段と終えた値段の差をやり取りするよ。',
      cash + '。このうち' + fmt(collateral) + 'を証拠金に使う予定。');
  }
  if (!leverage) return slip('倍率を選ぶ',
    direction(side) + 'で進めよう。倍率は、証拠金の何倍の金額で値動きを受けるかを表すよ。',
    '倍率は未選択。証拠金' + fmt(collateral) + 'で、1倍・2倍・5倍を試せるよ。');

  const quote = openPerp({available, collateral, leverage, entryPrice:entry, side:side === 'short' ? -1 : 1, feeRate:account.data.feeRate});
  const p = quote.position;
  const figures = '証拠金' + fmt(collateral) + ' × ' + fmt(p.leverage) + '倍 ＝ 取引額' + fmt(p.notional) +
    '。1枚' + fmt(entry) + 'なので、' + fmt(p.quantity) + '枚分の値動きを受けるよ。';
  const summary = direction(side) + fmt(p.leverage) + '倍、取引額' + fmt(p.notional) + '（' + fmt(p.quantity) + '枚分）。';
  if (step.field === 'leverage') return slip('倍率の試算', figures + ' 注文で使うのは' + fmt(collateral) + '、手元に残るのは' + fmt(quote.available) + '。',
    '試算 ' + summary + comparison(p));
  if (step.id === 'LV-01-S008' || step.id === 'LV-01-S009') return slip('同じ値動きで比べる',
    figures + ' 倍率を上げると利益も損失も大きくなるよ。この稽古では、自分で取引を閉じよう。',
    direction(side) + fmt(p.leverage) + '倍の試算。' + comparison(p));
  return slip('新規注文の見積もり', figures + ' ' + comparison(p),
    summary + '注文前の手元' + fmt(available) + '。使う予定' + fmt(collateral) + '、残る予定' + fmt(quote.available) + '。');
}

function openPosition(state, step, account) {
  const snapshot = account.data.perp;
  const p = snapshot.position;
  const side = p.side === -1 ? 'short' : 'long';
  const order = direction(side) + fmt(p.leverage) + '倍、' + fmt(p.quantity) + '枚分';
  const cash = '手元' + fmt(snapshot.available);
  const funding = '証拠金' + fmt(p.collateral) + 'を取引に使い、' + cash + '。取引額' + fmt(p.notional) + 'の値動きを受けるよ。';
  if (account.data.status !== 'marked') {
    const draft = account.phoneState.formDrafts;
    const price = Number(step.field === 'markPrice' ? selected(state, step, draft) : draft.markPrice);
    if (priceChoices.includes(price)) {
      const pnl = perpMetrics(p, price).unrealizedPnl;
      const label = step.field === 'markPrice' ? '選択中' : '決定済み';
      return slip('次の教材価格の試算', perUnit(side, p.entryPrice, price) + ' ' + funding,
        '今は' + fmt(p.markPrice) + '。' + fmt(price) + 'を' + label + '。進めると' + fmt(p.quantity) + '枚分で' + outcome(pnl) + '（試算）。');
    }
    if (step.field === 'markPrice') return slip('値動きを選ぶ', order + 'の試算。' + comparison(p),
      '次の価格は未選択。今は' + fmt(p.markPrice) + '、含み損益0。' + cash + '。');
    return slip('注文成立・保有中の建玉', '建玉（たてぎょく）は、始めてからまだ終えていない取引。' + funding,
      order + '。価格' + fmt(p.markPrice) + '、含み損益0。' + cash + '。');
  }
  const pnl = perpMetrics(p).unrealizedPnl;
  const delta = Math.abs(roundAmount(p.markPrice - p.entryPrice));
  const math = perUnit(side, p.entryPrice, p.markPrice) + ' 差額' + fmt(delta) + ' × ' + fmt(p.quantity) + '枚 ＝ ' + outcome(pnl) + '。';
  if (['LV-01-S018','LV-01-S019','LV-01-S020'].includes(step.id)) {
    const estimate = closePerp(snapshot, p.markPrice);
    const returned = estimate.history.at(-1).returned;
    return slip('全決済の見積もり', math + ' 今の建玉' + fmt(p.quantity) + '枚分を全部閉じると損益が決まるよ。',
      '未確定の' + outcome(pnl) + '。' + cash + ' ＋ 戻る予定' + fmt(returned) + ' ＝ ' + fmt(estimate.available) + '（予定）。');
  }
  return slip('値動き後の建玉', math,
    order + 'で' + outcome(pnl) + '（未確定）。取引中' + fmt(p.collateral) + '、' + cash + '。');
}

function receipt(state, step, account) {
  const view = getExtensionView(state, {questId});
  const closed = view.leverageHistory.at(-1);
  const available = account.accounts.availableUSDC;
  const held = roundAmount(available - closed.returned);
  const reference = direction(closed.side) + fmt(closed.leverage) + '倍。' + perUnit(closed.side, closed.entryPrice, closed.exitPrice) +
    ' ' + fmt(closed.quantity) + '枚分で' + outcome(closed.netPnl) + 'が確定。';
  return slip(step ? '全決済後の履歴' : 'ソラに見せる稽古の記録',
    reference + (step ? '' : ' お金は稽古場に残るよ。ソラにはこの記録を見せよう。'),
    '残り0枚。手元' + fmt(held) + ' ＋ 戻った' + fmt(closed.returned) + ' ＝ 今の手元' + fmt(available) + '。');
}

/** Live selections are illustrative. Only the independent dojo ledger records a trade. */
export function getDojoSlip(state, stepId = null) {
  const record = state?.questStates?.[questId];
  const step = lesson.get(stepId);
  const account = state?.financialScenarios?.['leverage-choice'];
  if (!record || !account || (stepId === null ? !record.completed : !step)) return null;
  if (account.data.perp?.history.length) return receipt(state, step, account);
  if (!step) return null;
  if (account.data.perp?.position) return openPosition(state, step, account);
  return beforeOrder(state, step, account);
}
