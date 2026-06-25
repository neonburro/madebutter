// src/pages/Account/index.jsx
// /account routing. Login + reset are public; the account home requires a customer
// session. A logged-in customer at /account/login/ is bounced to their home.
import { Routes, Route, Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CustomerLogin from './CustomerLogin';
import CustomerReset from './CustomerReset';
import AccountHome from './AccountHome';

export default function Account() {
  const { isCustomer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>Loading…</p>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="login" element={isCustomer ? <Navigate to="/account/" replace /> : <CustomerLogin />} />
      <Route path="login/" element={isCustomer ? <Navigate to="/account/" replace /> : <CustomerLogin />} />
      <Route path="reset" element={<CustomerReset />} />
      <Route path="reset/" element={<CustomerReset />} />
      <Route index element={isCustomer ? <AccountHome /> : <Navigate to="/account/login/" replace />} />
    </Routes>
  );
}
