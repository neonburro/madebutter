// src/pages/Admin/index.jsx
// The /admin/ entry. Shows login when signed out, the shell when signed in as staff.
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminShell from './components/AdminShell';

export default function Admin() {
  const { isStaff, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>Loading…</p>
      </main>
    );
  }

  return isStaff ? <AdminShell /> : <AdminLogin />;
}
