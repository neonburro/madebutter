// src/pages/Account/CustomerReset.jsx
// Customer password reset landing (from the emailed link). Two fields, live match,
// no eyeball. Signs out on success and sends them to sign in.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ButterMark from '../../components/Brand/ButterMark';

export default function CustomerReset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const match = pw.length >= 6 && pw === pw2;
  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    if (err) { setError(err.message); setBusy(false); return; }
    await supabase.auth.signOut();
    navigate('/account/login/');
  };

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col items-center justify-center px-6">
      <ButterMark size={56} />
      <div className="mt-8 w-full space-y-3">
        <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="new password" type="password"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        <input value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="confirm password" type="password"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        {pw2.length > 0 && (
          <p className="text-center text-xs" style={{ color: match ? '#7AA85A' : 'var(--mb-accent-toast)' }}>
            {match ? 'Looks good' : 'Passwords need to match (6+ characters)'}
          </p>
        )}
        {error && <p className="text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
        <button onClick={submit} disabled={busy || !match}
          className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </main>
  );
}
