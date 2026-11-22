import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById} from '../js/content.js';
import {getHlpReviewSlip, getHlpSlip} from '../js/hlp-slip.js';
import {renderPhonePanel} from '../js/phone-panels.js';

const quest = questById['HY-HLP'];
const {tasks} = quest.reviewVariant;
const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const restore = state => parseSave(JSON.stringify(state));
const allText = slip => [slip.title, slip.route, slip.reference, slip.status].join(' ');
const stepId = number => quest.stepIds[number - 1];
function start() {
  let state = createState();
  for (const command of [{type:'START'}, {type:'CHAPTER', id:'CH-6'}, {type:'NPC', index:0}, {type:'ACCEPT', id:quest.id}]) state = act(state, command);
  return state;
}
function advance(state, value) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:value ?? step.value ?? step.choices?.[0]?.value ?? true});
}
function finish(state) {
  while (activeStep(state)) state = advance(state);
  return state;
}
class Element {
  textContent = ''; children = []; style = {};
  append(...nodes) { this.children.push(...nodes); }
  setAttribute() {}
  addEventListener() {}
  get text() { return [this.textContent, ...this.children.map(child => child.text)].join(' '); }
}
const document = {createElement:() => new Element()};

test('the 27 primary actions show committed amounts and calendar days, then keep their own exit receipt', () => {
  let state = start();
  const read = () => getHlpSlip(state, activeStep(state).id);
  const native = () => renderPhonePanel({document, state, quest, step:activeStep(state)}).element.text;
  assert.equal(quest.stepIds.length, 27);
  assert.equal(getHlpSlip(createState(), stepId(1)), null);
  assert.equal(getHlpSlip(state), null);
  assert.equal(getHlpReviewSlip(state, tasks[0], tasks[0].actions[0]), null);
  for (let number = 1; number <= 27; number++) {
    assert.equal(activeStep(state).id, stepId(number));
    const slip = read();
    const shown = allText(slip);
    assert.ok(native().includes(slip.status));
    assert.doesNotMatch(shown, /undefined|NaN|350|650|6日目/);
    if (number <= 10) {
      assert.match(shown, /ゲーム内0日目.*手元1,000 Mock USDC.*預入はまだ0/);
      assert.doesNotMatch(shown, /評価額291|確定損失/);
      if (number >= 8) assert.match(slip.status, /預ける予定300.*模擬3口.*手元は700 Mock USDC/);
    } else if (number <= 13) {
      assert.match(shown, /預けた額300.*手元で使える額700.*模擬3口 × 単価100 ＝ 評価額300/);
      assert.match(slip.status, /ゲーム内0日目.*最後の預入は0日目.*4日目から.*あと4日/);
      if (number === 11) assert.match(slip.reference, /口（くち）は預けた分を数える単位.*評価額は、その分のいまの値打ち/);
    } else if (number <= 18) {
      assert.match(shown, /模擬3口 × 単価97 ＝ 評価額291.*評価損9.*評価額991/);
      assert.match(slip.status, /ゲーム内2日目.*最後の預入は0日目.*4日目から.*あと2日.*まだ引き出せません/);
      assert.equal(state.financialScenarios.hlp.accounts.availableUSDC, 700);
      if (number === 14) assert.match(slip.reference, /1口の単価が100から97に下がりました/);
    } else if (number <= 24) {
      assert.match(shown, /ゲーム内4日目.*最後の預入は0日目/);
      assert.match(slip.status, /引き出せます.*手元700.*受取予定291.*991 Mock USDC/);
      if (number >= 22) assert.match(native(), /引き出す口数 全額・模擬3口/);
    } else {
      assert.match(slip.status, /手元700.*受取291.*991 Mock USDC.*確定損失9/);
    }
    if ([10, 17, 19, 25].includes(number)) {
      state = restore(state);
      assert.deepEqual(read(), slip);
    }
    if (number === 7 || number === 21) {
      assert.throws(() => advance(state, number === 7 ? 350 : 'half'));
      assert.deepEqual(read(), slip);
    }
    state = advance(state, number === 7 ? ' 300.00 ' : undefined);
  }
  const history = getHlpSlip(state);
  assert.match(history.status, /手元700.*受取291.*991 Mock USDC/);
  for (const id of ['HY-HLP-S028','RV-HLP-1-A01','HY-EXIT-S024']) assert.equal(getHlpSlip(state, id), null);
  const journey = structuredClone(state.financialScenarios.journey);
  state = finish(act(state, {type:'ACCEPT', id:'HY-EXIT'}));
  assert.equal(state.financialScenarios.hlp.accounts.availableUSDC, 0);
  assert.equal(state.financialScenarios.hlp.accounts.walletUSDC, 990);
  assert.deepEqual(getHlpSlip(restore(state)), history);
  assert.deepEqual(state.financialScenarios.journey, journey);
});

test('the isolated 25-action exercise quotes the whole updated lock before confirmation and restores each phase', () => {
  let state = finish(start());
  const main = structuredClone(state.financialScenarios);
  const rewards = structuredClone(state.rewardEvents);
  const history = getHlpSlip(state);
  const read = (task, action) => getHlpReviewSlip(state, task, action);
  function run(task, action, value) {
    return act(state, {type:'REVIEW_ACTION', id:quest.id, taskId:task.id, actionId:action.id, value:value ?? action.value ?? true});
  }
  const first = read(tasks[0], tasks[0].actions[0]);
  assert.match(first.status, /ゲーム内0日目.*手元1,000.*預入はまだ0/);
  assert.equal(read(tasks[1], tasks[1].actions[0]), null);
  assert.equal(read(tasks[0], tasks[1].actions[0]), null);
  assert.equal(read(null, null), null);
  let count = 0;
  for (const task of tasks) {
    for (const action of task.actions) {
      count++;
      const slip = read(task, action);
      assert.ok(slip, action.id);
      const shown = allText(slip);
      assert.doesNotMatch(shown, /291|991|単価97|undefined|NaN/);
      if (count <= 5) assert.doesNotMatch(shown, /350|650|6日目|あと4日/);
      if (action.id === 'RV-HLP-2-A04') assert.match(slip.status, /預ける予定300.*模擬3口.*手元は700/);
      if (action.id === 'RV-HLP-3-A03') assert.match(shown, /預けた額300.*手元700.*模擬3口 × 単価100 ＝ 評価額300.*評価額1,000/);
      if (action.id === 'RV-HLP-4-A02') assert.match(slip.status, /ゲーム内2日目.*最後の預入は0日目.*4日目から.*あと2日/);
      if (['RV-HLP-4-A04','RV-HLP-4-A05'].includes(action.id)) {
        assert.match(slip.reference, /いま預入300、手元700.*50追加後は預入350、手元650.*予定/);
        assert.match(slip.status, /最後の預入が2日目.*全額350.*4日目から6日目/);
        assert.equal(state.reviewStates[quest.id].snapshot.unlockDay, 4);
      }
      if (['RV-HLP-4-A06','RV-HLP-4-A07'].includes(action.id)) {
        assert.match(slip.route, /ゲーム内2日目.*最後の預入は2日目.*6日目/);
        assert.match(slip.reference, /預けた額350、手元650.*模擬3.5口 × 単価100 ＝ 評価額350/);
        assert.match(slip.status, /全額350.*6日目から.*元の4日目でもあと2日.*今はあと4日/);
        assert.equal(state.reviewStates[quest.id].snapshot.available, 650);
        assert.equal(state.reviewStates[quest.id].snapshot.units, 3.5);
      }
      if (action.id === 'RV-HLP-5-A04') {
        assert.match(shown, /ゲーム内6日目.*模擬3.5口 × 単価100 ＝ 評価額350.*手元650.*受取予定350.*1,000/);
        assert.equal(state.reviewStates[quest.id].snapshot.units, 3.5);
      }
      if (action.id === 'RV-HLP-5-A05') {
        assert.match(slip.status, /手元650.*受取350.*1,000.*残るのは0口/);
        assert.equal(read(null, null), null);
      }
      if (['RV-HLP-2-A02','RV-HLP-4-A03','RV-HLP-5-A02'].includes(action.id)) {
        assert.throws(() => run(task, action, '3000'));
        assert.deepEqual(read(task, action), slip);
      }
      if (['RV-HLP-2-A04','RV-HLP-4-A06','RV-HLP-5-A03','RV-HLP-5-A05'].includes(action.id)) {
        state = restore(state);
        assert.deepEqual(read(task, action), slip);
      }
      state = run(task, action);
    }
  }
  assert.equal(count, 25);
  assert.match(read(null, null).status, /手元650.*受取350.*1,000.*残るのは0口/);
  assert.equal(read(tasks[0], tasks[0].actions[0]), null);
  assert.deepEqual(getHlpReviewSlip(restore(state), null, null), read(null, null));
  assert.deepEqual(getHlpSlip(state), history);
  assert.deepEqual(state.financialScenarios, main);
  assert.deepEqual(state.rewardEvents, rewards);
  state = act(state, {type:'RESTART_REVIEW', id:quest.id});
  assert.deepEqual(read(tasks[0], tasks[0].actions[0]), first);
  assert.equal(read(null, null), null);
});
