import test from 'node:test';
import assert from 'node:assert/strict';
import { steps, stepById, bosses, quests } from '../js/content.js';
import { createState, dispatch, activeStep } from '../js/engine.js';
import { getFxOperationInstruction, getFxConceptCards, getFxSelectionSummary, getFxSubmitLabel, getFxOrderConfirmation } from '../js/fx-guidance.js';

const text = id => getFxConceptCards(stepById[id]).map(card => `${card.title} ${card.text}`).join('\n');
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

test('the four authored chip inputs describe the real field and optional value button', () => {
  const expected = {
    'FX-01-010': ['lots', 0.1],
    'FX-01-014': ['lots', 1],
    'FX-02-012': ['closeLots', 1],
    'FX-02-S-006': ['lots', 1],
  };
  const changed = steps.filter(step => getFxOperationInstruction(step) !== step.instruction);
  assert.deepEqual(changed.map(step => step.id).sort(), Object.keys(expected).sort());
  for (const [id, [field, value]] of Object.entries(expected)) {
    const original = structuredClone(stepById[id]);
    const step = freeze(structuredClone(original));
    const instruction = getFxOperationInstruction(step);
    assert.equal(step.type, 'input');
    assert.equal(step.field, field);
    assert.equal(step.value, value);
    assert.ok(instruction.includes(`「${step.fieldLabel}」の欄に練習値「${value}」を入れよう`), id);
    assert.ok(instruction.includes(`カードの値を入力：${value}`), id);
    assert.doesNotMatch(instruction, /チップ/);
    assert.deepEqual(step, original, 'display adaptation must not mutate the authored operation');
  }
});

test('non-input steps and boss/review actions retain their instructions and expose no answer cards', () => {
  for (const step of steps.filter(step => !/^FX-/.test(step.id))) {
    assert.equal(getFxOperationInstruction(step), step.instruction, step.id);
    assert.deepEqual(getFxConceptCards(step), [], step.id);
  }
  for (const id of ['FX-01-009', 'FX-01-015', 'FX-02-S-014', 'FX-03-001']) {
    assert.equal(getFxOperationInstruction(stepById[id]), stepById[id].instruction, id);
  }
  const outside = [
    ...bosses.flatMap(boss => boss.tasks.flatMap(task => task.actions ?? [task])),
    ...quests.flatMap(quest => quest.reviewVariant?.tasks?.flatMap(task => task.actions ?? [task]) ?? []),
    { ...stepById['FX-01-010'], id: 'RV-FX-01-1-a1' },
    { ...stepById['FX-02-003'], id: 'CH-3-boss-answer' },
    { ...stepById['FX-01-010'], questId: 'LV-01' },
  ];
  assert.ok(outside.length > 100);
  for (const step of outside) {
    assert.equal(getFxOperationInstruction(step), step.instruction ?? '', step.id);
    assert.deepEqual(getFxConceptCards(step), [], step.id);
  }
});

test('opening a definition leaves its meaning on the resulting next screen', () => {
  assert.equal(stepById['FX-01-004'].nextStepIds[0], 'FX-01-005');
  assert.match(text('FX-01-005'), /Bid（ビッド）は自分が売るとき/);
  assert.match(text('FX-01-005'), /Ask（アスク）は自分が買うとき/);
  assert.equal(stepById['FX-01-005'].nextStepIds[0], 'FX-01-006');
  assert.match(text('FX-01-006'), /新規買いは.*上がると利益、下がると損失/);
  assert.match(text('FX-01-006'), /新規売りはその逆/);
  assert.match(text('FX-01-006'), /閉じる「決済」とも別/);
  assert.equal(stepById['FX-02-002'].nextStepIds[0], 'FX-02-003');
  assert.match(text('FX-02-003'), /開いた内訳/);
  for (const id of ['FX-01-015', 'FX-01-016', 'FX-01-017', 'FX-02-S-007', 'FX-02-S-008']) {
    assert.match(text(id), /新規買い・新規売り/, id);
  }
});

test('quantity cards distinguish the fixed lot conversion, trade amount and cash', () => {
  assert.equal(0.1 * 1000, 100);
  assert.equal(100 * 150, 15000);
  assert.equal(1000 * 150, 150000);
  for (const id of ['FX-01-011', 'FX-01-012']) {
    assert.match(text(id), /0\.1lotは100ドル/);
    assert.match(text(id), /15,000円は「取引額」で、手元の現金ではありません/);
  }
  assert.match(text('FX-01-015'), /1lotは1,000ドル/);
  assert.match(text('FX-01-015'), /150,000円は「取引額」で、手元の現金ではありません/);
});

test('standard margin explanations preserve cash and separate the fixed model from real services', () => {
  assert.equal(1000 * 150 / 5, 30000);
  for (const id of ['FX-02-001', 'FX-02-002', 'FX-02-003', 'FX-02-004']) {
    assert.match(text(id), /証拠金（しょうこきん）/);
    assert.match(text(id), /代金や、追加の手数料ではありません/);
  }
  for (const id of ['FX-02-003', 'FX-02-004']) {
    assert.match(text(id), /現金は100,000円/);
    assert.match(text(id), /1,000ドル×150\.00円＝150,000円/);
    assert.match(text(id), /150,000円÷5＝30,000円/);
    assert.match(text(id), /新規注文で現金から150,000円や30,000円を支払う計算にはしません/);
    assert.match(text(id), /教材の簡略モデルで、実サービスの計算そのものではありません/);
    assert.doesNotMatch(text(id), /32,000|160,000/);
  }
  assert.match(text('FX-02-005'), /現金残高は100,000円のまま、証拠金30,000円を確保中/);
  assert.match(text('FX-02-005'), /まだ閉じていない取引の損益によっても変わります/);
});

test('optional short example is isolated, with its own 160,000/32,000 fixed model', () => {
  assert.equal(1000 * 160 / 5, 32000);
  assert.match(text('FX-02-S-009'), /この副練習だけの現金は100,000円/);
  assert.match(text('FX-02-S-009'), /1,000ユーロ×160\.00円＝160,000円/);
  assert.match(text('FX-02-S-009'), /160,000円÷5＝32,000円/);
  assert.match(text('FX-02-S-009'), /代金として現金から引きません/);
  assert.match(text('FX-02-S-009'), /教材の簡略モデル/);
  assert.match(text('FX-02-S-009'), /本編の資金とは合算しません/);
  assert.match(text('FX-02-S-010'), /現金残高は100,000円のまま、証拠金32,000円を確保中/);
  for (const step of steps.filter(step => step.questId !== 'FX-02-S')) {
    assert.doesNotMatch(getFxConceptCards(step).map(card => card.text).join(' '), /32,000|160,000/, step.id);
  }
});

test('closing cards distinguish settling an existing position from a new opposite order', () => {
  for (const id of ['FX-02-010', 'FX-02-011', 'FX-02-012', 'FX-02-013', 'FX-02-014']) {
    assert.match(text(id), /建玉（たてぎょく）/);
    assert.match(text(id), /その建玉から「決済売り」で閉じます/);
    assert.match(text(id), /「新規売り」は別の取引を始める操作/);
  }
  for (const id of ['FX-02-S-013', 'FX-02-S-014', 'FX-02-S-015', 'FX-02-S-016']) {
    assert.match(text(id), /その建玉から「決済買い」で閉じます/);
    assert.match(text(id), /「新規買い」で別の取引を始めることとは違います/);
  }
});

test('helpers are safe for absent or unrelated data and return independent presentation copies', () => {
  for (const step of [undefined, null, {}, { questId: 'FX-02' }, { id: 'FX-02-003', questId: 'FX-01' }]) {
    assert.doesNotThrow(() => getFxOperationInstruction(step));
    assert.deepEqual(getFxConceptCards(step), []);
  }
  const original = structuredClone(stepById['FX-02-003']);
  const step = freeze(structuredClone(original));
  const first = getFxConceptCards(step);
  first[0].text = 'changed by a view';
  first.push({ title: 'another', text: 'not shared' });
  assert.equal(getFxConceptCards(step).length, 2);
  assert.match(getFxConceptCards(step)[0].text, /証拠金/);
  assert.deepEqual(step, original);
  const malformed = { ...stepById['FX-01-010'], value: NaN };
  assert.equal(getFxOperationInstruction(malformed), malformed.instruction);
});

test('lot submit labels confirm the draft quantity without implying an executed trade', () => {
  const expected = {
    'FX-01-010': 'このlot数で進む',
    'FX-01-014': 'このlot数で進む',
    'FX-02-012': 'この決済数量で進む',
    'FX-02-S-006': 'このlot数で進む',
  };
  for (const step of steps) assert.equal(getFxSubmitLabel(step), expected[step.id], step.id);
  for (const value of [undefined, null, {}, { ...stepById['FX-01-010'], id: 'RV-FX-01-1-a1' }]) {
    assert.equal(getFxSubmitLabel(value), undefined);
  }
});

function fxPreparation() {
  let state = createState();
  const act = command => { state = dispatch(state, command, 1_000_000_000); };
  for (const command of [{ type: 'START', avatar: 0 }, { type: 'CHAPTER', id: 'CH-3' }, { type: 'NPC', chapterId: 'CH-3', index: 0 }, { type: 'SAVE_OFFER' }, { type: 'ACCEPT', id: 'FX-01', timed: false }]) act(command);
  return {
    get state() { return state; },
    act,
    through(id) {
      while (activeStep(state)) {
        const step = activeStep(state);
        act({ type: 'STEP', id: step.id, value: step.value ?? true });
        if (step.id === id) return;
      }
      throw new Error(`Missing operation ${id}`);
    },
  };
}
const rowValue = (summary, label) => summary.rows.find(row => row.label === label)?.value;

test('actual saved pair operations change the selection summary, without inventing a euro quote', () => {
  const run = fxPreparation();
  let summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'まだ選んでいません');
  assert.equal(rowValue(summary, '入力した数量'), 'まだ入力していません');
  assert.equal(rowValue(summary, '選んだ向き'), 'まだ選んでいません');
  run.through('FX-01-003');
  const euroState = freeze(structuredClone(run.state));
  const before = JSON.stringify(euroState);
  summary = getFxSelectionSummary(euroState, activeStep(euroState));
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'EUR/JPY（ユーロ/円）');
  assert.match(summary.cards[0].text, /1ユーロを日本円の値段で表す/);
  assert.match(summary.cards[0].text, /値段は設定していません/);
  assert.equal(rowValue(summary, '売る値段（Bid）'), undefined);
  assert.equal(rowValue(summary, '買う値段（Ask）'), undefined);
  assert.doesNotMatch(JSON.stringify(summary), /150\.00|149\.98|160\.00|160\.03|300P/);
  assert.equal(JSON.stringify(euroState), before);
  run.through('FX-01-007');
  summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'USD/JPY（米ドル/円）');
  assert.equal(rowValue(summary, '売る値段（Bid）'), '149.98円（教材値）');
  assert.equal(rowValue(summary, '買う値段（Ask）'), '150.00円（教材値）');
});

test('actual lot and direction operations show saved choices and retain the unplaced-order state', () => {
  const run = fxPreparation();
  run.through('FX-01-010');
  let summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '入力した数量'), '0.1lot＝100ドル');
  assert.equal(rowValue(summary, '選んだ向き'), 'まだ選んでいません');
  run.through('FX-01-014');
  summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '入力した数量'), '1lot＝1,000ドル');
  run.through('FX-01-015');
  summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '選んだ向き'), '新規買い（未発注）');
  assert.match(summary.cards.at(-1).text, /上がると利益、下がると損失/);
  run.through('FX-01-016');
  summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '選んだ向き'), '新規売り（未発注）');
  assert.match(summary.cards.at(-1).text, /下がると利益、上がると損失/);
  assert.match(summary.cards.at(-1).text, /「決済売り」とは別/);
  run.through('FX-01-017');
  summary = getFxSelectionSummary(run.state, activeStep(run.state));
  assert.equal(rowValue(summary, '選んだ向き'), '新規買い（未発注）');
  assert.equal(rowValue(summary, '取引の状態'), '注文の準備中（まだ発注していません）');
  assert.deepEqual(run.state.financialScenarios['fx-order'].data.fills, []);
  assert.equal(run.state.financialScenarios['fx-order'].accounts.cashBalance, 100000);
});

test('summary never substitutes expected values for unfinished or missing selections', () => {
  const state = createState();
  state.phoneState.formDrafts = { 'fx-order:pair': 'USDJPY', 'fx-order:lots': 1, 'fx-order:side': 'buy' };
  let summary = getFxSelectionSummary(state, stepById['FX-01-003']);
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'まだ選んでいません');
  assert.equal(rowValue(summary, '入力した数量'), 'まだ入力していません');
  assert.equal(rowValue(summary, '選んだ向き'), 'まだ選んでいません');
  state.questStates['FX-01'] = { completedSteps: ['FX-01-003', 'FX-01-010', 'FX-01-015'] };
  state.phoneState.formDrafts = {};
  summary = getFxSelectionSummary(state, stepById['FX-01-016']);
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'まだ選んでいません');
  assert.equal(rowValue(summary, '入力した数量'), 'まだ入力していません');
  assert.equal(rowValue(summary, '選んだ向き'), 'まだ選んでいません');
  state.phoneState.formDrafts = { 'fx-order:pair': 'OTHER', 'fx-order:lots': Infinity, 'fx-order:side': 'other' };
  summary = getFxSelectionSummary(state, stepById['FX-01-016']);
  assert.equal(rowValue(summary, '選んだ通貨ペア'), 'まだ選んでいません');
  assert.equal(rowValue(summary, '入力した数量'), 'まだ入力していません');
  assert.equal(rowValue(summary, '選んだ向き'), 'まだ選んでいません');
});

test('selection summary is FX-01 only, absent-state safe and independent between reads', () => {
  for (const step of [undefined, null, {}, stepById['FX-02-003'], stepById['FX-02-S-009'], stepById['FX-03-001'], { ...stepById['FX-01-003'], id: 'RV-FX-01-1-a1' }]) {
    assert.equal(getFxSelectionSummary(undefined, step), null);
  }
  const first = getFxSelectionSummary(undefined, stepById['FX-01-003']);
  assert.equal(rowValue(first, '選んだ通貨ペア'), 'まだ選んでいません');
  first.rows[0].value = 'changed';
  assert.equal(rowValue(getFxSelectionSummary(undefined, stepById['FX-01-003']), '取引の状態'), '注文の準備中（まだ発注していません）');
});

const confirmationCache = new Map();
function confirmationState(target) {
  if (!confirmationCache.has(target)) {
    const run = fxPreparation();
    run.through('FX-01-018');
    run.act({ type: 'ACCEPT', id: 'FX-02', timed: false });
    if (target === 'FX-02-004') run.through('FX-02-003');
    else if (target === 'FX-02-014') run.through('FX-02-013');
    else {
      run.through('FX-02-020');
      run.act({ type: 'ACCEPT', id: 'FX-02-S', timed: false });
      run.through(target === 'FX-02-S-009' ? 'FX-02-S-008' : 'FX-02-S-015');
    }
    assert.equal(activeStep(run.state).id, target);
    confirmationCache.set(target, structuredClone(run.state));
  }
  return structuredClone(confirmationCache.get(target));
}
const quoteRows = summary => summary.rows.filter(row => /教材約定価格|想定損益|教材記録ID/.test(row.label));

test('new-order confirmations show actual saved settings, fixed fictional quotes and an unplaced status', () => {
  for (const [id, scenarioId, pair, recordId, quote, loss] of [
    ['FX-02-004', 'fx-order', 'USD/JPY（米ドル/円）', 'fx-usdjpy-001', 'Ask 150.00円', '−20円（その場で閉じる場合）'],
    ['FX-02-S-009', 'fx-sell-variant', 'EUR/JPY（ユーロ/円）', 'fx-eurjpy-side-001', 'Bid 160.00円', '−30円（その場で閉じる場合）'],
  ]) {
    const state = freeze(confirmationState(id)), step = freeze(structuredClone(stepById[id]));
    const before = JSON.stringify(state), stepBefore = JSON.stringify(step);
    const summary = getFxOrderConfirmation(state, step);
    assert.equal(summary.status, 'ready');
    assert.equal(rowValue(summary, '確認の状態'), '新規注文の確認中（未発注）');
    assert.equal(rowValue(summary, '選んだ通貨ペア'), pair);
    assert.equal(rowValue(summary, '入力した数量'), '1lot＝1,000通貨');
    assert.equal(rowValue(summary, '成立時の教材記録ID（予定）'), recordId);
    assert.equal(rowValue(summary, '新規の教材約定価格（予定）'), quote);
    assert.equal(rowValue(summary, '成立直後の想定損益'), loss);
    assert.match(summary.cards[0].text, /架空教材.*手数料・スワップは0円/);
    assert.equal(state.financialScenarios[scenarioId].data.position, null);
    assert.deepEqual(state.financialScenarios[scenarioId].data.fills, []);
    assert.equal(state.financialScenarios[scenarioId].accounts.cashBalance, 100000);
    assert.equal(JSON.stringify(state), before);
    assert.equal(JSON.stringify(step), stepBefore);
  }
});

test('close confirmations use the selected real position and the ticked executable side, without settling it', () => {
  for (const [id, scenarioId, recordId, side, quote, pnl] of [
    ['FX-02-014', 'fx-order', 'fx-usdjpy-001', '決済売り', 'Bid 149.88円', '−120円'],
    ['FX-02-S-016', 'fx-sell-variant', 'fx-eurjpy-side-001', '決済買い', 'Ask 159.93円', '＋70円'],
  ]) {
    const state = freeze(confirmationState(id)), step = freeze(structuredClone(stepById[id]));
    const before = JSON.stringify(state), stepBefore = JSON.stringify(step);
    const summary = getFxOrderConfirmation(state, step);
    assert.equal(summary.status, 'ready');
    assert.equal(rowValue(summary, '確認の状態'), '決済の確認中（まだ閉じていません）');
    assert.equal(rowValue(summary, '選んだ建玉ID'), recordId);
    assert.equal(rowValue(summary, '入力した決済数量'), '1lot＝1,000通貨');
    assert.equal(rowValue(summary, '閉じる向き'), side);
    assert.equal(rowValue(summary, '教材の価格場面'), '次の値動き後');
    assert.equal(rowValue(summary, '決済の教材約定価格（予定）'), quote);
    assert.equal(rowValue(summary, 'この価格で全決済した場合の想定損益'), pnl);
    assert.equal(state.financialScenarios[scenarioId].data.position.id, recordId);
    assert.equal(state.financialScenarios[scenarioId].data.fills.filter(fill => fill.kind === 'close').length, 0);
    assert.equal(state.financialScenarios[scenarioId].accounts.cashBalance, 100000);
    assert.equal(JSON.stringify(state), before);
    assert.equal(JSON.stringify(step), stepBefore);
  }
});

test('confirmation distinguishes the pre-tick and post-tick tapes and refuses inconsistent tick evidence', () => {
  for (const [id, scenarioId, questId, tickStep, recordId, quote, pnl] of [
    ['FX-02-014', 'fx-order', 'FX-02', 'FX-02-009', 'fx-usdjpy-001', 'Bid 149.98円', '−20円'],
    ['FX-02-S-016', 'fx-sell-variant', 'FX-02-S', 'FX-02-S-012', 'fx-eurjpy-side-001', 'Ask 160.03円', '−30円'],
  ]) {
    // A deliberately synthetic branch condition, not a claim this is a valid
    // imported save: remove the tick evidence to exercise the earlier tape.
    const state = confirmationState(id);
    state.financialScenarios[scenarioId].eventLog = state.financialScenarios[scenarioId].eventLog.filter(event => event.id !== `${scenarioId}:tick:${recordId}`);
    let summary = getFxOrderConfirmation(state, stepById[id]);
    assert.equal(summary.status, 'incomplete');
    assert.deepEqual(quoteRows(summary), []);
    state.questStates[questId].completedSteps = state.questStates[questId].completedSteps.filter(step => step !== tickStep);
    summary = getFxOrderConfirmation(state, stepById[id]);
    assert.equal(summary.status, 'awaiting-tick');
    assert.equal(rowValue(summary, '決済の教材約定価格（予定）'), quote);
    assert.equal(rowValue(summary, 'この価格で全決済した場合の想定損益'), pnl);
    assert.match(rowValue(summary, '教材の価格場面'), /値動き前/);
  }
});

test('missing, wrong or conflicting drafts do not reveal a replacement quote, amount or target ID', () => {
  const mutations = [
    ['FX-02-004', state => { state.phoneState.formDrafts['fx-order:pair'] = 'EURJPY'; }],
    ['FX-02-004', state => { state.questStates['FX-01'].completedSteps = state.questStates['FX-01'].completedSteps.filter(id => id !== 'FX-01-014'); }],
    ['FX-02-S-009', state => { state.phoneState.formDrafts['fx-sell-variant:side'] = 'buy'; }],
    ['FX-02-014', state => { state.phoneState.formDrafts['fx-order:closeLots'] = 0.5; }],
    ['FX-02-014', state => { state.phoneState.formDrafts['fx-order:positionId'] = 'new-order'; }],
    ['FX-02-S-016', state => { state.phoneState.formDrafts['fx-sell-variant:positionId'] = 'fx-usdjpy-001'; }],
    ['FX-02-S-016', state => { delete state.financialScenarios['fx-sell-variant'].phoneState.formDrafts['FX-02-S'].closeLots; delete state.phoneState.formDrafts['FX-02-S'].closeLots; delete state.phoneState.formDrafts['fx-sell-variant:closeLots']; }],
  ];
  for (const [id, mutate] of mutations) {
    const state = confirmationState(id);
    mutate(state);
    const before = JSON.stringify(state), summary = getFxOrderConfirmation(state, stepById[id]);
    assert.equal(summary.status, 'incomplete', id);
    assert.deepEqual(quoteRows(summary), [], id);
    assert.equal(JSON.stringify(state), before, id);
  }
});

test('short confirmation reads its own wallet even when the main wallet is changed', () => {
  const state = confirmationState('FX-02-S-016');
  const before = getFxOrderConfirmation(state, stepById['FX-02-S-016']);
  state.financialScenarios['fx-order'].accounts.cashBalance = 12345;
  state.financialScenarios['fx-order'].data.position = { id: 'unrelated-main-position', pair: 'USDJPY', side: 'buy', baseQuantity: 100, entryPrice: 150 };
  state.phoneState.formDrafts['fx-order:closeLots'] = 9;
  assert.deepEqual(getFxOrderConfirmation(state, stepById['FX-02-S-016']), before);
  assert.doesNotMatch(JSON.stringify(before), /149\.88|150\.00|fx-usdjpy-001|12,345/);
});

test('confirmation is absent-safe, has no boss/review output and does not call completed trades unplaced', () => {
  for (const step of [undefined, null, {}, stepById['FX-01-018'], stepById['FX-02-013'], stepById['FX-03-001'], { ...stepById['FX-02-004'], id: 'RV-FX-02-1-a1' }]) {
    assert.equal(getFxOrderConfirmation(undefined, step), null);
  }
  for (const id of ['FX-02-004', 'FX-02-014', 'FX-02-S-009', 'FX-02-S-016']) {
    const summary = getFxOrderConfirmation(undefined, stepById[id]);
    assert.equal(summary.status, 'incomplete');
    assert.deepEqual(quoteRows(summary), []);
  }
  let state = confirmationState('FX-02-004');
  state = dispatch(state, { type: 'STEP', id: 'FX-02-004', value: true }, 1_000_000_000);
  const placed = getFxOrderConfirmation(state, stepById['FX-02-004']);
  assert.match(rowValue(placed, '確認の状態'), /すでに確定/);
  assert.doesNotMatch(rowValue(placed, '確認の状態'), /未発注/);
  assert.deepEqual(quoteRows(placed), []);
  state = confirmationState('FX-02-014');
  state = dispatch(state, { type: 'STEP', id: 'FX-02-014', value: true }, 1_000_000_000);
  const settled = getFxOrderConfirmation(state, stepById['FX-02-014']);
  assert.match(rowValue(settled, '確認の状態'), /建玉がありません/);
  assert.deepEqual(quoteRows(settled), []);
});
