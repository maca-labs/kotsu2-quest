import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createState, dispatch, activeStep, questState, totalXp} from '../js/engine.js';
import {questById} from '../js/content.js';
import {questBrief, getAdventure} from '../js/adventure.js';
import {getStoryGuide} from '../js/story-guide.js';

const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const block = (first, after) => source.slice(source.indexOf('function ' + first + '('), source.indexOf('function ' + after + '('));
const dialogs = block('acceptDialog', 'startQuest') + block('roomRecord', 'roomConversation');
const portQuests = ['FX-01', 'FX-02', 'FX-03'];

function portRoomAfter(id) {
  let state = createState(), clock = 1000, dialog, navigation;
  function act(command) {
    state = dispatch(state, command, ++clock);
    return true;
  }
  act({type: 'START'});
  act({type: 'CHAPTER', id: 'CH-3'});
  act({type: 'NPC', chapterId: 'CH-3', index: 0});
  act({type: 'SAVE_OFFER'});
  for (const questId of portQuests) {
    act({type: 'ACCEPT', id: questId});
    while (activeStep(state)) {
      const step = activeStep(state);
      act({type: 'STEP', id: step.id, value: step.type === 'check' ? true : step.value});
    }
    if (questId === id) break;
    act({type: 'NPC', chapterId: 'CH-3', index: 0});
  }

  const report = getStoryGuide(state);
  assert.equal(report.questId, id);
  assert.ok(report.recordKey);
  const ui = {room: {id: 'client', houseName: report.houseName, questId: id, client: report.client,
    recordKey: report.recordKey, position: {x: 4, y: 6}}};
  const env = {
    ui, get state() {return state;}, document: {}, act, questById, questBrief, questState, getAdventure,
    storyGuide: () => getStoryGuide(state),
    h: (tag, attrs, ...children) => ({tag, attrs, children}), p: text => text,
    btn: (label, click, style) => ({label, click, style}), portrait: name => name,
    renderSpeakerIdentity: ({name}) => ({speaker: name}), render() {},
    showDialog: (title, content, actions) => {dialog = {title, content, actions};},
    modal: {close() {dialog = undefined;}},
    guideAction: guide => {navigation = guide.action;},
    startQuest: (quest, timed) => act({type: 'ACCEPT', id: quest.id, timed})
  };
  vm.runInNewContext(dialogs, env);
  return {
    ui, talk: env.talkRoomClient, get state() {return state;}, get dialog() {return dialog;},
    get navigation() {return navigation;},
    press(label) {
      const button = dialog.actions.find(a => a.label === label);
      assert.ok(button, 'Missing button ' + label + ' in ' + dialog.title);
      button.click();
    }
  };
}

for (const [id, nextId] of [['FX-01', 'FX-02'], ['FX-02', 'FX-03']]) {
  for (const route of ['primary', 'back']) {
    test(`${id}: reporting hands the room to ${nextId}; ${route} leads to an explicit offer`, () => {
      const c = portRoomAfter(id), xp = totalXp(c.state);
      const nextQuest = questById[nextId], next = questBrief(nextQuest);
      const oldSpeaker = c.ui.room.client, position = {...c.ui.room.position};
      c.talk();
      assert.ok(c.dialog.title.includes(oldSpeaker));
      assert.equal(c.dialog.content[0].speaker, oldSpeaker);
      if (route === 'back') {
        c.press('部屋に戻る');
        c.talk();
        assert.equal(c.dialog.content[0].speaker, next.client);
        assert.ok(c.dialog.content.includes(next.summary));
        c.press('依頼の話を聞く');
      } else {
        const primary = c.dialog.actions.find(a => a.style?.includes('primary'));
        assert.ok(primary.label.includes(next.client), primary.label);
        assert.match(primary.label, /次の依頼/);
        primary.click();
      }
      assert.equal(c.ui.room.questId, nextId);
      assert.equal(c.ui.room.client, next.client);
      assert.equal(c.ui.room.recordKey, getStoryGuide(c.state).recordKey);
      assert.deepEqual(c.ui.room.position, position);
      assert.equal(c.dialog?.title, nextQuest.title);
      assert.equal(c.dialog.content[0].speaker, next.client);
      assert.equal(questState(c.state, nextId), undefined);
      assert.equal(totalXp(c.state), xp);
      c.press('自分のペースで受ける');
      assert.equal(activeStep(c.state)?.id, nextQuest.stepIds[0]);
    });
  }
}

test('the last port report offers the chapter trial with the optional sell practice untouched', () => {
  const c = portRoomAfter('FX-03'), xp = totalXp(c.state);
  c.talk();
  assert.equal(c.dialog.content[0].speaker, questBrief(questById['FX-03']).client);
  c.press('町の最後の確認へ');
  assert.deepEqual(c.navigation, {type: 'boss', id: 'CH-3'});
  assert.equal(questState(c.state, 'FX-02-S'), undefined);
  assert.equal(totalXp(c.state), xp);
});
