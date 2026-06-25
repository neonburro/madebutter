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
        backdropFilter: transparent ? 'none' : 'blur(8px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(8px)',
        borderBottom: transparent ? '1px solid transparent' : '1px solid var(--mb-surface-line)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="mx-auto flex w-[98%] items-center justify-between py-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="madebutter. home"
          style={{ filter: transparent ? 'drop-shadow(0 1px 6px rgba(0,0,0,0.25))' : 'none', transition: 'filter 0.3s ease' }}
        >
          <img src="/madebutter-logo.png" alt="madebutter." className="h-12 w-auto sm:h-14" />
        </button>

        <Link
          to={isCustomer ? '/account/' : '/account/login/'}
          aria-label={isCustomer ? 'Your account' : 'Sign in'}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          style={
            transparent
              ? { background: 'rgba(255,255,255,0.9)', color: 'var(--mb-text-primary)', boxShadow: '0 1px 8px rgba(0,0,0,0.12)' }
              : { background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }
          }
        >
          <Donut size={20} strokeWidth={2} color={transparent ? '#161412' : '#F5D66B'} />
          <span>{isCustomer ? `Hi ${firstName || 'there'}` : 'sign in'}</span>
        </Link>
      </div>
    </motion.header>
  );
}
