import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById} from '../js/content.js';
import {renderPhonePanel} from '../js/phone-panels.js';
import {getPerpSlip} from '../js/perp-slip.js';

const quest = questById['HY-PERP'];
const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const restore = state => parseSave(JSON.stringify(state));
const read = state => getPerpSlip(state, activeStep(state).id);
function start() {
  let state = createState();
  for (const command of [{type:'START'}, {type:'CHAPTER', id:'CH-6'}, {type:'NPC', index:0}, {type:'ACCEPT', id:quest.id}]) state = act(state, command);
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

test('the 48 phone slips show the open account, confirmed events and read-only main receipt after withdrawal', () => {
  let state = start();
  const unrelated = structuredClone(state.financialScenarios.journey);
  assert.equal(quest.stepIds.length, 48);
  assert.equal(getPerpSlip(createState(), quest.stepIds[0]), null);
  assert.equal(getPerpSlip(state), null);
  let closedMain;
  for (let n = 1; n <= 48; n++) {
    const step = activeStep(state);
    assert.equal(step.id, quest.stepIds[n - 1]);
    const slip = read(state);
    const {element, handlesAction} = renderPhonePanel({document, state, quest, step});
    assert.equal(handlesAction, false);
    for (const value of Object.values(slip)) assert.ok(value && element.text.includes(value), step.id);
    assert.doesNotMatch(element.text, /undefined|NaN|not_started|perp-sl|教材の表示価格/);
    if (n <= 19) {
      assert.doesNotMatch(element.text, /戻った|990|96\.5|993|0\.02|904/);
      assert.equal(state.financialScenarios.perp.data.perp, null);
      if (n <= 6) assert.match(slip.status, /手元1,000 Mock USDC、建玉0件/);
      if (n === 7) assert.match(slip.status, /ロングは上がると利益・下がると損失。ショートは上がると損失・下がると利益/);
      if (n >= 8 && n <= 10) {
        assert.match(slip.reference, /証拠金100 × 倍率2倍 ＝ 取引額（建玉金額）200 Mock USDC.*教材価格100 ＝ 数量2枚/);
        assert.equal(slip.status, '試算 証拠金100 × 2倍 ＝ 取引額200。価格100で数量2枚。');
      }
      if (n === 12) {
        assert.match(slip.status, /証拠金の欄に「100」を入力/);
        assert.throws(() => advance(state, 200));
      }
      if (n >= 13) {
        assert.match(slip.reference, /証拠金100 × 倍率2倍 ＝ 取引額（建玉金額）200.*教材価格100 ＝ 数量2枚/);
        assert.match(slip.status, /今の手元1,000から証拠金100だけを使う予定.*2倍で取引額200・数量2枚、残る予定900/);
      }
    } else if (n <= 26) {
      assert.match(slip.reference, /注文成立時 証拠金100 × 倍率2倍.*取引額（建玉金額）200.*数量2枚/);
      if (n <= 21) assert.match(slip.status, /ロング2枚、教材価格100.*証拠金100.*手元900.*含み損益0/);
      else {
        assert.match(slip.status, /価格100 → 95。含み損10（未確定）/);
        if (n >= 25) assert.match(slip.status, /今の手元900 ＋ 戻る予定90 ＝ 決済後990 Mock USDC（予定）/);
        else assert.match(slip.status, /今すべて決済すれば90 Mock USDCが戻る予定。今の手元900/);
        assert.equal(state.financialScenarios.perp.accounts.realizedPnl, 0);
      }
    } else if (n <= 28 || n === 48) {
      assert.match(slip.reference, /決済時は価格95で確定損失10。手元900 ＋ 証拠金から戻った90 ＝ 990/);
      assert.match(slip.status, /建玉0件、手元990/);
      if (n === 27) closedMain = structuredClone(state.financialScenarios.perp);
      if (n === 28) assert.match(slip.status, /次は別口座のSL/);
      if (n === 48) assert.match(slip.status, /出金に引き継ぎ/);
    } else {
      assert.match(slip.route, /本編の決済時は990.*別口座/);
      assert.deepEqual(state.financialScenarios.perp, closedMain);
      if (n <= 35) {
        assert.match(slip.reference, /開始価格100、ロング2枚/);
        assert.doesNotMatch(element.text, /96\.5|993/);
        if (n === 32) {
          assert.match(slip.status, /発動価格の欄に「97」を入力。売れる価格は別/);
          assert.throws(() => advance(state, 96.5));
        }
        if (n === 34) assert.match(slip.status, /発動価格97を設定予定/);
        if (n === 35) assert.match(slip.status, /発動価格97で設定済み。今の価格は100/);
      } else if (n <= 38) {
        assert.match(slip.status, /発動97 → 成立96\.5。損失7、戻った93、手元993/);
        if (n === 38) assert.match(slip.status, /次は別口座の資金調達料/);
      } else if (n <= 43) {
        assert.match(slip.reference, /数量2枚 × 基準価格100 × 教材の1時間率＋0\.01% ＝ 0\.02 Mock USDC。正の率ではロングが払い、ショートが受け取り/);
        if (n <= 41) assert.match(slip.status, /今の支払0.*0\.02 Mock USDC払う予定/);
        else assert.match(slip.status, /1時間分の支払0\.02。証拠金内に99\.98、手元900、合計999\.98/);
        if (n === 43) assert.match(slip.status, /次は別口座の清算/);
      } else {
        assert.match(slip.title, /教材の簡略清算判定/);
        if (n <= 45) {
          assert.match(slip.status, /価格100で自己資本100、維持証拠金10.*ロング2枚、手元900/);
          assert.doesNotMatch(element.text, /手元904/);
        } else assert.match(slip.status, /価格52で自己資本4、維持証拠金5\.2。清算で戻った4、手元904/);
        if (n === 47) assert.match(slip.status, /手元904 Mock USDC。このお金は足さず、本編の990 Mock USDCへ戻ります/);
      }
    }
    if ([7,9,12,19,20,21,22,26,27,28,29,32,34,35,36,38,39,41,42,43,44,45,46,47,48].includes(n)) {
      state = restore(state);
      assert.deepEqual(read(state), slip);
    }
    state = advance(state);
  }
  const receipt = getPerpSlip(state);
  assert.match(receipt.status, /手元990/);
  for (const id of ['HY-PERP-S049','HY-EXIT-S018','RV-PERP-1-A01']) assert.equal(getPerpSlip(state, id), null);
  state = act(state, {type:'ACCEPT', id:'HY-EXIT'});
  let sawPending = false;
  while (activeStep(state)) {
    state = advance(state);
    if (state.financialScenarios.perp.data.exitStatus === 'processing') {
      sawPending = true;
      const pending = getPerpSlip(state);
      assert.equal(pending.reference, receipt.reference);
      assert.match(pending.status, /建玉0件、手元0 Mock USDC。出金処理中989/);
    }
  }
  assert.equal(sawPending, true);
  const history = getPerpSlip(restore(state));
  assert.equal(history.reference, receipt.reference);
  assert.match(history.status, /手元0 Mock USDC。練習ウォレットに989/);
  assert.deepEqual(state.financialScenarios.journey, unrelated);
});

test('changing either direction or any allowed leverage previews the selection without placing an order', () => {
  let state = start();
  while (activeStep(state).id !== 'HY-PERP-S007') state = advance(state);
  function preview(value) {
    const key = 'selection:' + activeStep(state).id;
    state.phoneState.formDrafts[key] = value;
    const original = structuredClone(state);
    const slip = read(state);
    assert.deepEqual(state, original);
    assert.equal(renderPhonePanel({document, state, quest, step:activeStep(state)}).element.text.includes(slip.status), true);
    assert.deepEqual(read(restore(state)), slip);
    assert.equal(state.financialScenarios.perp.accounts.availableUSDC, 1000);
    assert.equal(state.financialScenarios.perp.data.perp, null);
    return slip.status;
  }
  assert.match(preview('short'), /売り・ショート1枚の試算。価格100から101に上がると損失1、99に下がると利益1/);
  assert.throws(() => advance(state, 'short'));
  assert.match(preview('long'), /買い・ロング1枚の試算。価格100から101に上がると利益1、99に下がると損失1/);
  state = advance(advance(state, 'long'));
  for (const [value, notional] of [['1',100],['5',500],['2',200]]) {
    const summary = preview(value);
    assert.equal(summary, '試算 証拠金100 × ' + value + '倍 ＝ 取引額' + notional + '。価格100で数量' + value + '枚。');
    assert.ok(read(state).reference.includes('証拠金100 × 倍率' + value + '倍 ＝ 取引額（建玉金額）' + notional + ' Mock USDC'));
    if (value !== '2') assert.throws(() => advance(state, Number(value)));
  }
});
