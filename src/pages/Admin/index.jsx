// src/pages/Admin/index.jsx
// /admin/ shows login (signed out) or shell (staff). /admin/reset/ shows the
// password reset screen reached from the recovery email link.
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminShell from './components/AdminShell';
import ResetPassword from './components/ResetPassword';

function AdminHome() {
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

export default function Admin() {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="reset" element={<ResetPassword />} />
      <Route path="reset/" element={<ResetPassword />} />
    </Routes>
  );
}
