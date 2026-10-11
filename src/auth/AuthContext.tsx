import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'member';
}

export interface AuthState {
  user: AuthUser | null;
  registrationOpen: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export class AuthError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.error || `Request failed (${res.status})`, data.field);
  return data;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// initial comes from the server render, so the first client render matches the SSR markup
export const AuthProvider: React.FC<{ initial: AuthState; children: React.ReactNode }> = ({ initial, children }) => {
  const [state, setState] = useState<AuthState>(initial);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await postJson('/api/auth/login', { email, password });
    setState((s) => ({ ...s, user }));
    return user as AuthUser;
  }, []);

  const register = useCallback(async (input: { name: string; email: string; phone: string; password: string }) => {
    const { user } = await postJson('/api/auth/register', input);
    setState((s) => ({ ...s, user }));
    return user as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    await postJson('/api/auth/logout', {}).catch(() => {});
    setState((s) => ({ ...s, user: null }));
  }, []);

  const value = useMemo(() => ({ ...state, login, register, logout }), [state, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
