import test from 'node:test';
import assert from 'node:assert/strict';
import {questById} from '../js/content.js';
import {activeStep, createState, dispatch, parseSave, totalXp} from '../js/engine.js';
import {renderExtensionPanel} from '../js/phone-extension.js';
import {getDojoSlip} from '../js/dojo-slip.js';

const quest = questById['LV-01'];
const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const ledger = state => state.financialScenarios['leverage-choice'];
const restore = state => parseSave(JSON.stringify(state));
const read = state => getDojoSlip(state, activeStep(state).id);
const words = slip => Object.values(slip).join(' ');
const document = {
  createElement() {
    return {children:[], textContent:'', append(...nodes) { this.children.push(...nodes); }, setAttribute() {}, addEventListener() {}};
  }
};
const panelText = node => [node.textContent, ...node.children.map(panelText)].join(' ');

function start() {
  let state = createState();
  for (const command of [{type:'START'}, {type:'CHAPTER',id:'CH-6'}, {type:'NPC',index:0}, {type:'ACCEPT',id:quest.id}]) state = act(state, command);
  return state;
}

function submit(state, choices) {
  const step = activeStep(state);
  const value = choices[step.field] ?? (step.type === 'check' ? true : step.value);
  return act(state, {type:'STEP', id:step.id, value});
}

function preview(state, value) {
  const step = activeStep(state);
  state.phoneState.formDrafts['selection:' + step.id] = value;
  const before = structuredClone(state);
  const result = read(state);
  const panel = renderExtensionPanel({document, state, step, quest});
  assert.equal(panel.handlesAction, false);
  assert.ok(panelText(panel.element).includes(result.status));
  assert.deepEqual(read(restore(state)), result);
  assert.deepEqual(state, before);
  return result;
}

test('each live step and the report reflect only the reached stage of the 5× short at 105', () => {
  let state = start();
  const choices = {side:'short', leverage:'5', markPrice:'105'};
  const main = structuredClone(state.financialScenarios.perp);
  assert.equal(getDojoSlip(createState(), quest.stepIds[0]), null);
  assert.equal(getDojoSlip(state), null);
  for (const [index, id] of quest.stepIds.entries()) {
    const n = index + 1;
    const step = activeStep(state);
    assert.equal(step.id, id);
    const before = structuredClone(state);
    const result = read(state);
    const {element, handlesAction} = renderExtensionPanel({document,state,step,quest});
    assert.equal(handlesAction, false);
    const panel = panelText(element);
    for (const line of Object.values(result)) assert.ok(line && panel.includes(line), id);
    assert.doesNotMatch(panel, /undefined|NaN|Infinity/);
    assert.deepEqual(state, before);
    const account = ledger(state);
    if (n <= 12) {
      assert.equal(account.accounts.availableUSDC, 1000);
      assert.equal(account.data.perp, null);
      assert.doesNotMatch(words(result), /975|戻った|決済済み/);
      if (n <= 4) assert.match(result.status, /手元1,000/);
      if (n === 5) assert.match(result.status, /向きは未選択/);
      if (n === 6) assert.match(result.status, /倍率は未選択/);
      if ([7,10,11,12].includes(n)) {
        assert.match(result.reference, /証拠金100 × 5倍 ＝ 取引額500.*1枚100.*5枚分/);
        assert.match(result.status, /ショート5倍.*注文前の手元1,000.*使う予定100、残る予定900/);
      }
      if ([8,9].includes(n)) assert.match(result.status, /試算。105なら損失25、95なら利益25/);
    } else if (n <= 20) {
      assert.equal(account.accounts.availableUSDC, 900);
      assert.equal(account.accounts.collateral, 100);
      assert.equal(account.accounts.realizedPnl, 0);
      assert.deepEqual(account.data.perp.history, []);
      if (n <= 15) {
        assert.equal(account.data.perp.position.markPrice, 100);
        assert.equal(account.accounts.unrealizedPnl, 0);
        assert.doesNotMatch(result.status, /戻る予定|戻った|975/);
        if (n === 13) assert.match(result.status, /ショート5倍、5枚分。価格100、含み損益0。手元900/);
        if (n === 14) assert.match(result.status, /次の価格は未選択。今は100/);
        if (n === 15) assert.match(result.status, /今は100。105を決定済み.*損失25（試算）/);
      } else {
        assert.equal(account.accounts.unrealizedPnl, -25);
        assert.match(result.reference, /100で売る向きで始め、105で買い戻す計算。1枚分につき差額5を払う。 差額5 × 5枚 ＝ 損失25/);
        if (n <= 17) assert.match(result.status, /損失25（未確定）。取引中100、手元900/);
        else assert.match(result.status, /未確定の損失25。手元900 ＋ 戻る予定75 ＝ 975（予定）/);
      }
    } else {
      assert.equal(account.data.perp.position, null);
      assert.equal(account.accounts.realizedPnl, -25);
      assert.match(result.reference, /5枚分で損失25が確定/);
      assert.match(result.status, /残り0枚。手元900 ＋ 戻った75 ＝ 今の手元975/);
    }
    if (step.type === 'select') {
      const temporary = preview(state, choices[step.field]);
      assert.match(words(temporary), /試算/);
    }
    state = restore(state);
    state = submit(state, choices);
  }
  const receipt = getDojoSlip(restore(state));
  assert.match(receipt.reference, /ショート5倍.*損失25が確定.*お金は稽古場に残る/);
  assert.match(receipt.status, /今の手元975/);
  assert.deepEqual(state.financialScenarios.perp, main);
  for (const id of ['HY-PERP-S005','LV-01-S023',quest.reviewVariant.tasks[0].actions[0].id]) assert.equal(getDojoSlip(state, id), null);
});

test('choosing, changing and clearing a draft never places the trade or moves its market', () => {
  let state = start();
  while (activeStep(state).field !== 'side') state = submit(state, {});
  const balance = structuredClone(ledger(state));
  const xp = totalXp(state);
  assert.match(preview(state, 'long').status, /ロング1枚の試算。105なら利益5、95なら損失5/);
  assert.match(preview(state, 'short').reference, /100で売る向きで始め、105で買い戻す計算。1枚分につき差額5を払う.*コインを受け渡さず/);
  for (const value of ['', 'other']) assert.match(preview(state, value).status, /向きは未選択/);
  assert.deepEqual(ledger(state), balance);
  assert.equal(totalXp(state), xp);
  state = submit(state, {side:'short'});
  for (const [value, amount, change] of [['1',100,5],['2',200,10],['5',500,25]]) {
    const estimate = preview(state, value);
    assert.ok(estimate.status.includes('取引額' + amount + '（' + value + '枚分）'));
    assert.ok(estimate.status.includes('105なら損失' + change + '、95なら利益' + change));
    assert.match(estimate.reference, /注文で使うのは100、手元に残るのは900/);
  }
  assert.match(preview(state, '').status, /倍率は未選択/);
  const choices = {side:'short', leverage:'5'};
  while (activeStep(state).field !== 'markPrice') state = submit(state, choices);
  const market = structuredClone(ledger(state));
  assert.match(preview(state, '95').status, /今は100。95を選択中。進めると5枚分で利益25（試算）/);
  assert.match(preview(state, '105').status, /今は100。105を選択中。進めると5枚分で損失25（試算）/);
  assert.match(preview(state, '').status, /次の価格は未選択。今は100、含み損益0/);
  assert.deepEqual(ledger(state), market);
});

const cases = [
  ['long',1,95,-5,95,995], ['long',2,95,-10,90,990], ['long',5,95,-25,75,975],
  ['long',1,105,5,105,1005], ['long',2,105,10,110,1010], ['long',5,105,25,125,1025],
  ['short',1,95,5,105,1005], ['short',2,95,10,110,1010], ['short',5,95,25,125,1025],
  ['short',1,105,-5,95,995], ['short',2,105,-10,90,990], ['short',5,105,-25,75,975]
];
for (const [side, leverage, price, pnl, returned, total] of cases) {
  test(side + ' ' + leverage + '× at ' + price + ' uses the selected side in previews, marks and receipts', () => {
    let state = start();
    const choices = {side, leverage:String(leverage), markPrice:String(price)};
    const name = side === 'short' ? 'ショート' : 'ロング';
    const amount = (pnl < 0 ? '損失' : '利益') + Math.abs(pnl);
    const finish = total.toLocaleString('ja-JP');
    while (activeStep(state)) {
      const step = activeStep(state);
      if (step.field === 'markPrice') {
        const quote = preview(state, choices.markPrice);
        assert.ok(quote.status.includes(amount + '（試算）'));
        assert.ok(quote.reference.includes('差額5を' + (pnl < 0 ? '払う' : '受け取る')));
      }
      if (step.id === 'LV-01-S016') {
        assert.ok(read(state).status.includes(amount + '（未確定）'));
        assert.equal(ledger(state).accounts.realizedPnl, 0);
      }
      if (step.id === 'LV-01-S020') {
        assert.ok(read(state).status.includes('手元900 ＋ 戻る予定' + returned + ' ＝ ' + finish + '（予定）'));
      }
      state = submit(state, choices);
    }
    const account = ledger(state);
    const receipt = getDojoSlip(state);
    assert.ok(receipt.reference.includes(name + leverage + '倍') && receipt.reference.includes(amount + 'が確定'));
    assert.ok(receipt.status.includes('手元900 ＋ 戻った' + returned + ' ＝ 今の手元' + finish));
    assert.equal(account.accounts.availableUSDC, total);
    assert.equal(account.accounts.realizedPnl, pnl);
    assert.equal(account.data.perp.history.length, 1);
  });
}

test('a separate review starts empty and finishes with its own balance while the report keeps its actual trade', () => {
  let state = start();
  while (activeStep(state)) state = submit(state, {side:'short', leverage:'5', markPrice:'105'});
  const before = structuredClone(state.financialScenarios);
  const xp = totalXp(state);
  const report = getDojoSlip(state);
  const task = quest.reviewVariant.tasks[0];
  const choices = {side:'long', leverage:'2', markPrice:'105'};
  function reviewPanel(action, snapshot) {
    const copy = structuredClone(snapshot);
    const {element} = renderExtensionPanel({document,state,step:action,quest,reviewSnapshot:snapshot});
    assert.deepEqual(snapshot, copy);
    return panelText(element);
  }
  const initial = reviewPanel(task.actions[0], quest.reviewVariant.initialSnapshot);
  assert.match(initial, /まだ選んでいません/);
  assert.doesNotMatch(initial, /975|ソラに見せる稽古の記録/);
  for (const step of task.actions) {
    state = act(state, {type:'REVIEW_ACTION',id:quest.id,taskId:task.id,actionId:step.id,value:choices[step.field] ?? (step.type === 'check' ? true : step.value)});
    assert.equal(getDojoSlip(state, step.id), null);
  }
  const finished = reviewPanel(task.actions.at(-1), state.reviewStates[quest.id].snapshot);
  assert.match(finished, /ロング（買い）/);
  assert.match(finished, /1,010/);
  assert.doesNotMatch(finished, /975|全決済後の履歴/);
  assert.deepEqual(getDojoSlip(restore(state)), report);
  assert.deepEqual(state.financialScenarios, before);
  assert.equal(totalXp(state), xp);
});
