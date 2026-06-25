// src/components/Nav/TopNav.jsx
// Smooth nav. At top: clean, logo legible over dark heroes via a soft chip. Scroll
// down hides, scroll up returns solid. Desktop: logo + wide account pill. Mobile:
// logo + donut button that opens a clean slide-down drawer. When signed in the
// drawer reveals a "my donuts." tab into the profile world.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Donut, X } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const MENU = [
  { to: '/', label: 'menu' },
  { to: '/contact/', label: 'contact' },
  { to: '/suggest/', label: 'suggestion box' },
];

export default function TopNav() {
  const { isCustomer, firstName } = useCustomerAuth();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 12);
      if (y > lastY.current && y > 90) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const solid = !atTop;
  const chip = {
    background: solid ? 'transparent' : 'rgba(255,255,255,0.82)',
    padding: solid ? '0' : '6px 14px',
    boxShadow: solid ? 'none' : '0 2px 12px rgba(0,0,0,0.10)',
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? '-110%' : '0%' }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: solid ? 'rgba(255,255,255,0.94)' : 'transparent',
          backdropFilter: solid ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: solid ? 'blur(10px)' : 'none',
          borderBottom: `1px solid ${solid ? 'var(--mb-surface-line)' : 'transparent'}`,
          transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        }}
      >
        <div className="mx-auto flex w-[98%] items-center justify-between py-3">
          <Link to="/" aria-label="madebutter. home" className="inline-flex items-center rounded-full transition-all" style={chip}>
            <img src="/madebutter-logo.png" alt="madebutter." className="h-11 w-auto sm:h-14" />
          </Link>

          <Link
            to={isCustomer ? '/account/' : '/account/login/'}
            aria-label={isCustomer ? 'Your account' : 'Sign in'}
            className="hidden items-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:flex"
            style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
          >
            <Donut size={18} strokeWidth={2} color="#F5D66B" />
            <span>{isCustomer ? `Hi ${firstName || 'there'}` : 'sign in'}</span>
          </Link>

          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="sm:hidden">
            <span className="inline-flex items-center justify-center rounded-full" style={{ ...chip, padding: solid ? 8 : 10, background: solid ? 'var(--mb-surface-paper)' : 'rgba(255,255,255,0.82)' }}>
              <Donut size={24} strokeWidth={2} color="#161412" />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] sm:hidden"
              style={{ background: 'rgba(15,14,13,0.4)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-[60] rounded-b-3xl px-6 pb-8 pt-5 sm:hidden"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMenuOpen(false)} aria-label="madebutter. home">
                  <img src="/madebutter-logo.png" alt="madebutter." className="h-11 w-auto" />
                </Link>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ color: 'var(--mb-text-muted)' }}>
                  <X size={26} />
                </button>
              </div>

              <Link
                to={isCustomer ? '/account/' : '/account/login/'}
                onClick={() => setMenuOpen(false)}
                className="mt-6 flex items-center justify-center gap-2 rounded-full py-4 text-base font-semibold"
                style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
              >
                <Donut size={20} strokeWidth={2} color="#F5D66B" />
                {isCustomer ? `Hi ${firstName || 'there'}` : 'sign in'}
              </Link>

              {isCustomer && (
                <Link
                  to="/account/"
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold lowercase"
                  style={{ background: 'var(--mb-surface-paper)', color: 'var(--mb-text-primary)' }}
                >
                  <Donut size={20} strokeWidth={2} color="#161412" />
                  my donuts<span style={{ color: '#F5D66B' }}>.</span>
                </Link>
              )}

              <nav className="mt-6 flex flex-col gap-1">
                {MENU.map((m) => (
                  <Link key={m.to} to={m.to} onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-4 text-2xl font-bold lowercase"
                    style={{ color: 'var(--mb-text-primary)' }}>
                    {m.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
