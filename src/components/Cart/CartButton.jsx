// src/components/Cart/CartButton.jsx
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function CartButton({ onClick }) {
  const { count, bump } = useCart();
  const controls = useAnimationControls();
  const [badgePulse, setBadgePulse] = useState(0);

  useEffect(() => {
    if (bump === 0) return;
    controls.start({
      scale: [1, 1.12, 0.97, 1],
      transition: { duration: 0.34, ease: 'easeOut' },
    });
    setBadgePulse((p) => p + 1);
  }, [bump, controls]);

  return (
    <motion.button
      animate={controls}
      onClick={onClick}
      aria-label="Open cart"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg"
      style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
    >
      <ShoppingBag size={18} />
      <span className="text-sm font-medium">Cart</span>
      {count > 0 && (
        <motion.span
          key={badgePulse}
          initial={{ scale: 0.6 }}
          animate={{ scale: [1.3, 1] }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
          style={{ background: 'var(--mb-dark-accent)', color: 'var(--mb-text-primary)' }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}
