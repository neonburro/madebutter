// src/components/Nav/TopNav.jsx
// Smooth nav. At top: clean, logo legible over dark heroes via a soft chip. Scroll
// down hides, scroll up returns solid. The donut button is the single entry point on
// every viewport: signed out it is icon only, signed in it elongates to "Hi name".
// Tapping it always opens the slide-down drawer. Inside, guests get an invite to
// join, members get "my donuts." No em dashes, oxford commas or colons.
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

          <button
            onClick={() => setMenuOpen(true)}
            aria-label={isCustomer ? 'Your account and menu' : 'Open menu'}
            className="flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: 'var(--mb-text-primary)',
              color: 'var(--mb-text-inverse)',
              padding: isCustomer ? '0.7rem 1.4rem' : '0.7rem',
            }}
          >
            <Donut size={22} strokeWidth={2} color="#F5D66B" />
            {isCustomer && <span>Hi {firstName || 'there'}</span>}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(15,14,13,0.4)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-[60] mx-auto w-full max-w-md rounded-b-3xl px-6 pb-8 pt-5 sm:left-auto sm:right-4 sm:mx-0 sm:mt-3 sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
              initial={{ y: '-100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0.6 }}
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

              {isCustomer ? (
                <>
                  <p className="mt-6 text-2xl font-bold">Hi {firstName || 'there'}.</p>
                  <Link
                    to="/account/"
                    onClick={() => setMenuOpen(false)}
                    className="mt-4 flex items-center justify-center gap-2 rounded-full py-4 text-lg font-bold lowercase"
                    style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
                  >
                    <Donut size={22} strokeWidth={2} color="#F5D66B" />
                    my donuts<span style={{ color: '#F5D66B' }}>.</span>
                  </Link>
                </>
              ) : (
                <div className="mt-6 rounded-3xl p-6 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
                  <Donut size={40} strokeWidth={2} color="#161412" className="mx-auto" />
                  <p className="mt-3 text-2xl font-bold">start collecting donuts</p>
                  <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                    every order earns you donuts. sign in or create an account to start your stash.
                  </p>
                  <Link
                    to="/account/login/"
                    onClick={() => setMenuOpen(false)}
                    className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
                    style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
                  >
                    <Donut size={20} strokeWidth={2} color="#F5D66B" />
                    sign in or join
                  </Link>
                </div>
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
