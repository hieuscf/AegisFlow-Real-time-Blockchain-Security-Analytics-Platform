import { create } from 'zustand';
import type { SecurityAlert } from '@/types/alert';
import type { PriceUpdatePayload } from '@/types/blockchain';
import type { WebSocketStatus } from '@/types';

const MAX_ALERTS = 20;
const MAX_PRICE_UPDATES = 200;

interface WebSocketState {
  status: WebSocketStatus;
  lastConnectedAt: string | null;
  errorMessage: string | null;
  alerts: SecurityAlert[];
  priceUpdates: PriceUpdatePayload[];
  setStatus: (status: WebSocketStatus) => void;
  setError: (message: string | null) => void;
  markConnected: () => void;
  markDisconnected: () => void;
  pushAlert: (alert: SecurityAlert) => void;
  setAlerts: (alerts: SecurityAlert[]) => void;
  clearAlerts: () => void;
  pushPriceUpdate: (update: PriceUpdatePayload) => void;
  clearPriceUpdates: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: 'idle',
  lastConnectedAt: null,
  errorMessage: null,
  alerts: [],
  priceUpdates: [],

  setStatus: (status) => set({ status }),

  setError: (errorMessage) => set({ errorMessage, status: errorMessage ? 'error' : 'idle' }),

  markConnected: () =>
    set({
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      errorMessage: null,
    }),

  markDisconnected: () =>
    set({
      status: 'disconnected',
    }),

  pushAlert: (alert) =>
    set((state) => {
      if (state.alerts.some((existing) => existing.id === alert.id)) {
        return state;
      }
      return {
        alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS),
      };
    }),

  setAlerts: (alerts) => set({ alerts: alerts.slice(0, MAX_ALERTS) }),

  clearAlerts: () => set({ alerts: [] }),

  pushPriceUpdate: (update) =>
    set((state) => ({
      priceUpdates: [update, ...state.priceUpdates].slice(0, MAX_PRICE_UPDATES),
    })),

  clearPriceUpdates: () => set({ priceUpdates: [] }),
}));
