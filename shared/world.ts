export const worldConfig = { daySeconds: 720, weatherSeconds: 120 };
export function buildingTier(level: number) {
  return Math.min(6, Math.max(0, Math.floor(level / 5)));
}
export function worldAt(now: number, epoch: number) {
  const elapsed = Math.max(0, now - epoch) / 1000;
  const hour = (8 + (elapsed / worldConfig.daySeconds) * 24) % 24;
  const phase =
    hour >= 5 && hour < 10
      ? 'Morning'
      : hour >= 10 && hour < 17
        ? 'Day'
        : hour >= 17 && hour < 20
          ? 'Dusk'
          : 'Night';
  return { hour, phase, rain: Math.floor(elapsed / worldConfig.weatherSeconds) % 5 === 2 };
}
