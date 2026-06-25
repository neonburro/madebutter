// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
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
