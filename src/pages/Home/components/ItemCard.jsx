// src/pages/Home/components/ItemCard.jsx
//
// One flavour. Tap the plate for the detail popup, press the plus to add.
//
// ── A SOLD OUT ITEM STILL HAS TO BE READABLE ────────────────────────────────
// The whole card used to drop to opacity 45 when it was unavailable, name and
// price included, which made it a pale rectangle you could not identify. That
// is backwards. Somebody looking at a sold out flavour is asking WHAT WAS IT,
// and the answer has to survive. So the picture dims and desaturates and the
// words do not move at all. The state is carried by the plate and by the pill,
// never by hiding the name.
//
// ── THE PLATE WITH NO PHOTO ─────────────────────────────────────────────────
// It said "photo soon" in muted text on near white, which was invisible and
// was also a coming soon in disguise, and this shop does not say that anywhere.
// Now it is a sunk well with the house mark ghosted into it. It reads as a
// plate waiting for its picture rather than as a broken card, and it says
// nothing, which is the correct amount to say about a missing photograph.
//
// ── WHY THE PLUS IS NOT INSIDE THE PLATE BUTTON ─────────────────────────────
// It used to be a span with role button nested inside the real button, which is
// invalid and gives screen readers a control inside a control. They are
// siblings now, both absolutely placed over a positioned wrapper, so the plate
// is one button and the plus is another.
//
// No em dashes, oxford commas or colons.

import { Plus, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/format';
import { menuImageUrl } from '../../../lib/supabase';

// Below this many we say how many are left. Above it the number is noise.
const LOW_STOCK_AT = 6;

export default function ItemCard({ item, onOpen }) {
  const { add, qtyOf, atCap } = useCart();
  const img = menuImageUrl(item.image_path);
  const qty = qtyOf(item.id);

  const tracks = item.track_stock && item.stock_qty != null;
  const soldOut = tracks && item.stock_qty <= 0;
  const lowStock = tracks && item.stock_qty > 0 && item.stock_qty <= LOW_STOCK_AT;
  const available = item.is_available_today && !soldOut;
  const capped = atCap(item);
  const inBox = qty > 0;

  return (
    <div className="group relative flex flex-col">
      <div className="relative">
        <button
          onClick={() => onOpen?.(item)}
          className="relative block aspect-square w-full overflow-hidden text-left"
          style={{
            borderRadius: 'var(--mb-radius-plate)',
            background: img ? 'var(--mb-surface-raised)' : 'var(--mb-surface-sunk)',
            boxShadow: inBox
              ? '0 0 0 2px var(--mb-accent-butter), var(--mb-shadow-card)'
              : 'var(--mb-shadow-card)',
            transition: 'box-shadow 0.25s var(--mb-ease), transform 0.25s var(--mb-ease)',
          }}
          aria-label={`View ${item.name}`}
        >
          {img ? (
            <img
              src={img}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              style={{
                filter: available ? 'none' : 'grayscale(0.85)',
                opacity: available ? 1 : 0.5,
              }}
            />
          ) : (
            // the ghosted mark. no words, on purpose.
            <div className="flex h-full w-full items-center justify-center">
              <img
                src="/madebutter-mark.png"
                alt=""
                width="56"
                height="56"
                className="h-14 w-14"
                style={{ opacity: 0.14 }}
              />
            </div>
          )}

          {available && lowStock && (
            <span
              className="mb-nums absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'var(--mb-surface-raised)', color: 'var(--mb-accent-toast)', boxShadow: 'var(--mb-shadow-card)' }}
            >
              {item.stock_qty} left
            </span>
          )}

          {!available && (
            <span
              className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
              style={{
                background: 'var(--mb-surface-raised)',
                color: 'var(--mb-text-secondary)',
                letterSpacing: '0.08em',
                boxShadow: 'var(--mb-shadow-card)',
              }}
            >
              {soldOut ? 'sold out' : 'not today'}
            </span>
          )}
        </button>

        {/* sibling of the plate button, never a child of it */}
        {available && (
          <motion.button
            onClick={() => { if (!capped) add(item); }}
            disabled={capped}
            aria-label={capped ? `${item.name} limit reached` : `Add ${item.name}`}
            whileTap={capped ? {} : { scale: 0.84 }}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: capped ? 'var(--mb-surface-sunk)' : 'var(--mb-accent-butter)',
              color: capped ? 'var(--mb-text-muted)' : 'var(--mb-text-primary)',
              cursor: capped ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--mb-shadow-card)',
            }}
          >
            {capped ? <Check size={18} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
          </motion.button>
        )}

        <AnimatePresence>
          {available && inBox && (
            <motion.span
              key="qty-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="mb-nums pointer-events-none absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold"
              style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)', boxShadow: 'var(--mb-shadow-card)' }}
            >
              {qty}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* full contrast whatever the plate is doing */}
      <div className="mt-2.5 px-1">
        <p className="text-[15px] font-bold leading-tight" style={{ letterSpacing: '-0.01em' }}>
          {item.name}
        </p>
        {item.price != null && item.price > 0 && (
          <p className="mb-nums mt-0.5 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
            {formatPrice(item.price)}
          </p>
        )}
      </div>
    </div>
  );
}
