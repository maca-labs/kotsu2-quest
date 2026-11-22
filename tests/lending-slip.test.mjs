import test from 'node:test';
import assert from 'node:assert/strict';
import {questById} from '../js/content.js';
import {activeStep, createState, dispatch, parseSave, totalXp} from '../js/engine.js';
import {getLendingSlip} from '../js/lending-slip.js';
import {renderExtensionPanel} from '../js/phone-extension.js';

const quest = questById['LD-01'];
const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const restore = state => parseSave(JSON.stringify(state));
const valueFor = step => step.type === 'check' ? true : step.value;
const words = node => [node.textContent, ...node.children.map(words)].join(' ');
const document = {createElement:tag => ({
  tag, textContent:'', children:[], append(...nodes) { this.children.push(...nodes); }, setAttribute() {}, addEventListener() {}
})};

function start() {
  let state = createState();
  for (const command of [{type:'START'}, {type:'CHAPTER',id:'CH-6'}, {type:'NPC',index:0}, {type:'ACCEPT',id:quest.id}]) state = act(state, command);
  return state;
}

function advance(state) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:valueFor(step)});
}

test('all 22 main lending slips and the report follow the saved money and timing', () => {
  let state = start();
  assert.equal(getLendingSlip(createState(), quest.stepIds[0]), null);
  for (const [index, id] of quest.stepIds.entries()) {
    const n = index + 1;
    const step = activeStep(state);
    assert.equal(step.id, id);
    const before = structuredClone(state);
    const entry = getLendingSlip(state, id);
    assert.equal(getLendingSlip(state), null);
    assert.deepEqual(getLendingSlip(restore(state), id), entry);
    const {element, handlesAction} = renderExtensionPanel({document,state,step,quest});
    assert.equal(handlesAction, false);
    const [card, ...rest] = element.children[1].children;
    assert.deepEqual(card.children.map(item => item.textContent), [entry.title,entry.route,entry.reference,entry.status]);
    assert.ok(rest.some(node => node.tag === 'details' && words(node).includes('貸出条件と残高の内訳')));
    if (n === 12) assert.ok(rest.some(node => node.children.some(child => child.tag === 'button' && child.disabled)));
    const text = words(card);
    assert.doesNotMatch(text, /undefined|NaN|Infinity/);
    if (n <= 10) {
      assert.match(text, /手元1,000/);
      assert.doesNotMatch(text, /入金済み|受取済み|今の手元/);
      if ([3,8,10].includes(n)) {
        assert.match(text, /教材の年率12%は1年分/);
        assert.match(text, /100 × 0.12 × 30 ÷ 365。利息は約0.99（明細では0.986301）/);
      }
      if (n === 4) assert.match(text, /相手が返せなくなると.*お金を失う.*架空の例/);
      if (n >= 8) assert.match(text, /手元に900が残る/);
      if ([8,10].includes(n)) assert.match(text, /元本と合わせて戻る予定は100.986301/);
    } else if (n <= 14) {
      assert.match(text, /満期まであと30日.*満期前に返還を申し込めない/);
      assert.match(text, /貸出中の元本100.*手元900/);
    } else if (n <= 17) {
      assert.match(text, /満期・これから返還申請.*元本100と利息0.986301.*予定は100.986301.*まだ受け取っていない.*手元900/);
    } else if (n <= 21) {
      assert.match(entry.title, n <= 19 ? /返還申請済み・処理中/ : /処理済み・受取待ち/);
      assert.match(text, /元本100 ＋ 利息0.986301 ＝ 100.986301/);
      assert.match(entry.status, /手元への入金はまだ。手元900/);
    } else {
      assert.match(entry.reference, /元本100 ＋ 利息0.986301 ＝ 100.986301。貸出中の元本0/);
      assert.match(entry.status, /残していた900 ＋ 戻った100.986301 ＝ 今の手元1,000.986301/);
    }
    assert.deepEqual(state, before);
    state = advance(restore(state));
  }
  const report = getLendingSlip(restore(state));
  assert.match(report.title, /ソラ.*返還明細/);
  assert.match(report.reference, /元本100 ＋ 利息0.986301 ＝ 100.986301/);
  assert.match(report.status, /戻った100.986301 ＝ 今の手元1,000.986301/);
  assert.equal(state.financialScenarios['lending-lab'].accounts.availableUSDC, 1000.986301);
  for (const id of ['LD-01-S023','LV-01-S002',quest.reviewVariant.tasks[0].actions[0].id]) assert.equal(getLendingSlip(state,id), null);
});

test('the 200 Mock USDC review displays its own ledger and preserves the main report', () => {
  let state = start();
  while (activeStep(state)) state = advance(state);
  const report = getLendingSlip(state);
  const ledgers = structuredClone(state.financialScenarios);
  const xp = totalXp(state);
  const task = quest.reviewVariant.tasks[0];
  function panel(step, reviewSnapshot) {
    const copy = structuredClone(reviewSnapshot);
    const {element} = renderExtensionPanel({document,state,step,quest,reviewSnapshot});
    assert.deepEqual(reviewSnapshot, copy);
    return words(element);
  }
  for (const step of task.actions) {
    const text = panel(step, state.reviewStates[quest.id]?.snapshot ?? quest.reviewVariant.initialSnapshot);
    assert.equal(getLendingSlip(state,step.id), null);
    assert.match(text, /200/);
    assert.match(text, /1\.972603/);
    assert.doesNotMatch(text, /0\.986301|ソラに見せる返還明細/);
    state = act(state, {type:'REVIEW_ACTION',id:quest.id,taskId:task.id,actionId:step.id,value:valueFor(step)});
  }
  const finished = panel(task.actions.at(-1), state.reviewStates[quest.id].snapshot);
  assert.match(finished, /201\.972603/);
  assert.match(finished, /1,001\.972603/);
  assert.deepEqual(getLendingSlip(restore(state)), report);
  assert.deepEqual(state.financialScenarios, ledgers);
  assert.equal(totalXp(state), xp);
});
