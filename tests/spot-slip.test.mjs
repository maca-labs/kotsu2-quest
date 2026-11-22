import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById, stepById} from '../js/content.js';
import {applyFinancialStep, initialScenarios} from '../js/finance.js';
import {getSpotSlip} from '../js/spot-slip.js';
import {renderPhonePanel} from '../js/phone-panels.js';

const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const spotId = number => 'HY-SPOT-S' + String(number).padStart(3, '0');
const accept = (state, id) => act(state, {type:'ACCEPT', id});
function advance(state, value) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:value ?? step.value ?? step.choices?.[0]?.value ?? true});
}
function finish(state) {
  while (activeStep(state)) state = advance(state);
  return state;
}
function visit(state, chapter) {
  return act(act(state, {type:'CHAPTER', id:chapter}), {type:'NPC', chapterId:chapter, index:0});
}
class Element {
  textContent = ''; childNodes = []; style = {};
  append(...nodes) { this.childNodes.push(...nodes); }
  setAttribute() {}
  addEventListener() {}
  get text() { return [this.textContent, ...this.childNodes.map(node => node.text)].join(' '); }
}
const doc = {createElement:() => new Element()};

test('the phone follows actual market fills, pending funds and the two account switches', () => {
  let state = visit(act(createState(), {type:'START'}), 'CH-5');
  for (const id of ['FI-01','FI-02','FI-03','CR-01','CR-02','CR-03','CR-04']) state = finish(accept(state, id));
  const journey = structuredClone(state.financialScenarios.journey);
  assert.equal(journey.accounts.availableUSDC, 99);
  assert.equal(getSpotSlip(state, spotId(1)), null);
  state = accept(visit(state, 'CH-6'), 'HY-SPOT');
  const current = () => getSpotSlip(state, activeStep(state).id);
  const panel = () => renderPhonePanel({document:doc, state, step:activeStep(state), quest:questById['HY-SPOT']}).element.text;
  function at(number) {
    while (activeStep(state) && activeStep(state).id !== spotId(number)) state = advance(state);
    assert.equal(activeStep(state)?.id, spotId(number));
    const slip = current();
    assert.doesNotMatch(panel(), /not_started|cancelled|pending|NaN|undefined/);
    assert.ok(panel().includes(slip.status));
    return slip;
  }

  assert.match(at(1).route, /現物ラボ専用.*第5章.*別/);
  assert.match(current().status, /使える 1,000 Mock USDC.*保有 0 HYPE/);
  assert.equal(getSpotSlip(state), null);
  at(8);
  assert.match(panel(), /買う枚数.*未入力/);
  assert.throws(() => advance(state, 3));
  state = advance(state, ' 2.0 ');
  assert.match(at(12).reference, /支払予定 2 HYPE × 100 ＝ 200 Mock USDC.*800 Mock USDC.*手数料は 0％/);
  state = parseSave(JSON.stringify(state));
  assert.equal(state.financialScenarios.spot.phoneState.formDrafts['HY-SPOT'].quantity, ' 2.0 ');
  assert.match(current().status, /使える 1,000.*保有 0 HYPE/);
  assert.match(at(13).status, /使える 800.*保有 2 HYPE.*評価損益 0.*確定損益 0/);
  assert.match(at(15).reference, /2 HYPE × 100 ＝ 200.*合わせた評価額は 1,000/);
  assert.match(at(16).reference, /2 HYPE × 90 ＝ 180.*合わせた評価額は 980/);
  assert.match(current().status, /使える 800.*保有 2 HYPE.*評価損 20.*確定損益 0/);
  at(20);
  state = advance(state, '2.00');
  assert.match(at(22).reference, /2 HYPE × 90 ＝ 180.*受け取る予定/);
  assert.match(current().status, /使える 800.*保有 2 HYPE/);
  assert.match(at(23).reference, /売却成立 2 HYPE × 90 ＝ 180.*購入に使ったのは 200/);
  assert.match(current().status, /使える 980.*保有 0 HYPE.*確定損失 20/);
  assert.match(at(25).reference, /次に開く指値の小練習は別口座/);
  assert.match(current().status, /使える 980/);
  assert.match(at(26).route, /指値だけの練習口座.*元の現物ラボには 980/);
  assert.match(current().status, /使える 1,000.*保有 0 HYPE.*予約 0/);
  at(30);
  assert.match(panel(), /買い指値.*未入力/);
  assert.throws(() => advance(state, 100));
  state = advance(state, '95.0');
  at(32);
  assert.match(panel(), /買い指値.*95 Mock USDC.*買う枚数.*未入力/);
  state = advance(state, '1.000000');
  const preview = at(33);
  assert.match(preview.reference, /1 HYPE × 95 ＝ 95 Mock USDC.*教材価格 100.*保留/);
  assert.match(preview.status, /今は使える 1,000・予約 0.*注文後の予定は使える 905・予約 95 Mock USDC.*保有 0 HYPEのまま/);
  assert.deepEqual(at(34), preview);
  state = parseSave(JSON.stringify(state));
  assert.equal(state.financialScenarios['spot-limit'].phoneState.formDrafts['HY-SPOT'].limitPrice, '95.0');
  assert.match(at(35).title, /保留中（未約定）/);
  assert.match(current().status, /使える 905.*保有 0 HYPE.*予約 95/);
  const pending = current();
  state = parseSave(JSON.stringify(state));
  assert.deepEqual(current(), pending);
  at(36);
  assert.throws(() => advance(state, 'filled'));
  assert.deepEqual(at(38), pending);
  assert.match(at(39).reference, /成立する前に取り消し.*95 Mock USDC.*戻った/);
  assert.match(current().status, /使える 1,000.*保有 0 HYPE.*予約 0/);
  assert.match(at(40).reference, /「戻る」で元の現物ラボへ/);
  assert.match(current().status, /使える 1,000/);
  assert.match(at(41).status, /使える 980.*保有 0 HYPE.*確定損失 20/);
  state = finish(state);
  const archived = getSpotSlip(state);
  assert.match(archived.reference, /購入 2 HYPE × 100 ＝ 200.*売却成立 2 HYPE × 90 ＝ 180/);
  assert.deepEqual(getSpotSlip(parseSave(JSON.stringify(state))), archived);
  for (const id of ['RV-SPOT-01','HY-EXIT-S001','HY-SPOT-S042','CH6-B4-A01']) assert.equal(getSpotSlip(state, id), null);

  const limit = structuredClone(state.financialScenarios['spot-limit']);
  state = finish(accept(state, 'HY-EXIT'));
  const history = getSpotSlip(parseSave(JSON.stringify(state)));
  assert.match(history.route, /出金申請に引き継いだ額は 980/);
  assert.match(history.status, /使える 0 Mock USDC.*保有 0 HYPE.*確定損失 20/);
  assert.equal(state.financialScenarios.spot.accounts.walletUSDC, 979);
  assert.deepEqual(state.financialScenarios.journey, journey);
  assert.deepEqual(state.financialScenarios['spot-limit'], limit);
});

test('spot confirmations reject empty, malformed or mismatched saved amounts before posting', () => {
  for (const [scenarioId, number, valid, field, other] of [
    ['spot', 12, {quantity:2}, 'quantity', '3'],
    ['spot-limit', 34, {limitPrice:95, limitQuantity:1}, 'limitPrice', '94'],
    ['spot-limit', 34, {limitPrice:95, limitQuantity:1}, 'limitQuantity', '2'],
  ]) {
    for (const invalid of ['', '   ', 'not a number', other]) {
      const state = {financialScenarios:initialScenarios()};
      const ledger = state.financialScenarios[scenarioId];
      ledger.phoneState.formDrafts['HY-SPOT'] = {...valid, [field]:invalid};
      const before = structuredClone(ledger);
      assert.throws(() => applyFinancialStep(state, stepById[spotId(number)], true));
      assert.deepEqual(ledger, before);
    }
  }
});
