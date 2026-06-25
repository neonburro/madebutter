// src/pages/Account/CustomerLogin.jsx
// Clean customer login + signup. Two inputs, placeholder text inside, big butter
// mark that links home, no title. Toggles between sign in, create account, reset.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ButterMark from '../../components/Brand/ButterMark';

export default function CustomerLogin() {
  const { signIn, signUp, sendReset } = useCustomerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('in');
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

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col items-center justify-center px-6">
      <Link to="/" aria-label="madebutter. home">
        <ButterMark size={88} />
      </Link>

      <div className="mt-8 w-full space-y-3">
        {mode === 'up' && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name"
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" inputMode="email" autoComplete="email"
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        {mode !== 'reset' && (
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none" style={field} />
        )}

        {error && <p className="text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
        {notice && <p className="text-center text-xs" style={{ color: '#7AA85A' }}>{notice}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'One sec…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}
        </button>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 text-xs" style={{ color: 'var(--mb-text-muted)' }}>
        {mode === 'in' && (
          <>
            <button onClick={() => { setMode('up'); setError(null); }}>New here? Create an account</button>
            <button onClick={() => { setMode('reset'); setError(null); }}>Forgot password</button>
          </>
        )}
        {mode === 'up' && <button onClick={() => { setMode('in'); setError(null); }}>Already have an account? Sign in</button>}
        {mode === 'reset' && <button onClick={() => { setMode('in'); setError(null); }}>Back to sign in</button>}
      </div>
    </main>
  );
}
