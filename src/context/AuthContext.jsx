/**
 * AuthContext.jsx
 * Global authentication state. Wraps the app and exposes user, login,
 * register, and logout via useAuthContext().
 *
 * On mount it calls GET /api/auth/me to restore a session from the
 * httpOnly JWT cookie (silent — no error shown if unauthenticated).
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGetMe, apiLogin, apiRegister, apiLogout } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);   // { id, username, email } or null
  const [authLoading, setAuthLoading] = useState(true); // true while bootstrapping

  // ── Bootstrap: restore session from cookie on mount ──
  useEffect(() => {
    apiGetMe()
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {}) // swallow — user is simply not logged in
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiLogin({ email, password }); // throws on error
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const data = await apiRegister({ username, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    authLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
