import {
  balance,
  buildings,
  capacity,
  constructionSeconds,
  farmCapacity,
  production,
  resources,
  technologies,
  units,
  upgradeCost,
  type Cost,
} from './config.js';
export type Job = {
  id: string;
  key: string;
  target?: number;
  quantity?: number;
  start: number;
  end: number;
  lane: string;
};
export type Report = { id: string; time: number; title: string; detail: string; kind: string };
export type VillageState = {
  name: string;
  resources: Cost;
  lastUpdate: number;
  buildings: Record<string, number>;
  troops: Record<string, number>;
  research: string[];
  jobs: Job[];
  reports: Report[];
  requestIds: string[];
  armyPlan?: Record<string, number>;
};
export function initialState(now = Date.now()): VillageState {
  return {
    name: 'Oakheart',
    resources: {
      wood: balance.startingResources,
      clay: balance.startingResources,
      iron: balance.startingResources,
    },
    lastUpdate: now,
    buildings: Object.fromEntries(
      Object.keys(buildings).map((k) => [
        k,
        ['headquarters', 'timber', 'clay', 'iron', 'farm', 'warehouse'].includes(k) ? 1 : 0,
      ]),
    ),
    troops: Object.fromEntries(Object.keys(units).map((k) => [k, 0])),
    research: [],
    jobs: [],
    reports: [
      {
        id: 'welcome',
        time: now,
        title: 'A new chapter begins',
        detail: 'Your banner flies over Oakheart. Grow your economy and build a realm to endure.',
        kind: 'village',
      },
    ],
    requestIds: [],
    armyPlan: Object.fromEntries(Object.keys(units).map((k) => [k, 0])),
  };
}
export const unmet = (s: VillageState, req: Record<string, number>) =>
  Object.entries(req).filter(([k, l]) => (s.buildings[k] || 0) < l);
export function population(s: VillageState) {
  return (
    Object.entries(s.buildings).reduce((n, [k, l]) => n + l * buildings[k].population, 0) +
    Object.entries(s.troops).reduce((n, [k, q]) => n + q * units[k].population, 0) +
    s.jobs.reduce(
      (n, j) =>
        n +
        (j.lane === 'construction'
          ? buildings[j.key].population
          : j.lane === 'research'
            ? 0
            : units[j.key].population * (j.quantity || 0)),
      0,
    )
  );
}
export function rates(s: VillageState, speed: number): Cost {
  return {
    wood: production(s.buildings.timber) * speed,
    clay: production(s.buildings.clay) * speed,
    iron: production(s.buildings.iron) * speed,
  };
}
function report(s: VillageState, time: number, title: string, detail: string, kind: string) {
  s.reports.unshift({ id: crypto.randomUUID(), time, title, detail, kind });
  s.reports = s.reports.slice(0, 120);
}
function produce(s: VillageState, to: number, speed: number) {
  const rate = rates(s, speed),
    cap = capacity(s.buildings.warehouse);
  for (const r of resources) {
    const before = s.resources[r];
    s.resources[r] = Math.min(cap, before + (rate[r] * Math.max(0, to - s.lastUpdate)) / 3600000);
    if (before < cap && s.resources[r] >= cap)
      report(
        s,
        to,
        `${r[0].toUpperCase() + r.slice(1)} storage is full`,
        'Expand your warehouse or invest in your village.',
        'storage',
      );
  }
  s.lastUpdate = to;
}
export function advance(s: VillageState, now: number, speed: number) {
  now = Math.max(now, s.lastUpdate);
  const due = s.jobs.filter((j) => j.end <= now).sort((a, b) => a.end - b.end);
  for (const job of due) {
    produce(s, job.end, speed);
    if (job.lane === 'construction') {
      const locked = Object.keys(buildings).filter(
        (k) => unmet(s, buildings[k].requires).length > 0,
      );
      s.buildings[job.key] = job.target!;
      report(
        s,
        job.end,
        `${buildings[job.key].name} completed`,
        `Your ${buildings[job.key].name} is now level ${job.target}.`,
        'construction',
      );
      for (const key of locked)
        if (!unmet(s, buildings[key].requires).length)
          report(
            s,
            job.end,
            `${buildings[key].name} unlocked`,
            'A new building is available for construction.',
            'unlock',
          );
    } else if (job.lane === 'research') {
      s.research.push(job.key);
      report(
        s,
        job.end,
        `${technologies[job.key].name} researched`,
        technologies[job.key].effect,
        'research',
      );
    } else {
      s.troops[job.key] += job.quantity || 0;
      report(
        s,
        job.end,
        'Troops ready',
        `${job.quantity} ${units[job.key].name} joined your garrison.`,
        'military',
      );
    }
    s.jobs = s.jobs.filter((j) => j.id !== job.id);
  }
  produce(s, now, speed);
  return s;
}
function pay(s: VillageState, cost: Cost) {
  if (resources.some((r) => s.resources[r] + 1e-8 < cost[r]))
    throw new Error('Not enough resources. Let your economy grow.');
  for (const r of resources) s.resources[r] = Math.max(0, s.resources[r] - cost[r]);
}
function addJob(
  s: VillageState,
  key: string,
  lane: string,
  duration: number,
  now: number,
  extra: Partial<Job> = {},
) {
  const start = Math.max(now, ...s.jobs.filter((j) => j.lane === lane).map((j) => j.end));
  s.jobs.push({
    id: crypto.randomUUID(),
    key,
    lane,
    start,
    end: start + duration * 1000,
    ...extra,
  });
}
export type Action = {
  type: 'upgrade' | 'recruit' | 'research' | 'rename' | 'formation';
  formation?: Record<string, number>;
  key?: string;
  quantity?: number;
  name?: string;
  requestId: string;
};
export function act(s: VillageState, a: Action, now: number, speed: number) {
  if (s.requestIds.includes(a.requestId)) return s;
  advance(s, now, speed);
  const key = a.key || '';
  if (a.type === 'upgrade') {
    const def = buildings[key];
    if (!def) throw new Error('Unknown building.');
    if (unmet(s, def.requires).length) throw new Error('Building requirements are not met.');
    const queued = s.jobs.filter((j) => j.lane === 'construction');
    if (queued.length >= balance.queueLimit) throw new Error('Construction queue is full.');
    const target = s.buildings[key] + queued.filter((j) => j.key === key).length + 1;
    if (target > def.max) throw new Error('Maximum level reached.');
    if (population(s) + def.population > farmCapacity(s.buildings.farm))
      throw new Error('Your farm needs more capacity.');
    pay(s, upgradeCost(key, target));
    addJob(
      s,
      key,
      'construction',
      constructionSeconds(key, target, s.buildings.headquarters, speed),
      now,
      { target },
    );
  } else if (a.type === 'recruit') {
    const def = units[key],
      q = a.quantity;
    if (!def || !Number.isSafeInteger(q) || q! < 1 || q! > 10000)
      throw new Error('Choose between 1 and 10,000 troops.');
    if (unmet(s, def.requires).length || (def.tech && !s.research.includes(def.tech)))
      throw new Error('Unit requirements are not met.');
    if (s.jobs.filter((j) => j.lane === def.building).length >= balance.recruitQueueLimit)
      throw new Error('Recruitment queue is full.');
    if (population(s) + def.population * q! > farmCapacity(s.buildings.farm))
      throw new Error('Not enough population capacity. Upgrade your farm.');
    pay(s, Object.fromEntries(resources.map((r) => [r, def.cost[r] * q!])) as Cost);
    addJob(
      s,
      key,
      def.building,
      (def.seconds * q! * balance.recruitReduction ** (s.buildings[def.building] - 1)) / speed,
      now,
      { quantity: q },
    );
  } else if (a.type === 'research') {
    const def = technologies[key];
    if (!def) throw new Error('Unknown technology.');
    if (s.research.includes(key) || s.jobs.some((j) => j.key === key && j.lane === 'research'))
      throw new Error('Already researched or in progress.');
    if (s.jobs.some((j) => j.lane === 'research'))
      throw new Error('The smithy is already researching.');
    if (unmet(s, def.requires).length || (def.tech && !s.research.includes(def.tech)))
      throw new Error('Research requirements are not met.');
    pay(s, def.cost);
    addJob(s, key, 'research', def.seconds / speed, now);
  } else if (a.type === 'formation') {
    if (!s.buildings.rally) throw new Error('Construct a Rally Point before organizing an army.');
    if (!a.formation || typeof a.formation !== 'object' || Array.isArray(a.formation))
      throw new Error('Choose an army composition.');
    const plan: Record<string, number> = {};
    for (const key of Object.keys(units)) {
      const quantity = a.formation[key] ?? 0;
      if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > s.troops[key])
        throw new Error('Your army plan exceeds the available garrison.');
      plan[key] = quantity;
    }
    s.armyPlan = plan;
  } else if (a.type === 'rename') {
    const name = a.name?.trim();
    if (!name || name.length > 32)
      throw new Error('Use a village name between 1 and 32 characters.');
    s.name = name;
  } else throw new Error('Unknown action.');
  s.requestIds.push(a.requestId);
  s.requestIds = s.requestIds.slice(-200);
  return s;
}
export function troopStats(s: VillageState, key: string) {
  const d = units[key],
    stats = { ...d };
  for (const tech of s.research)
    for (const modifier of technologies[tech].modifiers) {
      if (
        (modifier.unit && modifier.unit !== key) ||
        (modifier.building && modifier.building !== d.building)
      )
        continue;
      stats[modifier.stat] *= modifier.factor;
    }
  for (const stat of ['attack', 'infantryDefense', 'cavalryDefense', 'rangedDefense'] as const)
    stats[stat] = Math.round(stats[stat]);
  return stats;
}
