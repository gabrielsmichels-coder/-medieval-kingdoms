import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initialState, type VillageState } from '../shared/engine.js';
test('SQLite survives client restart, rolls back transactions, and serializes concurrent actions', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'medieval-test-'));
  const url = `file:${dir}/realm.db`;
  const client = new PrismaClient({ datasourceUrl: url });
  try {
    await writeFile(path.join(dir, 'realm.db'), '');
    execFileSync(path.resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'], {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
    });
    await client.player.create({ data: { id: 'test', name: 'Steward' } });
    const state = initialState(1000);
    state.troops.spear = 12;
    state.research = ['spears'];
    await client.village.create({
      data: { id: 'test', playerId: 'test', name: 'Test', state: JSON.stringify(state) },
    });
    await client.$disconnect();
    const restarted = new PrismaClient({ datasourceUrl: url });
    try {
      const row = await restarted.village.findUniqueOrThrow({ where: { id: 'test' } });
      const restored = JSON.parse(row.state) as VillageState;
      assert.equal(restored.troops.spear, 12);
      assert.deepEqual(restored.research, ['spears']);
      await assert.rejects(
        restarted.$transaction(async (tx) => {
          await tx.village.update({ where: { id: 'test' }, data: { name: 'Rolled back' } });
          throw new Error('rollback');
        }),
      );
      assert.equal(
        (await restarted.village.findUniqueOrThrow({ where: { id: 'test' } })).name,
        'Test',
      );
    } finally {
      await restarted.$disconnect();
    }
    // Exercise the real API repository against the isolated database.
    process.env.DATABASE_URL = url;
    process.env.GAME_SPEED = '1';
    const { transact, prisma } = await import('../server/db.js');
    try {
      const start = 1700000000000;
      await transact(undefined, start);
      const request = { type: 'upgrade' as const, key: 'headquarters', requestId: 'same-action' };
      await Promise.all([transact(request, start), transact(request, start)]);
      const s = await transact(undefined, start);
      assert.equal(s.jobs.length, 1);
      assert.equal(s.resources.wood, balanceStart() - 90);
      // A durable receipt prevents replay even after recent IDs are evicted from the aggregate.
      const saved = await prisma.village.findUniqueOrThrow({ where: { id: 'oakheart' } });
      const evicted = JSON.parse(saved.state) as VillageState;
      evicted.requestIds = [];
      await prisma.village.update({
        where: { id: 'oakheart' },
        data: { state: JSON.stringify(evicted) },
      });
      const replay = await transact(request, start);
      assert.equal(replay.resources.wood, s.resources.wood);
      assert.equal(replay.jobs.length, 1);
      assert.equal(await prisma.actionReceipt.count(), 1);
      await assert.rejects(
        transact({ type: 'recruit', key: 'spear', quantity: 1, requestId: 'invalid' }, start),
      );
      const after = await transact(undefined, start);
      assert.equal(after.jobs.length, 1);
      const completed = await transact(undefined, s.jobs[0].end + 3600000);
      assert.equal(completed.buildings.headquarters, 2);
      assert.equal(completed.jobs.length, 0);
      completed.buildings.barracks = 1;
      completed.buildings.smithy = 1;
      completed.resources = { wood: 1000, clay: 1000, iron: 1000 };
      await prisma.village.update({
        where: { id: 'oakheart' },
        data: { state: JSON.stringify(completed) },
      });
      const at = completed.lastUpdate;
      await Promise.all([
        transact({ type: 'recruit', key: 'spear', quantity: 3, requestId: 'troops' }, at),
        transact({ type: 'research', key: 'spears', requestId: 'technology' }, at),
      ]);
      const queued = await transact(undefined, at);
      assert.equal(queued.jobs.length, 2);
      const done = await transact(undefined, Math.max(...queued.jobs.map((j) => j.end)) + 1000);
      assert.equal(done.troops.spear, 3);
      assert.ok(done.research.includes('spears'));
      assert.equal(done.jobs.length, 0);
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    await client.$disconnect();
    await rm(dir, { recursive: true, force: true });
  }
});
function balanceStart() {
  return 500;
}
