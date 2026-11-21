import test from 'node:test';
import assert from 'node:assert/strict';
import {getRpgSpawn, getWorldWalkStep, isDesert, stepRpgMap} from '../js/rpg-world.js';

function followDirections(from, to) {
  let location = getRpgSpawn('world', from);
  const visited = new Set(), directions = [];
  while (true) {
    const tile = location.x + ',' + location.y;
    assert.ok(!visited.has(tile), from + ' to ' + to + ' loops at ' + tile);
    visited.add(tile);
    const direction = getWorldWalkStep(location, to);
    assert.ok(direction, 'Missing direction at ' + tile);
    directions.push(direction);
    const step = stepRpgMap(location, direction.dx, direction.dy);
    assert.ok(step.moved, 'Blocked move at ' + tile);
    assert.ok(!isDesert(step.location), 'Quest route entered the optional desert');
    if (step.transition) {
      assert.equal(step.transition.mapId, to);
      return directions;
    }
    location = step.location;
  }
}

test('the port round trip never sends the player back into the entrance they just left', () => {
  const outward = followDirections('town:CH-3', 'cave:CH-3');
  const home = followDirections('cave:CH-3', 'town:CH-3');
  assert.equal(outward.length, 8);
  assert.equal(home.length, 10);
  assert.deepEqual(home[0], {dx: -1, dy: 0, arrow: '←', label: '左'});
  const spawn = getRpgSpawn('world', 'cave:CH-3');
  assert.deepEqual([spawn.x, spawn.y], [54, 40]);
  assert.equal(stepRpgMap(spawn, 0, -1).transition.mapId, 'cave:CH-3');
});

test('every chapter has guidance both ways, including across the roads from a different town', () => {
  for (let chapter = 0; chapter <= 6; chapter++) {
    const town = 'town:CH-' + chapter, cave = 'cave:CH-' + chapter;
    followDirections(town, cave);
    followDirections(cave, town);
    if (chapter > 0) followDirections('town:CH-' + (chapter - 1), cave);
  }
});

test('no direction is offered for an unknown entrance, at the goal, or outside the world map', () => {
  assert.equal(getWorldWalkStep(getRpgSpawn('world', 'town:CH-3'), 'cave:CH-9'), null);
  assert.equal(getWorldWalkStep({mapId: 'world', x: 48, y: 36}, 'town:CH-3'), null);
  assert.equal(getWorldWalkStep(getRpgSpawn('cave:CH-3'), 'town:CH-3'), null);
});
