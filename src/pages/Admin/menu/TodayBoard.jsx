// src/pages/Admin/menu/TodayBoard.jsx
//
// ── THE SIX AM JOB ──────────────────────────────────────────────────────────
//
// Setting what is out today is the thing this admin gets used for every single
// morning, and until now it was the slowest screen in the building. The menu
// grid is 65 photo cards two or three across, so marking a day meant scrolling
// several screens of pictures and hunting for toggles.
//
// The bulk inventory popup did not cover it either. It filters to items with
// track_stock on, and only SEVEN of the sixty five have it, so it opens on a
// short list that has nothing to do with the question being asked.
//
// This is that job and nothing else. Compact rows, a search box, and per style
// all on and all off, because a baker who did not make crullers today wants to
// clear nine flavours in one press rather than nine.
//
// ── OPTIMISTIC, WITH THE ROLLBACK THAT MATTERS ──────────────────────────────
//
// Every toggle paints immediately and reverts if the write fails. That is not
// polish, it is correctness: if a staff account has lost write access the row
// would otherwise sit there looking saved while the shop sells a tray that does
// not exist. The update asks for the row back with select and treats an empty
// result as failure, because row level security refuses a write by returning
// NO ROWS rather than an error, which is the trap. See onToggle in
// AdminMenu.jsx, which learned it first.
//
// ── WHY THE BULK WRITES ARE ONE STATEMENT ───────────────────────────────────
//
// all on and all off use a single update with an in filter. The inventory
// popup loops one update per item, which on a full rack is dozens of round
// trips that can half apply if the tab closes. Setting one column on a known
// list of ids is exactly what one statement is for.
//
// No em dashes, oxford commas or colons.

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/format';

function Toggle({ on, onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="relative h-7 w-12 flex-shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{ background: on ? 'var(--mb-accent-butter)' : 'var(--mb-surface-line-strong)' }}
      aria-label={on ? 'Out today' : 'Not today'}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full transition-transform"
        style={{
          background: 'var(--mb-surface-raised)',
          boxShadow: 'var(--mb-shadow-card)',
          transform: on ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

export default function TodayBoard({ cats, setCats, reload }) {
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  // flatten to styles once, then filter by the search box
  const styles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = [];
    for (const c of cats) {
      for (const g of c.groups || []) {
        const items = (g.items || []).filter(
          (i) => !needle || i.name.toLowerCase().includes(needle),
        );
        if (items.length) out.push({ ...g, items, categoryName: c.name });
      }
    }
    return out;
  }, [cats, q]);

  const allItems = useMemo(
    () => cats.flatMap((c) => (c.groups || []).flatMap((g) => g.items || [])),
    [cats],
  );
  const onCount = allItems.filter((i) => i.is_available_today).length;

  // paint every id in the list to `next` without touching anything else
  const paint = (ids, next) => {
    const set = new Set(ids);
    setCats((prev) => prev.map((c) => ({
      ...c,
      groups: c.groups.map((g) => ({
        ...g,
        items: g.items.map((i) => (set.has(i.id) ? { ...i, is_available_today: next } : i)),
      })),
    })));
  };

  const write = async (ids, next) => {
    setError(null);
    const before = new Map(allItems.map((i) => [i.id, i.is_available_today]));
    paint(ids, next);

    const { data, error: err } = await supabase
      .from('items')
      .update({ is_available_today: next })
      .in('id', ids)
      .select('id');

    // an empty result means row level security refused it, not that it worked
    if (err || !data || data.length !== ids.length) {
      setCats((prev) => prev.map((c) => ({
        ...c,
        groups: c.groups.map((g) => ({
          ...g,
          items: g.items.map((i) => (before.has(i.id) ? { ...i, is_available_today: before.get(i.id) } : i)),
        })),
      })));
      setError(err?.message || 'that did not save. your account may not have write access.');
      reload?.(true);
    }
  };

  const toggleOne = async (item) => {
    setBusyId(item.id);
    await write([item.id], !item.is_available_today);
    setBusyId(null);
  };

  const setStyle = async (style, next) => {
    const ids = style.items.filter((i) => i.is_available_today !== next).map((i) => i.id);
    if (!ids.length) return;
    await write(ids, next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2.5"
          style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
        >
          <Search size={17} style={{ color: 'var(--mb-text-muted)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="find a flavor"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search" style={{ color: 'var(--mb-text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>
        <p className="mb-nums text-sm font-bold" style={{ color: 'var(--mb-text-secondary)' }}>
          {onCount} of {allItems.length} out
        </p>
      </div>

      {error && (
        <p
          className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ background: 'rgba(176,114,42,0.10)', color: 'var(--mb-accent-toast)' }}
        >
          {error}
        </p>
      )}

      {styles.length === 0 && (
        <p className="mt-10 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
          nothing matches “{q}”.
        </p>
      )}

      {styles.map((style) => {
        const on = style.items.filter((i) => i.is_available_today).length;
        return (
          <section key={style.id} className="mt-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <h3 className="text-lg font-bold">{style.name}</h3>
              <span className="mb-nums text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>
                {on}/{style.items.length}
              </span>
              <span className="ml-auto flex gap-2">
                <button
                  onClick={() => setStyle(style, true)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold lowercase"
                  style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
                >
                  all on
                </button>
                <button
                  onClick={() => setStyle(style, false)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold lowercase"
                  style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
                >
                  all off
                </button>
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl" style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}>
              {style.items.map((item, idx) => {
                const noPrice = !item.price || item.price <= 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--mb-surface-line)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="mb-nums mt-0.5 text-xs font-semibold" style={{ color: noPrice ? 'var(--mb-accent-toast)' : 'var(--mb-text-secondary)' }}>
                        {/* a zero price cannot be sold, see src/data/menuShape.js */}
                        {noPrice ? 'no price set' : formatPrice(item.price)}
                        {item.track_stock ? ` · ${item.stock_qty ?? 0} left` : ''}
                      </p>
                    </div>
                    <Toggle
                      on={!!item.is_available_today}
                      busy={busyId === item.id}
                      onClick={() => toggleOne(item)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
