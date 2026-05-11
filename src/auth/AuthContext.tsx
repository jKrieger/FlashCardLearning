import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import { db } from '../db/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

const FRESH_LOGIN_KEY = 'fc-fresh-login';

async function clearLocalCache(): Promise<void> {
  try {
    await Promise.all(db.tables.map((t) => t.clear()));
  } catch {
    // ignore — Dexie kann beim ersten Aufruf noch nicht initialisiert sein
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' && sessionStorage.getItem(FRESH_LOGIN_KEY) === '1') {
        sessionStorage.removeItem(FRESH_LOGIN_KEY);
        void clearLocalCache();
      }
      if (event === 'SIGNED_OUT') {
        void clearLocalCache();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signIn(email, password) {
        sessionStorage.setItem(FRESH_LOGIN_KEY, '1');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          sessionStorage.removeItem(FRESH_LOGIN_KEY);
          throw error;
        }
      },
      async signUp(email, password) {
        sessionStorage.setItem(FRESH_LOGIN_KEY, '1');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          sessionStorage.removeItem(FRESH_LOGIN_KEY);
          throw error;
        }
        return { needsConfirmation: !data.session };
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
      }
    }),
    [session, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
