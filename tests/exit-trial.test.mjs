import test from 'node:test';
import assert from 'node:assert/strict';
import {bosses, quests, steps} from '../js/content-crypto.js';
import {createState, dispatch, getBossTasks} from '../js/engine.js';
import {applyFinancialStep} from '../js/finance.js';
import {getExitTrialSlip} from '../js/exit-trial.js';

const fixture = {journey:[100,99], spot:[105,104], hlp:[100,99], stake:[80,79], perp:[50,49]};

for (const [route, [available, received]] of Object.entries(fixture)) {
  test(`CH6 ${route}: the slip follows preparation, request and receipt in the separate boss ledger`, () => {
    let state = createState();
    state.selectedRoute = route;
    state.questStates[`HY-EXIT:${route}`] = {completed:true};
    if (route === 'journey') {
      for (const step of steps.filter(step => ['CR-01', 'CR-02', 'CR-03', 'HY-EXIT'].includes(step.questId))) {
        applyFinancialStep(state, step, step.value, {routeId:route});
      }
      assert.equal(state.financialScenarios.journey.accounts.walletUSDC, 998);
    }
    const primary = structuredClone(state.financialScenarios[route]);
    const tasks = getBossTasks(state, 'CH-6');
    for (const task of tasks) {
      for (const action of task.actions) {
        const slip = getExitTrialSlip(state, task, action);
        assert.deepEqual(Object.keys(slip).sort(), ['reference','route','status','title']);
        assert.doesNotMatch(Object.values(slip).join(' '), /998|DEMO-WALLET-A|undefined|NaN/);
        if (task.id === 'CH6-B1') {
          assert.match(slip.route, /本編とは別/);
          assert.match(slip.status, new RegExp(`使える額は${route === 'journey' ? 100 : 0} Mock USDC`));
          if (route === 'journey') assert.match(slip.reference, /見送ったので、売却も解除もいらない/);
          if (route === 'hlp' && action.id.endsWith('A01')) assert.match(slip.reference, /あと2日/);
          if (route === 'hlp' && action.id.endsWith('A04')) assert.match(slip.reference, /ロックが解け/);
          if (route === 'stake' && action.id.endsWith('A08')) assert.match(slip.reference, /1 HYPEは現物への到着待ち/);
          if (route === 'stake' && action.id.endsWith('A09')) assert.match(slip.reference, /現物に1 HYPEが到着/);
        } else if (task.id === 'CH6-B2') {
          assert.match(slip.status, new RegExp(`使える額は${available} Mock USDC`));
        } else {
          assert.match(slip.route, /USDC \/ Arbitrum \/ DEMO-RETURN-B/);
          assert.match(slip.reference, new RegExp(`${available} − 教材費1 ＝ 受取予定${received} Mock USDC`));
          if (task.id !== 'CH6-B5') {
            assert.match(slip.title, /申請前/);
            assert.match(slip.status, new RegExp(`使える額は${available} Mock USDC`));
          } else if (action.id.endsWith('A01') || action.id.endsWith('A02')) {
            assert.match(slip.title, /処理中/);
            assert.match(slip.status, new RegExp(`到着待ち${received} Mock USDC。受取財布はまだ0 Mock USDC`));
          } else {
            assert.match(slip.title, /到着済み/);
            assert.match(slip.status, new RegExp(`今回の到着は${received} Mock USDC`));
          }
        }
        state = dispatch(state, {type:'BOSS', id:'CH-6', taskId:task.id, actionId:action.id,
          value:action.type === 'check' ? true : action.value});
      }
    }
    assert.equal(state.bossStates['CH-6'].completed, true);
    assert.equal(state.financialScenarios[`boss-ch6-${route}`].accounts.walletUSDC, received);
    assert.deepEqual(state.financialScenarios[route], primary);
  });
}

test('main lessons, other bosses, reviews and mismatched actions never get a CH6 trial slip', () => {
  const state = createState();
  const tasks = getBossTasks(state, 'CH-6');
  const otherBoss = bosses.find(boss => boss.chapterId === 'CH-5').tasks[2];
  const review = quests.find(quest => quest.id === 'HY-EXIT').reviewVariant.tasks[0];
  const main = steps.find(step => step.questId === 'HY-EXIT');
  for (const [task, action] of [[main,main], [otherBoss,otherBoss.actions[0]], [review,review.actions[0]],
    [tasks[0],tasks[1].actions[0]], [tasks[0],undefined], [undefined,undefined]]) {
    assert.equal(getExitTrialSlip(state, task, action), null);
  }
  assert.equal(getExitTrialSlip({financialScenarios:{}}, tasks[0], tasks[0].actions[0]), null);
});
