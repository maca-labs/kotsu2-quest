import assert from 'node:assert/strict';
import test from 'node:test';
import {makeBattleActionIcon, makeBattleStage} from '../js/battle-art.js';
import {getAvailableEncounters, getFieldEncounter} from '../js/rpg.js';

// Inspect the final native pixels, independent of any particular drawing calls.
function drawingDocument() {
  return {
    createElement(tag) {
      const element = {
        tag, attributes: {}, children: [], pixels: [],
        setAttribute(key,value) { this.attributes[key]=String(value); },
        append(child) { this.children.push(child); },
        getContext() {
          return {
            fillRect(x,y,width,height) {
              for (let row=y; row<y+height; row++)
                for (let col=x; col<x+width; col++)
                  if (row>=0 && col>=0 && row<element.height && col<element.width)
                    element.pixels[row*element.width+col] = this.fillStyle;
            }
          };
        }
      };
      return element;
    }
  };
}

const doc = drawingDocument();
const scene = (enemy, map, status='active') => makeBattleStage(doc, {
  enemy, kind: map==='cave' ? 'quest' : 'field', fieldKind: map, status
});
const silhouette = canvas => Array.from({length:canvas.width*canvas.height},
  (_,i) => canvas.pixels[i] ? '#' : '.').join('');

test('the six road species, seven chapter guardians and desert boss have distinct silhouettes', () => {
  const kinds = ['moss','bat','boar','golem','wisp','drake'];
  const regular = kinds.map(kind => scene({kind, name:'野道の魔物'}, 'road'));
  const gates = ['PR-01','PO-01','BK-01','FX-01','TC-01','CR-01','HY-SPOT'].map(id => {
    const questStates = {[id]:{questId:id, acceptedAtReal:0, completedSteps:[]}};
    const first = getAvailableEncounters({questStates}).find(enc => enc.checkpoint===0);
    return scene(first.enemy, 'cave');
  });
  const boss = scene(getFieldEncounter('desert','CH-0').enemy,'desert');
  const pictures = [...regular, ...gates, boss].map(stage => stage.children[1]);
  assert.equal(new Set(pictures.map(silhouette)).size, 14);
  for (const canvas of pictures) {
    assert.equal(canvas.attributes.role, 'img');
    assert.ok(canvas.attributes['aria-label'].endsWith('のドット絵'));
    assert.ok(new Set(canvas.pixels.filter(Boolean)).size >= 7);
  }
});

test('the background remains intact on victory and hit effects target the actor alone', () => {
  const enemy = { kind:'bat', name:'夕羽コウモリ' };
  const landscapes = [];
  for (const map of ['road','cave','desert']) {
    const before = scene(enemy,map);
    const won = scene(enemy,map,'won');
    assert.equal(before.children[0].attributes['aria-hidden'], 'true');
    assert.equal(before.children[0].attributes['data-battle-enemy'], undefined);
    assert.equal(before.children[1].attributes['data-battle-enemy'], '');
    assert.deepEqual(before.children[0].pixels, won.children[0].pixels);
    assert.equal(won.children[1].textContent, '敵を退けた！');
    assert.equal(won.children[1].attributes['data-battle-enemy'], undefined);
    landscapes.push(before.children[0].pixels.join(''));
  }
  assert.equal(new Set(landscapes).size,3);
});

test('each battle command has a different decorative pixel symbol', () => {
  const icons = ['attack','guard','skill','flee'].map(id => makeBattleActionIcon(doc,id));
  assert.equal(new Set(icons.map(silhouette)).size,4);
  assert.ok(icons.every(icon => icon.attributes['aria-hidden']==='true'));
});
