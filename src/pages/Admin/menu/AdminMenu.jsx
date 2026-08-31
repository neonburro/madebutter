// src/pages/Admin/menu/AdminMenu.jsx
//
// Menu management, in two views over the same loaded tree.
//
//   today     the six am job. compact rows, search, per style all on and all
//             off. see TodayBoard.jsx for why this exists and why it is the
//             default rather than the grid.
//   arrange   the maintenance job. photo cards you can drag to reorder and tap
//             to edit, plus add item.
//
// The split is deliberate. Those are two different tasks on two different
// clocks, one every morning and one every few weeks, and one screen trying to
// be both is what made setting a day slow. The tree is fetched ONCE here and
// handed to whichever view is showing, so switching costs nothing and both
// views agree about what is on.
//
// ── THE ROW LEVEL SECURITY TRAP, WRITTEN DOWN ONCE ──────────────────────────
// A write refused by RLS comes back with NO ERROR and an empty data array. So
// every optimistic write in here asks for the row back with select and treats
// zero rows as a failure. Drop the select and a staff account without write
// access gets a UI that lies to it. TodayBoard.jsx does the same thing for the
// same reason.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState, useCallback } from 'react';
import { Plus, Boxes, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, menuImageUrl } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/format';
import { persistOrder } from './menuActions';
import ItemEditModal from './ItemEditModal';
import BulkInventoryModal from './BulkInventoryModal';
import TodayBoard from './TodayBoard';

function Toggle({ on, onClick, busy }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
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

function SortableItem({ item, onEdit, onToggle, busyId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const dimmed = !item.is_available_today;
  const img = menuImageUrl(item.image_path);
  const noPrice = !item.price || item.price <= 0;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: 'var(--mb-surface-raised)',
    boxShadow: 'var(--mb-shadow-card)',
  };
  return (
    <div ref={setNodeRef} style={style} className="flex flex-col overflow-hidden rounded-2xl text-left">
      <button onClick={() => onEdit(item)} className="relative aspect-square w-full" style={{ background: img ? 'var(--mb-surface-raised)' : 'var(--mb-surface-sunk)' }}>
        {img
          ? <img src={img} alt={item.name} className="h-full w-full object-contain" style={{ filter: dimmed ? 'grayscale(0.55)' : 'none', opacity: dimmed ? 0.6 : 1 }} draggable={false} />
          : <span className="flex h-full w-full items-center justify-center">
              <img src="/madebutter-mark.png" alt="" width="40" height="40" className="h-10 w-10" style={{ opacity: 0.16 }} />
            </span>}
        <span
          {...attributes} {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1.5 top-1.5 flex h-8 w-8 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
          style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)', touchAction: 'none' }}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} style={{ color: 'var(--mb-text-muted)' }} />
        </span>
      </button>

      <div className="p-3">
        <button onClick={() => onEdit(item)} className="block w-full text-left">
          <p className="text-sm font-bold leading-tight">{item.name}</p>
          <p className="mb-nums mt-1 text-xs font-semibold" style={{ color: noPrice ? 'var(--mb-accent-toast)' : 'var(--mb-text-secondary)' }}>
            {noPrice ? 'no price set' : formatPrice(item.price)}{item.track_stock ? ` · ${item.stock_qty ?? 0} left` : ''}
          </p>
        </button>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.06em', color: dimmed ? 'var(--mb-text-muted)' : 'var(--mb-text-primary)' }}>
            {dimmed ? 'not today' : 'today'}
          </span>
          <Toggle on={!dimmed} busy={busyId === item.id} onClick={() => onToggle(item)} />
        </div>
      </div>
    </div>
  );
}

function GroupGrid({ group, onEdit, onReorder, onAdd, onToggle, busyId }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
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
            <SortableItem key={item.id} item={item} onEdit={onEdit} onToggle={onToggle} busyId={busyId} />
          ))}
          <button
            onClick={() => onAdd(group.id)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl text-sm font-bold lowercase"
            style={{ border: '2px dashed var(--mb-surface-line-strong)', color: 'var(--mb-text-secondary)' }}
          >
            <Plus size={24} /> add item
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function AdminMenu() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');
  const [editing, setEditing] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toggleError, setToggleError] = useState(null);

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

  const onToggle = async (item) => {
    const next = !item.is_available_today;
    setBusyId(item.id);
    setToggleError(null);
    setCats((prev) => prev.map((c) => ({
      ...c,
      groups: c.groups.map((g) => ({
        ...g,
        items: g.items.map((i) => i.id === item.id ? { ...i, is_available_today: next } : i),
      })),
    })));
    const { data, error } = await supabase
      .from('items')
      .update({ is_available_today: next })
      .eq('id', item.id)
      .select('id');
    setBusyId(null);
    if (error || !data || data.length === 0) {
      setCats((prev) => prev.map((c) => ({
        ...c,
        groups: c.groups.map((g) => ({
          ...g,
          items: g.items.map((i) => i.id === item.id ? { ...i, is_available_today: !next } : i),
        })),
      })));
      setToggleError(error?.message || 'that did not save. your account may not have write access.');
    }
  };

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

  if (loading) {
    return <p className="p-8 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>loading menu…</p>;
  }

  const tab = (key, label) => (
    <button
      key={key}
      onClick={() => setView(key)}
      className="rounded-full px-4 py-2 text-sm font-bold lowercase"
      style={{
        background: view === key ? 'var(--mb-accent-butter)' : 'var(--mb-surface-raised)',
        color: 'var(--mb-text-primary)',
        boxShadow: 'var(--mb-shadow-card)',
      }}
      aria-pressed={view === key}
    >
      {label}
    </button>
  );

  return (
    <div className="px-4 py-8 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold lowercase" style={{ letterSpacing: 'var(--tracking-heading)' }}>menu</h1>
          <p className="mt-2 text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
            {view === 'today'
              ? 'flip what came out of the oven. search to find one fast.'
              : 'drag the handle to reorder. tap a photo to edit.'}
          </p>
        </div>
        <button
          onClick={() => setBulkOpen(true)}
          className="flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold lowercase"
          style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)', boxShadow: 'var(--mb-shadow-card)' }}
        >
          <Boxes size={18} /> stock counts
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        {tab('today', 'today')}
        {tab('arrange', 'arrange')}
      </div>

      {toggleError && (
        <p className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(176,114,42,0.10)', color: 'var(--mb-accent-toast)' }}>{toggleError}</p>
      )}

      {view === 'today' ? (
        <div className="mt-6">
          <TodayBoard cats={cats} setCats={setCats} reload={load} />
        </div>
      ) : (
        cats.map((c) => (
          <section key={c.id} className="mt-10">
            <h2 className="text-2xl font-bold">{c.name}</h2>
            {c.groups.map((g) => (
              <div key={g.id} className="mt-5">
                {c.groups.length > 1 && (
                  <h3 className="mb-3 text-sm font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>{g.name}</h3>
                )}
                <GroupGrid group={g} onEdit={setEditing} onReorder={onReorder} onAdd={(gid) => setEditing({ __new: true, group_id: gid })} onToggle={onToggle} busyId={busyId} />
              </div>
            ))}
          </section>
        ))
      )}

      <ItemEditModal item={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      <BulkInventoryModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSaved={() => load(true)} />
    </div>
  );
}
