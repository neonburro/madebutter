// src/pages/Admin/components/AdminLogin.jsx
// Back of house gateway. Same clean big-bold form vibe as the customer login, but a
// different door: no self-signup. Username + password, forgot password, and a request
// access line (email the team). Logo links home. No em dashes, oxford commas, colons.
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  return (
    <div className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="madebutter. home">
            <img src="/madebutter-logo.png" alt="madebutter." className="h-12 w-auto" />
          </Link>
          <h1 className="mt-7 text-4xl font-bold sm:text-5xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>Back of house</h1>
          <p className="mt-4 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>Staff sign in.</p>
        </div>

        <div className="mt-10 space-y-4">
          <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={onKey}
            placeholder="username" autoComplete="username" autoCapitalize="none"
            className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey}
            type="password" placeholder="password" autoComplete="current-password"
            className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />

          {error && <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

          <button onClick={submit} disabled={busy}
            className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
            style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
            {busy ? 'Signing in…' : 'Log in'}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
          <button onClick={() => setForgot(true)}>Forgot password</button>
          <p>Need access? Email <a href="mailto:team@madebutter.com" style={{ color: 'var(--mb-text-primary)' }}>team@madebutter.com</a></p>
        </div>
      </main>
    </div>
  );
}
