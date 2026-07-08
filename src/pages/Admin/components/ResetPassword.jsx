// src/pages/Admin/components/ResetPassword.jsx
// Landing for the email recovery link. Supabase establishes a recovery session from
// the link; the user must set a new password here. Big bold clean style. Eye toggle
// on both fields. Live match hint.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PasswordInput from '../../../components/Form/PasswordInput';

export default function ResetPassword() {
  const { updatePassword, finishRecovery, signOut } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const match = pw.length > 0 && pw === pw2;

  const submit = async () => {
    if (pw.length < 8) { setError('Use at least 8 characters.'); return; }
    if (pw !== pw2) { setError('Passwords do not match.'); return; }
    setBusy(true);
    setError(null);
    const err = await updatePassword(pw);
    if (err) {
      setError(err.message || 'Could not update password. The link may have expired.');
      setBusy(false);
      return;
    }
    finishRecovery && finishRecovery();
    setDone(true);
  };

  const goToLogin = async () => {
    await signOut();
    navigate('/admin/');
  };

  return (
    <div className="w-full" style={{ background: 'var(--mb-surface-base)' }}>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <Link to="/" aria-label="madebutter. home">
            <img src="/madebutter-logo.png" alt="madebutter." className="h-12 w-auto" />
          </Link>
          <h1 className="mt-7 text-4xl font-bold sm:text-5xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
            {done ? 'Password updated' : 'New password'}
          </h1>
          {!done && <p className="mt-4 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>Choose a new password.</p>}
        </div>

        {done ? (
          <button onClick={goToLogin}
            className="mx-auto mt-8 rounded-full px-7 py-3.5 text-base font-bold"
            style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
            Go to login
          </button>
        ) : (
          <div className="mt-10 space-y-4">
            <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="new password" autoComplete="new-password" />
            <PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="confirm password" autoComplete="new-password"
              borderColor={pw2.length > 0 ? (match ? 'rgba(120,170,90,0.6)' : 'rgba(184,80,60,0.5)') : undefined} />
            {pw2.length > 0 && (
              <p className="text-center text-sm font-semibold" style={{ color: match ? '#7AA85A' : 'var(--mb-accent-toast)' }}>
                {match ? 'Passwords match.' : 'Passwords do not match yet.'}
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
    </div>
  );
}
