// src/components/Cart/CartSheet.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { menuImageUrl } from '../../lib/supabase';

export default function CartSheet({ open, onClose }) {
  const { lines, add, decrement, subtotal, count } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(15,14,13,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-3xl p-5"
            style={{ background: 'var(--mb-surface-base)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--mb-surface-line-strong)' }} />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>
                Your order
              </h2>
              <button onClick={onClose} aria-label="Close cart" style={{ color: 'var(--mb-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {count === 0 ? (
              <p className="py-10 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>
                Your cart is empty. Tap a + to start your box.
              </p>
            ) : (
              <>
                <div className="max-h-[48vh] space-y-3 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => {
                      const img = menuImageUrl(l.image_path);
                      return (
                        <motion.div
                          key={l.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl"
                            style={{ background: 'var(--mb-surface-paper)' }}
                          >
                            {img && <img src={img} alt={l.name} className="h-full w-full object-contain" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{l.name}</p>
                            <p className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>
                              {l.price > 0 ? formatPrice(l.price * l.qty) : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => decrement(l.id)}
                              aria-label="Remove one"
                              className="flex h-7 w-7 items-center justify-center rounded-full"
                              style={{ border: '1px solid var(--mb-surface-line-strong)' }}
                            >
                              <Minus size={14} />
                            </motion.button>
                            <span className="w-5 text-center text-sm font-medium">{l.qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => add(l)}
                              aria-label="Add one"
                              className="flex h-7 w-7 items-center justify-center rounded-full"
                              style={{ background: 'var(--mb-accent-butter)' }}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <p className="mt-4 text-center text-xs" style={{ color: 'var(--mb-text-muted)' }}>
                  Order ahead. We'll send your locker number when it's ready, or come on inside for a few extra treats.
                </p>

                <div className="mt-3 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
                  <span className="text-sm" style={{ color: 'var(--mb-text-secondary)' }}>Subtotal</span>
                  <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { onClose(); navigate('/checkout/'); }}
                  className="mt-4 w-full rounded-full py-3.5 text-sm font-semibold"
                  style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
                >
                  Checkout
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
