// src/pages/Home/components/ItemDetailModal.jsx
//
// The item sheet. It was informational only, an image and a description with a
// Close button, which meant tapping a card was a dead end and the only way to
// buy anything was the small plus in the corner of the grid. It is now where
// you answer an item's questions and add it, and for an item with no questions
// it is simply a bigger way to add the same thing.
//
// ── DEFAULTS ARE PRESELECTED WHEN A CHOICE IS REQUIRED ──────────────────────
// A group with min_select of one gets its first option chosen on open, so the
// add button works the moment the sheet appears and nobody is stopped by a
// question they did not know they had been asked. Whole milk is first in the
// Milk group for exactly this reason. Optional groups start empty.
//
// ── IT IS A SHEET ON A PHONE ────────────────────────────────────────────────
// Bottom aligned and near full height on small screens, a centred card from sm
// up. A question list can run long and a centred box on a phone puts the add
// button somewhere a thumb cannot reach, which is the whole reason this is not
// the small dialog it used to be.
//
// ── PRICES SHOWN HERE ARE NOT THE PRICES CHARGED ────────────────────────────
// The running total is display. create-payment-intent.js recomputes everything
// from the database and rejects any option the item does not actually offer.
// See the note in src/data/options.js.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Plus } from 'lucide-react';
import { formatPrice } from '../../../lib/format';
import { menuImageUrl } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import {
  optionGroupsFor, optionsPrice, selectionProblem, flattenSelection,
} from '../../../data/options';

// Required single choice groups open with their first answer already picked.
function initialSelection(item) {
  const out = {};
  for (const g of optionGroupsFor(item)) {
    const first = (g.options || [])[0];
    out[g.id] = (g.min_select || 0) > 0 && first ? [first.id] : [];
  }
  return out;
}

export default function ItemDetailModal({ item, onClose }) {
  const { add, atCap } = useCart();
  const [selected, setSelected] = useState({});

  // reset every time a different item opens, never carry answers between items
  useEffect(() => { setSelected(item ? initialSelection(item) : {}); }, [item]);

  if (!item) return <AnimatePresence />;

  const groups = optionGroupsFor(item);
  const chosen = flattenSelection(groups, selected);
  const problem = selectionProblem(groups, selected);
  const capped = atCap(item);
  const soldOut = item.track_stock && item.stock_qty != null && item.stock_qty <= 0;
  const orderable = item.price > 0 && item.is_available_today && !soldOut;
  const total = (item.price || 0) + optionsPrice(chosen);

  const toggle = (group, optionId) => {
    setSelected((prev) => {
      const picked = prev[group.id] || [];
      const max = group.max_select || 1;
      const min = group.min_select || 0;

      if (max === 1) {
        // a radio, except an optional one can be unpicked by pressing it again
        if (picked.includes(optionId)) return { ...prev, [group.id]: min > 0 ? picked : [] };
        return { ...prev, [group.id]: [optionId] };
      }
      if (picked.includes(optionId)) {
        return { ...prev, [group.id]: picked.filter((id) => id !== optionId) };
      }
      // at the ceiling, ignore rather than silently dropping somebody's earlier pick
      if (picked.length >= max) return prev;
      return { ...prev, [group.id]: [...picked, optionId] };
    });
  };

  const onAdd = () => {
    if (problem || !orderable || capped) return;
    add(item, chosen);
    onClose();
  };

  const img = menuImageUrl(item.image_path);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'var(--mb-scrim)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:px-5"
            onClick={onClose}
          >
            <motion.div
              className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-h-[88vh] sm:max-w-md sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)', boxShadow: 'var(--mb-shadow-lift)' }}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="relative">
                  <div
                    className="flex aspect-[16/10] w-full items-center justify-center sm:aspect-square"
                    style={{ background: img ? 'var(--mb-surface-raised)' : 'var(--mb-surface-sunk)' }}
                  >
                    {img
                      ? <img src={img} alt={item.name} className="h-full w-full object-contain" />
                      : <img src="/madebutter-mark.png" alt="" width="64" height="64" className="h-16 w-16" style={{ opacity: 0.14 }} />}
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="close"
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="mb-display text-2xl font-semibold leading-tight">{item.name}</h2>
                    {item.price > 0 && (
                      <span className="mb-nums mt-1 flex-shrink-0 text-base font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="mt-3 text-[15px] font-medium leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
                      {item.description}
                    </p>
                  )}

                  {groups.map((g) => {
                    const picked = selected[g.id] || [];
                    const multi = (g.max_select || 1) > 1;
                    return (
                      <div key={g.id} className="mt-6">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-base font-bold">{g.name}</h3>
                          <span className="text-xs font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
                            {g.helper || (g.min_select > 0 ? 'required' : 'optional')}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-col gap-2">
                          {(g.options || []).map((o) => {
                            const on = picked.includes(o.id);
                            return (
                              <button
                                key={o.id}
                                onClick={() => toggle(g, o.id)}
                                aria-pressed={on}
                                className="flex min-h-[52px] items-center gap-3 rounded-2xl px-4 text-left"
                                style={{
                                  background: 'var(--mb-surface-raised)',
                                  boxShadow: on
                                    ? '0 0 0 2px var(--mb-accent-butter), var(--mb-shadow-card)'
                                    : 'var(--mb-shadow-card)',
                                }}
                              >
                                <span
                                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center"
                                  style={{
                                    // a circle asks for one, a square asks for any number
                                    borderRadius: multi ? '7px' : '999px',
                                    background: on ? 'var(--mb-accent-butter)' : 'var(--mb-surface-sunk)',
                                  }}
                                >
                                  {on && <Check size={15} strokeWidth={3} />}
                                </span>
                                <span className="flex-1 text-[15px] font-semibold">{o.name}</span>
                                {o.price_delta > 0 && (
                                  <span className="mb-nums text-sm font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
                                    +{formatPrice(o.price_delta)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {item.ingredients && (
                    <div className="mt-6">
                      <p className="mb-1 text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>
                        ingredients
                      </p>
                      <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'var(--mb-text-secondary)' }}>
                        {item.ingredients}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t p-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
                {!orderable ? (
                  <p className="py-2 text-center text-[15px] font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                    {soldOut ? 'that one is gone. it goes fast.' : 'not out today.'}
                  </p>
                ) : (
                  <>
                    {problem && (
                      <p className="mb-2 text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>
                        {problem}
                      </p>
                    )}
                    <button
                      onClick={onAdd}
                      disabled={!!problem || capped}
                      className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold lowercase transition-transform active:scale-[0.99] disabled:opacity-55"
                      style={{
                        background: 'var(--mb-accent-butter)',
                        color: 'var(--mb-text-primary)',
                        boxShadow: 'var(--mb-shadow-card)',
                      }}
                    >
                      {capped ? 'that is all we have' : (
                        <>
                          <Plus size={20} strokeWidth={2.5} />
                          add to box
                          <span className="mb-nums">{formatPrice(total)}</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
