import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById} from '../js/content.js';
import {renderPhonePanel} from '../js/phone-panels.js';
import {getStakeSlip} from '../js/stake-slip.js';

const quest = questById['HY-STAKE'];
const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const restore = state => parseSave(JSON.stringify(state));
const allText = slip => [slip.title, slip.route, slip.reference, slip.status].join(' ');
function start() {
  let state = createState();
  for (const cmd of [{type:'START'}, {type:'CHAPTER', id:'CH-6'}, {type:'NPC', index:0}, {type:'ACCEPT', id:quest.id}]) state = act(state, cmd);
  return state;
}
function advance(state, value) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:value ?? step.value ?? step.choices?.[0]?.value ?? true});
}
class Element {
  textContent = ''; childNodes = []; style = {};
  append(...nodes) { this.childNodes.push(...nodes); }
  setAttribute() {}
  addEventListener() {}
  get text() { return [this.textContent, ...this.childNodes.map(node => node.text)].join(' '); }
}
const document = {createElement:() => new Element()};

test('all 40 phone slips follow the confirmed location, return clocks and cash across save and exit', () => {
  let state = start();
  const otherAccount = structuredClone(state.financialScenarios.journey);
  const read = () => getStakeSlip(state, activeStep(state).id);
  assert.equal(getStakeSlip(createState(), quest.stepIds[0]), null);
  assert.equal(getStakeSlip(state), null);
  assert.equal(quest.stepIds.length, 40);
  for (let number = 1; number <= 40; number++) {
    const step = activeStep(state);
    assert.equal(step.id, quest.stepIds[number - 1]);
    const slip = read();
    const shown = allText(slip);
    const panel = renderPhonePanel({document, state, quest, step});
    assert.equal(panel.handlesAction, false);
    assert.ok(panel.element.text.includes(slip.status), step.id);
    assert.doesNotMatch(panel.element.text, /undefined|NaN|not_started/);
    if (number < 22) assert.doesNotMatch(panel.element.text, /808|192減/);
    if (number < 12) assert.doesNotMatch(panel.element.text, /灯台ノード|森の歯車|星波ノード/);
    if (number > 13) {
      assert.match(slip.route, /森の歯車.*稼働中.*8%/);
      assert.doesNotMatch(panel.element.text, /灯台ノード|星波ノード/);
    }
    if (number <= 10) {
      assert.match(slip.status, /現物10枚、使える0 Mock USDC/);
      assert.match(slip.route, /第5章の財布・島の資金とは別/);
      assert.match(slip.reference, /10枚 × 教材価格100 ＝ 評価額1,000 Mock USDC/);
      if (number === 8) {
        assert.match(slip.status, /入力は「10」/);
        assert.throws(() => advance(state, 9));
        assert.deepEqual(read(), slip);
      }
      if (number >= 9) assert.match(slip.status, /ステーキングへ10枚を移す予定/);
    } else if (number <= 18) {
      assert.match(slip.status, /ステーキング手元10枚、委任中0枚/);
      if (number === 13) assert.match(slip.reference, /灯台ノード.*稼働中.*5%.*森の歯車.*稼働中.*8%.*星波ノード.*点検表示.*3%.*どの候補も選べます/);
    } else if (number <= 20) {
      assert.match(slip.status, /委任中10枚.*0日目.*1日目から解除可/);
      assert.match(slip.reference, /現物0枚.*ステーキング手元0枚.*使える0 Mock USDC/);
    } else if (number === 21) {
      assert.match(slip.status, /委任中10.1枚（単発報酬0.1枚込み）.*1日目・解除可/);
    } else if (number <= 26) {
      assert.match(slip.reference, /10枚 × 100 ＝ 1,000 Mock USDC.*100から80.*10.1枚 × 80 ＝ 評価額808 Mock USDC.*最初より192減/);
      assert.match(shown, /使える0 Mock USDC/);
      if (number === 22) {
        assert.match(slip.title, /見積もり/);
        assert.match(slip.status, /単価80なら評価808/);
        assert.equal(state.financialScenarios.stake.data.price, 100);
      } else {
        if (number === 25 || number === 26) assert.match(slip.status, /解除可.*解除するとステーキング手元へ戻ります.*現物0枚のまま/);
        else assert.match(slip.title, /値下がり後/);
        assert.match(slip.status, /委任中10.1枚.*解除可/);
        assert.equal(state.financialScenarios.stake.data.price, 80);
      }
    } else if (number <= 31) {
      assert.match(slip.status, /1日目.*ステーキング手元10.1枚.*現物へ戻す申請はこれから.*7日の待機はまだ開始前/);
      assert.match(slip.reference, /委任中0枚、現物0枚、使える0 Mock USDC/);
    } else if (number <= 33) {
      assert.match(slip.status, /待機中10.1枚、現物0枚.*1日目.*8日目に到着予定（あと7日）/);
      assert.match(slip.reference, /1日目に申請.*8日目まで7日待ちます.*ステーキング手元0枚.*使える0 Mock USDC/);
    } else if (number <= 39) {
      assert.match(slip.status, /現物10.1枚、使える0 Mock USDC/);
      if (number <= 37) {
        assert.match(slip.status, /8日目に到着/);
        assert.match(slip.reference, /1日目に申請してから7日たち、8日目に現物へ届きました。待機中0枚/);
        assert.doesNotMatch(slip.reference, /待ちます|到着予定/);
      } else {
        assert.match(slip.reference, /10.1枚 × 80 − 手数料0 ＝ 808 Mock USDC/);
        assert.match(slip.status, /単価80・手数料0で売ると、受取予定808/);
      }
    } else {
      assert.match(slip.reference, /8日目の売却明細.*10.1枚 × 80 − 手数料0 ＝ 808 Mock USDC/);
      assert.match(slip.status, /現在は現物0枚、使える808 Mock USDC/);
    }
    if ([10,13,18,20,22,26,31,33,39,40].includes(number)) {
      state = restore(state);
      assert.deepEqual(read(), slip);
    }
    state = advance(state, number === 13 ? 'forest' : number === 8 ? ' 10.00 ' : undefined);
  }
  const saleReceipt = getStakeSlip(state);
  assert.match(saleReceipt.status, /現物0枚、使える808 Mock USDC/);
  for (const foreign of ['HY-STAKE-S041','HY-EXIT-S024','RV-STAKE-1-A01']) assert.equal(getStakeSlip(state, foreign), null);
  state = act(state, {type:'ACCEPT', id:'HY-EXIT'});
  while (activeStep(state)) {
    state = advance(state);
    if (state.financialScenarios.stake.data.exitStatus === 'processing') {
      const pending = getStakeSlip(state);
      assert.equal(pending.reference, saleReceipt.reference);
      assert.match(pending.status, /現物0枚、使える0 Mock USDC.*出金処理中807 Mock USDC/);
    }
  }
  const history = getStakeSlip(restore(state));
  assert.equal(history.reference, saleReceipt.reference);
  assert.match(history.status, /現在は現物0枚、使える0 Mock USDC.*財布に807 Mock USDC/);
  assert.deepEqual(state.financialScenarios.journey, otherAccount);
});

test('all three validator choices reopen with their own terms', () => {
  let choosing = start();
  while (activeStep(choosing).id !== 'HY-STAKE-S013') choosing = advance(choosing);
  for (const [value, label] of [['lighthouse','灯台ノード：稼働中・教材手数料5%'],['forest','森の歯車：稼働中・教材手数料8%'],['starwave','星波ノード：点検表示・教材手数料3%']]) {
    const chosen = restore(advance(choosing, value));
    assert.equal(activeStep(chosen).id, 'HY-STAKE-S014');
    assert.ok(getStakeSlip(chosen, activeStep(chosen).id).route.includes(label));
    assert.equal(chosen.financialScenarios.stake.accounts.stakingHYPE, 10);
  }
});
