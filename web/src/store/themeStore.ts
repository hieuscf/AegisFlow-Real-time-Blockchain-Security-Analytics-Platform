import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

function applyThemeClass(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      setMode: (mode) => {
        applyThemeClass(mode);
        set({ mode });
      },
      toggleMode: () => {
        const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
        applyThemeClass(next);
        set({ mode: next });
      },
    }),
    {
      name: 'aegisflow-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.mode);
        }
      },
    },
  ),
);

applyThemeClass('dark');
