import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,questById} from '../js/content.js';
import {createState} from '../js/engine.js';
import {getAdventure,questBrief} from '../js/adventure.js';

test('each client speaks in their own voice at the door and at the start of the phone quest',()=>{
  const state=createState(),before=structuredClone(state);
  for(const quest of quests){
    const brief=questBrief(quest),intro=getAdventure(state,quest).latestReaction;
    assert.equal(intro.speaker,brief.client,quest.id);
    assert.equal(intro.kind,'intro',quest.id);
    assert.equal(intro.text,brief.summary,quest.id);
    assert.notEqual(brief.summary,brief.goal,quest.id);
    assert.match(brief.summary,/[。！？]$/,quest.id);
    assert.ok(!brief.summary.includes(brief.client),quest.id);
    const narratorSubject=brief.incident.split('は、')[0];
    if(brief.incident.startsWith(narratorSubject+'は、')&&brief.client.includes(narratorSubject)){
      assert.ok(!brief.summary.includes(narratorSubject+'は'),quest.id);
    }
  }
  const senna=questBrief(questById['DX-01']);
  assert.match(senna.incident,/セナは、取引所への申込/);
  assert.match(senna.summary,/取引所へ申し込みたい.*練習メール/);
  assert.deepEqual(state,before);
});
