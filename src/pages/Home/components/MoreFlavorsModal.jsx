// src/pages/Home/components/MoreFlavorsModal.jsx
//
// Everything of one style that is not out today. Full screen on a phone, a
// sheet on a tablet, a centred card on a desktop. These are not orderable, so
// tapping one opens its detail rather than adding it.
//
// ── THE VOICE IS THE COUNTER, LOWERCASE ─────────────────────────────────────
// This said "More of our flavors" and "Take a peek and start scheming" in Title
// Case, which is a third voice on a site that is otherwise lowercase and dry
// with Kolache doing the talking. See src/data/kolache.js. The rule there is
// that he speaks where a person behind a counter would actually say something,
// and being asked what else you make is exactly that, so the line is his.
//
// The empty photo plate matches ItemCard.jsx, a ghosted mark and no words. If
// you change one, change both.
//
// No em dashes, oxford commas or colons.

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { menuImageUrl } from '../../../lib/supabase';

export default function MoreFlavorsModal({ open, items, onClose, onPick }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'var(--mb-scrim)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-6" onClick={onClose}>
            <motion.div
              className="flex w-full flex-col overflow-hidden sm:max-h-[88vh] sm:max-w-2xl sm:rounded-3xl lg:max-w-4xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 p-6 pb-4 sm:p-8 sm:pb-5">
                <div>
                  <h2 className="text-2xl font-bold leading-tight sm:text-3xl" style={{ letterSpacing: 'var(--tracking-heading)' }}>
                    the rest of them
                  </h2>
                  <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--mb-text-secondary)' }}>
                    these are not out today. they come back around.
                  </p>
                </div>
                <button onClick={onClose} aria-label="close" className="flex-shrink-0 rounded-full p-1" style={{ color: 'var(--mb-text-muted)' }}>
                  <X size={26} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6 overflow-y-auto px-6 pb-8 pt-2 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
                {items.map((item) => {
                  const img = menuImageUrl(item.image_path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onPick?.(item)}
                      className="flex flex-col text-left transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div
                        className="aspect-square w-full overflow-hidden"
                        style={{
                          borderRadius: 'var(--mb-radius-plate)',
                          background: img ? 'var(--mb-surface-raised)' : 'var(--mb-surface-sunk)',
                          boxShadow: 'var(--mb-shadow-card)',
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-contain"
                            style={{ filter: 'grayscale(0.5)', opacity: 0.72 }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <img src="/madebutter-mark.png" alt="" width="48" height="48" className="h-12 w-12" style={{ opacity: 0.14 }} />
                          </div>
                        )}
                      </div>
                      <p className="mt-2.5 px-1 text-[15px] font-bold leading-tight" style={{ letterSpacing: '-0.01em' }}>
                        {item.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
