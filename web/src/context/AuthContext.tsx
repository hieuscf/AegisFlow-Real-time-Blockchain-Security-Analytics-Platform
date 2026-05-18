import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  address: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  setSession: (token: string, address: string) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'aegisflow_token';
const ADDRESS_KEY = 'aegisflow_address';

function readStoredSession(): AuthState {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    address: localStorage.getItem(ADDRESS_KEY),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthState>(readStoredSession);

  const setSession = useCallback((token: string, address: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADDRESS_KEY, address);
    setSessionState({ token, address });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADDRESS_KEY);
    setSessionState({ token: null, address: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token),
      setSession,
      clearSession,
    }),
    [session, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
