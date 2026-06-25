// src/components/Nav/TopNav.jsx
// Three-state nav:
//  - at very top: transparent, sits over the hero (logo gets a soft shadow for legibility)
//  - scrolling down: hides (slides up out of view)
//  - scrolling up while mid-page: reappears as solid white (readable over content)
//  - back at very top: returns to transparent
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Donut } from 'lucide-react';

export default function TopNav() {
  const { isCustomer, firstName } = useCustomerAuth();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 10);
      if (y > lastY.current && y > 80) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = atTop;

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background: transparent ? 'transparent' : 'rgba(255,255,255,0.92)',
        backdropFilter: transparent ? 'none' : 'saturate(180%) blur(12px)',
        boxShadow: transparent ? 'none' : '0 1px 0 rgba(0,0,0,0.05)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="madebutter. home"
          style={{ filter: transparent ? 'drop-shadow(0 1px 6px rgba(0,0,0,0.25))' : 'none', transition: 'filter 0.3s ease' }}
        >
          <img src="/madebutter-logo.png" alt="madebutter." className="h-8 w-auto sm:h-9" />
        </button>

        <Link
          to={isCustomer ? '/account/' : '/account/login/'}
          aria-label={isCustomer ? 'Your account' : 'Sign in'}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors"
          style={
            transparent
              ? { background: 'rgba(255,255,255,0.9)', color: 'var(--mb-text-primary)', boxShadow: '0 1px 8px rgba(0,0,0,0.12)' }
              : { background: 'transparent', color: 'var(--mb-text-primary)' }
          }
        >
          {isCustomer && <span className="hidden sm:inline">Hi {firstName || 'there'}</span>}
          <Donut size={22} strokeWidth={2} color="#161412" />
        </Link>
      </div>
    </motion.header>
  );
}
