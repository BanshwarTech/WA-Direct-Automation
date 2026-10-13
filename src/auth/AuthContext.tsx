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
  /** Paid plans are on: Pricing is visible and plan limits apply */
  plansEnabled: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Returns the user (first account, logged in) or the email a verification link was sent to */
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<{ user?: AuthUser; verificationSentTo?: string }>;
  /** Activates the account from the emailed sign-up link and logs in */
  verifyEmail: (token: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Sets a new password from an emailed reset link and logs in */
  resetPassword: (token: string, password: string) => Promise<AuthUser>;
}

export class AuthError extends Error {
  constructor(message: string, public field?: string, public data: Record<string, any> = {}) {
    super(message);
  }
}

export async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.error || `Request failed (${res.status})`, data.field, data);
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
    const data = await postJson('/api/auth/register', input);
    if (data.verificationSent) return { verificationSentTo: data.email as string };
    setState((s) => ({ ...s, user: data.user }));
    return { user: data.user as AuthUser };
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const { user } = await postJson('/api/auth/verify-email', { token });
    setState((s) => ({ ...s, user }));
    return user as AuthUser;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const { user } = await postJson('/api/auth/reset-password', { token, password });
    setState((s) => ({ ...s, user }));
    return user as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    await postJson('/api/auth/logout', {}).catch(() => {});
    setState((s) => ({ ...s, user: null }));
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, resetPassword, verifyEmail }),
    [state, login, register, logout, resetPassword, verifyEmail]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
