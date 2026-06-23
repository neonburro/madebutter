// src/pages/Home/components/ItemDetailModal.jsx
// Simple info popup: image, name, description, ingredients. Close button + click-outside.
// No add-to-cart here by design — purely informational.
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '../../../lib/format';
import { menuImageUrl } from '../../../lib/supabase';

export default function ItemDetailModal({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(15,14,13,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-5" onClick={onClose}>
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-3xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-square w-full" style={{ background: 'var(--mb-surface-paper)' }}>
                {menuImageUrl(item.image_path) ? (
                  <img src={menuImageUrl(item.image_path)} alt={item.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>photo soon</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold leading-tight" style={{ letterSpacing: 'var(--tracking-heading)' }}>
                    {item.name}
                  </h2>
                  {item.price > 0 && (
                    <span className="mt-0.5 flex-shrink-0 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
                    {item.description}
                  </p>
                )}

                {item.ingredients && (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-medium uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>
                      Ingredients
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
                      {item.ingredients}
                    </p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99]"
                  style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
