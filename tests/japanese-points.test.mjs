import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {steps, quests} from '../js/content-points.js';
import {createState, dispatch, activeStep, totalXp, validateAction} from '../js/engine.js';
import {displayPracticeValue, humanFieldLabel} from '../js/help.js';
import * as actionInput from '../js/action-input.js';
import * as fxGuidance from '../js/fx-guidance.js';

const byId = Object.fromEntries(steps.map(step => [step.id, step]));
const nativePositions = ['BK-02-015', 'BK-02-018', 'BK-02-R-003'];
const pasteIds = ['PR-01-010', 'P018', 'BK-01-013'];

test('all 297 points operations expose sentences and button names without implementation terms', () => {
  assert.equal(steps.length, 297);
  for (const step of steps) {
    const shown = [step.instruction, step.label, step.result, ...step.details, ...step.hints, ...(step.choices || []).map(choice => choice.label)].join('\n');
    assert.doesNotMatch(shown, /チップ|clipboard|emailVerified|occupation=|purpose=|termsAccepted|icReadAccepted|faceImageAccepted|accountType=|transferAmount=|purchasePrice=|inboundShipping=|expectedSalePrice=|outboundShipping=|(?:bank|app|kyc|transfer|listing-card|card-purchase|card-sale)-\d{3}|fx-(?:usdjpy|eurjpy|offer)/, step.id);
    assert.notEqual(step.label, step.instruction, step.id);
    assert.doesNotMatch(step.label, /を押す|を押そう|を選ぼう|入力しよう/, step.id);
    assert.match(step.result, /。$/, step.id);
    assert.equal(step.details.at(-1), step.result, step.id);
    assert.doesNotMatch(step.hints.join('\n'), /今は「.*」に進む練習|。.*」に進む/, step.id);
  }
});

test('input and selection guidance names the actual field and the displayed choice', () => {
  for (const step of steps) {
    if (step.type === 'input' && !pasteIds.includes(step.id)) {
      assert.ok(step.instruction.includes(`「${step.fieldLabel}」`), step.id);
      assert.match(step.instruction, /入力しよう/, step.id);
      assert.doesNotMatch(step.label, /チップ|候補|を押す/, step.id);
    }
    if (step.type === 'select' && !nativePositions.includes(step.id)) {
      assert.ok(step.instruction.includes(`「${step.fieldLabel}」`), step.id);
      const chosen = step.choices.find(choice => choice.value === step.value);
      assert.ok(step.instruction.includes(`「${chosen.label}」`), step.id);
      assert.match(step.instruction, /選ぼう/, step.id);
    }
    if (step.type === 'check') assert.match(step.instruction, /チェックを入れよう/, step.id);
  }
  assert.equal(byId['BK-01-020'].inputType, 'date');
  assert.ok(byId['BK-01-020'].instruction.includes('「1990-04-12」'));
  assert.doesNotThrow(()=>validateAction(byId['BK-01-020'],'1990-04-12'));
  assert.throws(()=>validateAction(byId['BK-01-020'],'1990年4月12日'));
  assert.equal(byId['BK-01-024'].inputType, 'tel');
  assert.equal(byId['TR-01-014'].value, 'アサヒ ミナト');
  assert.ok(byId['TR-01-014'].choices.some(choice => choice.value === 'アサヒ ミナミ'));
});

test('paste names still use this exercise clipboard and cannot become ordinary typed inputs', () => {
  for (const id of pasteIds) {
    const step = byId[id];
    assert.equal(step.type, 'input');
    assert.match(step.label, /貼り付け/);
    assert.ok(step.instruction.includes(`「${step.label}」`));
    assert.equal(actionInput.submissionValue({step, typedValue: 'wrong typed text', mainClipboard: 'main code'}), 'main code');
    assert.equal(actionInput.submissionValue({step, typedValue: 'wrong typed text', namespace: 'review', mainClipboard: 'main code', reviewClipboard: 'review code'}), 'review code');
  }
  assert.equal(byId['PR-01-010'].label, '合言葉を貼り付け');
  assert.equal(byId.P018.label, '確認コードを貼り付け');
});

test('the three native identity controls describe their real buttons, without a drag instruction', () => {
  for (const [id, label] of [
    ['BK-02-015', 'カードを読取り枠に置く'],
    ['BK-02-018', '人物を顔の枠に合わせる'],
    ['BK-02-R-003', '人物を明るい場所の枠へ動かす'],
  ]) {
    assert.equal(byId[id].type, 'select');
    assert.equal(byId[id].label, label);
    assert.equal(byId[id].instruction, `「${label}」を押そう。`);
  }
});

test('rewritten navigation instructions preserve home and switcher effects through all 297 operations', () => {
  let state = createState(), now = 1_800_000_000_000, count = 0;
  const act = command => { state = dispatch(state, command, ++now); };
  act({type: 'START'});
  for (const quest of quests) {
    act({type: 'CHAPTER', id: quest.chapterId});
    act({type: 'NPC', chapterId: quest.chapterId, index: 0});
    if (quest.id === 'FX-01') act({type: 'SAVE_OFFER'});
    act({type: 'ACCEPT', id: quest.id});
    while (activeStep(state)) {
      const step = activeStep(state);
      act({type: 'STEP', id: step.id, value: step.type === 'check' ? true : step.value});
      if (['PR-01-003', 'P011'].includes(step.id)) assert.equal(state.phoneState.activeApp, 'home', step.id);
      if (['PR-01-007', 'P015', 'P049', 'BK-01-010'].includes(step.id)) assert.equal(state.phoneState.appSwitcherOpen, true, step.id);
      if (['PR-01-008', 'P016', 'P050', 'BK-01-011'].includes(step.id)) assert.equal(state.phoneState.appSwitcherOpen, false, step.id);
      count++;
    }
  }
  assert.equal(count, 297);
});

class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {}; this.listeners = {}; this.value = ''; this.ownText = ''; }
  setAttribute(key, value) { this.attributes[key] = value; if (['value', 'type', 'id'].includes(key)) this[key] = value; }
  addEventListener(name, fn) { (this.listeners[name] ??= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners[event.type] ?? []) fn({type: event.type, target: this, preventDefault() {}}); return true; }
  append(...nodes) { this.children.push(...nodes); }
  set textContent(value) { this.ownText = String(value); this.children = []; }
  get textContent() { return this.ownText + this.children.map(node => node.textContent).join(''); }
}
const descendants = node => [node, ...node.children.flatMap(descendants)];

test('the card price candidate fills the named field; its separate submit completes only the input operation', () => {
  let state = createState(), now = 1_800_000_000_000;
  const act = command => { state = dispatch(state, command, ++now); };
  for (const command of [{type: 'START'}, {type: 'CHAPTER', id: 'CH-4'}, {type: 'NPC', chapterId: 'CH-4', index: 0}, {type: 'ACCEPT', id: 'TC-01'}]) act(command);
  while (activeStep(state).id !== 'TC-01-014') {
    const step = activeStep(state);
    act({type: 'STEP', id: step.id, value: step.value});
  }
  const step = activeStep(state), before = structuredClone(state), source = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const environment = {
    ...actionInput, ...fxGuidance, displayPracticeValue, humanFieldLabel,
    Node: Element, Event: class { constructor(type) { this.type = type; } },
    document: {createElement: tag => new Element(tag), createTextNode: text => { const node = new Element('#text'); node.textContent = text; return node; }, createDocumentFragment: () => new Element('#fragment')},
    ui: {inputs: {}, reviewId: null}, get state() { return state; }, phoneFieldLabels: {}, valueDisplay: value => String(value), saveQuiet() {}, operationGuide: {scrollToTarget() {}}, showError(message) { throw Error(message); },
  };
  vm.createContext(environment);
  vm.runInContext(source.split('\n').filter(line => line.startsWith('function h(') || line.startsWith('const btn=') || line.startsWith('const p=')).join('\n'), environment);
  vm.runInContext(source.slice(source.indexOf('function detailsBlock('), source.indexOf('function phoneNavigationForStep(')), environment);
  const nodes = descendants(environment.renderAction(step, value => act({type: 'STEP', id: step.id, value})));
  assert.ok(nodes.some(node => node.tagName === 'LABEL' && node.textContent === '仕入価格（円）'));
  assert.equal(nodes.find(node => node.type === 'submit').textContent, 'この仕入価格で進む');
  nodes.find(node => node.className === 'candidate').dispatchEvent({type: 'click'});
  assert.equal(nodes.find(node => node.tagName === 'INPUT').value, '2000');
  assert.equal(activeStep(state).id, step.id);
  assert.equal(totalXp(state), totalXp(before));
  assert.deepEqual(state.financialScenarios, before.financialScenarios);
  nodes.find(node => node.tagName === 'FORM').dispatchEvent({type: 'submit'});
  assert.equal(activeStep(state).id, 'TC-01-015');
  assert.equal(totalXp(state), totalXp(before) + 2);
  assert.equal(state.financialScenarios['cards-trade'].accounts.cashBalance, 10000);
});
