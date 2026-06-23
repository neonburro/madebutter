// src/context/AuthContext.jsx
// Real Supabase Auth. Tracks the session + the staff profile (display name, role).
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStaff = useCallback(async (userId) => {
    if (!userId) { setStaff(null); return; }
    const { data } = await supabase.from('staff').select('*').eq('id', userId).single();
    setStaff(data || null);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadStaff(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      loadStaff(sess?.user?.id);
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadStaff]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStaff(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      staff,
      loading,
      isStaff: !!session && !!staff,
      signIn,
      signOut,
    }),
    [session, staff, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
