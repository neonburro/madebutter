// src/pages/Admin/components/AccountSettings.jsx
// Staff account settings. Change username and/or password. Both require the current
// password. Big bold clean style. Eye toggle on all password fields. Talks to
// update-staff-credentials (service role).
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import PasswordInput from '../../../components/Form/PasswordInput';

export default function AccountSettings() {
  const { session, staff } = useAuth();
  const userId = session?.user?.id;
  const [currentPw, setCurrentPw] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!currentPw) { setError('Enter your current password to confirm.'); return; }
    if (!newUsername && !newPw) { setError('Change a username or a password to continue.'); return; }
    if (newPw && newPw !== newPw2) { setError('New passwords do not match.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/.netlify/functions/update-staff-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          current_password: currentPw,
          new_username: newUsername || undefined,
          new_password: newPw || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update.');
      setNotice('Saved. Use your new details next time you sign in.');
      setCurrentPw(''); setNewUsername(''); setNewPw(''); setNewPw2('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-10">
      <h1 className="text-4xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Account</h1>
      <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
        Signed in as {staff?.username || staff?.display_name}. Change your username or password below.
      </p>

      <div className="mt-8 max-w-md space-y-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'var(--mb-text-muted)' }}>confirm it is you</p>
          <PasswordInput value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="current password" autoComplete="current-password" />
        </div>

        <div className="border-t pt-5" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="mb-2 text-sm font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'var(--mb-text-muted)' }}>new username (optional)</p>
          <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder={staff?.username || 'username'}
            autoCapitalize="none"
            className="w-full rounded-2xl px-4 py-4 text-base font-medium outline-none" style={field} />
        </div>

        <div className="border-t pt-5" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="mb-2 text-sm font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'var(--mb-text-muted)' }}>new password (optional)</p>
          <PasswordInput value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="new password" autoComplete="new-password" />
          <div className="mt-3">
            <PasswordInput value={newPw2} onChange={(e) => setNewPw2(e.target.value)} placeholder="confirm new password" autoComplete="new-password" />
          </div>
        </div>

        {error && <p className="text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
        {notice && <p className="text-sm font-semibold" style={{ color: '#7AA85A' }}>{notice}</p>}

        <button onClick={submit} disabled={busy}
          className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
