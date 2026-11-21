import test from 'node:test';
import assert from 'node:assert/strict';
import {drawCharacterPortrait, drawWalkingCharacter, townNpcName} from '../js/character-art.js';
import {tavernAdvisorNames} from '../js/adventure.js';
import {chapterById} from '../js/content.js';

function bitmap(paint) {
  const pixels = Array(32 * 32).fill('-');
  const ctx = {
    fillRect(x, y, w, h) {
      assert.ok([x,y,w,h].every(Number.isInteger));
      assert.match(this.fillStyle, /^#[0-9a-f]{6}([0-9a-f]{2})?$/i);
      for (let row = Math.max(0,y); row < Math.min(32,y+h); row++) {
        for (let col = Math.max(0,x); col < Math.min(32,x+w); col++) pixels[row*32+col] = this.fillStyle;
      }
    },
  };
  paint(ctx);
  return pixels.join(',');
}

const portrait = (name, avatar=0) => bitmap(ctx => drawCharacterPortrait({getContext:()=>ctx},name,avatar));
const walking = (name, direction=0, frame=0, gear={}, avatar=0) =>
  bitmap(ctx => drawWalkingCharacter(ctx,6,3,name,direction,frame,gear,avatar));

test('all nine named tavern advisers have distinct portraits and map sprites', () => {
  assert.equal(tavernAdvisorNames.length, 9);
  assert.equal(new Set(tavernAdvisorNames.map(name=>portrait(name))).size, 9);
  assert.equal(new Set(tavernAdvisorNames.map(name=>walking(name))).size, 9);
  assert.equal(portrait('郵便屋 ミナ'), portrait('郵便屋ミナ'));
  assert.equal(walking('長老オリベ'), walking('elder'));
});

test('town sprites resolve the configured speaker, including the fourth fallback resident', () => {
  for (const chapter of Object.values(chapterById)) {
    for (const [index,npc] of chapter.npcs.entries()) assert.equal(townNpcName(chapter,index), npc.name);
    assert.ok(townNpcName(chapter,3));
  }
  assert.equal(townNpcName(chapterById['CH-6'],0), '港の村長リオ');
  assert.notEqual(portrait('港の村長リオ'),portrait('長老オリベ'));
});

test('each selected traveler keeps all four facings and three walking frames', () => {
  assert.equal(new Set([0,1,2].map(avatar=>portrait('hero',avatar))).size, 3);
  const costumes = [];
  for (const avatar of [0,1,2]) {
    const frames = [];
    for (const direction of [0,1,2,3]) {
      for (const frame of [0,1,2]) frames.push(walking('hero',direction,frame,{},avatar));
    }
    assert.equal(new Set(frames).size, 12);
    costumes.push(frames[0]);
  }
  assert.equal(new Set(costumes).size, 3);
});

test('actual equipped items change the traveler image without writing to equipment', () => {
  const appearances = [
    {}, {weapon:'traveler-staff'}, {weapon:'rainbow-oath'}, {weapon:'rpg-iron-sword'}, {weapon:'rpg-copper-sword'},
    {shield:'proof-shield'}, {armor:'rpg-mail-armor'}, {head:'dawn-crown'},
  ];
  assert.equal(new Set(appearances.map(gear=>walking('hero',3,0,Object.freeze(gear)))).size, appearances.length);
  assert.equal(walking('hero',3,0,{shield:'rpg-mail-armor'}),walking('hero',3,0,{armor:'rpg-mail-armor'}));
});
