import test from 'node:test';
import assert from 'node:assert/strict';
import {activeStep, createState, dispatch, parseSave} from '../js/engine.js';
import {getMarketReceipt} from '../js/market-receipt.js';

function beginMarket() {
  let state = createState();
  let time = 1000;
  for (const command of [
    {type: 'START'}, {type: 'CHAPTER', id: 'CH-4'}, {type: 'NPC', chapterId: 'CH-4', index: 0},
    {type: 'ACCEPT', id: 'TC-01'},
  ]) state = dispatch(state, command, time++);
  return state;
}

function advanceTo(state, id) {
  let step = activeStep(state);
  while (step && step.id !== id) {
    state = dispatch(state, {type: 'STEP', id: step.id, value: step.type === 'check' ? true : step.value},
      state.realClockState.lastObservedAt + 1);
    step = activeStep(state);
  }
  assert.equal(step?.id, id);
  return state;
}

const rows = receipt => Object.fromEntries(receipt.rows.map(({label, value}) => [label, value]));

test('the cost forecast and the purchase receipt belong to different moments', () => {
  let state = beginMarket();
  assert.equal(getMarketReceipt(state, 'TC-01', 'TC-01-001'), null);
  assert.equal(getMarketReceipt(state, 'TC-01'), null);
  state = advanceTo(state, 'TC-01-020');
  const receipt = getMarketReceipt(state, 'TC-01', 'TC-01-020');
  assert.deepEqual(rows(receipt), {
    '売れると予想した値段': '3,000円', '市場の手数料（10%）': '−300円', '自分から買った人までの送料': '−200円',
    '入金の見込み': '2,500円', '利益の見込み': '250円',
  });
  assert.match(receipt.note, /カード代2,000円.*自分までの送料200円.*梱包代50円/);
  assert.equal(state.financialScenarios['cards-trade'].accounts.cashBalance, 10000);
  state = advanceTo(state, undefined);
  assert.deepEqual(rows(getMarketReceipt(state, 'TC-01')), {
    'カードの代金': '2,000円', 'お店から自分までの送料': '200円', '仕入れで払った合計': '2,200円', '仕入れた直後の財布': '7,800円',
  });
});

test('market receipts follow listing, packing, dispatch and settlement across a real save reload', () => {
  let state = advanceTo(beginMarket(), undefined);
  const purchaseReceipt = getMarketReceipt(state, 'TC-01');
  state = dispatch(state, {type: 'NPC', chapterId: 'CH-4', index: 0}, 2000);
  state = dispatch(state, {type: 'ACCEPT', id: 'TC-02'}, 2001);
  const reach = id => {
    state = advanceTo(state, id);
    const before = JSON.stringify(state);
    const receipt = getMarketReceipt(state, 'TC-02', id);
    assert.equal(JSON.stringify(state), before, 'display must never mutate the ledger or progress');
    return receipt;
  };
  assert.equal(rows(reach('TC-02-022'))['売れた場合の入金の見込み'], '2,500円');
  assert.equal(rows(reach('TC-02-023'))['いまの売上'], '0円');
  assert.deepEqual(rows(reach('TC-02-024')), {'まだ入金されていない売上': '3,000円', '入金されたお金': '0円'});
  assert.equal(getMarketReceipt(state, 'TC-02'), null);
  assert.equal(getMarketReceipt(state, 'TC-02', 'TC-02-031'), null);
  assert.equal(rows(reach('TC-02-026'))['財布に残った現金'], '7,750円');
  const beforeShipping = reach('TC-02-028');
  assert.doesNotMatch(JSON.stringify(beforeShipping), /HS-001/);
  const shipped = reach('TC-02-029');
  assert.equal(rows(shipped)['入金されたお金'], '0円');
  assert.equal(rows(shipped)['荷物の追跡番号'], '星便 HS-001');
  assert.match(shipped.note, /送料200円.*あとで.*梱包代50円.*支払い済み/);
  state = parseSave(JSON.stringify(state));
  assert.deepEqual(getMarketReceipt(state, 'TC-02', 'TC-02-029'), shipped);
  assert.equal(rows(reach('TC-02-030'))['市場からの入金'],'入金済み');
  assert.deepEqual(rows(reach('TC-02-031')), {'市場から届いたお金':'2,500円'});
  assert.deepEqual(rows(reach('TC-02-032')), {
    'カードが売れた値段': '3,000円', '市場の手数料': '−300円', '自分から買った人までの送料': '−200円', '入金されたお金': '2,500円',
  });
  state = advanceTo(state, undefined);
  assert.deepEqual(rows(getMarketReceipt(state,'TC-02').breakdowns[0]), {
    '入金されたお金': '2,500円', '仕入れたカードの代金': '−2,000円', 'お店から自分までの送料': '−200円',
    '先に払った梱包代': '−50円', '今回の利益': '250円',
  });
  state = advanceTo(state, undefined);
  const final = getMarketReceipt(state, 'TC-02');
  assert.deepEqual(Object.values(rows(final)), ['3,000円', '2,500円', '250円']);
  assert.match(final.note, /10,000円.*10,250円/);
  assert.deepEqual(getMarketReceipt(state, 'TC-01'), purchaseReceipt, 'past purchase receipt must keep its original balance');
  assert.equal(getMarketReceipt(state, 'CH-4', 'CH-4-5'), null);
  assert.equal(getMarketReceipt(state, 'TC-02', 'CH-4-5'), null);
  assert.equal(getMarketReceipt(state, 'FX-01'), null);
});
