import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getKey, setKey, publicApi } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: !!getKey(), actor: null, facilities: [], meta: null });

  const load = useCallback(async () => {
    if (!getKey()) return setState({ loading: false, actor: null, facilities: [], meta: null });
    try {
      const me = await api('/me');
      setState({ loading: false, ...me });
    } catch {
      setKey(null);
      setState({ loading: false, actor: null, facilities: [], meta: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const login = async (key) => {
    setKey(key.trim());
    const me = await api('/me').catch((e) => {
      setKey(null);
      throw e;
    });
    setState({ loading: false, ...me });
    return me;
  };
  // Username + password → short-lived session token, stored where the API key used to be.
  const loginWithPassword = async (username, password) => {
    const r = await publicApi('/login', { method: 'POST', body: { username: username.trim(), password } });
    return login(r.token);
  };
  const logout = () => {
    setKey(null);
    setState({ loading: false, actor: null, facilities: [], meta: null });
  };

  const can = (type) => {
    const a = state.actor;
    if (!a || !state.meta) return false;
    return a.role === 'admin' || state.meta.event_rules[type]?.roles.includes(a.role);
  };

  return <AuthCtx.Provider value={{ ...state, login, loginWithPassword, logout, reload: load, can }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
