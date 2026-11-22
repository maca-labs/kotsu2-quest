import {steps, simulationConfig} from './content-crypto.js';

const journeySteps = new Map(steps.filter(step => step.questId.startsWith('CR-')).map(step => [step.id, step]));
const lessonValue = id => journeySteps.get(id).value;
export const journeyTransfer = Object.freeze({
  wallet: lessonValue('CR-02-S004'),
  asset: lessonValue('CR-03-S003'),
  network: lessonValue('CR-03-S005'),
  recipient: lessonValue('CR-03-S007'),
  quantity: lessonValue('CR-03-S018'),
  fee: simulationConfig.depositCost,
  gas: simulationConfig.gasETH,
  minimum: simulationConfig.depositMinimum,
});

const transfer = journeyTransfer;
const core = 'ハイリキ（HyperCore）';
const wallet = '自分の練習財布 ' + transfer.wallet;
const path = wallet + ' → ' + transfer.network + ' → ' + core + 'の ' + transfer.recipient;
const amount = value => Number(value).toLocaleString('ja-JP', {maximumFractionDigits: 6});
const usdc = value => amount(value) + ' Mock USDC';
const eth = value => amount(value) + ' Mock ETH';
const walletFunds = accounts => '財布に' + usdc(accounts.walletUSDC) + 'とガス用の' + eth(accounts.walletETH);
const coreFunds = value => 'ハイリキで使える分は' + usdc(value);

function mapSlip(state, journey, number) {
  const accounts = number === null ? journey.initialSnapshot.accounts : journey.accounts;
  const handoff = state.financialScenarios['funding-japan']?.data?.handoff;
  const source = handoff ? '前の依頼で円から準備した資産を、そのまま使う。' : 'この旅で使う練習資産を確かめよう。';
  let reference = source;
  if (number >= 2 && number <= 5) reference = '銀行では円、ウォレットではコインの明細を開いて、単位を見よう。';
  if (number >= 6 && number <= 9) reference = 'ウォレットで自分の資産を操作する。送るときは、両方の画面で道の名前を照合しよう。';
  if (number >= 10 && number <= 13) reference = 'ハイリキで取引に使う場所はHyperCore。別の場所、HyperEVMの残高とは分けて見る。';
  if (number >= 14) reference = '送るコインはMock USDC。道を使う費用（ガス）は、財布のMock ETHから払う。';
  return {
    title: number === null ? '資産の地図を調べたときの控え' : '資産の地図・出発前',
    route: '銀行の円 → 交換所 → ' + wallet + '。次の行き先は' + core + '。',
    reference,
    status: walletFunds(accounts) + '。' + coreFunds(accounts.availableUSDC) + '。',
  };
}

function connectionSlip(journey, number) {
  const recorded = number === null;
  const connected = recorded || journey.data.connected;
  const enabled = recorded || journey.data.enabled;
  let reference = '接続を許可すると、アプリに自分の財布の識別子が表示される。';
  if (number >= 9 && number <= 15) reference = '取引を有効にすると、注文の練習ができる。入金は次の依頼で行う。';
  if (number >= 16 || recorded) reference = '復元情報を渡すと、ほかの人にも財布を使われる。困ったらアプリのヘルプへ。';
  const accounts = recorded ? journey.initialSnapshot.accounts : journey.accounts;
  return {
    title: recorded ? '接続を確かめたときの控え' : '練習ウォレットの接続記録',
    route: '接続を求めるアプリ「そらの取引練習」／ 使うのは' + wallet,
    reference,
    status: (connected ? '接続済み' : '未接続') + '・取引の練習は' + (enabled ? '有効' : 'まだ無効') + '。送金なし。' + walletFunds(accounts) + '。',
  };
}

function depositSlip(journey, number) {
  const {accounts, data} = journey;
  const draft = journey.phoneState?.formDrafts?.['CR-03'] ?? {};
  const quantity = Number(draft.quantity ?? transfer.quantity);
  const estimate = '送る' + usdc(quantity) + 'のうち教材費は' + usdc(transfer.fee) + '、受取予定は' + usdc(quantity - transfer.fee) + '。ガスは別に' + eth(transfer.gas) + '。';
  const route = path;
  if (data.depositStatus === 'not_started') {
    let reference = '受取カードの資産はMock ' + transfer.asset + '。送る画面で、資産・道・宛先の3つを合わせよう。';
    if (number >= 13 && number <= 14) reference = '同じUSDCでも、受取先が使う道と違えば今回の入金にならない。両方の画面で道の名前を比べよう。';
    if (number >= 15 && number <= 16) reference = '自分の財布は送る側。宛先欄には、ハイリキの受取カードからコピーした識別子を貼り付けよう。';
    if (number >= 17) reference = estimate;
    return {title: '送る前の受取カード', route, reference,
      status: 'まだ送信前。' + walletFunds(accounts) + '。' + coreFunds(accounts.availableUSDC) + '。'};
  }
  const reference = '送信額' + usdc(quantity) + 'のうち教材費は' + usdc(accounts.depositFee) + '。別にガス' + eth(transfer.gas) + 'を使った。';
  if (data.depositStatus === 'processing') {
    return {title: '送信済み・ハイリキへの到着待ち', route, reference,
      status: walletFunds(accounts) + '。処理中は' + usdc(accounts.incomingUSDC) + '。' + coreFunds(accounts.availableUSDC) + '。'};
  }
  // Chapter 6 can withdraw these funds. Keep this chapter's original arrival slip legible afterwards.
  const atArrival = data.exitAmount === undefined ? accounts : {
    walletUSDC: journey.initialSnapshot.accounts.walletUSDC - quantity,
    walletETH: accounts.walletETH,
    availableUSDC: data.exitAmount,
  };
  return {title: 'ハイリキに届いたときの明細', route, reference,
    status: walletFunds(atArrival) + '。ハイリキに' + usdc(atArrival.availableUSDC) + 'が到着し、使える残高になった。'};
}

function comparisonSlip(journey, number) {
  const draft = journey.phoneState?.formDrafts?.['CR-04'] ?? {};
  const horizon = journeySteps.get('CR-04-S016').choices.find(choice => choice.value === draft.returnHorizon);
  const route = journeySteps.get('CR-04-S018').choices.find(choice => choice.value === draft.route);
  return {
    title: number === null ? '次の章で学ぶ道の控え' : '資金を戻す時期と運用方法',
    route: 'いま見比べる場所は' + core + '。運用を見送る道も選べる。',
    reference: horizon ? '自分が選んだ希望は「' + horizon.label + '」。' : '値下がりしたらどうなるか、引き出すまで何日待つかを比べよう。',
    status: route ? '予約した道は「' + route.label + '」。予約だけで資金は動かない。' : 'まだ見比べているところ。この画面で運用や出金は始まらない。',
  };
}

/** Read the main journey ledger only for its own lesson. Reviews and bosses have independent funds. */
export function getJourneySlip(state, questId, stepId = null) {
  const journey = state?.financialScenarios?.journey;
  if (!journey || !state.questStates?.[questId]) return null;
  const step = journeySteps.get(stepId);
  if (stepId === null ? !state.questStates[questId].completed : step?.questId !== questId) return null;
  const number = step ? Number(step.id.slice(-3)) : null;
  switch (questId) {
    case 'CR-01': return mapSlip(state, journey, number);
    case 'CR-02': return connectionSlip(journey, number);
    case 'CR-03': return depositSlip(journey, number);
    case 'CR-04': return comparisonSlip(journey, number);
    default: return null;
  }
}
