// src/pages/Admin/menu/ItemEditModal.jsx
// Edit every POS field on an item: name, price, description, ingredients, sku,
// availability today, and inventory (track + qty). Writes to Supabase.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase, menuImageUrl } from '../../../lib/supabase';

export default function ItemEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        price_dollars: ((item.price ?? 0) / 100).toFixed(2),
        description: item.description || '',
        ingredients: item.ingredients || '',
        sku: item.sku || '',
        is_available_today: !!item.is_available_today,
        track_stock: !!item.track_stock,
        stock_qty: item.stock_qty ?? 0,
      });
      setError(null);
    }
  }, [item]);

  if (!item || !form) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true);
    setError(null);
    const price = Math.round(parseFloat(form.price_dollars || '0') * 100);
    if (Number.isNaN(price) || price < 0) { setError('Enter a valid price.'); setBusy(false); return; }

    const { error: err } = await supabase
      .from('items')
      .update({
        name: form.name.trim(),
        price,
        description: form.description.trim() || null,
        ingredients: form.ingredients.trim() || null,
        sku: form.sku.trim() || null,
        is_available_today: form.is_available_today,
        track_stock: form.track_stock,
        stock_qty: form.track_stock ? parseInt(form.stock_qty, 10) || 0 : null,
      })
      .eq('id', item.id);

    if (err) { setError(err.message); setBusy(false); return; }
    onSaved();
  };

  const img = menuImageUrl(item.image_path);
  const field = { border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,14,13,0.45)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" onClick={onClose}>
            <motion.div
              className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: 'var(--mb-surface-paper)' }}>
                  {img && <img src={img} alt={form.name} className="h-full w-full object-contain" />}
                </div>
                <p className="text-base font-semibold">{form.name || 'Edit item'}</p>
              </div>

              <div className="space-y-4 px-4 pb-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>Name</span>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={field} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>Price (dollars)</span>
                  <input value={form.price_dollars} onChange={(e) => set('price_dollars', e.target.value)} inputMode="decimal" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={field} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>Description</span>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={field} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>Ingredients (use • between items)</span>
                  <textarea value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} rows={2} placeholder="flour • butter • matcha • cane sugar" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={field} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>SKU</span>
                  <input value={form.sku} onChange={(e) => set('sku', e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono" style={field} />
                </label>

                <button onClick={() => set('is_available_today', !form.is_available_today)} className="flex w-full items-center justify-between rounded-xl px-3 py-3" style={field}>
                  <span className="text-sm font-medium">Available today</span>
                  <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: form.is_available_today ? 'var(--mb-accent-butter)' : 'var(--mb-surface-line-strong)' }}>
                    <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: form.is_available_today ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </span>
                </button>

                <button onClick={() => set('track_stock', !form.track_stock)} className="flex w-full items-center justify-between rounded-xl px-3 py-3" style={field}>
                  <span className="text-sm font-medium">Track inventory</span>
                  <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: form.track_stock ? 'var(--mb-accent-butter)' : 'var(--mb-surface-line-strong)' }}>
                    <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ transform: form.track_stock ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </span>
                </button>

                {form.track_stock && (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>How many made today</span>
                    <input value={form.stock_qty} onChange={(e) => set('stock_qty', e.target.value)} inputMode="numeric" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={field} />
                  </label>
                )}

                {error && <p className="text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
              </div>

              <div className="sticky bottom-0 flex gap-3 border-t p-4" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
                <button onClick={onClose} className="flex-1 rounded-full py-3 text-sm font-medium" style={{ border: '1px solid var(--mb-surface-line-strong)' }}>Cancel</button>
                <button onClick={save} disabled={busy} className="flex-1 rounded-full py-3 text-sm font-semibold disabled:opacity-60" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
