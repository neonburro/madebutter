// src/components/Nav/TopNav.jsx
//
// The floating top bar. At the top of the page it is transparent with the logo
// on a soft chip so it stays legible over a dark hero. Scroll down and it
// leaves, scroll up and it comes back solid. The donut button is the single
// entry point on every viewport. Signed out it is icon only, signed in it
// elongates to "Hi name". Tapping it opens the drawer.
//
// ── IT OWNS --mb-nav-offset AND StyleNav READS IT ───────────────────────────
//
// This bar is FIXED and the style rail under it is STICKY, so both wanted to
// live at top 0 and this one won, which meant that every time you scrolled up
// inside the menu the bar slid back down over the rail and covered it. You
// cannot hide the navigation someone is currently using.
//
// So the height of this bar is published on the document as --mb-nav-offset,
// and it is 0 while the bar is away. StyleNav.jsx sticks at that offset and
// transitions with it, so the two move as one stack and nothing is ever
// covered. The height is MEASURED off the real element rather than written
// down, because the bar is a different height once the logo grows at the sm
// breakpoint and a hardcoded number would be wrong on exactly one screen size.
//
// Anything else that wants to sit under this bar should read the same
// variable. Do not add a second measurement.
//
// No em dashes, oxford commas or colons.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const headerRef = useRef(null);
  const heightRef = useRef(0);

  // measure once and on resize, then publish. see the note above.
  useLayoutEffect(() => {
    const measure = () => {
      heightRef.current = headerRef.current?.offsetHeight || 0;
      if (!hidden) {
        document.documentElement.style.setProperty('--mb-nav-offset', `${heightRef.current}px`);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [hidden]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--mb-nav-offset',
      hidden ? '0px' : `${heightRef.current}px`,
    );
  }, [hidden]);

  useEffect(() => () => {
    document.documentElement.style.removeProperty('--mb-nav-offset');
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      // ── WHEN THE BAR STOPS BEING TRANSPARENT ────────────────────────────
      // It used to go solid after twelve pixels, which meant the glass lasted
      // about one flick of a thumb and the hero was behind a panel for the
      // whole rest of its height. It now stays transparent across everything
      // ABOVE the food and turns solid at the moment the menu reaches it.
      //
      // #menu-start is the marker, rendered by src/pages/Home/index.jsx right
      // where the style rail begins. Any page without one, contact and the
      // legal pages, falls back to the old twelve pixel rule, which is correct
      // for a page that opens on text rather than on a picture.
      const gate = document.getElementById('menu-start');
      setAtTop(gate ? gate.getBoundingClientRect().top > (heightRef.current || 0) : y < 12);

      if (y > lastY.current && y > 90) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const solid = !atTop;
  const chip = {
    background: solid ? 'transparent' : 'rgba(250,246,236,0.86)',
    padding: solid ? '0' : '6px 14px',
    boxShadow: solid ? 'none' : 'var(--mb-shadow-card)',
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        animate={{ y: hidden && !menuOpen ? '-110%' : '0%' }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: solid ? 'rgba(250,246,236,0.92)' : 'transparent',
          backdropFilter: solid ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: solid ? 'blur(12px)' : 'none',
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
              boxShadow: 'var(--mb-shadow-card)',
            }}
          >
            <Donut size={22} strokeWidth={2} color="var(--mb-accent-butter)" />
            {isCustomer && <span>Hi {firstName || 'there'}</span>}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: 'var(--mb-scrim)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-[60] mx-auto w-full max-w-md rounded-b-3xl px-6 pb-8 pt-5 sm:left-auto sm:right-4 sm:mx-0 sm:mt-3 sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)', boxShadow: 'var(--mb-shadow-lift)' }}
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
                    <Donut size={22} strokeWidth={2} color="var(--mb-accent-butter)" />
                    my crumbs<span style={{ color: 'var(--mb-accent-butter)' }}>.</span>
                  </Link>
                </>
              ) : (
                <div className="mt-6 rounded-3xl p-6 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
                  <Donut size={40} strokeWidth={2} color="var(--mb-text-primary)" className="mx-auto" />
                  {/* the currency is CRUMBS, never donuts. see src/data/crumbs.js */}
                  <p className="mt-3 text-2xl font-bold">start collecting crumbs</p>
                  <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                    every dollar is ten crumbs. collect enough of them and we hand you back a whole donut.
                  </p>
                  <Link
                    to="/account/login/"
                    onClick={() => setMenuOpen(false)}
                    className="mt-5 flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
                    style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
                  >
                    <Donut size={20} strokeWidth={2} color="var(--mb-accent-butter)" />
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
