// src/components/Nav/TopNav.jsx
// Storefront main nav: logo left, sign-in right. Hides on scroll-down, shows on scroll-up.
// NOTE: customer recognition ("Hello, name") is the deferred Layer 3 work — not staff auth.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function TopNav() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur"
      style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'var(--mb-surface-line)' }}
    >
      <div className="mx-auto flex w-[98%] items-center justify-between py-3">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="madebutter. home">
          <img src="/madebutter-logo.png" alt="madebutter." className="h-8 w-auto sm:h-9" />
        </button>

        <button
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--mb-text-primary)', color: 'var(--mb-text-inverse)' }}
        >
          Sign in
        </button>
      </div>
    </motion.header>
  );
}
