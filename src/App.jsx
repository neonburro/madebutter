// src/App.jsx
// App router. Public site + admin + account. A password-recovery session (from the
// emailed reset link) forces the user to /admin/reset/ from any landing page, so the
// reset form always shows even if the email button lands on the homepage.
// Last updated 2026-06-27.
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Admin from './pages/Admin';
import Account from './pages/Account';
import Contact from './pages/Contact';
import Suggest from './pages/Suggest';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import NotFound from './pages/NotFound';
import Footer from './components/Footer/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// When a recovery session is active, pull the user to the reset page from anywhere.
function RecoveryRedirect() {
  const { recovering } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (recovering && !pathname.startsWith('/admin/reset')) {
      navigate('/admin/reset/', { replace: true });
    }
  }, [recovering, pathname, navigate]);
  return null;
}

// Footer shows on public pages, not on admin or account/login or checkout flows.
function GlobalFooter() {
  const { pathname } = useLocation();
  const hideOn = ['/admin', '/account', '/checkout', '/order'];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  return <Footer />;
}

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <RecoveryRedirect />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />
            <Route path="/order/:id/" element={<OrderConfirmation />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/terms/" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/privacy/" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact/" element={<Contact />} />
            <Route path="/suggest" element={<Suggest />} />
            <Route path="/suggest/" element={<Suggest />} />
            <Route path="/account/*" element={<Account />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalFooter />
        </Router>
      </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
