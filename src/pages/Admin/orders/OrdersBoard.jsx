// src/pages/Admin/orders/OrdersBoard.jsx
// Live order board. Three lanes: New -> Preparing -> Ready. Tap the action to
// advance. Ready -> Picked up clears it. Realtime, iPad-first touch targets.
import { AnimatePresence, motion } from 'framer-motion';
import { useOrders } from './useOrders';

const LANES = [
  { key: 'paid', label: 'New', next: 'preparing', action: 'Start', accent: 'var(--mb-accent-butter)' },
  { key: 'preparing', label: 'Preparing', next: 'ready', action: 'Ready', accent: '#7AA85A' },
  { key: 'ready', label: 'Ready', next: 'picked_up', action: 'Picked up', accent: 'var(--mb-text-primary)' },
];

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

function OrderCard({ order, lane, onAdvance, onCancel }) {
  const receipt = order.receipt_no || order.short_code || order.id.slice(0, 6);
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)' }}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-base font-semibold">{receipt}</p>
        <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{timeAgo(order.created_at)}</span>
      </div>
      {order.contact_name && (
        <p className="mt-0.5 text-sm" style={{ color: 'var(--mb-text-secondary)' }}>{order.contact_name}</p>
      )}

      <div className="mt-3 space-y-1">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span>{it.item_name}</span>
            <span style={{ color: 'var(--mb-text-muted)' }}>×{it.qty}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--mb-surface-line)' }}>
        <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>
          {itemCount} item{itemCount === 1 ? '' : 's'} · ${(order.total_cents / 100).toFixed(2)}
        </span>
        {order.preferred_channel && (
          <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{order.preferred_channel}</span>
        )}
      </div>

      <button
        onClick={() => onAdvance(order.id, lane.next)}
        className="mt-3 w-full rounded-full py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
        style={{ background: lane.accent, color: lane.key === 'ready' ? 'var(--mb-text-inverse)' : 'var(--mb-text-primary)' }}
      >
        {lane.action}
      </button>
      {lane.key === 'paid' && (
        <button
          onClick={() => onCancel(order.id)}
          className="mt-2 w-full py-1.5 text-xs"
          style={{ color: 'var(--mb-text-muted)' }}
        >
          cancel order
        </button>
      )}
    </motion.div>
  );
}

export default function OrdersBoard() {
  const { orders, loading, setStatus } = useOrders();

  const onCancel = (id) => {
    if (window.confirm('Cancel this order?')) setStatus(id, 'cancelled');
  };

  if (loading) {
    return <p className="p-8 text-sm" style={{ color: 'var(--mb-text-muted)' }}>loading orders…</p>;
  }

  const byLane = (key) => orders.filter((o) => o.status === key);

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Orders</h1>
        <span className="text-sm" style={{ color: 'var(--mb-text-muted)' }}>{orders.length} active</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {LANES.map((lane) => {
          const laneOrders = byLane(lane.key);
          return (
            <div key={lane.key}>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: lane.accent }} />
                <h2 className="text-sm font-semibold uppercase" style={{ letterSpacing: '0.08em' }}>{lane.label}</h2>
                <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{laneOrders.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {laneOrders.map((o) => (
                    <OrderCard key={o.id} order={o} lane={lane} onAdvance={setStatus} onCancel={onCancel} />
                  ))}
                </AnimatePresence>
                {laneOrders.length === 0 && (
                  <p className="rounded-2xl border border-dashed py-8 text-center text-xs"
                    style={{ borderColor: 'var(--mb-surface-line-strong)', color: 'var(--mb-text-muted)' }}>
                    nothing here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
