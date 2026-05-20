import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
