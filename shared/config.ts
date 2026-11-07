export const resources = ['wood', 'clay', 'iron'] as const;
export type Resource = (typeof resources)[number];
export type Cost = Record<Resource, number>;
export type BuildingDef = {
  name: string;
  description: string;
  max: number;
  base: Cost;
  growth: number;
  seconds: number;
  population: number;
  requires: Record<string, number>;
  category: 'Economy' | 'Village' | 'Military';
  effect: string;
};
const b = (
  name: string,
  description: string,
  max: number,
  base: number[],
  seconds: number,
  population: number,
  requires: Record<string, number>,
  category: BuildingDef['category'],
  effect: string,
): BuildingDef => ({
  name,
  description,
  max,
  base: { wood: base[0], clay: base[1], iron: base[2] },
  growth: 1.43,
  seconds,
  population,
  requires,
  category,
  effect,
});
export const buildings: Record<string, BuildingDef> = {
  headquarters: b(
    'Headquarters',
    'The heart of your realm. Direct construction and unlock the foundations of a flourishing kingdom.',
    30,
    [63, 56, 49],
    45,
    2,
    {},
    'Village',
    'Construction speed',
  ),
  timber: b(
    'Timber Camp',
    'Foresters harvest the ancient woodland, supplying timber for a growing village.',
    30,
    [50, 60, 40],
    35,
    1,
    {},
    'Economy',
    'Wood production',
  ),
  clay: b(
    'Clay Pit',
    'Rich earth is shaped into the bricks that will become your kingdom.',
    30,
    [65, 45, 40],
    35,
    1,
    {},
    'Economy',
    'Clay production',
  ),
  iron: b(
    'Iron Mine',
    'Miners work the rocky hillside to supply tools, armor, and weapons.',
    30,
    [75, 65, 50],
    40,
    1,
    {},
    'Economy',
    'Iron production',
  ),
  farm: b(
    'Farm',
    'Golden fields and full granaries sustain your villagers and soldiers.',
    30,
    [55, 65, 45],
    35,
    0,
    {},
    'Economy',
    'Population capacity',
  ),
  warehouse: b(
    'Warehouse',
    'Keep the fruits of your labor safe in spacious timber storehouses.',
    30,
    [60, 50, 50],
    40,
    1,
    {},
    'Economy',
    'Storage per resource',
  ),
  hiding: b(
    'Hiding Place',
    'Concealed cellars protect a portion of each resource from future raids.',
    10,
    [70, 90, 50],
    60,
    1,
    { headquarters: 2 },
    'Village',
    'Protected resources',
  ),
  rally: b(
    'Rally Point',
    'A gathering place for the banners of your army. Muster troops and prepare future expeditions.',
    1,
    [80, 60, 80],
    60,
    1,
    { headquarters: 3 },
    'Military',
    'Army command',
  ),
  barracks: b(
    'Barracks',
    'Train disciplined infantry to defend your home and carry your banner.',
    25,
    [140, 120, 100],
    90,
    3,
    { headquarters: 3 },
    'Military',
    'Infantry training',
  ),
  smithy: b(
    'Smithy',
    'The ringing of hammer on anvil heralds new military knowledge.',
    20,
    [180, 160, 180],
    120,
    3,
    { headquarters: 5, barracks: 3 },
    'Military',
    'Military research',
  ),
  stable: b(
    'Stable',
    'Breed strong horses and train the mounted warriors of your realm.',
    20,
    [240, 210, 250],
    150,
    4,
    { headquarters: 10, barracks: 5, smithy: 5 },
    'Military',
    'Cavalry training',
  ),
  wall: b(
    'Wall',
    'A sturdy ring of stone protects your village and strengthens its defenders.',
    20,
    [100, 200, 80],
    90,
    0,
    { headquarters: 5, barracks: 1 },
    'Military',
    'Defense bonus',
  ),
  church: b(
    'Church',
    'A beacon of faith and fellowship that strengthens the resolve of your people.',
    3,
    [1200, 1500, 1000],
    600,
    10,
    { headquarters: 15, warehouse: 10, smithy: 10 },
    'Village',
    'Morale bonus',
  ),
};
export const balance = {
  production: [0, 30, 45, 65, 90, 125, 170, 230, 310, 410, 540],
  storage: [0, 1000, 1500, 2200, 3200, 4600, 6500, 9000, 12500, 17000, 23000],
  productionGrowth: 1.29,
  storageGrowth: 1.34,
  farmBase: 100,
  farmGrowth: 1.24,
  queueLimit: 3,
  recruitQueueLimit: 5,
  headquartersReduction: 0.95,
  recruitReduction: 0.94,
  wallBonus: 0.055,
  churchBonus: 0.08,
  hidingPerLevel: 150,
  startingResources: 500,
};
export type UnitDef = {
  name: string;
  description: string;
  cost: Cost;
  population: number;
  seconds: number;
  attack: number;
  infantryDefense: number;
  cavalryDefense: number;
  rangedDefense: number;
  speed: number;
  carry: number;
  building: string;
  requires: Record<string, number>;
  tech?: string;
};
const u = (
  name: string,
  description: string,
  cost: number[],
  population: number,
  seconds: number,
  attack: number,
  infantryDefense: number,
  cavalryDefense: number,
  rangedDefense: number,
  speed: number,
  carry: number,
  building: string,
  requires: Record<string, number>,
  tech?: string,
): UnitDef => ({
  name,
  description,
  cost: { wood: cost[0], clay: cost[1], iron: cost[2] },
  population,
  seconds,
  attack,
  infantryDefense,
  cavalryDefense,
  rangedDefense,
  speed,
  carry,
  building,
  requires,
  tech,
});
export const units: Record<string, UnitDef> = {
  spear: u(
    'Spearman',
    'Reliable guardians against mounted enemies.',
    [50, 30, 10],
    1,
    45,
    10,
    15,
    45,
    20,
    18,
    25,
    'barracks',
    { barracks: 1 },
  ),
  sword: u(
    'Swordsman',
    'Armored infantry with a steadfast defense.',
    [30, 30, 70],
    1,
    65,
    25,
    50,
    20,
    30,
    22,
    15,
    'barracks',
    { barracks: 2 },
    'swords',
  ),
  axe: u(
    'Axeman',
    'Fearless infantry built for the front line.',
    [60, 30, 40],
    1,
    55,
    40,
    10,
    5,
    10,
    18,
    10,
    'barracks',
    { barracks: 1 },
  ),
  archer: u(
    'Archer',
    'Patient marksmen watching over your walls.',
    [70, 30, 50],
    1,
    65,
    15,
    35,
    40,
    30,
    18,
    10,
    'barracks',
    { barracks: 3 },
    'archery',
  ),
  light: u(
    'Light Cavalry',
    'Swift riders with room for supplies.',
    [125, 100, 200],
    4,
    120,
    130,
    30,
    40,
    30,
    10,
    80,
    'stable',
    { stable: 1 },
    'cavalry',
  ),
  heavy: u(
    'Heavy Cavalry',
    'The armored fist of a powerful kingdom.',
    [200, 150, 400],
    6,
    180,
    150,
    200,
    80,
    150,
    11,
    50,
    'stable',
    { stable: 5 },
    'cavalry',
  ),
};
export type TechModifier = {
  stat: 'attack' | 'infantryDefense' | 'cavalryDefense' | 'rangedDefense';
  factor: number;
  unit?: string;
  building?: string;
};
export type TechDef = {
  name: string;
  description: string;
  cost: Cost;
  seconds: number;
  requires: Record<string, number>;
  tech?: string;
  effect: string;
  modifiers: TechModifier[];
};
export const technologies: Record<string, TechDef> = {
  spears: {
    name: 'Improved Spears',
    description: 'Hardened spearheads hold the line against charging horsemen.',
    cost: { wood: 150, clay: 100, iron: 150 },
    seconds: 90,
    requires: { smithy: 1 },
    effect: '+15% spearman cavalry defense',
    modifiers: [{ stat: 'cavalryDefense', factor: 1.15, unit: 'spear' }],
  },
  armor: {
    name: 'Reinforced Armor',
    description: 'Layered armor gives every soldier greater staying power.',
    cost: { wood: 200, clay: 180, iron: 250 },
    seconds: 120,
    requires: { smithy: 3 },
    tech: 'spears',
    effect: '+10% all troop defense',
    modifiers: [
      { stat: 'infantryDefense', factor: 1.1 },
      { stat: 'cavalryDefense', factor: 1.1 },
      { stat: 'rangedDefense', factor: 1.1 },
    ],
  },
  swords: {
    name: 'Advanced Swordsmithing',
    description: 'Balanced steel blades bring professional infantry to your ranks.',
    cost: { wood: 300, clay: 250, iron: 350 },
    seconds: 150,
    requires: { smithy: 5, barracks: 3 },
    effect: 'Unlock swordsmen; +15% infantry attack',
    modifiers: [{ stat: 'attack', factor: 1.15, building: 'barracks' }],
  },
  archery: {
    name: 'Archery Training',
    description: 'Well-drilled bowmen add a new layer to your village defense.',
    cost: { wood: 250, clay: 200, iron: 150 },
    seconds: 120,
    requires: { smithy: 2, barracks: 3 },
    effect: 'Unlock archers; +10% ranged defense',
    modifiers: [{ stat: 'rangedDefense', factor: 1.1 }],
  },
  cavalry: {
    name: 'Cavalry Equipment',
    description: 'Strong saddles and fitted tack prepare your mounted companies.',
    cost: { wood: 500, clay: 400, iron: 600 },
    seconds: 240,
    requires: { smithy: 5, stable: 1 },
    tech: 'swords',
    effect: 'Unlock cavalry; +10% cavalry attack',
    modifiers: [{ stat: 'attack', factor: 1.1, building: 'stable' }],
  },
};
export function scaled(table: number[], level: number, growth: number) {
  return level < table.length
    ? table[level]
    : Math.round(table[table.length - 1] * growth ** (level - table.length + 1));
}
export const production = (level: number) =>
  scaled(balance.production, level, balance.productionGrowth);
export const capacity = (level: number) => scaled(balance.storage, level, balance.storageGrowth);
export const farmCapacity = (level: number) =>
  Math.floor(balance.farmBase * balance.farmGrowth ** Math.max(0, level - 1));
export function upgradeCost(key: string, target: number): Cost {
  if (key === 'headquarters' && target === 2) return { wood: 90, clay: 80, iron: 70 };
  if (key === 'headquarters' && target === 3) return { wood: 130, clay: 120, iron: 100 };
  const d = buildings[key];
  return Object.fromEntries(
    resources.map((r) => [r, Math.ceil(d.base[r] * d.growth ** (target - 1))]),
  ) as Cost;
}
export function constructionSeconds(key: string, target: number, hq: number, speed: number) {
  const base =
    key === 'headquarters' && target === 2
      ? 60
      : key === 'headquarters' && target === 3
        ? 120
        : buildings[key].seconds * 1.38 ** (target - 1);
  return Math.max(1, (base * balance.headquartersReduction ** Math.max(0, hq - 1)) / speed);
}
