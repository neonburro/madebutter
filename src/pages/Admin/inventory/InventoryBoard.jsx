// src/pages/Admin/inventory/InventoryBoard.jsx
// Morning rack-load screen. Every tracked item gets a clean count control:
// type a number to ADD to what's on hand, or use the -/+ steppers. The live
// "new total" shows what it will become. Save All writes every change at once.
// Mobile-first; roomier on desktop.
import { useEffect, useState, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ButterMark from '../../../components/Brand/ButterMark';

export default function InventoryBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addById, setAddById] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('id, name, slug, track_stock, stock_qty, is_available_today, group_id, sort_order')
      .order('sort_order');
    setItems((data || []).filter((i) => i.track_stock));
    setAddById({});
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFor = (id) => addById[id] ?? 0;
  const setAdd = (id, val) => setAddById((m) => ({ ...m, [id]: val }));

  const onType = (id, raw) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    setAdd(id, cleaned === '' ? 0 : parseInt(cleaned, 10));
  };
  const bump = (id, delta) => setAdd(id, Math.max(0, addFor(id) + delta));

  const dirtyCount = Object.values(addById).filter((v) => v > 0).length;

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    const updates = items
      .filter((it) => addFor(it.id) > 0)
      .map((it) => ({
        id: it.id,
        stock_qty: (it.stock_qty ?? 0) + addFor(it.id),
        is_available_today: true,
      }));
    for (const u of updates) {
      await supabase.from('items').update({ stock_qty: u.stock_qty, is_available_today: u.is_available_today }).eq('id', u.id);
    }
    setSaving(false);
    setSaved(true);
    await load();
    setTimeout(() => setSaved(false), 2200);
  };

  const markSoldOut = async (id) => {
    await supabase.from('items').update({ stock_qty: 0 }).eq('id', id);
    load();
  };

  if (loading) return <p className="p-8 text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading inventory…</p>;

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex items-center gap-2.5">
        <ButterMark size={26} />
        <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Today's inventory</h1>
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>
        Type how many you just made to add to the rack, or tap to nudge. Save once.
      </p>

      {items.length === 0 && (
        <p className="mt-8 text-sm" style={{ color: 'var(--mb-text-muted)' }}>
          No tracked items yet. Turn on "track inventory" for an item in Menu to manage it here.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((it) => {
          const add = addFor(it.id);
          const onHand = it.stock_qty ?? 0;
          const newTotal = onHand + add;
          const low = newTotal > 0 && newTotal <= 6;
          return (
            <div key={it.id} className="rounded-2xl p-4" style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: onHand === 0 ? 'var(--mb-accent-toast)' : low ? 'var(--mb-accent-toast)' : 'var(--mb-text-muted)' }}>
                    {onHand === 0 ? 'sold out' : `on hand: ${onHand}`}
                    {add > 0 && <span style={{ color: '#7AA85A' }}> → {newTotal}</span>}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button onClick={() => bump(it.id, -1)} aria-label="subtract one"
                    className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ border: '1px solid var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}>
                    <Minus size={16} />
                  </button>
                  <input
                    value={add === 0 ? '' : add}
                    onChange={(e) => onType(it.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    inputMode="numeric"
                    placeholder="0"
                    className="h-9 w-14 rounded-lg text-center text-sm font-semibold outline-none"
                    style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
                  />
                  <button onClick={() => bump(it.id, 1)} aria-label="add one"
                    className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ border: '1px solid var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => markSoldOut(it.id)} className="text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>
                  mark sold out
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="sticky bottom-4 mt-6">
          {saved && <p className="mb-2 text-center text-sm font-medium" style={{ color: '#7AA85A' }}>Inventory updated.</p>}
          <button
            onClick={saveAll}
            disabled={saving || dirtyCount === 0}
            className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
          >
            {saving ? 'Saving…' : dirtyCount === 0 ? 'Add counts above to save' : `Save all (${dirtyCount})`}
          </button>
        </div>
      )}
    </div>
  );
}
