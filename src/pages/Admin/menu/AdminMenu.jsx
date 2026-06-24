// src/pages/Admin/menu/AdminMenu.jsx
// Menu management. Categories -> groups -> items. Drag items to reorder (dnd-kit),
// tap to edit, add new items per group. Order persists to sort_order.
import { useEffect, useState, useCallback } from 'react';
import { Plus, Boxes } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, menuImageUrl } from '../../../lib/supabase';
import { persistOrder } from './menuActions';
import ItemEditModal from './ItemEditModal';
import BulkInventoryModal from './BulkInventoryModal';

function SortableItem({ item, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const dimmed = !item.is_available_today;
  const img = menuImageUrl(item.image_path);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : dimmed ? 0.5 : 1,
    touchAction: 'none',
    background: 'var(--mb-surface-base)',
    border: '1px solid var(--mb-surface-line)',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={() => onEdit(item)}
      className="flex cursor-grab flex-col overflow-hidden rounded-2xl text-left active:cursor-grabbing"
    >
      <div className="aspect-square w-full" style={{ background: 'var(--mb-surface-paper)' }}>
        {img && <img src={img} alt={item.name} className="h-full w-full object-contain" style={{ filter: dimmed ? 'grayscale(0.5)' : 'none' }} draggable={false} />}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-tight">{item.name}</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--mb-text-muted)' }}>
          ${(item.price / 100).toFixed(2)}{item.track_stock ? ` · ${item.stock_qty ?? 0} left` : ''}
        </p>
        {dimmed && <p className="mt-1 text-[10px] font-medium uppercase" style={{ color: 'var(--mb-accent-toast)', letterSpacing: '0.08em' }}>not today</p>}
      </div>
    </div>
  );
}

function GroupGrid({ group, onEdit, onReorder, onAdd }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const onDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = group.items.map((i) => i.id);
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    const reordered = arrayMove(group.items, from, to);
    onReorder(group.id, reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={group.items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {group.items.map((item) => (
            <SortableItem key={item.id} item={item} onEdit={onEdit} />
          ))}
          <button
            onClick={() => onAdd(group.id)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl text-sm font-medium"
            style={{ border: '2px dashed var(--mb-surface-line-strong)', color: 'var(--mb-text-muted)' }}
          >
            <Plus size={22} /> add item
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function AdminMenu() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const { data: categories } = await supabase.from('categories').select('*').order('sort_order');
    const { data: groups } = await supabase.from('groups').select('*').order('sort_order');
    const { data: items } = await supabase.from('items').select('*').order('sort_order');
    const tree = (categories || []).map((c) => ({
      ...c,
      groups: (groups || []).filter((g) => g.category_id === c.id).map((g) => ({
        ...g,
        items: (items || []).filter((i) => i.group_id === g.id),
      })),
    }));
    setCats(tree);
    if (!quiet) setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSaved = () => { setEditing(null); load(true); };

  const onReorder = async (groupId, reordered) => {
    setCats((prev) => prev.map((c) => ({
      ...c,
      groups: c.groups.map((g) => g.id === groupId ? { ...g, items: reordered } : g),
    })));
    try {
      await persistOrder('items', reordered.map((it, idx) => ({ id: it.id, sort_order: idx })));
    } catch {
      load(true);
    }
  };

  if (loading) return <p className="p-8 text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading menu…</p>;

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Menu</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--mb-text-muted)' }}>Drag to reorder. Tap to edit. Use + to add an item.</p>
        </div>
        <button
          onClick={() => setBulkOpen(true)}
          className="flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
          style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}
        >
          <Boxes size={16} /> Bulk inventory
        </button>
      </div>

      {cats.map((c) => (
        <section key={c.id} className="mt-8">
          <h2 className="text-lg font-semibold">{c.name}</h2>
          {c.groups.map((g) => (
            <div key={g.id} className="mt-4">
              {c.groups.length > 1 && (
                <h3 className="mb-3 text-xs font-medium uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>{g.name}</h3>
              )}
              <GroupGrid group={g} onEdit={setEditing} onReorder={onReorder} onAdd={(gid) => setEditing({ __new: true, group_id: gid })} />
            </div>
          ))}
        </section>
      ))}

      <ItemEditModal item={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      <BulkInventoryModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSaved={() => load(true)} />
    </div>
  );
}
