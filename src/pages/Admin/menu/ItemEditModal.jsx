// src/pages/Admin/menu/ItemEditModal.jsx
// Create or edit an item. All POS fields + image upload + delete.
// Pass item={...} to edit, item={{ __new: true, group_id }} to create.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Upload } from 'lucide-react';
import { supabase, menuImageUrl } from '../../../lib/supabase';
import { slugify, uploadMenuImage } from './menuActions';

export default function ItemEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const pendingFile = useRef(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        price_dollars: ((item.price ?? 0) / 100).toFixed(2),
        description: item.description || '',
        ingredients: item.ingredients || '',
        sku: item.sku || '',
        slug: item.slug || '',
        image_path: item.image_path || '',
        is_available_today: item.is_available_today ?? true,
        track_stock: !!item.track_stock,
        stock_qty: item.stock_qty ?? 0,
      });
      setPreview(null);
      pendingFile.current = null;
      setError(null);
    }
  }, [item]);

  if (!item || !form) return null;

  const isNew = !!item.__new;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    pendingFile.current = f;
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    const price = Math.round(parseFloat(form.price_dollars || '0') * 100);
    if (!form.name.trim()) { setError('Name is required.'); setBusy(false); return; }
    if (Number.isNaN(price) || price < 0) { setError('Enter a valid price.'); setBusy(false); return; }

    try {
      const slug = form.slug || slugify(form.name);
      let image_path = form.image_path;

      if (pendingFile.current) {
        image_path = await uploadMenuImage(pendingFile.current, slug);
      }

      const payload = {
        name: form.name.trim(),
        price,
        description: form.description.trim() || null,
        ingredients: form.ingredients.trim() || null,
        sku: form.sku.trim() || `mb-${slug}`,
        slug,
        image_path: image_path || null,
        is_available_today: form.is_available_today,
        track_stock: form.track_stock,
        stock_qty: form.track_stock ? parseInt(form.stock_qty, 10) || 0 : null,
      };

      if (isNew) {
        const { error: err } = await supabase.from('items').insert({
          ...payload, group_id: item.group_id, is_active: true, sort_order: 999,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('items').update(payload).eq('id', item.id);
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Could not save.');
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setBusy(true);
    const { error: err } = await supabase.from('items').delete().eq('id', item.id);
    if (err) { setError(err.message); setBusy(false); return; }
    onSaved();
  };

  const shownImg = preview || menuImageUrl(form.image_path);
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
              <div className="p-4">
                <p className="text-base font-semibold">{isNew ? 'New item' : 'Edit item'}</p>
              </div>

              <div className="px-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative aspect-square w-full overflow-hidden rounded-2xl"
                  style={{ background: 'var(--mb-surface-paper)', border: '1px solid var(--mb-surface-line)' }}
                >
                  {shownImg ? (
                    <img src={shownImg} alt={form.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>tap to add a photo</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md" style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}>
                    <Upload size={13} /> {shownImg ? 'change' : 'upload'}
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              </div>

              <div className="space-y-4 p-4">
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
                  <input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="auto from name if blank" className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono" style={field} />
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

                {!isNew && (
                  <button onClick={remove} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--mb-accent-toast)' }}>
                    <Trash2 size={15} /> delete item
                  </button>
                )}

                {error && <p className="text-xs" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}
              </div>

              <div className="sticky bottom-0 flex gap-3 border-t p-4" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
                <button onClick={onClose} className="flex-1 rounded-full py-3 text-sm font-medium" style={{ border: '1px solid var(--mb-surface-line-strong)' }}>Cancel</button>
                <button onClick={save} disabled={busy} className="flex-1 rounded-full py-3 text-sm font-semibold disabled:opacity-60" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
                  {busy ? 'Saving…' : isNew ? 'Create' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
