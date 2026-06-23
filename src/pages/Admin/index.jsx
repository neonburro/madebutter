// src/pages/Admin/index.jsx
// /admin routing. Login when signed out; shell + nested sections when staff.
// /admin/reset/ stays public (recovery email link).
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminShell from './components/AdminShell';
import AdminHome from './components/AdminHome';
import Placeholder from './components/Placeholder';
import ResetPassword from './components/ResetPassword';
import AdminMenu from './menu/AdminMenu';

function Gate({ children }) {
  const { isStaff, loading } = useAuth();
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>Loading…</p>
      </main>
    );
  }
  return isStaff ? children : <AdminLogin />;
}

export default function Admin() {
  return (
    <Routes>
      <Route path="reset" element={<ResetPassword />} />
      <Route path="reset/" element={<ResetPassword />} />
      <Route element={<Gate><AdminShell /></Gate>}>
        <Route index element={<AdminHome />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="menu/" element={<AdminMenu />} />
        <Route path="hero" element={<Placeholder title="Hero" />} />
        <Route path="hero/" element={<Placeholder title="Hero" />} />
        <Route path="orders" element={<Placeholder title="Orders" />} />
        <Route path="orders/" element={<Placeholder title="Orders" />} />
      </Route>
    </Routes>
  );
}
