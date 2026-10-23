import test from 'node:test';
import assert from 'node:assert/strict';
import { quests, steps, bosses, applyReviewEffect, routeAmounts, routeReceipts } from '../js/content-crypto.js';
import { initialScenarios, applyFinancialStep, validateFinancialState } from '../js/finance.js';

const routes = ['journey', 'spot', 'hlp', 'stake', 'perp'];
const fixtureValue = action => action.value ?? action.choices?.[0]?.value;
const freshState = () => ({ financialScenarios: initialScenarios(), phoneState: { formDrafts: {} } });
function perform(state, action, routeId = 'journey') {
  return applyFinancialStep(state, action, fixtureValue(action), { routeId });
}
function completeQuest(state, id, routeId) {
  for (const step of steps.filter(step => step.questId === id)) perform(state, step, routeId);
}
function prepareAllMainScenarios() {
  const state = freshState();
  for (const quest of quests.filter(quest => quest.id !== 'HY-EXIT')) completeQuest(state, quest.id, quest.routeId || 'journey');
  return state;
}

test('crypto catalog preserves all 275 standard actions and all four complete optional labs', () => {
  const expected = { 'CR-01': 18, 'CR-02': 25, 'CR-03': 32, 'CR-04': 18, 'HY-SPOT': 41, 'HY-HLP': 27, 'HY-STAKE': 40, 'HY-PERP': 48, 'HY-EXIT': 26 };
  assert.equal(quests.length, 9);
  assert.equal(steps.length, 275);
  assert.equal(new Set(steps.map(step => step.id)).size, 275);
  for (const quest of quests) {
    assert.equal(quest.stepIds.length, expected[quest.id], quest.id);
    assert.deepEqual(quest.stepIds, Array.from({ length: expected[quest.id] }, (_, i) => `${quest.id}-S${String(i + 1).padStart(3, '0')}`));
    for (const step of steps.filter(step => step.questId === quest.id)) {
      assert.ok(step.label && step.instruction && step.screenId, step.id);
      assert.ok(['tap', 'focus', 'input', 'select', 'check', 'confirm', 'wait'].includes(step.type), step.id);
      if (step.type === 'input') assert.notEqual(step.value, undefined, `${step.id} needs a fixed practice value`);
      if (step.type === 'select') assert.ok(step.choices?.length > 1, `${step.id} needs an actual choice field`);
    }
  }
  assert.equal(quests.find(q => q.id === 'HY-EXIT').routePrerequisites, true);
  assert.equal(quests.find(q => q.id === 'HY-PERP').optional, true);
  for (const labId of ['HY-SPOT', 'HY-HLP', 'HY-STAKE', 'HY-PERP']) assert.equal(quests.find(q => q.id === labId).requiresChapterSeal, 'CH-5');
  const routeChoice = steps.find(step => step.id === 'CR-04-S018');
  assert.equal(routeChoice.acceptAnyChoice, true);
  assert.deepEqual(new Set(routeChoice.choices.map(choice => choice.value)), new Set(routes));
});

test('every implemented main lab reaches the specified amount and its own withdrawal, without repeated transfers', () => {
  const state = prepareAllMainScenarios();
  for (const route of routes) assert.equal(state.financialScenarios[route].accounts.availableUSDC, routeAmounts[route], route);
  assert.equal(state.financialScenarios['spot-limit'].accounts.reservedUSDC, 0);
  assert.equal(state.financialScenarios['spot-limit'].accounts.availableUSDC, 1000);
  assert.equal(state.financialScenarios['perp-liquidation'].accounts.availableUSDC, 904);
  assert.equal(state.financialScenarios['perp-sl'].accounts.realizedPnl, -7);
  for (const route of routes) {
    completeQuest(state, 'HY-EXIT', route);
    const accounts = state.financialScenarios[route].accounts;
    assert.equal(accounts.availableUSDC, 0, route);
    assert.equal(accounts.walletUSDC, routeReceipts[route] + (route === 'journey' ? 900 : 0), route);
    const once = structuredClone(state.financialScenarios[route].accounts);
    completeQuest(state, 'HY-EXIT', route);
    assert.deepEqual(state.financialScenarios[route].accounts, once, `${route} withdrawal replay`);
  }
  assert.equal(state.financialScenarios.journey.accounts.walletETH, 0.0009);
  assert.equal(state.financialScenarios.stake.accounts.rewardHYPE, 0.1);
  validateFinancialState(state.financialScenarios);
});

test('CH5 boss and all five CH6 boss routes operate independent snapshots and replay safely', () => {
  const state = prepareAllMainScenarios();
  const primaryBefore = Object.fromEntries(routes.map(route => [route, structuredClone(state.financialScenarios[route])]));
  for (const boss of bosses) {
    const variants = boss.routeTasks ? Object.entries(boss.routeTasks) : [['journey', boss.tasks]];
    for (const [route, tasks] of variants) {
      assert.equal(tasks.length, 5, `${boss.chapterId} ${route}`);
      for (const task of tasks) {
        assert.ok(task.actions.length >= 2, task.id);
        for (const action of task.actions) {
          const financialAction = { ...action, scenarioId: task.scenarioId };
          perform(state, financialAction, route);
          const once = structuredClone(state.financialScenarios);
          perform(state, financialAction, route);
          assert.deepEqual(state.financialScenarios, once, `${route} ${action.id} replay`);
        }
      }
    }
  }
  const expected = { spot: 104, hlp: 99, stake: 79, perp: 49, journey: 99 };
  for (const route of routes) {
    assert.equal(state.financialScenarios[`boss-ch6-${route}`].accounts.walletUSDC, expected[route], route);
    assert.deepEqual(state.financialScenarios[route], primaryBefore[route], `${route} primary unchanged by boss`);
  }
  assert.equal(state.financialScenarios['boss-ch5-transfer'].accounts.walletUSDC, 950);
  assert.equal(state.financialScenarios['boss-ch5-transfer'].accounts.availableUSDC, 49);
  validateFinancialState(state.financialScenarios);
});

test('different-condition reviews preserve separate balances and every financial effect is idempotent', () => {
  const results = {};
  for (const quest of quests) {
    const variant = quest.reviewVariant;
    const initial = JSON.stringify(variant.initialSnapshot);
    const snapshot = structuredClone(variant.initialSnapshot);
    for (const task of variant.tasks) {
      assert.ok(task.domain && Number.isInteger(task.objectiveIndex), task.id);
      for (const action of task.actions) {
        applyReviewEffect(snapshot, action);
        const once = structuredClone(snapshot);
        applyReviewEffect(snapshot, action);
        assert.deepEqual(snapshot, once, action.id);
      }
    }
    assert.equal(JSON.stringify(variant.initialSnapshot), initial, `${quest.id} immutable starting point`);
    results[quest.id] = snapshot;
  }
  assert.equal(results['CR-03'].wallet, 950);
  assert.equal(results['CR-03'].core, 49);
  assert.equal(results['HY-SPOT'].available, 1005);
  assert.equal(results['HY-SPOT'].realized, 5);
  assert.equal(results['HY-SPOT'].limitAvailable, 1000);
  assert.equal(results['HY-SPOT'].reserved, 0);
  assert.equal(results['HY-HLP'].available, 1000);
  assert.equal(results['HY-HLP'].unlockDay, 6);
  assert.equal(results['HY-HLP'].simulationDay, 6);
  assert.equal(results['HY-STAKE'].spot, 10);
  assert.equal(results['HY-STAKE'].delegated + results['HY-STAKE'].staking + results['HY-STAKE'].waiting, 0);
  assert.equal(results['HY-STAKE'].arrivalDay, 8);
  assert.equal(results['HY-PERP'].available, 993);
  assert.equal(results['HY-PERP'].realized, -7);
  assert.equal(results['HY-EXIT'].wallet, 199);
  assert.equal(results['HY-EXIT'].available + results['HY-EXIT'].pending, 0);
  assert.throws(() => applyReviewEffect({ eventLog: [] }, 'review:unknown'), /見つかりません/);
});
