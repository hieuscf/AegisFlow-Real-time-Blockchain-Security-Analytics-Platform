import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAuthToken, setAuthToken } from '@/lib/auth';
import type { AuthStatus } from '@/features/wallet/types';

interface AuthState {
  token: string | null;
  address: string | null;
  status: AuthStatus;
  error: string | null;
  isAuthenticated: boolean;
  setSigning: () => void;
  setSession: (token: string, address: string) => void;
  setError: (message: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      address: null,
      status: 'idle',
      error: null,
      isAuthenticated: false,

      setSigning: () => set({ status: 'signing', error: null }),

      setSession: (token, address) => {
        setAuthToken(token);
        set({
          token,
          address,
          status: 'authenticated',
          isAuthenticated: true,
          error: null,
        });
      },

      setError: (message) =>
        set({
          status: 'error',
          error: message,
          isAuthenticated: false,
        }),

      logout: () => {
        clearAuthToken();
        set({
          token: null,
          address: null,
          status: 'idle',
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null, status: 'idle' }),
    }),
    {
      name: 'aegisflow-auth',
      partialize: (state) => ({
        token: state.token,
        address: state.address,
        isAuthenticated: state.isAuthenticated,
        status: state.isAuthenticated ? ('authenticated' as const) : ('idle' as const),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
        }
      },
    },
  ),
);
