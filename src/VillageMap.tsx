import { useState } from 'react';
import { Plus, Minus, Sun, CloudRain } from 'lucide-react';
import { t } from './i18n';
import { buildings } from '../shared/config';
import { buildingTier, worldAt } from '../shared/world';
import type { VillageState } from '../shared/engine';
const positions: Record<string, [number, number]> = {
  headquarters: [505, 205],
  church: [690, 165],
  iron: [865, 220],
  timber: [160, 245],
  stable: [315, 185],
  barracks: [745, 365],
  smithy: [865, 495],
  clay: [150, 440],
  warehouse: [330, 505],
  farm: [580, 550],
  hiding: [160, 590],
  rally: [515, 390],
  wall: [720, 610],
};
function Tree({
  x,
  y,
  size = 1,
  index = 0,
}: {
  x: number;
  y: number;
  size?: number;
  index?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cy="8" rx="19" ry="7" fill="#203a1e" opacity=".22" />
      <path d="M-3 6 0-46 5 5" fill="#6c5030" />
      <g className="tree-crown" style={{ animationDelay: `-${index % 8}s` }}>
        <path
          d="M0-83-22-49h9l-17 30h12L-31-2Q0 13 30-2L17-19h12L13-49h9Z"
          fill={index % 2 ? '#315e37' : '#3f6a39'}
        />
        <path d="M0-83-22-49h9l-17 30h12L-31-2-15 2 2-41Z" fill="#6c8c48" opacity=".65" />
        <path
          d="m0-61 15 16m-19 18 21 13m-27-8-12 10"
          stroke="#8ea260"
          opacity=".25"
          strokeWidth="2"
        />
      </g>
    </g>
  );
}
function Banner({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 10v-46" stroke="#5e4830" strokeWidth="2" />
      <g className="banner-cloth">
        <path
          d="M1-36Q16-42 29-35L23-25l5 9Q14-23 1-17Z"
          fill="#315b6b"
          stroke="#cfad62"
          strokeWidth="1"
        />
        <path d="m11-33 5 10 5-10" fill="none" stroke="#d2ba76" strokeWidth="2" />
      </g>
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
  const tier = buildingTier(level),
    stone = tier >= 2 || ['church', 'wall'].includes(kind),
    royal = tier >= 4,
    roof =
      tier === 0
        ? '#b99650'
        : tier === 1
          ? '#ad7044'
          : tier === 2
            ? '#965a43'
            : tier === 3
              ? '#586c72'
              : tier === 4
                ? '#435b71'
                : tier === 5
                  ? '#354d62'
                  : '#34475c';
  const wall = stone ? '#c7c3ad' : '#e0ce9d',
    side = stone ? '#969b90' : '#ad956c';
  const tower = (tx: number, ty: number) => (
    <g transform={`translate(${tx} ${ty})`}>
      <path d="M-15-7 0-15 16-7v56L0 57-15 49Z" fill={wall} />
      <path d="M0 1 16-7v56L0 57Z" fill={side} />
      <path d="m-20-9 20-34 21 34L0 1Z" fill={roof} />
      <path d="M-7 7h4v13h-4m10-3 5-2v12l-5 2" stroke="#4a5146" strokeWidth="3" />
      <path d="m-12 32 12 6 13-6m-24 10 11 5" stroke="#7d8275" fill="none" opacity=".5" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} data-tier={tier}>
      <ellipse cy="20" rx="67" ry="24" fill="#29371d" opacity=".24" />
      {kind === 'wall' ? (
        <>
          <path
            d="m-70 12 41-20 30 15 37-18 35 18v29L36 53-1 36-29 50-70 30Z"
            fill={wall}
            stroke="#7d8375"
            strokeWidth="2"
          />
          {[-60, -38, -16, 6, 28, 50].map((v, i) => (
            <path
              key={v}
              d={`m${v} ${i % 2 ? 12 : 8}v-13l8-4v13`}
              stroke="#b9b8a1"
              strokeWidth="8"
            />
          ))}
          <path d="M-14 37V17Q0 0 14 17v20" fill="#4c4b39" />
          {tier >= 1 && tower(-56, -31)}
          {tier >= 3 && tower(55, -32)}
        </>
      ) : kind === 'iron' || kind === 'clay' ? (
        <>
          <path
            d="m-65 18 10-40 22-30 29-12 41 16 27 51-24 30Z"
            fill={kind === 'iron' ? '#868b7e' : '#ac8760'}
          />
          <path
            d="m-53-4 29-38 17 14 14-25 27 23 16 30"
            fill="none"
            stroke={kind === 'iron' ? '#a5aa99' : '#c9a17a'}
            strokeWidth="7"
          />
          <path d="M-24 22V-5Q0-35 26-5v27Z" fill="#28342b" />
          <path
            d="M-29 26V-7Q0-42 31-7v30"
            fill="none"
            stroke={stone ? '#c7c0a4' : '#755936'}
            strokeWidth={8 + tier}
          />
          <path d="m-10 17 40 28m-25-31 44 27" stroke="#b7ac8b" strokeWidth="3" />
          {Array.from({ length: tier + 1 }, (_, i) => (
            <g key={i} transform={`translate(${-53 + i * 17} 28)`}>
              <path d="m-9 0 7-9 12 3 2 10-11 5Z" fill={kind === 'iron' ? '#5d6c69' : '#ba764e'} />
            </g>
          ))}
          {tier >= 2 && (
            <g transform="translate(45 -28)">
              <path
                d="M0 35V-25M-18 36v-61M-20-25H5M-15-17l15 15m-15 5L0 18"
                stroke="#715c3b"
                strokeWidth="4"
              />
              <circle cy="-22" r="10" fill="none" stroke="#bdac7c" strokeWidth="3" />
            </g>
          )}
        </>
      ) : kind === 'rally' ? (
        <>
          <ellipse cy="15" rx="45" ry="22" fill="#c8bc8e" stroke="#ab9c76" strokeWidth="3" />
          <Banner x={-24} y={-8} />
          <Banner x={22} y={-8} />
          <path d="m-28 22 8-21h42l9 21Z" fill="#8d9b8c" />
          <path d="M-18 4h35v18h-35Z" fill="#c9cfb5" />
          <path d="M0 1v21" stroke="#a29f83" />
        </>
      ) : (
        <>
          {tier >= 3 && tower(-45, -48)}
          {tier >= 5 && (
            <g transform="translate(45 -4)">
              <path d="m-15 0 18-9 25 13v38L3 53-15 43Z" fill={wall} />
              <path d="m-22 0 22-30 36 33-32 15Z" fill={roof} />
            </g>
          )}
          <path d="m-48-21 48-23 49 24v49L0 53-48 29Z" fill={wall} stroke="#625d4025" />
          <path d="M0 2 49-20v49L0 53Z" fill={side} />
          {stone ? (
            Array.from({ length: 5 }, (_, i) => (
              <g key={i} stroke="#737e704d" fill="none">
                <path d={`m-45 ${-10 + i * 10} 45 22 45-22`} />
                <path d={`m${-36 + (i % 2) * 10} ${-14 + i * 10}v8m24 5v8m37-4v8`} />
              </g>
            ))
          ) : (
            <g stroke="#6b5334" strokeWidth="4">
              <path d="M-44-17v44M-25-28v65M-3-36v85M20-27v67M44-17v44" />
              <path d="m-45 8 42 20L45 6m-87-18 39 38m9 5 34-39" />
            </g>
          )}
          <path d="m-58-21 55-45 62 46L0 6Z" fill={roof} stroke="#544a3477" strokeWidth="1.5" />
          <path d="m-58-21 55-45L0 6Z" fill="#f4cf7a" opacity=".18" />
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d={`m${-51 + i * 7} ${-23 - i * 5} ${48 - i * 6} ${24 - i * 3}`}
              stroke="#f1dfae"
              opacity=".22"
              strokeWidth="2"
            />
          ))}
          <path d="m-34 39 0-24q8-12 16 7v25Z" fill="#554831" stroke="#b69a65" strokeWidth="2" />
          {[-8, 17, 35].map((v, i) => (
            <g key={v}>
              <path d={`m${v} ${i ? 9 : 0} 8-4v13l-8 4Z`} fill="#313d36" />
              <path
                className="lit-window"
                d={`m${v + 1} ${i ? 10 : 1} 6-3v10l-6 3Z`}
                fill="#ffd57d"
              />
              <path d={`m${v + 4} ${i ? 6 : -3}v16`} stroke="#776446" strokeWidth="1.5" />
            </g>
          ))}
          {kind === 'headquarters' && (
            <>
              <path d="M-3-63v-14" stroke="#b8a267" strokeWidth="2" />
              <Banner x={-3} y={-52} />
            </>
          )}
          {kind === 'church' && (
            <>
              {tower(23, -78)}
              <path d="M23-126v25m-8-15h16" stroke="#d2bc7c" strokeWidth="3" />
            </>
          )}
          {['smithy', 'barracks'].includes(kind) && (
            <g>
              <path d="m30-43 0-27 12-4v35Z" fill="#8d8e7a" />
              <g className="chimney-smoke">
                <circle cx="36" cy="-86" r="8" fill="#d0c9ad" opacity=".35" />
                <circle cx="40" cy="-102" r="11" fill="#d0c9ad" opacity=".18" />
              </g>
            </g>
          )}
          {kind === 'farm' && (
            <g transform="translate(58 28)">
              <path d="m0-8 38-21 38 16-40 23Z" fill="#927442" />
              {Array.from({ length: 6 }, (_, i) => (
                <path
                  key={i}
                  d={`m${i * 5} ${-5 - i * 3} 35 14`}
                  stroke="#d5b95d"
                  strokeWidth="3"
                />
              ))}
            </g>
          )}
          {['warehouse', 'timber'].includes(kind) && (
            <g stroke="#604b2e" strokeWidth="1.5">
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${-64 + i * 12} ${36 + i * 2})`}>
                  <path d="m0-8 20-8 11 6-21 9v8L0 0Z" fill="#9c7545" />
                  <ellipse cx="2" cy="-4" rx="4" ry="5" fill="#c7a366" />
                </g>
              ))}
            </g>
          )}
          {kind === 'stable' && (
            <g transform="translate(52 30)">
              <path
                d="m-13 0 5-16 20-1 8 12-7 9-3-10-15 5-2 14m18-16 3 15"
                fill="#715036"
                stroke="#55432b"
                strokeWidth="3"
              />
              <path d="m10-17 8-15 9 6-6 13" fill="#715036" />
            </g>
          )}
          {royal && tower(46, -46)}
          {tier >= 1 && <Banner x={-50} y={9} />}
          {tier >= 6 && (
            <>
              <path d="m-20-57 5-16 11 8 10-9 7 19Z" fill="#d2b963" stroke="#f2de8f" />
              <path d="M-35-27 0-44 35-27" fill="none" stroke="#d4bd73" strokeWidth="3" />
            </>
          )}
        </>
      )}
    </g>
  );
}
function Flame({ x, y, large = false }: { x: number; y: number; large?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} className="village-fire">
      <ellipse cy="-8" rx={large ? 42 : 29} ry={large ? 33 : 23} fill="url(#fireGlow)" />
      <path d="M0 4V-9" stroke="#594229" strokeWidth="3" />
      <g className="flame-flicker">
        <path d="M-5-8Q-9-16 0-26q-2 9 4 9Q12-7 0-5Z" fill="#f5a943" />
        <path d="M-2-7Q-5-12 1-19q7 13-3 12" fill="#ffe3a0" />
      </g>
    </g>
  );
}
function NPC({ i }: { i: number }) {
  const soldier = i % 3 === 0;
  return (
    <g className="village-npc" aria-label={t(soldier ? 'Soldier' : 'Farmer')}>
      <animateMotion
        dur={`${29 + i * 5}s`}
        repeatCount="indefinite"
        begin={`${-i * 7}s`}
        path={
          [
            'M240 350Q380 328 493 348T760 348Q590 385 493 348T240 350',
            'M490 225Q470 320 490 360T568 530Q500 450 490 360T490 225',
            'M330 505Q380 420 490 360T700 190Q650 300 490 360T330 505',
          ][i % 3]
        }
      />
      <ellipse cy="2" rx="6" ry="2" fill="#243d22" opacity=".3" />
      <g className="npc-steps">
        <path d="M-2-3-4 2m6-5 3 5" stroke="#544a35" strokeWidth="2" />
      </g>
      <path
        d="m-5-13 5-3 5 3-1 10h-8Z"
        fill={soldier ? '#82918d' : i % 2 ? '#a58d52' : '#727e4a'}
      />
      <circle cy="-19" r="4" fill="#d2ad7b" />
      {soldier ? (
        <>
          <path d="M-5-20q0-9 10 0Z" fill="#a0aaa2" />
          <path d="M7-15V0" stroke="#b8bdb0" strokeWidth="1.5" />
          <path d="m-7-13-4 3 1 7 5-4Z" fill="#476b70" stroke="#c2ae70" />
        </>
      ) : (
        <>
          <ellipse cy="-22" rx="7" ry="2" fill="#c7b16b" />
          <path d="m-4-22 1-4h5l2 4" fill="#a48a50" />
          <path d="M7-12 10-2" stroke="#8a6b3e" strokeWidth="2" />
        </>
      )}
    </g>
  );
}
export default function VillageMap({
  state,
  selected,
  onSelect,
  now = Date.now(),
}: {
  state: VillageState;
  selected: string;
  onSelect: (s: string) => void;
  now?: number;
}) {
  const [zoom, setZoom] = useState(1),
    [labels, setLabels] = useState(false),
    [sites, setSites] = useState(false),
    [phase, setPhase] = useState('Auto'),
    [weather, setWeather] = useState('Auto');
  const world = worldAt(
      now,
      state.worldEpoch ?? state.reports.find((r) => r.id === 'welcome')?.time ?? now,
    ),
    period = phase === 'Auto' ? world.phase : phase,
    rain = weather === 'Auto' ? world.rain : weather === 'Rain';
  const dark = period === 'Night' || period === 'Dusk' || rain,
    displayHour =
      phase === 'Auto' ? world.hour : ({ Morning: 8, Day: 13, Dusk: 18, Night: 22 }[phase] ?? 8),
    hour = Math.floor(displayHour),
    minute = Math.floor((displayHour % 1) * 60);
  const visible = Object.entries(positions).filter(
    ([key]) =>
      state.buildings[key] > 0 ||
      sites ||
      state.jobs.some((j) => j.key === key && j.lane === 'construction'),
  );
  return (
    <div className={`living-village phase-${period.toLowerCase()} ${rain ? 'is-raining' : ''}`}>
      <div className="world-toolbar">
        <span>
          <Sun size={15} />
          {t(period)}{' '}
          <b>
            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
          </b>
        </span>
        <div>
          <select
            aria-label={t('Lighting')}
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
          >
            {['Auto', 'Morning', 'Day', 'Dusk', 'Night'].map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </select>
          <select
            aria-label={t('Weather')}
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          >
            {['Auto', 'Clear', 'Rain'].map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="map-shell">
        <div className="map-viewport">
          <svg
            className="village-svg living-svg"
            viewBox="0 0 1000 680"
            style={{ width: `${zoom * 100}%`, maxHeight: zoom > 1 ? 'none' : undefined }}
            role="img"
            aria-label={t('Interactive isometric map of your village')}
          >
            <defs>
              <radialGradient id="meadow">
                <stop stopColor="#82934c" />
                <stop offset="1" stopColor="#435f36" />
              </radialGradient>
              <radialGradient id="fireGlow">
                <stop stopColor="#ffbf56" stopOpacity=".7" />
                <stop offset=".5" stopColor="#f7a33b" stopOpacity=".23" />
                <stop offset="1" stopColor="#ffb644" stopOpacity="0" />
              </radialGradient>
              <pattern id="grass" width="49" height="41" patternUnits="userSpaceOnUse">
                <path
                  d="m4 9 2-4 3 4m18 17 3-4 2 4m12-11 2-3"
                  stroke="#b1b775"
                  strokeWidth="1"
                  opacity=".25"
                />
                <circle cx="15" cy="37" r="1.4" fill="#364f2e" opacity=".4" />
              </pattern>
            </defs>
            <g className="landscape">
              <rect width="1000" height="680" fill="url(#meadow)" />
              <rect width="1000" height="680" fill="url(#grass)" />
              <path
                d="M-20 640Q150 515 148 455T248 351Q340 316 495 350T1015 345M505 0Q553 135 505 205T495 350Q490 451 590 695M-20 80Q190 85 315 185T495 350Q610 300 690 165T1020 65M330 505 495 350 865 495"
                stroke="#5b6436"
                strokeWidth="25"
                fill="none"
              />
              <path
                d="M-20 640Q150 515 148 455T248 351Q340 316 495 350T1015 345M505 0Q553 135 505 205T495 350Q490 451 590 695M-20 80Q190 85 315 185T495 350Q610 300 690 165T1020 65M330 505 495 350 865 495"
                stroke="#b5a071"
                strokeWidth="19"
                fill="none"
              />
              <ellipse cx="495" cy="350" rx="112" ry="53" fill="#c2ae7d" />
              <ellipse
                cx="495"
                cy="350"
                rx="105"
                ry="47"
                fill="#bdac7f"
                stroke="#d0bd8e"
                strokeDasharray="2 9"
              />
              {Array.from({ length: 66 }, (_, i) => {
                const top = i < 24;
                const x = top
                  ? (i * 53 + 17) % 1000
                  : i < 45
                    ? (i * 37) % 75
                    : 930 + ((i * 29) % 65);
                const y = top ? 40 + ((i * 19) % 65) : 90 + ((i * 31) % 560);
                return <Tree key={i} x={x} y={y} size={0.55 + (i % 4) * 0.12} index={i} />;
              })}
              <g transform="translate(570 475)">
                <path d="m0 0 104-42 90 40-104 46Z" fill="#7d6437" />
                {Array.from({ length: 11 }, (_, i) => (
                  <path
                    key={i}
                    d={`m${i * 8} ${-i * 3.5} 82 39`}
                    stroke="#b4a052"
                    strokeWidth="4"
                  />
                ))}
                <path d="m-9 3 103 49 108-48" fill="none" stroke="#99845a" strokeWidth="3" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <path
                    key={i}
                    d={`m${i * 19} ${i * 9 + 9}v-13`}
                    stroke="#c7b489"
                    strokeWidth="3"
                  />
                ))}
              </g>
              <g transform="translate(457 348)">
                <ellipse cy="9" rx="22" ry="12" fill="#867e5d" />
                <path d="M-20-3v13q20 17 40 0V-3Z" fill="#959b87" />
                <ellipse cy="-3" rx="20" ry="11" fill="#c2c3a4" />
                <ellipse cy="-3" rx="13" ry="6" fill="#334e4e" />
                <path
                  d="M-17-8v-31m34 32v-31m-40 0 23-19 24 19Z"
                  fill="#785d39"
                  stroke="#715633"
                  strokeWidth="3"
                />
              </g>
              <Banner x={536} y={350} />
              {Array.from({ length: 14 }, (_, i) => (
                <g
                  key={i}
                  transform={`translate(${90 + ((i * 67) % 850)} ${120 + ((i * 83) % 480)})`}
                >
                  <path d="m-9 3 5-10 9 1 6 9-10 5Z" fill="#939b7c" />
                  <path d="m-4-7 3 7 7-6" stroke="#b1b89a" fill="none" />
                </g>
              ))}
              {visible
                .sort((a, b) => a[1][1] - b[1][1])
                .map(([key, [x, y]]) => {
                  const level = state.buildings[key],
                    constructing = state.jobs.some(
                      (j) => j.key === key && j.lane === 'construction',
                    );
                  return (
                    <g
                      key={key}
                      className={`map-building ${selected === key ? 'selected' : ''} ${labels ? 'show-label' : ''}`}
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
                      <ellipse className="selection-ring" cx={x} cy={y + 20} rx="74" ry="30" />
                      {level > 0 ? (
                        <BuildingArt
                          x={x}
                          y={y}
                          kind={key}
                          level={level}
                          scale={0.84 + buildingTier(level) * 0.035}
                        />
                      ) : (
                        <g transform={`translate(${x} ${y})`}>
                          <path
                            d="m-37 0 37-18 37 18-37 18Z"
                            fill="#7f7a52"
                            stroke="#d6bd83"
                            strokeDasharray="5 3"
                          />
                          <path d="M-20 0h40m-20-10v20" stroke="#cabc88" />
                        </g>
                      )}
                      {constructing && (
                        <g
                          className="construction-spark"
                          transform={`translate(${x + 45} ${y - 50})`}
                        >
                          <path d="M-10 0H10M0-10v20" stroke="#edd08c" strokeWidth="3" />
                        </g>
                      )}
                      <g className="building-label" transform={`translate(${x} ${y + 63})`}>
                        <rect
                          x={-t(buildings[key].name).length * 3.6 - 23}
                          y="-14"
                          width={t(buildings[key].name).length * 7.2 + 46}
                          height="25"
                          rx="4"
                          fill="#f0e5c5"
                          stroke="#867b53"
                        />
                        <text
                          textAnchor="middle"
                          dy="3"
                          fill="#374532"
                          fontSize="11"
                          fontFamily="system-ui"
                        >
                          {t(buildings[key].name)} · {level}
                        </text>
                      </g>
                    </g>
                  );
                })}
              {Array.from({ length: 8 }, (_, i) => (
                <NPC key={i} i={i} />
              ))}
            </g>
            <rect
              className="atmosphere-tint"
              width="1000"
              height="680"
              fill={
                period === 'Night'
                  ? '#10223f'
                  : period === 'Dusk'
                    ? '#a44a29'
                    : period === 'Morning'
                      ? '#edc582'
                      : 'transparent'
              }
              opacity={
                period === 'Night'
                  ? 0.38
                  : period === 'Dusk'
                    ? 0.18
                    : period === 'Morning'
                      ? 0.09
                      : 0
              }
              pointerEvents="none"
            />
            {dark && (
              <g className="night-lights" pointerEvents="none">
                {visible
                  .filter(([key]) => state.buildings[key] > 0)
                  .map(([key, [x, y]]) => (
                    <Flame key={key} x={x - 35} y={y + 25} />
                  ))}
                <Flame x={550} y={375} large />
                <Flame x={395} y={330} />
                <g transform="translate(550 380)">
                  <path d="m-12 1 24-5m-22-3 21 9" stroke="#6b4b2b" strokeWidth="4" />
                </g>
              </g>
            )}
            {rain && (
              <g className="rain-layer" pointerEvents="none">
                {Array.from({ length: 90 }, (_, i) => (
                  <path
                    className="rain-drop"
                    key={i}
                    d={`m${((i * 83) % 1080) - 40} ${((i * 53) % 720) - 40} -8 23`}
                    stroke="#cfdfd7"
                    opacity={0.2 + (i % 3) * 0.1}
                    strokeWidth="1.3"
                    style={{ animationDelay: `-${(i % 13) * 0.13}s` }}
                  />
                ))}
              </g>
            )}
          </svg>
        </div>
        <div className="map-zoom">
          <button
            aria-label={t('Zoom out village map')}
            disabled={zoom <= 1}
            onClick={() => setZoom(Math.max(1, +(zoom - 0.4).toFixed(1)))}
          >
            <Minus size={13} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            aria-label={t('Zoom in village map')}
            disabled={zoom >= 2.2}
            onClick={() => setZoom(Math.min(2.2, +(zoom + 0.4).toFixed(1)))}
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="weather-badge">
          {rain ? <CloudRain size={13} /> : <Sun size={13} />} {t(rain ? 'Rain' : 'Clear')}
        </div>
      </div>
      <div className="world-options">
        <label>
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
          {t('Building names')}
        </label>
        <label>
          <input type="checkbox" checked={sites} onChange={(e) => setSites(e.target.checked)} />
          {t('Construction sites')}
        </label>
        <span>{t('Visual upgrades every 5 levels')}</span>
      </div>
    </div>
  );
}
