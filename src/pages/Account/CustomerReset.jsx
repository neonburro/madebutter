// src/pages/Account/CustomerReset.jsx
// Customer password reset landing (from the emailed link). Two fields, live match,
// eye toggle on both. Logo links home.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ButterMark from '../../components/Brand/ButterMark';
import PasswordInput from '../../components/Form/PasswordInput';

export default function CustomerReset() {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const match = pw.length >= 6 && pw === pw2;

  const submit = async () => {
    if (!match) { setError('Passwords need to match and be 6+ characters.'); return; }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  };

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col items-center justify-center px-6 text-center">
      <Link to="/" aria-label="madebutter. home"><ButterMark size={72} /></Link>
      {done ? (
        <>
          <h1 className="mt-6 text-3xl font-bold">Password updated</h1>
          <Link to="/account/login/" className="mt-6 rounded-full px-7 py-3.5 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
            Sign in
          </Link>
        </>
      ) : (
        <div className="mt-8 w-full space-y-3">
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="new password" autoComplete="new-password" />
          <PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="confirm password" autoComplete="new-password"
            borderColor={pw2.length > 0 ? (match ? 'rgba(120,170,90,0.6)' : 'rgba(184,80,60,0.5)') : undefined} />
          {pw2.length > 0 && (
            <p className="text-center text-sm font-semibold" style={{ color: match ? '#7AA85A' : 'var(--mb-accent-toast)' }}>
              {match ? 'Looks good' : 'Passwords need to match (6+ characters)'}
            </p>
          )}
          {error && <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
          <button onClick={submit} disabled={busy || !match}
            className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
      )}
    </main>
  );
}
