// src/pages/Admin/pos/POSOptionSheet.jsx
//
// The register's add on picker. Same questions the website asks, answered by
// somebody standing at a counter with a queue behind them, which changes the
// design in three ways:
//
//   BIG. Every answer is a 60px row. This gets used with one thumb, at speed,
//   on a tablet that is probably at an angle on a stand.
//
//   NO SCROLLING TO THE BUTTON. Add is pinned to the bottom of the sheet, not
//   at the end of the list, because a drink with three questions is taller than
//   the sheet and the most pressed control must never move.
//
//   OPENS ONLY WHEN IT HAS TO. POSRegister taps an item straight into the cart
//   when it asks no questions. This sheet is the exception, not the path.
//
// Required groups open with their first answer chosen, same as the website, so
// the common order is one tap and Add.
//
// The rules and the running total come from src/data/options.js. Nothing here
// is trusted either, pos-order.js re-derives it all through the same priceLine
// the online checkout uses.
//
// No em dashes, oxford commas or colons.

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import {
  optionGroupsFor, optionsPrice, selectionProblem, flattenSelection,
} from '../../../data/options';

const money = (c) => `$${((c || 0) / 100).toFixed(2)}`;

function initialSelection(item) {
  const out = {};
  for (const g of optionGroupsFor(item)) {
    const first = (g.options || [])[0];
    out[g.id] = (g.min_select || 0) > 0 && first ? [first.id] : [];
  }
  return out;
}

export default function POSOptionSheet({ item, onAdd, onClose }) {
  const [selected, setSelected] = useState({});

  useEffect(() => { setSelected(item ? initialSelection(item) : {}); }, [item]);

  const groups = item ? optionGroupsFor(item) : [];
  const chosen = flattenSelection(groups, selected);
  const problem = selectionProblem(groups, selected);
  const total = (item?.price || 0) + optionsPrice(chosen);

  const toggle = (group, optionId) => {
    setSelected((prev) => {
      const picked = prev[group.id] || [];
      const max = group.max_select || 1;
      const min = group.min_select || 0;
      if (max === 1) {
        if (picked.includes(optionId)) return { ...prev, [group.id]: min > 0 ? picked : [] };
        return { ...prev, [group.id]: [optionId] };
      }
      if (picked.includes(optionId)) {
        return { ...prev, [group.id]: picked.filter((id) => id !== optionId) };
      }
      if (picked.length >= max) return prev;
      return { ...prev, [group.id]: [...picked, optionId] };
    });
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-[90]"
            style={{ background: 'var(--mb-scrim)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:inset-y-0 sm:left-auto sm:right-6 sm:my-auto sm:max-h-[88vh] sm:rounded-3xl"
            style={{ background: 'var(--mb-surface-base)', boxShadow: 'var(--mb-shadow-lift)' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-3 border-b p-5" style={{ borderColor: 'var(--mb-surface-line)' }}>
              <div>
                <p className="text-xl font-bold leading-tight">{item.name}</p>
                <p className="mb-nums mt-0.5 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
                  {money(item.price)}
                </p>
              </div>
              <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}>
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {groups.map((g) => {
                const picked = selected[g.id] || [];
                const multi = (g.max_select || 1) > 1;
                return (
                  <div key={g.id} className="mb-6 last:mb-0">
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
                            className="flex min-h-[60px] items-center gap-3 rounded-2xl px-4 text-left transition-transform active:scale-[0.98]"
                            style={{
                              background: 'var(--mb-surface-raised)',
                              boxShadow: on
                                ? '0 0 0 2px var(--mb-accent-butter), var(--mb-shadow-card)'
                                : 'var(--mb-shadow-card)',
                            }}
                          >
                            <span
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center"
                              style={{
                                borderRadius: multi ? '8px' : '999px',
                                background: on ? 'var(--mb-accent-butter)' : 'var(--mb-surface-sunk)',
                              }}
                            >
                              {on && <Check size={17} strokeWidth={3} />}
                            </span>
                            <span className="flex-1 text-base font-bold">{o.name}</span>
                            {o.price_delta > 0 && (
                              <span className="mb-nums text-sm font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
                                +{money(o.price_delta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* pinned, never at the end of the list */}
            <div className="border-t p-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
              {problem && (
                <p className="mb-2 text-center text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>
                  {problem}
                </p>
              )}
              <button
                onClick={() => { if (!problem) { onAdd(item, chosen); onClose(); } }}
                disabled={!!problem}
                className="w-full rounded-full py-4 text-base font-bold transition-transform active:scale-[0.99] disabled:opacity-50"
                style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
              >
                Add <span className="mb-nums">{money(total)}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
