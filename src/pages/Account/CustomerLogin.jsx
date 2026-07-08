// src/pages/Account/CustomerLogin.jsx
// Customer gateway. Sign in, create account, forgot password. Big bold clean form
// vibe matching contact and suggestion. Butter mark links home. Customers CAN create
// an account here. No em dashes, oxford commas or colons.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ButterMark from '../../components/Brand/ButterMark';
import PasswordInput from '../../components/Form/PasswordInput';

export default function CustomerLogin() {
  const { signIn, signUp, sendReset } = useCustomerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('in'); // 'in' | 'up' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === 'reset') {
      const err = await sendReset(email);
      setBusy(false);
      if (err) { setError(err.message); return; }
      setNotice('Check your email for a reset link.');
      return;
    }
    const err = mode === 'in' ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (err) { setError(err.message); return; }
    if (mode === 'up') {
      setNotice('Almost there. Check your email to verify your account, then you are in.');
      setMode('in');
      return;
    }
    navigate('/account/');
  };

  const heading = mode === 'in' ? 'Welcome back' : mode === 'up' ? 'Start collecting' : 'Reset password';
  const sub =
    mode === 'in' ? 'Sign in to see your donuts and your orders.'
    : mode === 'up' ? 'Every order earns you donuts. Make an account to start your stash.'
    : 'We will email you a link to set a new password.';

  return (
    <div className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="madebutter. home"><ButterMark size={84} /></Link>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>{heading}</h1>
          <p className="mt-4 max-w-sm text-base font-semibold leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>{sub}</p>
        </div>

        <div className="mt-10 space-y-4">
          {mode === 'up' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name"
              className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" inputMode="email" autoComplete="email"
            className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
          {mode !== 'reset' && (
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
          )}

          {error && <p className="text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
          {notice && <p className="text-center text-sm font-semibold" style={{ color: '#7AA85A' }}>{notice}</p>}

          <button onClick={submit} disabled={busy}
            className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
            style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
            {busy ? 'One sec…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
          {mode === 'in' && (
            <>
              <button onClick={() => { setMode('up'); setError(null); setNotice(null); }}>
                New here? <span style={{ color: 'var(--mb-text-primary)' }}>Create an account</span>
              </button>
              <button onClick={() => { setMode('reset'); setError(null); setNotice(null); }}>Forgot password</button>
            </>
          )}
          {mode === 'up' && <button onClick={() => { setMode('in'); setError(null); setNotice(null); }}>Already have an account? <span style={{ color: 'var(--mb-text-primary)' }}>Sign in</span></button>}
          {mode === 'reset' && <button onClick={() => { setMode('in'); setError(null); setNotice(null); }}>Back to sign in</button>}
        </div>
      </main>
    </div>
  );
}
