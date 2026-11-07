import { FastForward, FlaskConical } from 'lucide-react';
import { useGame } from './store';
import { t } from './i18n';
export default function TestControls() {
  const { action, busy, state } = useGame();
  return (
    <section className="test-controls" aria-label={t('Test realm')}>
      <div>
        <FlaskConical size={16} />
        <strong>{t('Test realm')}</strong>
        <span>
          {state?.productionPeriodSeconds === 1
            ? t('Resources per second')
            : t('Resources per hour')}
        </span>
      </div>
      <div>
        <span>
          <FastForward size={14} />
          {t('Advance time')}
        </span>
        {[60, 300, 3600, 21600, 86400].map((seconds, i) => (
          <button
            key={seconds}
            disabled={busy}
            onClick={() => void action({ type: 'advanceTime', seconds })}
          >
            {['+1 min', '+5 min', '+1 h', '+6 h', '+24 h'][i]}
          </button>
        ))}
      </div>
      <small>
        {t(
          'Advances production, construction, training, research and the village clock. Requirements and costs still apply.',
        )}
      </small>
    </section>
  );
}
