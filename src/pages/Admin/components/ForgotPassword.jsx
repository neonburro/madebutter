// src/pages/Admin/components/ForgotPassword.jsx
// Request a reset. Staff enter their username; we resolve to email server-side,
// then Supabase emails them a recovery link.
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ForgotPassword({ onBack }) {
  const { sendReset } = useAuth();
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!username.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/resolve-staff-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.email) {
        await sendReset(data.email);
      }
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: 'var(--mb-surface-paper)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-10 w-auto" />
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
              If that username has an account, we sent a reset link to its email. Check your inbox.
            </p>
            <button onClick={onBack} className="mt-6 text-xs font-medium" style={{ color: 'var(--mb-accent-toast)' }}>
              Back to login
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
              Enter your username and we'll email you a reset link.
            </p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={onKey}
              placeholder="username"
              autoCapitalize="none"
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
              style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
            />
            {error && <p className="mt-3 text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <button onClick={onBack} className="mt-4 w-full text-center text-xs" style={{ color: 'var(--mb-text-muted)' }}>
              Back to login
            </button>
          </>
        )}
      </div>
    </main>
  );
}
