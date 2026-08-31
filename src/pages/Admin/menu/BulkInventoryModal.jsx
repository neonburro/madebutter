// src/pages/Admin/menu/BulkInventoryModal.jsx
// Bulk morning rack-load as a centered popup launched from the Menu screen.
// Type how many you made to ADD to on-hand, or tap -/+. Save all at once.
// Mobile = bottom sheet; desktop = wide centered rectangle.
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ButterMark from '../../../components/Brand/ButterMark';

export default function BulkInventoryModal({ open, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addById, setAddById] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('id, name, track_stock, stock_qty, sort_order')
      .order('sort_order');
    setItems((data || []).filter((i) => i.track_stock));
    setAddById({});
    setLoading(false);
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const addFor = (id) => addById[id] ?? 0;
  const setAdd = (id, val) => setAddById((m) => ({ ...m, [id]: val }));
  const onType = (id, raw) => {
    const c = raw.replace(/[^0-9]/g, '');
    setAdd(id, c === '' ? 0 : parseInt(c, 10));
  };
  const bump = (id, d) => setAdd(id, Math.max(0, addFor(id) + d));
  const dirtyCount = Object.values(addById).filter((v) => v > 0).length;

  const saveAll = async () => {
    setSaving(true);
    const updates = items.filter((it) => addFor(it.id) > 0).map((it) => ({
      id: it.id,
      stock_qty: (it.stock_qty ?? 0) + addFor(it.id),
    }));
    for (const u of updates) {
      await supabase.from('items').update({ stock_qty: u.stock_qty, is_available_today: true }).eq('id', u.id);
    }
    setSaving(false);
    onSaved && onSaved();
    onClose();
  };

  const markSoldOut = async (id) => {
    await supabase.from('items').update({ stock_qty: 0 }).eq('id', id);
    load();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80]" style={{ background: 'var(--mb-scrim)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" onClick={onClose}>
            <motion.div
              className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:max-h-[88vh] sm:max-w-3xl sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b p-4 sm:px-6" style={{ borderColor: 'var(--mb-surface-line)' }}>
                <div className="flex items-center gap-2.5">
                  <ButterMark size={24} />
                  <div>
                    <p className="text-base font-semibold">Today's inventory</p>
                    <p className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>Add what you just made. Save once.</p>
                  </div>
                </div>
                <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:px-6">
                {loading ? (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading…</p>
                ) : items.length === 0 ? (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--mb-text-muted)' }}>
                    No tracked items. Turn on "track inventory" for an item to manage it here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((it) => {
                      const add = addFor(it.id);
                      const onHand = it.stock_qty ?? 0;
                      const newTotal = onHand + add;
                      return (
                        <div key={it.id} className="rounded-2xl p-3" style={{ border: '1px solid var(--mb-surface-line)' }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{it.name}</p>
                              <p className="mt-0.5 text-xs" style={{ color: onHand === 0 ? 'var(--mb-accent-toast)' : 'var(--mb-text-muted)' }}>
                                {onHand === 0 ? 'sold out' : `on hand: ${onHand}`}
                                {add > 0 && <span style={{ color: '#7AA85A' }}> → {newTotal}</span>}
                              </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-1.5">
                              <button onClick={() => bump(it.id, -1)} aria-label="minus" className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ border: '1px solid var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}><Minus size={16} /></button>
                              <input value={add === 0 ? '' : add} onChange={(e) => onType(it.id, e.target.value)} onFocus={(e) => e.target.select()} inputMode="numeric" placeholder="0"
                                className="h-9 w-12 rounded-lg text-center text-sm font-semibold outline-none" style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }} />
                              <button onClick={() => bump(it.id, 1)} aria-label="plus" className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ border: '1px solid var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}><Plus size={16} /></button>
                            </div>
                          </div>
                          <button onClick={() => markSoldOut(it.id)} className="mt-2 text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>mark sold out</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t p-4 sm:px-6" style={{ borderColor: 'var(--mb-surface-line)' }}>
                  <button onClick={saveAll} disabled={saving || dirtyCount === 0}
                    className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
                    style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
                    {saving ? 'Saving…' : dirtyCount === 0 ? 'Add counts above to save' : `Save all (${dirtyCount})`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
