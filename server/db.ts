import { PrismaClient } from '@prisma/client';
import { act, advance, initialState, type Action, type VillageState } from '../shared/engine.js';
export const prisma = new PrismaClient();
export const speed = Number(process.env.GAME_SPEED || 1);
if (!Number.isFinite(speed) || speed <= 0) throw new Error('GAME_SPEED must be positive.');
let tail: Promise<unknown> = Promise.resolve();
export function transact(action?: Action, now = Date.now()): Promise<VillageState> {
  const task = tail.then(() =>
    prisma.$transaction(
      async (tx) => {
        await tx.player.upsert({
          where: { id: 'local' },
          create: { id: 'local', name: 'The Steward' },
          update: {},
        });
        const row = await tx.village.upsert({
          where: { id: 'oakheart' },
          create: {
            id: 'oakheart',
            playerId: 'local',
            name: 'Oakheart',
            state: JSON.stringify(initialState(now)),
          },
          update: {},
        });
        const state = JSON.parse(row.state) as VillageState;
        const receipt = action
          ? await tx.actionReceipt.findUnique({
              where: { villageId_requestId: { villageId: row.id, requestId: action.requestId } },
            })
          : null;
        if (action && !receipt) {
          act(state, action, now, speed);
          await tx.actionReceipt.create({
            data: { villageId: row.id, requestId: action.requestId },
          });
        } else advance(state, now, speed);
        const changed = await tx.village.updateMany({
          where: { id: row.id, version: row.version },
          data: { state: JSON.stringify(state), name: state.name, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new Error('Village changed. Please try again.');
        return state;
      },
      { timeout: 10000 },
    ),
  );
  tail = task.catch(() => {});
  return task;
}
