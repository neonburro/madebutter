// src/pages/Admin/index.jsx
// /admin routing. Login when signed out; shell + nested sections when staff.
// /admin/reset/ stays public (recovery email link). A recovery session forces reset.
// Sidebar: Dashboard, Orders, POS, Loyalty (Customers/Rewards/Signups), Menu, Brand.
// POS and the loyalty sections are coming-soon placeholders for now.
// Last updated 2026-06-27.
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminShell from './components/AdminShell';
import AdminHome from './components/AdminHome';
import ComingSoon from './components/ComingSoon';
import ResetPassword from './components/ResetPassword';
import AdminMenu from './menu/AdminMenu';
import OrdersBoard from './orders/OrdersBoard';
import AccountSettings from './components/AccountSettings';
import Customers from './loyalty/Customers';

function Gate({ children }) {
  const { isStaff, loading, recovering } = useAuth();
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>Loading…</p>
      </main>
    );
  }
  if (recovering) return <ResetPassword />;
  return isStaff ? children : <AdminLogin />;
}

export default function Admin() {
  return (
    <Routes>
      <Route path="reset" element={<ResetPassword />} />
      <Route path="reset/" element={<ResetPassword />} />
      <Route element={<Gate><AdminShell /></Gate>}>
        <Route index element={<AdminHome />} />

        <Route path="orders" element={<OrdersBoard />} />
        <Route path="orders/" element={<OrdersBoard />} />

        <Route path="pos" element={<ComingSoon title="POS" note="Our own register. Tap items, charge the right Ridgway tax, take card or cash. Building this next." />} />
        <Route path="pos/" element={<ComingSoon title="POS" note="Our own register. Tap items, charge the right Ridgway tax, take card or cash. Building this next." />} />

        <Route path="loyalty/customers" element={<Customers />} />
        <Route path="loyalty/customers/" element={<Customers />} />
        <Route path="loyalty/rewards" element={<ComingSoon title="Rewards" note="Donut points and status. Ten donuts per dollar, wired into every sale." />} />
        <Route path="loyalty/rewards/" element={<ComingSoon title="Rewards" note="Donut points and status. Ten donuts per dollar, wired into every sale." />} />
        <Route path="loyalty/signups" element={<ComingSoon title="Signups" note="The email and sms list, ready to export for marketing." />} />
        <Route path="loyalty/signups/" element={<ComingSoon title="Signups" note="The email and sms list, ready to export for marketing." />} />

        <Route path="menu" element={<AdminMenu />} />
        <Route path="menu/" element={<AdminMenu />} />

        <Route path="brand" element={<ComingSoon title="Brand" note="Upload a logo, set the accent colors, flip light or dark. Makes the whole app rebrandable for a clone." />} />
        <Route path="brand/" element={<ComingSoon title="Brand" note="Upload a logo, set the accent colors, flip light or dark. Makes the whole app rebrandable for a clone." />} />
        <Route path="hero" element={<ComingSoon title="Brand" />} />
        <Route path="hero/" element={<ComingSoon title="Brand" />} />

        <Route path="account" element={<AccountSettings />} />
        <Route path="account/" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}
