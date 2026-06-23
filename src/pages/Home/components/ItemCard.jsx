// src/pages/Home/components/ItemCard.jsx
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/format';
import { menuImageUrl } from '../../../lib/supabase';

export default function ItemCard({ item }) {
  const { add, qtyOf } = useCart();
  const available = item.is_available_today;
  const img = menuImageUrl(item.image_path);
  const qty = qtyOf(item.id);

  return (
    <div className={`group flex flex-col ${available ? '' : 'opacity-45'}`}>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl"
        style={{ background: 'var(--mb-surface-base)' }}
      >
        {img ? (
          <img
            src={img}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-contain"
            style={{ filter: available ? 'none' : 'grayscale(0.5)' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: 'var(--mb-surface-paper)' }}>
            <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>photo soon</span>
          </div>
        )}

        <AnimatePresence>
          {available && qty > 0 && (
            <motion.span
              key="qty-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold shadow-sm"
              style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
            >
              {qty}
            </motion.span>
          )}
        </AnimatePresence>

        {available ? (
          <motion.button
            onClick={() => add(item)}
            aria-label={`Add ${item.name}`}
            whileTap={{ scale: 0.82 }}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md"
            style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
          >
            <Plus size={18} />
          </motion.button>
        ) : (
          <span
            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
            style={{ background: 'var(--mb-surface-paper)', color: 'var(--mb-text-muted)', letterSpacing: '0.08em' }}
          >
            not today
          </span>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium leading-tight">{item.name}</p>
        {item.price != null && item.price > 0 && (
          <p className="mt-0.5 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>
            {formatPrice(item.price)}
          </p>
        )}
      </div>
    </div>
  );
}
