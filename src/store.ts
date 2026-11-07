import { create } from 'zustand';
import type { Action, VillageState } from '../shared/engine';
type Store = {
  state: VillageState | null;
  speed: number;
  offset: number;
  error: string;
  busy: boolean;
  load: () => Promise<void>;
  action: (a: Omit<Action, 'requestId'>) => Promise<boolean>;
  clear: () => void;
};
let generation = 0;
export const useGame = create<Store>((set, get) => ({
  state: null,
  speed: 1,
  offset: 0,
  error: '',
  busy: false,
  clear: () => set({ error: '' }),
  load: async () => {
    const revision = generation;
    try {
      const r = await fetch('/api/state');
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (revision === generation && !get().busy)
        set({ state: data.state, speed: data.speed, offset: data.state.lastUpdate - Date.now() });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
  action: async (a) => {
    if (get().busy) return false;
    generation++;
    set({ busy: true, error: '' });
    try {
      const r = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, requestId: crypto.randomUUID() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      generation++;
      set({
        state: data.state,
        speed: data.speed,
        offset: data.state.lastUpdate - Date.now(),
        busy: false,
      });
      return true;
    } catch (e) {
      generation++;
      set({ busy: false, error: (e as Error).message });
      return false;
    }
  },
}));
