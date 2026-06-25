// src/pages/Home/components/MoreFlavorsModal.jsx
// Popup of a subgroup's not-today flavors. Full screen on mobile, large sheet on
// iPad, big centered card on desktop. Dimmed, not orderable, tap a flavor for its
// info. Scrolls when there are many. Broad friendly copy.
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
            style={{ background: 'rgba(15,14,13,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-6" onClick={onClose}>
            <motion.div
              className="flex w-full flex-col overflow-hidden bg-white sm:max-h-[88vh] sm:max-w-2xl sm:rounded-3xl lg:max-w-4xl"
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
                    More of our flavors
                  </h2>
                  <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--mb-text-secondary)' }}>
                    Not on the counter today, but they will be back around. Take a peek and start scheming.
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
                    <button key={item.id} onClick={() => onPick?.(item)} className="flex flex-col text-left opacity-65 transition-all hover:opacity-100 hover:-translate-y-0.5">
                      <div className="aspect-square w-full overflow-hidden rounded-2xl" style={{ background: 'var(--mb-surface-paper)' }}>
                        {img ? (
                          <img src={img} alt={item.name} loading="lazy" className="h-full w-full object-contain" style={{ filter: 'grayscale(0.4)' }} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>photo soon</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-tight">{item.name}</p>
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
