// src/pages/Admin/components/AdminLogin.jsx
// Clean login: logo, username + password (placeholder-only), forgot + login.
// "Forgot password?" swaps to the ForgotPassword request screen.
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ForgotPassword from './ForgotPassword';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  if (forgot) return <ForgotPassword onBack={() => setForgot(false)} />;

  const submit = async () => {
    if (!username || !password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/resolve-staff-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.email) {
        setError('Wrong username or password.');
        setBusy(false);
        return;
      }
      const err = await signIn(data.email, password);
      if (err) {
        setError('Wrong username or password.');
        setBusy(false);
      }
    } catch {
      setError('Could not sign in. Try again.');
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

        <div className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={onKey}
            placeholder="username"
            autoComplete="username"
            autoCapitalize="none"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
            style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKey}
            type="password"
            placeholder="password"
            autoComplete="current-password"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
            style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
          />
        </div>

        {error && <p className="mt-3 text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
        >
          {busy ? 'Signing in…' : 'Log in'}
        </button>

        <button
          onClick={() => setForgot(true)}
          className="mt-4 w-full text-center text-xs"
          style={{ color: 'var(--mb-text-muted)' }}
        >
          Forgot password?
        </button>
      </div>
    </main>
  );
}
