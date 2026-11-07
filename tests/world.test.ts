import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BuildingArt } from '../src/VillageMap.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildingTier, worldAt } from '../shared/world.js';
import { initialState, act, advance, rates } from '../shared/engine.js';
test('buildings evolve at each five-level boundary through level thirty', () => {
  for (const [l, t] of [
    [1, 0],
    [4, 0],
    [5, 1],
    [9, 1],
    [10, 2],
    [15, 3],
    [20, 4],
    [25, 5],
    [30, 6],
  ])
    assert.equal(buildingTier(l), t);
});
test('day cycle includes morning, daylight, dusk and night with deterministic rain', () => {
  const epoch = 1000;
  assert.equal(worldAt(epoch, epoch).phase, 'Morning');
  assert.equal(worldAt(epoch + 150000, epoch).phase, 'Day');
  assert.equal(worldAt(epoch + 300000, epoch).phase, 'Dusk');
  assert.equal(worldAt(epoch + 450000, epoch).phase, 'Night');
  assert.equal(worldAt(epoch + 720000, epoch).phase, 'Morning');
  assert.equal(worldAt(epoch + 240000, epoch).rain, true);
  assert.equal(worldAt(epoch, epoch).rain, false);
});
test('test economy actually produces per second and respects storage', () => {
  const s = initialState(1000);
  s.productionPeriodSeconds = 1;
  advance(s, 2000, 1);
  assert.equal(s.resources.wood, 530);
  assert.equal(rates(s, 1).wood / 3600, 30);
  advance(s, 100000, 1);
  assert.equal(s.resources.wood, 1000);
});
test('time advance completes jobs once and ordinary production resumes afterward', () => {
  const s = initialState(1000);
  act(s, { type: 'upgrade', key: 'headquarters', requestId: 'build' }, 1000, 1);
  const a = { type: 'advanceTime' as const, seconds: 300, requestId: 'skip' };
  act(s, a, 1000, 1);
  assert.equal(s.buildings.headquarters, 2);
  assert.equal(s.timeOffset, 300000);
  assert.equal(s.jobs.length, 0);
  act(s, a, 1000, 1);
  assert.equal(s.timeOffset, 300000);
  const wood = s.resources.wood;
  advance(s, 301000 + 3600000, 1);
  assert.equal(s.resources.wood, wood + 30);
  assert.throws(
    () => act(s, { type: 'advanceTime', seconds: -1, requestId: 'invalid' }, s.lastUpdate, 1),
    /valid time/,
  );
});

test('each visual tier changes actual headquarters artwork, not just the level label', () => {
  const images = [1, 5, 10, 15, 20, 25, 30].map((level) =>
    renderToStaticMarkup(createElement(BuildingArt, { kind: 'headquarters', level })).replace(
      /data-tier="[0-9]+"/g,
      '',
    ),
  );
  assert.equal(new Set(images).size, 7);
});
