import { t, locale } from './i18n';
import { useState } from 'react';
import { Check, Flag, Lock, Swords, Package, Clock } from 'lucide-react';
import { units } from '../shared/config';
import { troopStats, type VillageState } from '../shared/engine';
import { useGame } from './store';
export default function ArmyPlanner({ state }: { state: VillageState }) {
  const [plan, setPlan] = useState<Record<string, number>>(state.armyPlan || {});
  const [saved, setSaved] = useState(false);
  const { action, busy } = useGame();
  const unlocked = state.buildings.rally > 0;
  const totals = Object.keys(units).reduce(
    (sum, key) => {
      const q = plan[key] || 0,
        stats = troopStats(state, key);
      return {
        count: sum.count + q,
        attack: sum.attack + stats.attack * q,
        carry: sum.carry + stats.carry * q,
        speed: q ? Math.max(sum.speed, stats.speed) : sum.speed,
      };
    },
    { count: 0, attack: 0, carry: 0, speed: 0 },
  );
  return (
    <form
      className="panel army-planner"
      onSubmit={(e) => {
        e.preventDefault();
        void action({ type: 'formation', formation: plan }).then((ok) => setSaved(ok));
      }}
    >
      <div className="card-heading">
        <h3>
          <Flag size={17} />
          {t('Army muster plan')}
        </h3>
        <span>
          {totals.count}
          {t(' selected')}
        </span>
      </div>
      <p>
        {t(
          'Organize a company for future expeditions. Saving a plan keeps your troops stationed safely at home.',
        )}
      </p>
      <div className="army-selection">
        {Object.entries(units).map(([key, unit]) => (
          <label key={key}>
            <span>
              {t(unit.name)}
              <small>
                {state.troops[key]}
                {t(' available')}
              </small>
            </span>
            <input
              aria-label={t(`Muster ${unit.name}`)}
              type="number"
              min="0"
              max={state.troops[key]}
              disabled={!unlocked}
              value={plan[key] || 0}
              onChange={(e) => {
                setSaved(false);
                setPlan({
                  ...plan,
                  [key]: Math.max(
                    0,
                    Math.min(state.troops[key], Math.floor(Number(e.target.value) || 0)),
                  ),
                });
              }}
            />
          </label>
        ))}
      </div>
      <div className="army-totals">
        <span>
          <Swords size={15} />
          {t(totals.attack.toLocaleString(locale()))}
          {t(' attack')}
        </span>
        <span>
          <Package size={15} />
          {t(totals.carry.toLocaleString(locale()))}
          {t(' carrying capacity')}
        </span>
        <span>
          <Clock size={15} />
          {t(totals.speed ? `${totals.speed} min / tile` : 'No troops selected')}
        </span>
      </div>
      <button className="primary-button" disabled={busy || !unlocked}>
        {!unlocked ? (
          <>
            <Lock size={14} />
            {t('Rally Point required')}
          </>
        ) : saved ? (
          <>
            <Check size={14} />
            {t('Muster plan saved')}
          </>
        ) : (
          <>
            <Flag size={14} />
            {t('Save muster plan')}
          </>
        )}
      </button>
    </form>
  );
}
