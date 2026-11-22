import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById, stepById} from '../js/content.js';
import {getExitSlip} from '../js/exit-slip.js';
import {renderPhonePanel} from '../js/phone-panels.js';

const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const accept = (state, id) => act(state, {type:'ACCEPT', id});
const stepId = number => 'HY-EXIT-S' + String(number).padStart(3, '0');
function advance(state, value) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:value ?? step.value ?? step.choices?.[0]?.value ?? true});
}
function runTo(state, number = null) {
  while (activeStep(state) && activeStep(state).id !== stepId(number)) state = advance(state);
  if (number !== null) assert.equal(activeStep(state)?.id, stepId(number));
  return state;
}
function visit(state, chapter) {
  state = act(state, {type:'CHAPTER', id:chapter});
  return act(state, {type:'NPC', chapterId:chapter, index:0});
}
function fundJourney(state) {
  state = visit(state, 'CH-5');
  for (const id of ['FI-01','FI-02','FI-03','CR-01','CR-02','CR-03','CR-04']) state = runTo(accept(state, id));
  return act(visit(state, 'CH-6'), {type:'ROUTE', route:'journey'});
}
const started = act(createState(), {type:'START'});
const first = accept(fundJourney(started), 'HY-EXIT');
const slip = state => getExitSlip(state, state.activeQuestKey, activeStep(state)?.id);

class Element {
  textContent=''; childNodes=[]; style={};
  append(...nodes) { this.childNodes.push(...nodes); }
  setAttribute() {}
  addEventListener() {}
  get text() { return this.textContent + this.childNodes.map(child => ' ' + child.text).join(''); }
}
function panel(state, number, recordKey = state.activeQuestKey) {
  const step = stepById[stepId(number)];
  return renderPhonePanel({document:{createElement:() => new Element()}, state, step, recordKey, quest:questById['HY-EXIT']})?.element.text;
}

test('journey exit shows the application, pending transfer and wallet receipt only when they occur', () => {
  let state = runTo(first, 2);
  assert.match(slip(state).status, /ハイリキ 99.*財布 900 Mock USDC.*0\.0009 Mock ETH/);
  state = advance(state);
  assert.match(slip(state).status, /運用を見送った.*売却.*解除.*不要/);
  assert.match(slip(state).route, /ハイリキ.*Arbitrum.*自分の練習財布 DEMO-WALLET-A/);
  assert.equal(getExitSlip(state, state.activeQuestKey), null);
  for (const [number, wrong, correct, shown] of [
    [6, 'USDT', 'USDC', /受け取る資産 Mock USDC/],
    [8, 'Ethereum', 'Arbitrum', /出金する資産 Mock USDC.*送る道 未選択.*受け取る道 Arbitrum/],
    [10, 'DEMO-VAULT-A', 'DEMO-WALLET-A', /送る道 Arbitrum.*受取先 未選択.*財布の宛先 DEMO-WALLET-A/],
    [12, 'edit', 'all', /受取先 DEMO-WALLET-A.*出金する額 未選択/],
  ]) {
    state = runTo(state, number);
    const before = JSON.stringify(state);
    assert.match(panel(state, number), shown);
    if (number !== 12) assert.ok(slip(state).status.includes(correct));
    assert.throws(() => advance(state, wrong));
    assert.equal(before, JSON.stringify(state));
    state = advance(state, correct);
  }
  state = runTo(state, 14);
  assert.match(slip(state).status, /申請99.*教材費1.*受取予定98 Mock USDC/);
  for (const [number, match] of [
    [15,/出金欄の資産 Mock USDC.*受取カードの資産 Mock USDC/],
    [16,/出金欄の道 Arbitrum.*受取カードの道 Arbitrum/],
    [17,/出金欄の宛先 DEMO-WALLET-A.*受取カードの宛先 DEMO-WALLET-A/],
  ]) {
    state = runTo(state, number);
    assert.match(panel(state, number), match);
  }
  state = runTo(state, 18);
  assert.match(slip(state).status, /申請99.*教材費1.*受取予定98 Mock USDC/);
  assert.match(panel(state, 18), /ハイリキ（出金）.*出金申請の内容.*DEMO-WALLET-A.*全額・99 Mock USDC/);
  state = advance(state);
  assert.match(slip(state).status, /ハイリキ 0.*途中 98.*財布 900 Mock USDC/);
  assert.match(panel(state, 19), /ハイリキの出金履歴.*処理中.*到着待ち.*98 Mock USDC/);
  const pending = slip(state);
  state = parseSave(JSON.stringify(state));
  assert.deepEqual(slip(state), pending);
  state = advance(runTo(state, 20));
  assert.match(panel(state, 21), /自分の練習ウォレット.*受取通知.*98 Mock USDC/);
  assert.match(panel(state, 22), /財布の残高.*Mock USDC 998.*Mock ETH 0\.0009/);
  state = runTo(state, 24);
  assert.match(panel(state, 24), /今回の受取明細.*届いた額 98 Mock USDC/);
  assert.match(slip(state).reference, /申請99.*教材費1.*今回の受取98 Mock USDC/);
  assert.match(slip(state).status, /元の900.*今回98.*998 Mock USDC/);
  state = runTo(state);
  const report = getExitSlip(state, state.activeQuestKey);
  assert.match(report.title, /ルカに渡す受取明細/);
  assert.match(report.status, /元の900.*今回98.*998 Mock USDC.*0\.0009 Mock ETH/);
  for (const id of ['CR-03-S024','CH6-B4-A01','RV-EXIT-01','HY-EXIT-S027']) {
    assert.equal(getExitSlip(state, state.activeQuestKey, id), null);
  }
  for (const key of [null,'CR-03','boss-ch6-journey','HY-EXIT:spot']) assert.equal(getExitSlip(state, key), null);
});

test('reports and phone forms use the requested record when chapter-only and main journey exits coexist', () => {
  let state = runTo(accept(visit(started, 'CH-6'), 'HY-EXIT'));
  const rehearsal = state.activeQuestKey;
  const archived = getExitSlip(state, rehearsal);
  assert.match(archived.title, /第6章だけの練習/);
  assert.match(archived.status, /元の0.*今回98.*98 Mock USDC/);
  assert.doesNotMatch(archived.status, /ETH|998/);
  state = accept(fundJourney(state), 'HY-EXIT');
  const main = state.activeQuestKey;
  assert.notEqual(main, rehearsal);
  assert.match(panel(state, 8, rehearsal), /出金する資産 Mock USDC.*送る道 Arbitrum/);
  assert.match(panel(state, 8, main), /出金する資産 未選択.*送る道 未選択/);
  state = runTo(state, 19);
  assert.match(getExitSlip(state, main, stepId(19)).status, /途中 98.*財布 900 Mock USDC/);
  assert.deepEqual(getExitSlip(state, rehearsal), archived);
  state = runTo(state);
  state = accept(state, 'HY-SPOT');
  const restored = parseSave(JSON.stringify(state));
  assert.deepEqual(getExitSlip(restored, rehearsal), archived);
  assert.match(getExitSlip(restored, main).status, /元の900.*今回98.*998 Mock USDC/);
  assert.doesNotMatch(panel(restored, 22, rehearsal), /998|Mock ETH/);
  assert.match(panel(restored, 22, main), /998.*0\.0009/);
});

test('an older save keeps its completed exit while the other routes create their own receipts', () => {
  let state = parseSave(readFileSync(new URL('./fixtures/pre-extension-v3.json', import.meta.url), 'utf8'));
  const legacy = getExitSlip(state, 'HY-EXIT:perp');
  for (const [route, release] of [['spot',/現物を売却済み/], ['hlp',/HLPから引き出し済み/], ['stake',/委任を解除.*売却済み/], ['journey',/見送った/]]) {
    state = act(state, {type:'ROUTE', route});
    state = runTo(accept(state, 'HY-EXIT'), 3);
    assert.match(slip(state).status, release);
    state = runTo(state);
  }
  assert.deepEqual(getExitSlip(state, 'HY-EXIT:perp'), legacy);
  for (const [route, name, amount, receipt] of [
    ['spot','現物ラボ',980,979], ['hlp','HLPラボ',991,990],
    ['stake','ステーキングラボ',808,807], ['perp','先物ラボ',990,989],
  ]) {
    const report = getExitSlip(state, 'HY-EXIT:' + route);
    assert.ok(report.title.includes(name));
    assert.match(report.reference, new RegExp('申請' + amount + '.*教材費1.*今回の受取' + receipt + ' Mock USDC'));
    assert.match(report.status, new RegExp('元の0.*今回' + receipt + '.*' + receipt + ' Mock USDC'));
    assert.doesNotMatch(report.status, /998|Mock ETH/);
  }
  assert.match(getExitSlip(state, 'HY-EXIT:journey').status, /998 Mock USDC.*0\.0009 Mock ETH/);
});
