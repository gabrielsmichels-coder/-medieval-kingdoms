import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, initialState, population, troopStats, unmet } from '../shared/engine.js';
import { balance, buildings, capacity, farmCapacity, upgradeCost } from '../shared/config.js';
const now = 1700000000000;
const action = (type: 'upgrade' | 'recruit' | 'research', key: string, quantity?: number) => ({
  type,
  key,
  quantity,
  requestId: crypto.randomUUID(),
});
function rich() {
  const s = initialState(now);
  s.resources = { wood: 100000, clay: 100000, iron: 100000 };
  s.buildings.warehouse = 20;
  s.buildings.farm = 20;
  return s;
}
test('initial village contains only six foundational buildings', () => {
  const s = initialState(now);
  assert.equal(Object.values(s.buildings).filter((l) => l === 1).length, 6);
  assert.equal(s.buildings.barracks, 0);
});
test('resources generate by elapsed time and realm speed', () => {
  const s = initialState(now);
  advance(s, now + 3600000, 1);
  assert.equal(s.resources.wood, 530);
  assert.equal(s.resources.clay, 530);
  advance(s, now + 7200000, 2);
  assert.equal(s.resources.iron, 590);
});
test('warehouse capacity applies independently and full notifications do not repeat', () => {
  const s = initialState(now);
  s.resources.wood = 999;
  s.resources.clay = 0;
  advance(s, now + 3600000, 1);
  assert.equal(s.resources.wood, 1000);
  assert.equal(s.resources.clay, 30);
  advance(s, now + 7200000, 1);
  assert.equal(s.reports.filter((r) => r.title === 'Wood storage is full').length, 1);
});
test('upgrade costs match first Headquarters progression and exponential growth', () => {
  assert.deepEqual(upgradeCost('headquarters', 2), { wood: 90, clay: 80, iron: 70 });
  assert.deepEqual(upgradeCost('headquarters', 3), { wood: 130, clay: 120, iron: 100 });
  assert.equal(upgradeCost('timber', 4).wood, Math.ceil(buildings.timber.base.wood * 1.43 ** 3));
});
test('prerequisites prevent premature construction', () => {
  const s = rich();
  assert.equal(unmet(s, buildings.stable.requires).length, 3);
  assert.throws(() => act(s, action('upgrade', 'barracks'), now, 1), /requirements/);
  s.buildings.headquarters = 3;
  act(s, action('upgrade', 'barracks'), now, 1);
  assert.equal(s.jobs[0].key, 'barracks');
});
test('construction completion applies once and resource production changes at completion', () => {
  const s = initialState(now);
  const cost = upgradeCost('timber', 2);
  act(s, action('upgrade', 'timber'), now, 1);
  const end = s.jobs[0].end;
  advance(s, end + 3600000, 1);
  assert.equal(s.buildings.timber, 2);
  assert.ok(
    Math.abs(s.resources.wood - (500 - cost.wood + (30 * (end - now)) / 3600000 + 45)) < 1e-6,
  );
  const count = s.reports.length;
  advance(s, end + 3600000, 1);
  assert.equal(s.reports.length, count);
  assert.equal(s.jobs.length, 0);
});
test('construction queue serializes repeated building upgrades and enforces limit', () => {
  const s = rich();
  act(s, action('upgrade', 'timber'), now, 1);
  act(s, action('upgrade', 'timber'), now, 1);
  act(s, action('upgrade', 'clay'), now, 1);
  assert.equal(s.jobs[1].target, 3);
  assert.equal(s.jobs[1].start, s.jobs[0].end);
  assert.equal(s.jobs[2].start, s.jobs[1].end);
  assert.throws(() => act(s, action('upgrade', 'iron'), now, 1), /queue is full/);
  advance(s, s.jobs[2].end, 1);
  assert.equal(s.buildings.timber, 3);
  assert.equal(s.buildings.clay, 2);
});
test('idempotent request does not charge twice', () => {
  const s = initialState(now);
  const a = action('upgrade', 'headquarters');
  act(s, a, now, 1);
  const wood = s.resources.wood;
  act(s, a, now, 1);
  assert.equal(s.resources.wood, wood);
  assert.equal(s.jobs.length, 1);
});
test('insufficient resources never become negative', () => {
  const s = initialState(now);
  s.resources.iron = 0;
  assert.throws(() => act(s, action('upgrade', 'headquarters'), now, 1), /resources/);
  assert.equal(s.resources.wood, 500);
  assert.equal(s.resources.iron, 0);
});
test('recruitment charges total cost, reserves population, and completes offline', () => {
  const s = rich();
  s.buildings.barracks = 1;
  const pop = population(s),
    wood = s.resources.wood;
  act(s, action('recruit', 'spear', 20), now, 1);
  assert.equal(s.resources.wood, wood - 1000);
  assert.equal(population(s), pop + 20);
  assert.equal(s.troops.spear, 0);
  advance(s, s.jobs[0].end, 1);
  assert.equal(s.troops.spear, 20);
  assert.equal(population(s), pop + 20);
  advance(s, s.lastUpdate, 1);
  assert.equal(s.troops.spear, 20);
});
test('recruitment refuses invalid quantities and population overflow', () => {
  const s = rich();
  s.buildings.barracks = 1;
  s.buildings.farm = 1;
  assert.ok(population(s) < farmCapacity(1));
  assert.throws(() => act(s, action('recruit', 'spear', 100), now, 1), /population/);
  for (const q of [0, -1, 1.5, 10001, NaN])
    assert.throws(() => act(s, action('recruit', 'spear', q), now, 1));
});
test('barracks and stable recruitment run independently', () => {
  const s = rich();
  s.buildings.barracks = 5;
  s.buildings.stable = 1;
  s.research = ['cavalry'];
  act(s, action('recruit', 'spear', 1), now, 1);
  act(s, action('recruit', 'light', 1), now, 1);
  assert.equal(s.jobs[0].start, s.jobs[1].start);
});
test('research prerequisites, gameplay effects, and completion persist in state', () => {
  const s = rich();
  s.buildings.barracks = 3;
  s.buildings.smithy = 1;
  assert.throws(() => act(s, action('research', 'armor'), now, 1), /requirements/);
  act(s, action('research', 'spears'), now, 1);
  advance(s, s.jobs[0].end, 1);
  assert.ok(s.research.includes('spears'));
  assert.equal(troopStats(s, 'spear').cavalryDefense, 52);
  assert.throws(() => act(s, action('research', 'spears'), s.lastUpdate, 1), /Already/);
});
test('offline warehouse upgrades apply storage limits chronologically', () => {
  const s = initialState(now);
  s.resources = { wood: 1000, clay: 1000, iron: 1000 };
  act(s, action('upgrade', 'warehouse'), now, 1);
  advance(s, now + 100 * 3600000, 1);
  assert.equal(s.buildings.warehouse, 2);
  for (const r of ['wood', 'clay', 'iron'] as const) assert.equal(s.resources[r], capacity(2));
});
test('production remains finite at maximum configured levels', () => {
  const s = rich();
  s.buildings.timber = 30;
  s.buildings.warehouse = 30;
  advance(s, now + 1000000000000, 12);
  assert.equal(s.resources.wood, capacity(30));
  assert.ok(Number.isFinite(s.resources.wood));
});
test('newly available buildings generate unlock reports', () => {
  const s = rich();
  act(s, action('upgrade', 'headquarters'), now, 1);
  advance(s, s.jobs[0].end, 1);
  assert.ok(s.reports.some((r) => r.title === 'Hiding Place unlocked'));
});

test('Rally Point saves validated army plans without removing stationed troops', () => {
  const s = initialState(now);
  s.troops.spear = 12;
  assert.throws(
    () => act(s, { type: 'formation', formation: { spear: 10 }, requestId: 'plan-locked' }, now, 1),
    /Rally Point/,
  );
  s.buildings.rally = 1;
  act(s, { type: 'formation', formation: { spear: 10 }, requestId: 'plan-saved' }, now, 1);
  assert.equal(s.armyPlan?.spear, 10);
  assert.equal(s.troops.spear, 12);
  assert.throws(
    () => act(s, { type: 'formation', formation: { spear: 13 }, requestId: 'plan-over' }, now, 1),
    /exceeds/,
  );
  assert.throws(
    () =>
      act(s, { type: 'formation', formation: { spear: -1 }, requestId: 'plan-negative' }, now, 1),
    /exceeds/,
  );
});
