import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {questById, stepById} from '../js/content.js';
import {getJourneySlip} from '../js/journey-slip.js';
import {renderPhonePanel} from '../js/phone-panels.js';

const act = (state, command) => dispatch(state, command, state.realClockState.lastObservedAt + 1);
const accept = (state, id) => act(state, {type:'ACCEPT', id});
function advance(state, value) {
  const step = activeStep(state);
  return act(state, {type:'STEP', id:step.id, value:value ?? step.value ?? step.choices?.[0]?.value ?? true});
}
function reach(state, id) {
  while (activeStep(state) && activeStep(state).id !== id) state = advance(state);
  assert.equal(activeStep(state)?.id, id);
  return state;
}
function complete(state, id) {
  return reach(accept(state, id));
}
function slip(state) {
  const step = activeStep(state);
  return getJourneySlip(state, step.questId, step.id);
}

let funded = act(createState(), {type:'START'});
funded = act(funded, {type:'CHAPTER', id:'CH-5'});
funded = act(funded, {type:'NPC', chapterId:'CH-5', index:0});
for (const id of ['FI-01','FI-02','FI-03']) funded = complete(funded, id);

const mapped = complete(funded, 'CR-01');
const connected = complete(mapped, 'CR-02');
const deposited = complete(connected, 'CR-03');

test('the map and wallet permission record show only the effect that has occurred', () => {
  let state = accept(funded, 'CR-01');
  assert.match(slip(state).route, /自分の練習財布 DEMO-WALLET-A.*ハイリキ（HyperCore）/);
  assert.match(slip(state).reference, /前の依頼で円から準備した資産/);
  assert.match(slip(state).status, /1,000 Mock USDC.*0\.001 Mock ETH.*0 Mock USDC/);
  assert.equal(getJourneySlip(state, 'CR-01'), null);
  state = reach(accept(mapped, 'CR-02'), 'CR-02-S008');
  const originalAccounts = structuredClone(state.financialScenarios.journey.accounts);
  assert.match(slip(state).route, /アプリ「そらの取引練習」.*自分の練習財布 DEMO-WALLET-A/);
  assert.match(slip(state).status, /未接続.*まだ無効.*送金なし/);
  state = advance(state);
  assert.match(slip(state).status, /接続済み.*まだ無効.*送金なし/);
  state = advance(reach(state, 'CR-02-S013'));
  assert.match(slip(state).status, /接続済み.*有効.*送金なし/);
  assert.deepEqual(state.financialScenarios.journey.accounts, originalAccounts);
  assert.deepEqual(getJourneySlip(deposited, 'CR-01'), getJourneySlip(mapped, 'CR-01'));
  assert.deepEqual(getJourneySlip(deposited, 'CR-02'), getJourneySlip(connected, 'CR-02'));
});

test('wrong network, address and quantity leave the verified fields and wallet in place', () => {
  let state = accept(connected, 'CR-03');
  const before = structuredClone(state.financialScenarios.journey.accounts);
  for (const [id, wrongValue, correctValue] of [
    ['CR-03-S012','USDT','USDC'], ['CR-03-S014','Ethereum','Arbitrum'],
    ['CR-03-S016','DEMO-WALLET-A','DEMO-VAULT-A'], ['CR-03-S018','101','100'],
  ]) {
    state = reach(state, id);
    const original = JSON.stringify(state);
    const card = slip(state);
    assert.match(card.route, /自分の練習財布 DEMO-WALLET-A → Arbitrum → ハイリキ（HyperCore）の DEMO-VAULT-A/);
    assert.match(card.status, /送信前.*1,000 Mock USDC.*0\.001 Mock ETH.*0 Mock USDC/);
    assert.throws(() => advance(state, wrongValue));
    assert.equal(JSON.stringify(state), original, 'rejection and viewing the receipt keep the journal and all prior choices');
    state = advance(state, correctValue);
  }
  assert.deepEqual(state.financialScenarios.journey.accounts, before);
  assert.equal(state.financialScenarios.journey.phoneState.formDrafts['CR-03'].address, 'DEMO-VAULT-A');
});

test('the deposit receipt distinguishes the estimate, pending funds and spendable funds after reloading', () => {
  let state = reach(accept(connected, 'CR-03'), 'CR-03-S025');
  const before = slip(state);
  assert.match(before.reference, /100 Mock USDC.*教材費は1 Mock USDC.*受取予定は99 Mock USDC.*0\.0001 Mock ETH/);
  state = advance(state);
  const pending = slip(state);
  assert.match(pending.title, /到着待ち/);
  assert.match(pending.status, /900 Mock USDC.*0\.0009 Mock ETH.*処理中は99 Mock USDC.*使える分は0 Mock USDC/);
  assert.equal(getJourneySlip(state, 'CR-03'), null);
  state = parseSave(JSON.stringify(state));
  assert.deepEqual(slip(state), pending);
  state = advance(state);
  assert.match(slip(state).status, /900 Mock USDC.*0\.0009 Mock ETH.*99 Mock USDCが到着.*使える残高/);
  const archived = getJourneySlip(deposited, 'CR-03');
  assert.deepEqual(slip(state), archived);
  state = act(deposited, {type:'CHAPTER', id:'CH-6'});
  state = act(state, {type:'NPC', chapterId:'CH-6', index:0});
  state = complete(state, 'HY-EXIT');
  assert.equal(state.financialScenarios.journey.accounts.walletUSDC, 998);
  assert.equal(state.financialScenarios.journey.accounts.availableUSDC, 0);
  assert.deepEqual(getJourneySlip(state, 'CR-03'), archived);
  assert.equal(getJourneySlip(state, 'CR-03', 'RV-CR03-1'), null);
  assert.equal(getJourneySlip(state, 'CR-03', 'CH5-B4'), null);
  assert.equal(getJourneySlip(state, 'CR-03', 'CR-02-S001'), null);
  assert.equal(getJourneySlip(state, 'FI-03'), null);
});

test('the route receipt shows the return horizon and route the player actually chose', () => {
  let state = reach(accept(deposited, 'CR-04'), 'CR-04-S016');
  assert.doesNotMatch(slip(state).status, /予約した道/);
  state = advance(state, 'flexible');
  assert.match(slip(state).reference, /ゲーム内の待機も練習したい/);
  state = reach(state, 'CR-04-S018');
  const skip = advance(state, 'journey');
  const stake = advance(state, 'stake');
  assert.match(getJourneySlip(skip, 'CR-04').status, /運用せず、出金だけ練習する/);
  assert.match(getJourneySlip(stake, 'CR-04').status, /ステーキング/);
  assert.deepEqual(skip.financialScenarios.journey.accounts, stake.financialScenarios.journey.accounts);
});

class PanelElement {
  constructor() { this.textContent=''; this.childNodes=[]; this.style={}; }
  append(...nodes) { this.childNodes.push(...nodes); }
  setAttribute() {}
  addEventListener() {}
  get text() { return this.textContent + this.childNodes.map(node => node.text).join(' '); }
}
const doc = {createElement:() => new PanelElement()};
function panel(state, id) {
  const step = stepById[id];
  return renderPhonePanel({document:doc, state, step, quest:questById[step.questId]}).element.text;
}
test('native panels put the map in the memo app and distinguish sender, recipient, permission and mail', () => {
  assert.match(panel(mapped, 'CR-01-S006'), /自分の財布.*コインを送る道.*DEMO-WALLET-A.*Arbitrum/);
  assert.doesNotMatch(panel(mapped, 'CR-01-S006'), /合言葉|一時メモ/);
  assert.match(panel(connected, 'CR-02-S006'), /サービス名 そらの取引練習.*自分の練習ウォレット DEMO-WALLET-A/);
  assert.doesNotMatch(panel(connected, 'CR-02-S016'), /復元情報を教えてください/);
  assert.match(panel(connected, 'CR-02-S019'), /復元情報を教えてください/);
  let state = reach(accept(connected, 'CR-03'), 'CR-03-S014');
  assert.match(panel(state, 'CR-03-S014'), /送信元 DEMO-WALLET-A.*送る資産 Mock USDC.*送る道 未選択.*宛先 未入力/);
  state = reach(state, 'CR-03-S017');
  assert.match(panel(state, 'CR-03-S017'), /送る道 Arbitrum.*宛先 DEMO-VAULT-A.*送信数量 未入力/);
});
