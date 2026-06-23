// src/pages/Admin/components/ResetPassword.jsx
// Landing screen for the email recovery link. Supabase establishes a recovery
// session from the link; the user MUST set a new password here before continuing.
// Two fields, must match. No visibility eyeball by request.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

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
    <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: 'var(--mb-surface-paper)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-10 w-auto" />
        </div>

        {done ? (
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--mb-text-secondary)' }}>Password updated.</p>
            <button
              onClick={goToLogin}
              className="mt-6 rounded-full px-6 py-3 text-sm font-semibold"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
            >
              Go to login
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
              Choose a new password.
            </p>
            <div className="space-y-3">
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                placeholder="new password"
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
                style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
              />
              <input
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                type="password"
                placeholder="confirm password"
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
                style={{
                  border: `1px solid ${pw2.length > 0 ? (match ? 'rgba(120,170,90,0.6)' : 'rgba(184,80,60,0.5)') : 'var(--mb-surface-line-strong)'}`,
                  background: 'var(--mb-surface-base)',
                }}
              />
            </div>
            {pw2.length > 0 && (
              <p className="mt-2 text-center text-xs" style={{ color: match ? '#7AA85A' : 'var(--mb-accent-toast)' }}>
                {match ? 'Passwords match.' : 'Passwords do not match yet.'}
              </p>
            )}
            {error && <p className="mt-3 text-center text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
            <button
              onClick={submit}
              disabled={busy || !match}
              className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
