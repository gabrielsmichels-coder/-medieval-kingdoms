import { t } from './i18n';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { buildings } from '../shared/config';
import type { VillageState } from '../shared/engine';
const positions: Record<string, [number, number]> = {
  headquarters: [475, 252],
  timber: [195, 250],
  clay: [777, 333],
  iron: [783, 186],
  farm: [650, 408],
  warehouse: [316, 380],
  hiding: [216, 435],
  rally: [497, 421],
  barracks: [604, 226],
  smithy: [700, 285],
  stable: [346, 219],
  wall: [443, 510],
  church: [420, 131],
};
function Tree({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cy="7" rx="13" ry="5" fill="#344831" opacity=".18" />
      <path d="M-2 3v-31h4V3" fill="#776042" />
      <path d="m0-65-19 33h9l-15 22h50L10-32h9Z" fill="#476b48" />
      <path d="m0-65 2 55h23L10-32h9Z" fill="#385d40" />
      <path d="m0-65-19 33h9l-15 22h9L1-46Z" fill="#5c8054" />
    </g>
  );
}
export function BuildingArt({
  x = 0,
  y = 0,
  scale = 1,
  kind = 'house',
  level = 1,
}: {
  x?: number;
  y?: number;
  scale?: number;
  kind?: string;
  level?: number;
}) {
  const fort = ['headquarters', 'barracks', 'church', 'wall'].includes(kind),
    roof = kind === 'farm' ? '#a88747' : fort ? '#64757b' : '#aa6348';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cy="8" rx="54" ry="18" fill="#3b4b2c" opacity=".19" />
      {kind === 'farm' && (
        <g transform="translate(25 5)">
          <path d="m0 0 55-24 40 20-55 26Z" fill="#bbab57" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`m${i * 8 + 9} ${-i * 3.6 + 3} 45-20`}
              stroke="#e0ca76"
              strokeWidth="3"
            />
          ))}
        </g>
      )}
      {kind === 'iron' || kind === 'clay' ? (
        <>
          <path
            d="m-45 8 5-32 22-24 26 10 25 35-7 24Z"
            fill={kind === 'iron' ? '#8d9390' : '#b49373'}
          />
          <path d="m-18 10 0-24 12-11 16 6 8 24Z" fill="#39483b" />
          <path d="m-22 12 0-29 17-12 20 8 9 28" fill="none" stroke="#8f7152" strokeWidth="7" />
          <path d="m-6 4 32 20m-23-23 34 17" stroke="#b1aaa0" strokeWidth="3" />
          <path
            d="m-35-10 9-18 11-8m24 10 15 17"
            stroke="#ffffff"
            strokeOpacity=".18"
            strokeWidth="5"
          />
        </>
      ) : (
        <>
          <path d="m-40-20 42-20 39 22v38L0 39-40 17Z" fill={fort ? '#c3c0a7' : '#ddc5a0'} />
          <path d="M0 0v39l41-19v-38Z" fill={fort ? '#a2a58e' : '#b69f7b'} />
          <path d="m-48-21 46-43 49 45L1 3Z" fill={roof} />
          <path d="m-48-21 46-43L1 3Z" fill={fort ? '#7f8e91' : '#c37c54'} />
          <path d="M-26 21V-1l13 6v23Z" fill="#695a43" />
          <path d="m14 7 12-6v12l-12 6Z" fill="#566353" />
          <path
            d="m-29-21 27-27 29 27"
            fill="none"
            stroke="#ffffff"
            strokeOpacity=".17"
            strokeWidth="3"
          />
          {(fort || level >= 3) && (
            <>
              <path d="m-38 14-13-6v-61l15-8 15 9v62Z" fill="#c9c5ae" />
              <path d="m-38-43 17-9v62l-17 4Z" fill="#a4a792" />
              <path d="m-57-54 20-29 21 30-22 12Z" fill={roof} />
              <path d="M-40-30h5v13h-5Z" fill="#526051" />
            </>
          )}
          {kind === 'church' && <path d="M0-85v28m-9-18h18" stroke="#c9b578" strokeWidth="4" />}
          {kind === 'timber' && (
            <g stroke="#786045" strokeWidth="8">
              <path d="m-49 23 24 12m-25-20 24 12m-13-24 25 12" />
            </g>
          )}
          {kind === 'stable' && (
            <path
              d="m18 29 5-14 12-7 9 6-8 7-1 12m-12-8-3 12"
              fill="#765c42"
              stroke="#765c42"
              strokeWidth="3"
            />
          )}
          {kind === 'rally' && (
            <>
              <path d="M0 28v-91" stroke="#725b3c" strokeWidth="3" />
              <path d="M2-62h31L25-48l8 12H2Z" fill="#395d4b" />
            </>
          )}
        </>
      )}
      {level >= 5 && (
        <path d="M-36-82v-24m1 1h17l-5 9h-12" stroke="#b5975e" strokeWidth="2" fill="#48674c" />
      )}
    </g>
  );
}
export default function VillageMap({
  state,
  selected,
  onSelect,
}: {
  state: VillageState;
  selected: string;
  onSelect: (s: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="map-shell">
      <div className="map-viewport">
        <svg
          style={{ width: `${zoom * 100}%`, maxHeight: zoom > 1 ? 'none' : undefined }}
          className="village-svg"
          viewBox="0 0 1000 610"
          role="img"
          aria-label={t('Interactive isometric map of your village')}
        >
          <defs>
            <linearGradient id="ground" x2="0" y2="1">
              <stop stopColor="#a9ba7d" />
              <stop offset="1" stopColor="#829c65" />
            </linearGradient>
            <linearGradient id="river">
              <stop stopColor="#76a6a0" />
              <stop offset="1" stopColor="#a0c1b0" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="8"
                floodColor="#243e2e"
                floodOpacity=".15"
              />
            </filter>
            <pattern id="grain" width="37" height="31" patternUnits="userSpaceOnUse">
              <path d="m3 10 3-3m15 18 3-3m8-20 3 2" stroke="#456947" opacity=".17" />
            </pattern>
          </defs>
          <path d="m47 273 429-208 469 211v62L520 570 47 346Z" fill="#6b8057" />
          <path d="m47 273 429-208 469 211-425 230Z" fill="url(#ground)" filter="url(#shadow)" />
          <path d="m47 273 429-208 469 211-425 230Z" fill="url(#grain)" />
          <path
            d="M153 222q70 55 96 100t142 92q65 30 74 93l55-1q-27-85-95-116t-108-87q-37-64-108-112Z"
            fill="url(#river)"
          />
          <path
            d="M157 226q72 57 96 97t144 91q59 27 73 82"
            fill="none"
            stroke="#c6d8ad"
            strokeWidth="4"
            opacity=".55"
          />
          <g fill="none" strokeLinecap="round">
            <path
              d="m307 196 360 179m-402-6 352-177m-187 69 22 157m-105-45 382-29"
              stroke="#899767"
              strokeWidth="21"
            />
            <path
              d="m307 196 360 179m-402-6 352-177m-187 69 22 157m-105-45 382-29"
              stroke="#c7bd91"
              strokeWidth="14"
            />
            <path d="m300 357 33 18" stroke="#8f7856" strokeWidth="28" />
            <path d="m294 347 47 25m-53-15 47 25" stroke="#c6b08a" strokeWidth="3" />
          </g>
          {Array.from({ length: 45 }, (_, i) => {
            const side = i % 3;
            return (
              <Tree
                key={i}
                x={
                  side === 0
                    ? 95 + ((i * 37) % 160)
                    : side === 1
                      ? 675 + ((i * 23) % 185)
                      : 285 + ((i * 41) % 330)
                }
                y={
                  side === 0
                    ? 260 + ((i * 13) % 95)
                    : side === 1
                      ? 174 + ((i * 11) % 70)
                      : 132 + ((i * 7) % 35)
                }
                size={0.55 + (i % 4) * 0.13}
              />
            );
          })}
          <g opacity=".6" fill="#efebc4">
            {Array.from({ length: 20 }, (_, i) => (
              <ellipse
                key={i}
                cx={170 + ((i * 34) % 650)}
                cy={290 + ((i * 23) % 160)}
                rx="2"
                ry="1"
              />
            ))}
          </g>
          {Object.entries(positions)
            .sort((a, b) => a[1][1] - b[1][1])
            .map(([key, [x, y]]) => {
              const level = state.buildings[key];
              return (
                <g
                  key={key}
                  className={`map-building ${selected === key ? 'selected' : ''} ${level === 0 ? 'unbuilt' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={t(`${buildings[key].name}, level ${level}`)}
                  onClick={() => onSelect(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(key);
                    }
                  }}
                >
                  <ellipse className="selection-ring" cx={x} cy={y + 13} rx="67" ry="28" />
                  {level > 0 ? (
                    <BuildingArt
                      x={x}
                      y={y}
                      scale={key === 'headquarters' ? 1.25 : key === 'church' ? 0.8 : 0.82}
                      kind={key}
                      level={level}
                    />
                  ) : (
                    <g transform={`translate(${x} ${y})`}>
                      <path
                        d="m-32 0 33-15 34 16L1 17Z"
                        fill="#9b9e7a"
                        stroke="#d5cfab"
                        strokeDasharray="4 3"
                      />
                      <path d="M-8-7h16M0-15V1" stroke="#f1e9cc" strokeWidth="2" />
                    </g>
                  )}
                  <g
                    className="building-label"
                    transform={`translate(${x} ${y + (key === 'headquarters' ? 60 : 43)})`}
                  >
                    <rect
                      x={-t(buildings[key].name).length * 3.2 - 13}
                      y="-12"
                      width={t(buildings[key].name).length * 6.4 + 26}
                      height="23"
                      rx="5"
                      fill={selected === key ? '#304f3e' : '#f4eedb'}
                      stroke={selected === key ? '#cbb273' : '#bfb994'}
                    />
                    <text
                      textAnchor="middle"
                      dy="3"
                      fill={selected === key ? '#fff6dc' : '#3f4936'}
                      fontSize="10"
                      fontFamily="system-ui"
                      fontWeight="600"
                    >
                      {t(buildings[key].name)} {t(level > 0 ? `· ${level}` : '+')}
                    </text>
                  </g>
                </g>
              );
            })}
          <g transform="translate(883 457)" stroke="#6e805f" fill="none">
            <circle r="29" />
            <path d="M0-35v70m-35-35h70m-12-22L22 22m-44 0 44-44" strokeWidth=".6" />
            <path d="m0-24 6 24-6 24-6-24Z" fill="#e0d9ac" />
            <path d="m0-24 6 24H0Z" fill="#536d4d" />
            <text y="-42" textAnchor="middle" fill="#526649" stroke="none" fontSize="11">
              {t('N')}
            </text>
          </g>
        </svg>
      </div>
      <div className="map-zoom">
        <button
          onClick={() => setZoom(Math.max(1, +(zoom - 0.4).toFixed(1)))}
          disabled={zoom <= 1}
          aria-label={t('Zoom out village map')}
        >
          <Minus size={13} />
        </button>
        <span>
          {Math.round(zoom * 100)}
          {'%'}
        </span>
        <button
          onClick={() => setZoom(Math.min(2.2, +(zoom + 0.4).toFixed(1)))}
          disabled={zoom >= 2.2}
          aria-label={t('Zoom in village map')}
        >
          <Plus size={13} />
        </button>
      </div>
      <div className="map-caption">
        <span className="status-dot" />
        {t(' A living village. A growing legacy.')}
      </div>
      <div className="map-coordinate">
        {t('OAKHEART VALLEY ')}
        <span>{'482 | 517'}</span>
      </div>
    </div>
  );
}
