// src/context/CustomerAuthContext.jsx
// Customer-facing auth, fully separate from staff/admin AuthContext. Same Supabase
// Auth backend, but tracks the customer's row in `customers` (not `staff`). A
// customer is "recognized" when signed in AND has (or claims) a customers row.
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = useCallback(async (user) => {
    if (!user) { setCustomer(null); return; }
    const { data: staffRow } = await supabase.from('staff').select('id').eq('id', user.id).maybeSingle();
    if (staffRow) { setCustomer(null); return; }

    let { data: row } = await supabase.from('customers').select('*').eq('auth_user_id', user.id).maybeSingle();
    if (!row) {
      const { data: created } = await supabase
        .from('customers')
        .insert({ auth_user_id: user.id, email: user.email, name: user.user_metadata?.name || null })
        .select('*')
        .single();
      row = created || null;
    }
    setCustomer(row);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadCustomer(data.session?.user).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      loadCustomer(sess?.user);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadCustomer]);

  const signUp = useCallback(async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/account/`,
      },
    });
    return error;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  }, []);

  const sendReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset/`,
    });
    return error;
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error;
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!customer) return 'Not signed in';
    const { error } = await supabase.from('customers').update(patch).eq('id', customer.id);
    if (!error) setCustomer((c) => ({ ...c, ...patch }));
    return error;
  }, [customer]);

  const firstName = customer?.name ? customer.name.split(' ')[0] : null;

  const value = useMemo(() => ({
    session, customer, loading,
    isCustomer: !!customer,
    firstName,
    signUp, signIn, signOut, sendReset, updateProfile, changePassword,
  }), [session, customer, loading, firstName, signUp, signIn, signOut, sendReset, updateProfile, changePassword]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
