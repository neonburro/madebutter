// src/pages/Admin/components/ForgotPassword.jsx
// Request a reset. Staff enter their username; we resolve to email server-side, then
// Supabase emails a recovery link. Big bold clean style matching the front end.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ForgotPassword({ onBack }) {
  const { sendReset } = useAuth();
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  const submit = async () => {
    if (!username.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/.netlify/functions/resolve-staff-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.email) await sendReset(data.email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="madebutter. home">
            <img src="/madebutter-logo.png" alt="madebutter." className="h-12 w-auto" />
          </Link>
          <h1 className="mt-7 text-4xl font-bold sm:text-5xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
            {sent ? 'Check your email' : 'Reset password'}
          </h1>
          <p className="mt-4 max-w-sm text-base font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
            {sent
              ? 'If that username has an account, we sent a reset link to its email. Check your inbox.'
              : 'Enter your username and we will email you a reset link.'}
          </p>
        </div>

        {!sent && (
          <div className="mt-10 space-y-4">
            <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={onKey}
              placeholder="username" autoCapitalize="none"
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
            <button onClick={submit} disabled={busy}
              className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        )}

        <button onClick={onBack} className="mt-6 text-sm font-bold" style={{ color: 'var(--mb-text-muted)' }}>
          Back to login
        </button>
      </main>
    </div>
  );
}
