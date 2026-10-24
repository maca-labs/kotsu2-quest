import { fxPnl } from './finance.js';

/** Display-only explanations for the authored FX lessons, never review answers. */
const lessonIds = new Set(['FX-01', 'FX-02', 'FX-02-S', 'FX-03']);
const lotInputIds = new Set(['FX-01-010', 'FX-01-014', 'FX-02-012', 'FX-02-S-006']);

function isLessonStep(step) {
  return !!step && lessonIds.has(step.questId)
    && typeof step.id === 'string'
    && step.id.startsWith(`${step.questId}-`)
    && /^\d{3}$/.test(step.id.slice(step.questId.length + 1));
}

function isLotInput(step) {
  return isLessonStep(step) && lotInputIds.has(step.id) && step.type === 'input'
    && ['lots', 'closeLots'].includes(step.field)
    && typeof step.value === 'number' && Number.isFinite(step.value);
}

/** Keep the original operation and value; describe the real editable control. */
export function getFxOperationInstruction(step) {
  const original = step?.instruction ?? '';
  if (!isLotInput(step) || !/チップを押す/.test(original)) return original;
  const label = step.fieldLabel || (step.field === 'closeLots' ? '決済lot数' : 'lot数');
  return `「${label}」の欄に練習値「${step.value}」を入れよう。「カードの値を入力：${step.value}」ボタンも使えます。`;
}

/** This confirms the entered draft; it is never a trading-order confirmation. */
export function getFxSubmitLabel(step) {
  if (!isLotInput(step)) return undefined;
  return step.field === 'closeLots' ? 'この決済数量で進む' : 'このlot数で進む';
}

/**
 * Read only confirmed selection operations from the FX-01 preparation lesson.
 * These rows never imply that a draft selection is a filled order. Later FX
 * lessons show their actual scenario ledger instead of this preparation copy.
 */
export function getFxSelectionSummary(state, step) {
  if (!isLessonStep(step) || step.questId !== 'FX-01') return null;
  const completed = state?.questStates?.['FX-01']?.completedSteps;
  const done = new Set(Array.isArray(completed) ? completed : []);
  const draft = state?.phoneState?.formDrafts ?? {};
  const pairValue = draft['fx-order:pair'];
  const pair = (done.has('FX-01-003') || done.has('FX-01-007'))
    && ['EURJPY', 'USDJPY'].includes(pairValue) ? pairValue : null;
  const lotsValue = draft['fx-order:lots'];
  const lotsNumber = typeof lotsValue === 'number' || typeof lotsValue === 'string'
    ? Number(lotsValue) : NaN;
  const lots = (done.has('FX-01-010') || done.has('FX-01-014'))
    && [0.1, 1].includes(lotsNumber) ? lotsNumber : null;
  const sideValue = draft['fx-order:side'];
  const side = ['FX-01-015', 'FX-01-016', 'FX-01-017'].some(id => done.has(id))
    && ['buy', 'sell'].includes(sideValue) ? sideValue : null;
  const rows = [{ label: '取引の状態', value: '注文の準備中（まだ発注していません）' }];
  const summaryCards = [];
  if (pair === 'EURJPY') {
    rows.push({ label: '選んだ通貨ペア', value: 'EUR/JPY（ユーロ/円）' });
    summaryCards.push({ title: 'ユーロ/円は、何を表す？', text: 'EUR/JPYは、1ユーロを日本円の値段で表す組合せです。ここは名前と単位を見る表示練習で、この基本練習のユーロ/円の値段は設定していません。' });
  } else if (pair === 'USDJPY') {
    rows.push(
      { label: '選んだ通貨ペア', value: 'USD/JPY（米ドル/円）' },
      { label: '売る値段（Bid）', value: '149.98円（教材値）' },
      { label: '買う値段（Ask）', value: '150.00円（教材値）' },
    );
    summaryCards.push({ title: '米ドル/円は、何を表す？', text: 'USD/JPYは、1米ドルを日本円の値段で表す組合せです。買うときはAsk、売るときはBidを使います。この画面の値段は教材の固定値です。' });
  } else {
    rows.push({ label: '選んだ通貨ペア', value: 'まだ選んでいません' });
  }
  if (lots !== null) {
    const quantity = (lots * 1000).toLocaleString('ja-JP');
    const unit = pair === 'EURJPY' ? 'ユーロ' : pair === 'USDJPY' ? 'ドル' : '通貨（ペアは未選択）';
    rows.push({ label: '入力した数量', value: `${lots}lot＝${quantity}${unit}` });
  } else {
    rows.push({ label: '入力した数量', value: 'まだ入力していません' });
  }
  if (side) {
    rows.push({ label: '選んだ向き', value: side === 'buy' ? '新規買い（未発注）' : '新規売り（未発注）' });
    summaryCards.push({ title: '選んだ向きの意味', text: side === 'buy'
      ? '新規買いは、始めた値段より上がると利益、下がると損失になる向きです。選んだだけでは注文は成立しません。'
      : '新規売りは、始めた値段より下がると利益、上がると損失になる向きです。元の取引を閉じる「決済売り」とは別の操作です。選んだだけでは注文は成立しません。' });
  } else {
    rows.push({ label: '選んだ向き', value: 'まだ選んでいません' });
  }
  return { title: 'いま選んだ注文の準備', rows, cards: summaryCards };
}

const confirmationSteps = {
  'FX-02-004': { scenarioId: 'fx-order', questId: 'FX-02', sourceQuest: 'FX-01', mode: 'new', pair: 'USDJPY', side: 'buy', positionId: 'fx-usdjpy-001', pairStep: 'FX-01-007', lotsStep: 'FX-01-014', sideStep: 'FX-01-017', previewStep: 'FX-02-003' },
  'FX-02-014': { scenarioId: 'fx-order', questId: 'FX-02', mode: 'close', pair: 'USDJPY', side: 'buy', positionId: 'fx-usdjpy-001', positionStep: 'FX-02-007', lotsStep: 'FX-02-012', previewStep: 'FX-02-013', openStep: 'FX-02-004', tickStep: 'FX-02-009' },
  'FX-02-S-009': { scenarioId: 'fx-sell-variant', questId: 'FX-02-S', sourceQuest: 'FX-02-S', mode: 'new', pair: 'EURJPY', side: 'sell', positionId: 'fx-eurjpy-side-001', pairStep: 'FX-02-S-003', lotsStep: 'FX-02-S-006', sideStep: 'FX-02-S-007', previewStep: 'FX-02-S-008' },
  'FX-02-S-016': { scenarioId: 'fx-sell-variant', questId: 'FX-02-S', mode: 'close', pair: 'EURJPY', side: 'sell', positionId: 'fx-eurjpy-side-001', positionStep: 'FX-02-S-011', lotsStep: 'FX-02-S-014', previewStep: 'FX-02-S-015', openStep: 'FX-02-S-009', tickStep: 'FX-02-S-012' },
};

const pairLabel = pair => ({ USDJPY: 'USD/JPY（米ドル/円）', EURJPY: 'EUR/JPY（ユーロ/円）' }[pair] ?? String(pair));
const numericDraft = value => (typeof value === 'number' && Number.isFinite(value))
  || (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) ? Number(value) : null;
const yen = value => `${value < 0 ? '−' : value > 0 ? '＋' : ''}${Math.abs(value).toLocaleString('ja-JP')}円`;

function completedSet(state, questId) {
  const completed = state?.questStates?.[questId]?.completedSteps;
  return new Set(Array.isArray(completed) ? completed : []);
}

// Read actual saved values, including their finance-owned mirror. Conflicting
// copies are a reason to withhold a quote, never to replace input with an answer.
function confirmationDraft(state, scenario, config, questId, field, completed) {
  if (!completed) return undefined;
  const root = state?.phoneState?.formDrafts ?? {};
  const sources = [
    [root, `${config.scenarioId}:${field}`],
    [root[questId], field],
    [scenario?.phoneState?.formDrafts?.[questId], field],
  ];
  const values = sources.filter(([source, key]) => source && Object.hasOwn(source, key)).map(([source, key]) => source[key]);
  if (!values.length) return undefined;
  const normalize = value => ['lots', 'closeLots'].includes(field) ? numericDraft(value) : value;
  const first = normalize(values[0]);
  return values.every(value => normalize(value) === first) ? first : null;
}

/**
 * Four pre-confirmation screens only. Price tape: finance.js fxOpen/fxTick/
 * fxClose and pointquest appendix C, FX-02 / FX-02-S. These are fixed fictional
 * examples, not live quotes. Reading this never opens or closes a position.
 */
export function getFxOrderConfirmation(state, step) {
  const config = isLessonStep(step) ? confirmationSteps[step.id] : null;
  if (!config || config.questId !== step.questId) return null;
  const scenario = state?.financialScenarios?.[config.scenarioId];
  const done = completedSet(state, config.questId);
  const sourceDone = completedSet(state, config.sourceQuest);
  const hasEvent = kind => scenario?.eventLog?.some(event => event.id === `${config.scenarioId}:${kind}`) === true;
  const isSell = config.side === 'sell';
  const entryPrice = isSell ? 160 : 150;
  const initialOpposite = isSell ? 160.03 : 149.98;
  const rows = [{ label: '確認の状態', value: config.mode === 'new' ? '新規注文の確認中（未発注）' : '決済の確認中（まだ閉じていません）' }];
  const result = { title: config.mode === 'new' ? 'この内容で新規注文を出す予定です' : 'この建玉を、この内容で閉じる予定です', status: 'incomplete', rows, cards: [] };
  const showDraft = (label, value) => rows.push({ label, value: value === undefined ? 'まだ入力・選択していません' : value === null ? '入力記録が一致していません' : String(value) });
  const note = '固定の架空教材です。取引手数料・スワップは0円。この確認を読んだだけでは、取引は確定しません。';
  if (config.mode === 'new') {
    if (hasEvent(`open:${config.positionId}`) || scenario?.data?.position) {
      rows[0].value = 'この練習の新規注文はすでに確定しています。';
      return result;
    }
    const pair = confirmationDraft(state, scenario, config, config.sourceQuest, 'pair', sourceDone.has(config.pairStep));
    const side = confirmationDraft(state, scenario, config, config.sourceQuest, 'side', sourceDone.has(config.sideStep));
    const lots = confirmationDraft(state, scenario, config, config.sourceQuest, 'lots', sourceDone.has(config.lotsStep));
    showDraft('選んだ通貨ペア', pair == null ? pair : pairLabel(pair));
    showDraft('新規の向き', side == null ? side : side === 'buy' ? '新規買い' : side === 'sell' ? '新規売り' : side);
    showDraft('入力した数量', lots == null ? lots : `${lots}lot＝${(lots * 1000).toLocaleString('ja-JP')}通貨`);
    const ready = pair === config.pair && side === config.side && lots === 1 && done.has(config.previewStep) && !!scenario;
    if (ready) {
      result.status = 'ready';
      rows.push(
        { label: '成立時の教材記録ID（予定）', value: config.positionId },
        { label: '新規の教材約定価格（予定）', value: `${isSell ? 'Bid' : 'Ask'} ${entryPrice.toFixed(2)}円` },
        { label: '成立直後の想定損益', value: `${yen(fxPnl({ side, entryPrice, exitPrice: initialOpposite, quantity: lots * 1000 }))}（その場で閉じる場合）` },
      );
      result.cards.push({ title: '確定する前に見比べよう', text: note });
    } else result.cards.push({ title: '入力した内容を見直そう', text: 'まだ注文内容がそろっていません。元の画面で選んだ通貨ペア・向き・数量を確かめてから、もう一度確認しよう。' });
    return result;
  }
  const positionId = confirmationDraft(state, scenario, config, config.questId, 'positionId', done.has(config.positionStep));
  const lots = confirmationDraft(state, scenario, config, config.questId, 'closeLots', done.has(config.lotsStep));
  showDraft('選んだ建玉ID', positionId);
  showDraft('入力した決済数量', lots == null ? lots : `${lots}lot＝${(lots * 1000).toLocaleString('ja-JP')}通貨`);
  const position = scenario?.data?.position;
  const validPosition = position && position.id === positionId && position.id === config.positionId
    && position.pair === config.pair && position.side === config.side
    && position.baseQuantity === 1000 && position.entryPrice === entryPrice;
  const completeDraft = validPosition && lots === position.baseQuantity / 1000
    && done.has(config.previewStep) && done.has(config.openStep) && hasEvent(`open:${config.positionId}`);
  if (!completeDraft) {
    if (!position) rows[0].value = '閉じる建玉がありません（未発注または決済済み）。';
    result.cards.push({ title: '元の建玉と数量を見直そう', text: 'まだ決済する内容がそろっていません。元の画面で閉じる建玉を選び、数量を確かめてから、もう一度確認しよう。' });
    return result;
  }
  const tickEvent = hasEvent(`tick:${config.positionId}`), tickDone = done.has(config.tickStep);
  if (tickEvent !== tickDone) {
    result.cards.push({ title: '値動きの記録を確認しよう', text: '工程の記録と、教材の値動きの記録が一致していません。価格を補わず、練習を開き直して確かめよう。' });
    return result;
  }
  const price = tickEvent ? isSell ? 159.93 : 149.88 : initialOpposite;
  result.status = tickEvent ? 'ready' : 'awaiting-tick';
  rows.push(
    { label: '通貨ペア', value: pairLabel(position.pair) },
    { label: '元の取引', value: `${position.side === 'buy' ? '新規買い' : '新規売り'}・開始 ${position.entryPrice.toFixed(2)}円` },
    { label: '閉じる向き', value: isSell ? '決済買い' : '決済売り' },
    { label: '教材の価格場面', value: tickEvent ? '次の値動き後' : '値動き前（次の値動きは未実施）' },
    { label: '決済の教材約定価格（予定）', value: `${isSell ? 'Ask' : 'Bid'} ${price.toFixed(2)}円` },
    { label: 'この価格で全決済した場合の想定損益', value: yen(fxPnl({ side: position.side, entryPrice: position.entryPrice, exitPrice: price, quantity: lots * 1000 })) },
  );
  result.cards.push({ title: tickEvent ? '決済を確定する前に見比べよう' : 'ここはまだ値動き前です', text: tickEvent ? note : `表示は値動き前の価格です。次の値動きの工程を終えてから、決済内容を確かめます。${note}` });
  return result;
}

const cards = {
  bidAsk: {
    title: '開いた用語：BidとAsk',
    text: 'Bid（ビッド）は自分が売るときの値段、Ask（アスク）は自分が買うときの値段です。二つの値段の差をスプレッドといいます。新規でも決済でも、売るときと買うときで使う値段が違います。',
  },
  directions: {
    title: '新規買い・新規売りは、始める向き',
    text: '「新規」は新しい取引を始めること。新規買いは、始めた値段より上がると利益、下がると損失になる向きです。新規売りはその逆です。持っている通貨を売る操作とは分けて考えます。すでにある取引を閉じる「決済」とも別です。',
  },
  smallQuantity: {
    title: '入れた量：0.1lotは100ドル',
    text: 'この練習は1lot（ロット）＝1,000通貨。0.1lotは100ドルです。100ドル×150円＝15,000円は「取引額」で、手元の現金ではありません。ここではまだ注文を確定していません。',
  },
  fullQuantity: {
    title: '入れた量：1lotは1,000ドル',
    text: 'この練習は1lot（ロット）＝1,000通貨。1lotは1,000ドルです。1,000ドル×150円＝150,000円は「取引額」で、手元の現金ではありません。ここではまだ注文を確定していません。',
  },
  marginMeaning: {
    title: '証拠金（しょうこきん）は、取引のために確保する分',
    text: '証拠金は、損失に備えて取引のために取り分ける資金です。買い物の代金や、追加の手数料ではありません。確保中の分を、別の取引に重ねて使うことはできません。',
  },
  buyMargin: {
    title: '開いた内訳：現金・取引額・証拠金は別',
    text: '現金は100,000円。取引額は1,000ドル×150.00円＝150,000円。必要証拠金は150,000円÷5＝30,000円です。新規注文で現金から150,000円や30,000円を支払う計算にはしません。この1/5は教材の簡略モデルで、実サービスの計算そのものではありません。',
  },
  buyReserved: {
    title: '注文成立後：現金と確保中の分を見分けよう',
    text: 'この取引の現金残高は100,000円のまま、証拠金30,000円を確保中です。自由に使える額は、まだ閉じていない取引の損益によっても変わります。現金残高だけで判断せず、画面の利用可能な証拠金も確かめよう。',
  },
  closeBuy: {
    title: '決済（けっさい）は、元の取引を閉じること',
    text: '建玉（たてぎょく）は、まだ閉じていない取引の記録。買いで始めた建玉は、その建玉から「決済売り」で閉じます。「新規売り」は別の取引を始める操作なので、今の建玉の決済にはなりません。',
  },
  sellMargin: {
    title: '別の売り練習：現金・取引額・証拠金',
    text: 'この副練習だけの現金は100,000円。取引額は1,000ユーロ×160.00円＝160,000円、必要証拠金は160,000円÷5＝32,000円です。32,000円は確保する分で、代金として現金から引きません。この1/5は教材の簡略モデルです。本編の資金とは合算しません。',
  },
  sellReserved: {
    title: '別の売り練習：32,000円を確保中',
    text: 'この副練習の現金残高は100,000円のまま、証拠金32,000円を確保中です。自由に使える額は、まだ閉じていない取引の損益によっても変わります。本編の現金や取引記録には足しません。',
  },
  closeSell: {
    title: '売りで始めた建玉を、決済買いで閉じよう',
    text: '売りで始めた建玉は、その建玉から「決済買い」で閉じます。「新規買い」で別の取引を始めることとは違います。決済する元の建玉と数量を確認しよう。',
  },
};

// An explanation opened by one operation is shown on the resulting screen.
// Each key is an existing main-lesson step ID, not a boss/review ID.
const cardKeysByStep = {
  'FX-01-005': ['bidAsk'],
  'FX-01-006': ['directions'],
  'FX-01-011': ['smallQuantity'],
  'FX-01-012': ['smallQuantity'],
  'FX-01-015': ['fullQuantity', 'directions'],
  'FX-01-016': ['directions', 'bidAsk'],
  'FX-01-017': ['directions', 'bidAsk'],
  'FX-01-018': ['directions'],
  'FX-02-001': ['marginMeaning'],
  'FX-02-002': ['marginMeaning'],
  'FX-02-003': ['marginMeaning', 'buyMargin'],
  'FX-02-004': ['marginMeaning', 'buyMargin'],
  'FX-02-005': ['buyReserved'],
  'FX-02-010': ['closeBuy'],
  'FX-02-011': ['closeBuy'],
  'FX-02-012': ['closeBuy'],
  'FX-02-013': ['closeBuy'],
  'FX-02-014': ['closeBuy'],
  'FX-02-S-007': ['directions'],
  'FX-02-S-008': ['directions', 'marginMeaning'],
  'FX-02-S-009': ['marginMeaning', 'sellMargin'],
  'FX-02-S-010': ['sellReserved'],
  'FX-02-S-013': ['closeSell'],
  'FX-02-S-014': ['closeSell'],
  'FX-02-S-015': ['closeSell'],
  'FX-02-S-016': ['closeSell'],
};

/** No state changes or financial estimates: only fixed, explicitly named examples. */
export function getFxConceptCards(step) {
  if (!isLessonStep(step)) return [];
  return (cardKeysByStep[step.id] ?? []).map(key => ({ ...cards[key] }));
}
