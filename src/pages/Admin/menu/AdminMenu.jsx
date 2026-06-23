// src/pages/Admin/menu/AdminMenu.jsx
// Menu management. Lists categories -> items (same butter vibe as storefront).
// Tap an item to edit every POS field. Availability + inventory inline.
import { useEffect, useState, useCallback } from 'react';
import { supabase, menuImageUrl } from '../../../lib/supabase';
import ItemEditModal from './ItemEditModal';

export default function AdminMenu() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: categories } = await supabase
      .from('categories').select('*').order('sort_order');
    const { data: groups } = await supabase
      .from('groups').select('*').order('sort_order');
    const { data: items } = await supabase
      .from('items').select('*').order('sort_order');

    const tree = (categories || []).map((c) => ({
      ...c,
      groups: (groups || []).filter((g) => g.category_id === c.id).map((g) => ({
        ...g,
        items: (items || []).filter((i) => i.group_id === g.id),
      })),
    }));
    setCats(tree);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSaved = () => { setEditing(null); load(); };

  if (loading) {
    return <p className="p-8 text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading menu…</p>;
  }

  return (
    <div className="px-4 py-6 sm:px-8">
      <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Menu</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>Tap an item to edit. Toggle what's available today.</p>

      {cats.map((c) => (
        <section key={c.id} className="mt-8">
          <h2 className="text-lg font-semibold">{c.name}</h2>
          {c.groups.map((g) => (
            <div key={g.id} className="mt-4">
              {c.groups.length > 1 && (
                <h3 className="mb-3 text-xs font-medium uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>{g.name}</h3>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((item) => {
                  const img = menuImageUrl(item.image_path);
                  const dimmed = !item.is_available_today;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setEditing(item)}
                      className="flex flex-col overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.98]"
                      style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)', opacity: dimmed ? 0.5 : 1 }}
                    >
                      <div className="aspect-square w-full" style={{ background: 'var(--mb-surface-paper)' }}>
                        {img && <img src={img} alt={item.name} className="h-full w-full object-contain" style={{ filter: dimmed ? 'grayscale(0.5)' : 'none' }} />}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--mb-text-muted)' }}>
                          ${(item.price / 100).toFixed(2)}
                          {item.track_stock ? ` · ${item.stock_qty ?? 0} left` : ''}
                        </p>
                        {dimmed && <p className="mt-1 text-[10px] font-medium uppercase" style={{ color: 'var(--mb-accent-toast)', letterSpacing: '0.08em' }}>not today</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <ItemEditModal item={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
    </div>
  );
}
