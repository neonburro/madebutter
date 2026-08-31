// src/components/Cart/CartSheet.jsx
//
// The box, as a bottom sheet.
//
// ── THE EMPTY BOX IS KOLACHE'S ──────────────────────────────────────────────
// It read "Your cart is empty. Tap a + to start your box." in muted grey, which
// is a machine describing its own state. An empty box is one of the few moments
// src/data/kolache.js says he should speak, so he does. He is size lg here
// because on an empty sheet he IS the content, which is the rule in
// Kolache.jsx for when that size is allowed.
//
// ── THE YELLOW IS ON CHECKOUT ───────────────────────────────────────────────
// This was a near black pill. Butter is the accent that marks what you press,
// and there is no more important thing to press on this site, so it gets the
// colour and the rest of the sheet stays quiet. Ink on butter is a high
// contrast pairing, higher than the old white on near black, so nothing is
// traded for the warmth.
//
// ── VOICE ───────────────────────────────────────────────────────────────────
// Lowercase throughout, matching the footer and the counter. It used to be
// "Your order", "Subtotal" and "Checkout" in Title Case sitting under a
// lowercase wordmark.
//
// No em dashes, oxford commas or colons.

import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { menuImageUrl } from '../../lib/supabase';
import Kolache from '../Kolache/Kolache';
import { SAYS } from '../../data/kolache';

export default function CartSheet({ open, onClose }) {
  const { lines, add, decrement, subtotal, count } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'var(--mb-scrim)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-3xl p-5"
            style={{ background: 'var(--mb-surface-base)', boxShadow: 'var(--mb-shadow-lift)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--mb-surface-line-strong)' }} />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold lowercase" style={{ letterSpacing: 'var(--tracking-heading)' }}>
                your box
                {count > 0 && (
                  <span className="mb-nums ml-2 font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
                    {count}
                  </span>
                )}
              </h2>
              <button onClick={onClose} aria-label="Close cart" style={{ color: 'var(--mb-text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {count === 0 ? (
              <div className="py-8">
                <Kolache size="lg" say={SAYS.emptyCart} />
              </div>
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
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
                            style={{ background: img ? 'var(--mb-surface-raised)' : 'var(--mb-surface-sunk)' }}
                          >
                            {img
                              ? <img src={img} alt={l.name} className="h-full w-full object-contain" />
                              : <img src="/madebutter-mark.png" alt="" width="24" height="24" className="h-6 w-6" style={{ opacity: 0.16 }} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{l.name}</p>
                            <p className="mb-nums text-xs font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                              {l.price > 0 ? formatPrice(l.price * l.qty) : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => decrement(l.id)}
                              aria-label={`Remove one ${l.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full"
                              style={{ border: '1px solid var(--mb-surface-line-strong)' }}
                            >
                              <Minus size={15} />
                            </motion.button>
                            <span className="mb-nums w-5 text-center text-sm font-bold">{l.qty}</span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => add(l)}
                              aria-label={`Add one ${l.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full"
                              style={{ background: 'var(--mb-accent-butter)' }}
                            >
                              <Plus size={15} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <p className="mt-4 text-center text-xs" style={{ color: 'var(--mb-text-secondary)' }}>
                  order ahead. we send your locker number when it is ready, or come inside and pick up a few extra.
                </p>

                <div className="mt-3 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
                  <span className="text-sm font-semibold lowercase" style={{ color: 'var(--mb-text-secondary)' }}>subtotal</span>
                  <span className="mb-nums text-xl font-bold">{formatPrice(subtotal)}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { onClose(); navigate('/checkout/'); }}
                  className="mt-4 w-full rounded-full py-4 text-base font-bold lowercase"
                  style={{
                    background: 'var(--mb-accent-butter)',
                    color: 'var(--mb-text-primary)',
                    boxShadow: 'var(--mb-shadow-card)',
                  }}
                >
                  checkout
                </motion.button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
