import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Axe,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Church,
  Clock,
  Flag,
  Flame,
  Hammer,
  HelpCircle,
  House,
  Layers,
  Leaf,
  Lock,
  Map,
  Menu,
  Mountain,
  Package,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Swords,
  TreePine,
  Users,
  Wheat,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
} from '../shared/config';
import {
  population,
  rates,
  troopStats,
  unmet,
  type Job,
  type VillageState,
} from '../shared/engine';
import { useGame } from './store';
import ArmyPlanner from './ArmyPlanner';
import VillageMap, { BuildingArt } from './VillageMap';
const icons: Record<string, LucideIcon> = {
  headquarters: House,
  timber: TreePine,
  clay: Layers,
  iron: Mountain,
  farm: Wheat,
  warehouse: Package,
  hiding: ShieldCheck,
  rally: Flag,
  barracks: Swords,
  smithy: Hammer,
  stable: Flag,
  wall: Shield,
  church: Church,
};
const resourceIcons: Record<string, LucideIcon> = { wood: TreePine, clay: Layers, iron: Mountain };
const nav = [
  { name: 'Village Overview', icon: House },
  { name: 'Buildings', icon: Hammer },
  { name: 'Military', icon: Swords },
  { name: 'Research', icon: BookOpen },
  { name: 'Rally Point', icon: Flag },
  { name: 'Reports', icon: ScrollText },
  { name: 'Settings', icon: Settings },
];
const fmt = (n: number) => Math.floor(n).toLocaleString();
function duration(seconds: number) {
  seconds = Math.max(0, Math.ceil(seconds));
  if (seconds >= 86400)
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  if (seconds >= 3600)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}
function CostRow({ cost, available }: { cost: Cost; available: Cost }) {
  return (
    <div className="cost-row">
      {resources.map((r) => {
        const Icon = resourceIcons[r];
        return (
          <span
            key={r}
            className={`${r} ${cost[r] > available[r] ? 'insufficient' : ''}`}
            title={`${r} cost`}
          >
            <Icon size={14} />
            {fmt(cost[r])}
          </span>
        );
      })}
    </div>
  );
}
function JobItem({ job, now }: { job: Job; now: number }) {
  const active = job.start <= now;
  const progress = Math.min(100, Math.max(0, ((now - job.start) / (job.end - job.start)) * 100));
  const name =
    job.lane === 'construction'
      ? buildings[job.key].name
      : job.lane === 'research'
        ? technologies[job.key].name
        : units[job.key].name;
  return (
    <div className="job">
      <div className="job-title">
        <span>
          {name} {job.target && <small>Lv. {job.target}</small>}
          {job.quantity && <small>×{job.quantity}</small>}
        </span>
        <span>{active ? duration((job.end - now) / 1000) : 'Queued'}</span>
      </div>
      <div className="progress-track">
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
function effect(key: string, level: number) {
  if (!level) return 'Not yet constructed';
  if (['timber', 'clay', 'iron'].includes(key)) return `${fmt(production(level))} / hour (base)`;
  if (key === 'warehouse') return `${fmt(capacity(level))} per resource`;
  if (key === 'farm') return `${fmt(farmCapacity(level))} population`;
  if (key === 'headquarters')
    return `${Math.round((1 - balance.headquartersReduction ** (level - 1)) * 100)}% faster construction`;
  if (key === 'hiding') return `${fmt(level * balance.hidingPerLevel)} protected per resource`;
  if (key === 'wall') return `+${Math.round(level * balance.wallBonus * 100)}% defense`;
  if (key === 'church') return `+${Math.round(level * balance.churchBonus * 100)}% morale`;
  if (key === 'rally') return 'Army command available';
  if (['barracks', 'stable'].includes(key))
    return `${Math.round((1 - balance.recruitReduction ** (level - 1)) * 100)}% faster recruitment`;
  return `Research tier ${level}`;
}
function Requirements({
  state,
  requirements,
  tech,
}: {
  state: VillageState;
  requirements: Record<string, number>;
  tech?: string;
}) {
  return (
    <div className="requirements">
      {Object.entries(requirements).map(([key, level]) => (
        <span className={state.buildings[key] >= level ? 'met' : ''} key={key}>
          {state.buildings[key] >= level ? <Check size={12} /> : <Lock size={11} />}{' '}
          {buildings[key].name} {state.buildings[key]} / {level}
        </span>
      ))}
      {tech && (
        <span className={state.research.includes(tech) ? 'met' : ''}>
          {state.research.includes(tech) ? <Check size={12} /> : <Lock size={11} />}{' '}
          {technologies[tech].name}
        </span>
      )}
    </div>
  );
}
function BuildingPanel({
  building,
  state,
  available,
  now,
  onClose,
  onNavigate,
}: {
  building: string;
  state: VillageState;
  available: Cost;
  now: number;
  onClose: () => void;
  onNavigate: (s: string) => void;
}) {
  const { speed, action, busy } = useGame(),
    def = buildings[building],
    level = state.buildings[building],
    locked = unmet(state, def.requires).length > 0;
  const queued = state.jobs.filter((j) => j.lane === 'construction'),
    target = level + queued.filter((j) => j.key === building).length + 1,
    cost = upgradeCost(building, target),
    max = target > def.max,
    Icon = icons[building];
  const affordable = resources.every((r) => available[r] >= cost[r]);
  const full = queued.length >= balance.queueLimit;
  return (
    <motion.aside
      className="building-panel panel"
      key={building}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="panel-eyebrow">
        BUILDING DETAILS
        <button
          className="icon-button close-detail"
          onClick={onClose}
          aria-label="Close building details"
        >
          <X size={16} />
        </button>
      </div>
      <div className={`building-portrait ${building}`}>
        <div className="portrait-halo" />
        <svg viewBox="-85 -115 170 175" aria-label={`${def.name} illustration`}>
          <BuildingArt kind={building} level={level || 1} />
        </svg>
        <span className="portrait-level">{level ? `LEVEL ${level}` : 'UNBUILT'}</span>
      </div>
      <div className="building-panel-body">
        <div className="building-heading">
          <h2>{def.name}</h2>
          {locked ? (
            <Lock size={17} />
          ) : (
            <span className="level-badge">
              {level} / {def.max}
            </span>
          )}
        </div>
        <p>{def.description}</p>
        <div className="effect-row">
          <span>Current benefit</span>
          <strong>{effect(building, level)}</strong>
        </div>
        {!max && (
          <div className="next-effect">
            <ArrowUpRight size={16} />
            <span>
              Level {target}
              <strong>{effect(building, target)}</strong>
            </span>
          </div>
        )}
        {Object.keys(def.requires).length > 0 && (
          <Requirements state={state} requirements={def.requires} />
        )}
        <div className="upgrade-section">
          <div className="section-label">
            {locked
              ? 'UNLOCK REQUIREMENTS'
              : max
                ? 'FULLY DEVELOPED'
                : `UPGRADE TO LEVEL ${target}`}
          </div>
          {!max && (
            <>
              <CostRow cost={cost} available={available} />
              <div className="upgrade-duration">
                <Clock size={13} />
                {duration(
                  constructionSeconds(building, target, state.buildings.headquarters, speed),
                )}
                <span>
                  <Users size={12} /> {def.population}
                </span>
              </div>
            </>
          )}
          <button
            className="primary-button"
            disabled={busy || locked || max || !affordable || full}
            onClick={() => void action({ type: 'upgrade', key: building })}
          >
            {locked ? (
              <>
                <Lock size={15} />
                Building locked
              </>
            ) : max ? (
              <>
                <CheckCheck size={16} />
                Maximum level
              </>
            ) : full ? (
              'Construction queue full'
            ) : !affordable ? (
              'More resources needed'
            ) : (
              <>
                <Hammer size={16} />
                {level ? 'Upgrade building' : 'Construct building'}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
        {['barracks', 'stable', 'smithy', 'rally'].includes(building) && level > 0 && (
          <button
            className="text-link"
            onClick={() =>
              onNavigate(
                building === 'smithy'
                  ? 'Research'
                  : building === 'rally'
                    ? 'Rally Point'
                    : 'Military',
              )
            }
          >
            Open{' '}
            {building === 'smithy'
              ? 'research'
              : building === 'rally'
                ? 'army command'
                : 'recruitment'}{' '}
            <ArrowRight size={14} />
          </button>
        )}
        <p className="panel-note">
          <ShieldCheck size={13} /> Your progress is saved automatically.
        </p>
      </div>
    </motion.aside>
  );
}
function Military({
  state,
  available,
  now,
}: {
  state: VillageState;
  available: Cost;
  now: number;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { action, busy, speed } = useGame();
  return (
    <div className="content-view">
      <div className="view-intro">
        <span className="eyebrow">THE STRENGTH OF YOUR REALM</span>
        <h2>Raise your banners</h2>
        <p>Recruit loyal soldiers. Build an army worthy of your kingdom.</p>
      </div>
      <div className="military-summary">
        <div>
          <Swords />
          <span>
            Garrison
            <strong>{fmt(Object.values(state.troops).reduce((a, b) => a + b, 0))} troops</strong>
          </span>
        </div>
        <div>
          <Users />
          <span>
            Population
            <strong>
              {population(state)} / {farmCapacity(state.buildings.farm)}
            </strong>
          </span>
        </div>
        <div>
          <Shield />
          <span>
            Wall defense
            <strong>+{Math.round(state.buildings.wall * balance.wallBonus * 100)}%</strong>
          </span>
        </div>
      </div>
      <div className="unit-grid">
        {Object.entries(units).map(([key, unit]) => {
          const q = quantities[key] ?? 1,
            locked =
              unmet(state, unit.requires).length > 0 ||
              (!!unit.tech && !state.research.includes(unit.tech)),
            stats = troopStats(state, key);
          const cost = Object.fromEntries(resources.map((r) => [r, unit.cost[r] * q])) as Cost;
          return (
            <div className={`panel unit-card ${locked ? 'is-locked' : ''}`} key={key}>
              <div className="unit-header">
                <div className="unit-emblem">
                  {unit.building === 'stable' ? (
                    <Flag size={29} />
                  ) : key === 'archer' ? (
                    <Axe size={29} />
                  ) : (
                    <Swords size={29} />
                  )}
                </div>
                <div>
                  <h3>{unit.name}</h3>
                  <span>{state.troops[key]} in village</span>
                </div>
                {locked && <Lock size={17} />}
              </div>
              <p>{unit.description}</p>
              <div className="stats-grid">
                <span>
                  Attack <b>{stats.attack}</b>
                </span>
                <span>
                  Inf. defense <b>{stats.infantryDefense}</b>
                </span>
                <span>
                  Cav. defense <b>{stats.cavalryDefense}</b>
                </span>
                <span>
                  Ranged def. <b>{stats.rangedDefense}</b>
                </span>
                <span>
                  Travel <b>{unit.speed} min / tile</b>
                </span>
                <span>
                  Carry <b>{unit.carry}</b>
                </span>
              </div>
              <Requirements state={state} requirements={unit.requires} tech={unit.tech} />
              <CostRow cost={cost} available={available} />
              <div className="recruit-detail">
                <span>
                  <Clock size={13} />
                  {duration(
                    (unit.seconds *
                      q *
                      balance.recruitReduction ** Math.max(0, state.buildings[unit.building] - 1)) /
                      speed,
                  )}
                </span>
                <span>
                  <Users size={13} />
                  {unit.population * q}
                </span>
              </div>
              <div className="recruit-controls">
                <input
                  aria-label={`${unit.name} quantity`}
                  type="number"
                  min="1"
                  max="10000"
                  value={q}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [key]: Math.max(1, Math.min(10000, Number(e.target.value) || 1)),
                    })
                  }
                />
                <button
                  className="primary-button"
                  disabled={
                    locked ||
                    busy ||
                    resources.some((r) => available[r] < cost[r]) ||
                    population(state) + q * unit.population > farmCapacity(state.buildings.farm)
                  }
                  onClick={() => void action({ type: 'recruit', key, quantity: q })}
                >
                  {locked ? (
                    <>
                      <Lock size={13} />
                      Locked
                    </>
                  ) : (
                    <>
                      Recruit <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="queue-columns">
        {['barracks', 'stable'].map((lane) => (
          <div className="panel queue-panel" key={lane}>
            <h3>
              {buildings[lane].name} queue{' '}
              <span>
                {state.jobs.filter((j) => j.lane === lane).length} / {balance.recruitQueueLimit}
              </span>
            </h3>
            {state.jobs
              .filter((j) => j.lane === lane)
              .map((j) => (
                <JobItem key={j.id} job={j} now={now} />
              ))}
            {!state.jobs.some((j) => j.lane === lane) && (
              <p className="muted">Your trainers await new recruits.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function Research({
  state,
  available,
  now,
}: {
  state: VillageState;
  available: Cost;
  now: number;
}) {
  const { action, busy, speed } = useGame();
  return (
    <div className="content-view">
      <div className="view-intro">
        <span className="eyebrow">KNOWLEDGE FORGES POWER</span>
        <h2>The art of advancement</h2>
        <p>Turn the knowledge of your smiths into strength on the battlefield.</p>
      </div>
      <div className="research-grid">
        {Object.entries(technologies).map(([key, tech]) => {
          const done = state.research.includes(key),
            job = state.jobs.find((j) => j.key === key && j.lane === 'research'),
            locked =
              unmet(state, tech.requires).length > 0 ||
              (!!tech.tech && !state.research.includes(tech.tech));
          return (
            <div className={`panel research-card ${done ? 'researched' : ''}`} key={key}>
              <div className="unit-header">
                <div className="unit-emblem">
                  {done ? <CheckCheck size={26} /> : <BookOpen size={26} />}
                </div>
                <div>
                  <h3>{tech.name}</h3>
                  <span>
                    {done ? 'Knowledge mastered' : `Smithy level ${tech.requires.smithy}`}
                  </span>
                </div>
              </div>
              <p>{tech.description}</p>
              <div className="research-effect">
                <Sparkles size={16} />
                {tech.effect}
              </div>
              <Requirements state={state} requirements={tech.requires} tech={tech.tech} />
              {job ? (
                <JobItem job={job} now={now} />
              ) : (
                <>
                  <CostRow cost={tech.cost} available={available} />
                  <div className="recruit-detail">
                    <Clock size={13} />
                    {duration(tech.seconds / speed)}
                  </div>
                </>
              )}
              <button
                className="primary-button"
                disabled={
                  busy ||
                  done ||
                  !!job ||
                  locked ||
                  state.jobs.some((j) => j.lane === 'research') ||
                  resources.some((r) => available[r] < tech.cost[r])
                }
                onClick={() => void action({ type: 'research', key })}
              >
                {done ? (
                  <>
                    <Check size={15} />
                    Researched
                  </>
                ) : job ? (
                  'Research in progress'
                ) : locked ? (
                  <>
                    <Lock size={13} />
                    Requirements not met
                  </>
                ) : (
                  <>
                    Research technology
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Rally({ state }: { state: VillageState }) {
  const unlocked = state.buildings.rally > 0;
  return (
    <div className="content-view">
      <div className="view-intro">
        <span className="eyebrow">UNDER ONE BANNER</span>
        <h2>The rally point</h2>
        <p>Your army, gathered at the heart of the village.</p>
      </div>
      {!unlocked && (
        <div className="notice">
          <Lock size={20} />
          <div>
            <strong>Establish your Rally Point</strong>
            <p>Reach Headquarters level 3, then construct the Rally Point to open army command.</p>
          </div>
        </div>
      )}
      <div className="panel roster">
        <h3>
          Village garrison{' '}
          <span>{Object.values(state.troops).reduce((a, b) => a + b, 0)} troops</span>
        </h3>
        <div className="roster-table">
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Available</th>
                <th>Attack</th>
                <th>Inf. defense</th>
                <th>Cav. defense</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(units).map(([key, unit]) => {
                const stats = troopStats(state, key);
                return (
                  <tr key={key}>
                    <td>{unit.name}</td>
                    <td>{state.troops[key]}</td>
                    <td>{stats.attack}</td>
                    <td>{stats.infantryDefense}</td>
                    <td>{stats.cavalryDefense}</td>
                    <td>{unit.carry * state.troops[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ArmyPlanner state={state} />
      <div className="queue-columns">
        <div className="panel queue-panel">
          <h3>Defensive strength</h3>
          <div className="effect-row">
            <span>Wall bonus</span>
            <strong>+{Math.round(state.buildings.wall * balance.wallBonus * 100)}%</strong>
          </div>
          <div className="effect-row">
            <span>Regional morale</span>
            <strong>+{Math.round(state.buildings.church * balance.churchBonus * 100)}%</strong>
          </div>
          <div className="effect-row">
            <span>Protected per resource</span>
            <strong>{state.buildings.hiding * balance.hidingPerLevel}</strong>
          </div>
        </div>
        <div className="panel queue-panel">
          <h3>Troop movements</h3>
          <p className="muted">
            Your troops are stationed at home. Attacks, reinforcements, and travel are planned for
            the multiplayer expansion.
          </p>
        </div>
      </div>
    </div>
  );
}
function SettingsView({ state }: { state: VillageState }) {
  const [name, setName] = useState(state.name),
    [saved, setSaved] = useState(false);
  const { action, busy, speed } = useGame();
  return (
    <div className="content-view narrow">
      <div className="view-intro">
        <span className="eyebrow">MAKE IT YOUR OWN</span>
        <h2>Your realm, your rules</h2>
        <p>Manage your village and learn about the realm.</p>
      </div>
      <form
        className="panel settings-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void action({ type: 'rename', name }).then((ok) => setSaved(ok));
        }}
      >
        <h3>Village identity</h3>
        <label htmlFor="village-name">Village name</label>
        <input
          id="village-name"
          maxLength={32}
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
        <button className="primary-button" disabled={busy}>
          {saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            'Save village name'
          )}
        </button>
      </form>
      <div className="panel settings-panel">
        <h3>Realm information</h3>
        <div className="effect-row">
          <span>Realm speed</span>
          <strong>{speed}×</strong>
        </div>
        <div className="effect-row">
          <span>Construction queue</span>
          <strong>{balance.queueLimit} buildings</strong>
        </div>
        <div className="effect-row">
          <span>Persistence</span>
          <strong>Automatic · SQLite</strong>
        </div>
        <p>
          Production, construction, training, and research continue while you are away. All rates
          and timers reflect this realm’s speed.
        </p>
        <p>
          This is a single-player village realm. World maps, combat, and alliances are reserved for
          a future expansion.
        </p>
      </div>
    </div>
  );
}
function VillageNotifications({ state }: { state: VillageState }) {
  const latest = useRef(state.reports[0]?.id);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const id = state.reports[0]?.id;
    if (id && id !== latest.current) {
      latest.current = id;
      setMessage(state.reports[0].title);
      const timer = setTimeout(() => setMessage(''), 5500);
      return () => clearTimeout(timer);
    }
  }, [state.reports[0]?.id]);
  return (
    <div aria-live="polite" className="completion-notifications">
      {message && (
        <motion.div
          className="completion-toast"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCheck size={18} />
          <span>{message}</span>
          <button
            className="icon-button"
            onClick={() => setMessage('')}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
export default function App() {
  const { state, speed, offset, error, busy, load, clear } = useGame();
  const [view, setView] = useState('Village Overview'),
    [selected, setSelected] = useState('headquarters'),
    [now, setNow] = useState(Date.now()),
    [mobile, setMobile] = useState(false),
    [category, setCategory] = useState('All'),
    [notifications, setNotifications] = useState(false),
    [help, setHelp] = useState(false),
    [seen, setSeen] = useState(() => Number(localStorage.getItem('mk-seen') || 0));
  useEffect(() => {
    void load();
    const p = setInterval(() => void load(), 2500);
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearInterval(p);
      clearInterval(t);
    };
  }, [load]);
  const navigate = (s: string) => {
    setView(s);
    setMobile(false);
    setNotifications(false);
  };
  if (!state)
    return (
      <div className="loading-screen">
        <img src="/crest.svg" width="72" />
        <h1>Medieval Kingdoms</h1>
        <p>{error || 'Preparing your realm…'}</p>
        {error && (
          <button className="primary-button" onClick={() => void load()}>
            Try again
          </button>
        )}
      </div>
    );
  const serverNow = now + offset,
    cap = capacity(state.buildings.warehouse),
    rate = rates(state, speed),
    available = Object.fromEntries(
      resources.map((r) => [
        r,
        Math.min(
          cap,
          state.resources[r] + (rate[r] * Math.max(0, serverNow - state.lastUpdate)) / 3600000,
        ),
      ]),
    ) as Cost;
  const construction = state.jobs.filter((j) => j.lane === 'construction');
  const unread = state.reports.filter((r) => r.time > seen).length;
  const score = Object.values(state.buildings).reduce((a, b) => a + b * 10, 0);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('Village Overview');
          }}
        >
          <img src="/crest.svg" alt="Kingdom crest" />
          <span>
            MEDIEVAL<strong>KINGDOMS</strong>
            <small>BUILD YOUR LEGACY</small>
          </span>
        </a>
        <div className="realm-selector">
          <span className="realm-icon">
            <Map size={19} />
          </span>
          <span>
            Oakheart Valley<small>Peaceful realm · {speed}× speed</small>
          </span>
          <span className="status-dot" />
        </div>
        <div className="nav-label">YOUR KINGDOM</div>
        <nav>
          {nav.map(({ name, icon: Icon }) => (
            <button
              className={view === name ? 'active' : ''}
              key={name}
              onClick={() => navigate(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === 'Reports' && unread > 0 ? (
                <span className="nav-count">{unread}</span>
              ) : view === name ? (
                <ChevronRight size={15} />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="council-card">
            <div className="council-icon">
              <Leaf size={21} />
            </div>
            <span>
              A kingdom takes root.
              <small>
                Great things begin with
                <br />a well-tended village.
              </small>
            </span>
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <HelpCircle size={17} /> A lord’s handbook <ArrowUpRight size={14} />
          </button>
          <div className="player">
            <div className="avatar">S</div>
            <span>
              The Steward<small>Lord of {state.name}</small>
            </span>
            <Shield size={16} />
          </div>
          <small className="version">MEDIEVAL KINGDOMS · v1.0</small>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <VillageNotifications state={state} />
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <div className="village-identity">
            <Flag size={21} />
            <div>
              <strong>{state.name}</strong>
              <small>482 | 517 · K54</small>
            </div>
            <ChevronDown size={13} />
          </div>
          <div className="resources">
            {resources.map((r) => {
              const Icon = resourceIcons[r];
              return (
                <div className={`resource ${r}`} key={r}>
                  <div className="resource-icon">
                    <Icon size={22} />
                  </div>
                  <div>
                    <strong>
                      {fmt(available[r])}
                      <small> / {fmt(cap)}</small>
                    </strong>
                    <span>
                      +{fmt(rate[r])}/h{' '}
                      <i title="Time until storage is full">
                        {available[r] >= cap
                          ? 'Full'
                          : duration(((cap - available[r]) / rate[r]) * 3600)}
                      </i>
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="resource population">
              <div className="resource-icon">
                <Users size={21} />
              </div>
              <div>
                <strong>
                  {population(state)}
                  <small> / {fmt(farmCapacity(state.buildings.farm))}</small>
                </strong>
                <span>Population</span>
              </div>
            </div>
          </div>
          <button
            className="notification-button icon-button"
            aria-label="View notifications"
            onClick={() => setNotifications(!notifications)}
          >
            <Bell size={20} />
            {unread > 0 && <span />}
          </button>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="breadcrumbs">
                Your kingdom <ChevronRight size={11} />
                <span>{view}</span>
              </div>
              <h1>{view === 'Village Overview' ? 'A village. A vision. A kingdom.' : view}</h1>
              <p>
                {view === 'Village Overview'
                  ? 'Every great kingdom begins with a single village. This one is yours.'
                  : 'Shape the future of your growing realm.'}
              </p>
            </div>
            <div className="season">
              <span className="sun-icon">☀</span>
              <span>
                Year 1 · The Age of Beginnings
                <small>
                  Spring <span>•</span> A new dawn
                </small>
              </span>
            </div>
          </div>
          {view === 'Village Overview' ? (
            <>
              <div className="overview-grid">
                <section className="village-section">
                  <div className="village-toolbar">
                    <div>
                      <span className="status-dot" />
                      <h2>{state.name}</h2>
                      <span className="tag">YOUR VILLAGE</span>
                    </div>
                    <span className="village-points">
                      <Shield size={14} />
                      {score} points
                    </span>
                  </div>
                  <VillageMap state={state} selected={selected} onSelect={setSelected} />
                  <div className="map-footer">
                    <span>
                      <span className="status-dot" /> Village at peace
                    </span>
                    <span>
                      <House size={13} />
                      {Object.values(state.buildings).filter((x) => x > 0).length} buildings <i />{' '}
                      <Users size={13} />
                      {population(state)} villagers
                    </span>
                    <span className="click-hint">
                      Select a building to manage <ArrowUpRight size={13} />
                    </span>
                  </div>
                  <div className="overview-bottom">
                    <section className="panel construction-panel">
                      <div className="card-heading">
                        <h3>
                          <Hammer size={17} />
                          Construction
                        </h3>
                        <span>
                          {construction.length} / {balance.queueLimit}
                        </span>
                      </div>
                      {construction.length ? (
                        construction.map((j) => <JobItem key={j.id} job={j} now={serverNow} />)
                      ) : (
                        <div className="empty-queue">
                          <div className="empty-icon">
                            <Hammer size={22} />
                          </div>
                          <div>
                            <strong>Your next chapter awaits</strong>
                            <p>Choose a building and start an upgrade.</p>
                          </div>
                          <ArrowUpRight size={18} />
                        </div>
                      )}
                      <div className="queue-foot">
                        <Clock size={12} /> Construction continues while you’re away.
                      </div>
                    </section>
                    <section className="panel growing-panel">
                      <div className="card-heading">
                        <h3>
                          <Leaf size={17} />A growing realm
                        </h3>
                        <span className="tag">CHAPTER I</span>
                      </div>
                      <h4>Lay the foundations</h4>
                      <p>A stronger Headquarters opens the way to a military of your own.</p>
                      <div className="goal">
                        <span>Headquarters level 3</span>
                        <strong>{Math.min(3, state.buildings.headquarters)} / 3</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          style={{
                            width: `${Math.min(100, (state.buildings.headquarters / 3) * 100)}%`,
                          }}
                        />
                      </div>
                      <button
                        className="text-link"
                        onClick={() => {
                          setSelected(
                            state.buildings.headquarters >= 3 ? 'barracks' : 'headquarters',
                          );
                        }}
                      >
                        {' '}
                        {state.buildings.headquarters >= 3
                          ? 'Build your barracks'
                          : 'Develop your headquarters'}
                        <ArrowRight size={13} />
                      </button>
                    </section>
                  </div>
                </section>
                {selected && (
                  <BuildingPanel
                    building={selected}
                    state={state}
                    available={available}
                    now={serverNow}
                    onClose={() => setSelected('')}
                    onNavigate={navigate}
                  />
                )}
              </div>
              <div className="realm-footer">
                <span>
                  <ShieldCheck size={13} />
                  Your legacy is safely recorded.
                </span>
                <span>THE ROOTS OF A KINGDOM RUN DEEP.</span>
                <span>
                  <span className="status-dot" />
                  Connected to realm
                </span>
              </div>
            </>
          ) : view === 'Buildings' ? (
            <div className="content-view">
              <div className="building-list-header">
                <div className="view-intro">
                  <span className="eyebrow">STONE BY STONE</span>
                  <h2>Build a lasting legacy</h2>
                  <p>Develop your village. New possibilities emerge as your realm grows.</p>
                </div>
                <div className="filter-tabs">
                  {['All', 'Economy', 'Village', 'Military'].map((x) => (
                    <button
                      className={category === x ? 'active' : ''}
                      onClick={() => setCategory(x)}
                      key={x}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
              <div className="buildings-layout">
                <div className="building-list">
                  {Object.entries(buildings)
                    .filter(([, d]) => category === 'All' || d.category === category)
                    .map(([key, def]) => {
                      const Icon = icons[key],
                        locked = unmet(state, def.requires).length > 0;
                      return (
                        <button
                          key={key}
                          className={`panel building-list-card ${selected === key ? 'selected' : ''}`}
                          onClick={() => setSelected(key)}
                        >
                          <div className={`list-building-icon ${locked ? 'locked' : ''}`}>
                            <Icon size={25} />
                          </div>
                          <div>
                            <h3>
                              {def.name}{' '}
                              <small>
                                {state.buildings[key]
                                  ? `Level ${state.buildings[key]}`
                                  : locked
                                    ? 'Locked'
                                    : 'Available'}
                              </small>
                            </h3>
                            <p>{effect(key, state.buildings[key])}</p>
                            {locked && <Requirements state={state} requirements={def.requires} />}
                          </div>
                          {locked ? <Lock size={16} /> : <ChevronRight size={17} />}
                        </button>
                      );
                    })}
                </div>
                {selected && (
                  <BuildingPanel
                    building={selected}
                    state={state}
                    available={available}
                    now={serverNow}
                    onClose={() => setSelected('')}
                    onNavigate={navigate}
                  />
                )}
              </div>
              <div className="panel queue-panel">
                <h3>Construction queue</h3>
                {construction.map((j) => (
                  <JobItem key={j.id} job={j} now={serverNow} />
                ))}
                {!construction.length && (
                  <p className="muted">Select a building to start construction.</p>
                )}
              </div>
            </div>
          ) : view === 'Military' ? (
            <Military state={state} available={available} now={serverNow} />
          ) : view === 'Research' ? (
            <Research state={state} available={available} now={serverNow} />
          ) : view === 'Rally Point' ? (
            <Rally state={state} />
          ) : view === 'Reports' ? (
            <div className="content-view">
              <div className="reports-heading">
                <div className="view-intro">
                  <span className="eyebrow">THE CHRONICLES OF {state.name.toUpperCase()}</span>
                  <h2>A record of your reign</h2>
                  <p>News, milestones, and the quiet progress of your village.</p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSeen(serverNow);
                    localStorage.setItem('mk-seen', String(serverNow));
                  }}
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              </div>
              <div className="panel reports-list">
                {state.reports.map((r) => (
                  <div className={`report ${r.time > seen ? 'unread' : ''}`} key={r.id}>
                    <div className="report-icon">
                      {r.kind === 'construction' ? (
                        <Hammer size={18} />
                      ) : r.kind === 'military' ? (
                        <Swords size={18} />
                      ) : r.kind === 'research' ? (
                        <BookOpen size={18} />
                      ) : (
                        <ScrollText size={18} />
                      )}
                    </div>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.detail}</p>
                    </div>
                    <time>{new Date(r.time).toLocaleString()}</time>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <SettingsView state={state} />
          )}
        </main>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-toast"
            role="alert"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Shield size={19} />
            <span>{error}</span>
            <button onClick={clear} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </motion.div>
        )}
        {notifications && (
          <motion.div
            className="notification-popover panel"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-heading">
              <h3>Village news</h3>
              <button
                className="icon-button"
                onClick={() => setNotifications(false)}
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
            {state.reports.slice(0, 5).map((r) => (
              <div className="notification-item" key={r.id}>
                <strong>{r.title}</strong>
                <p>{r.detail}</p>
              </div>
            ))}
            <button className="text-link" onClick={() => navigate('Reports')}>
              View the chronicles
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
        {help && (
          <div className="modal-backdrop" onClick={() => setHelp(false)}>
            <motion.div
              className="panel handbook"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-heading">
                <h3>
                  <BookOpen size={20} /> A lord’s handbook
                </h3>
                <button
                  className="icon-button"
                  aria-label="Close handbook"
                  onClick={() => setHelp(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <h2>Plant the seeds of a kingdom.</h2>
              <p>
                Your timber camp, clay pit, and iron mine produce resources every hour, even while
                you’re away. Upgrade them to grow your economy.
              </p>
              <ol>
                <li>
                  <b>Build your foundations.</b> Click a village building to upgrade it. Your
                  Headquarters unlocks new buildings and speeds up construction.
                </li>
                <li>
                  <b>Make room to grow.</b> Expand the Warehouse before resources fill up. Upgrade
                  the Farm to support buildings and troops.
                </li>
                <li>
                  <b>Raise a garrison.</b> Reach Headquarters level 3 and construct a Barracks.
                  Train spearmen and axemen to begin your army.
                </li>
                <li>
                  <b>Advance your knowledge.</b> Unlock the Smithy with Headquarters 5 and Barracks
                  3. Research equipment and new units.
                </li>
              </ol>
              <p>
                Costs are paid when a job is queued. Buildings share one construction lane;
                Barracks, Stable, and Smithy each work independently. Recruitment arrives as a
                completed batch.
              </p>
              <button className="primary-button" onClick={() => setHelp(false)}>
                My village awaits <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {busy && (
        <div className="saving-indicator">
          <span className="status-dot" /> Recording your decree…
        </div>
      )}
    </div>
  );
}
