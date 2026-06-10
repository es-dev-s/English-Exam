import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminLogin, verifyAdminSession } from '../api/client';
import {
  getAdminToken,
  setAdminSession,
  clearAdminSession,
  getStoredUsername,
} from '../utils/authStorage';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => getAdminToken());
  const [username, setUsername] = useState(() => getStoredUsername());
  const [loading, setLoading] = useState(Boolean(getAdminToken()));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    verifyAdminSession(token)
      .then((data) => {
        setUsername(data.username);
        setAdminSession(token, data.username);
      })
      .catch(() => {
        setToken(null);
        setUsername(null);
        clearAdminSession();
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (credentials) => {
    const data = await adminLogin(credentials);
    setAdminSession(data.token, data.username);
    setToken(data.token);
    setUsername(data.username);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setToken(null);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ token, username, loading, isAuthenticated: Boolean(token), login, logout }),
    [token, username, loading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
