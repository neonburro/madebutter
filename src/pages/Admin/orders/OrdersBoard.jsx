// src/pages/Admin/orders/OrdersBoard.jsx
// Live order board. Three lanes: New -> Preparing -> Ready. Tapping Ready on a
// Preparing order opens the locker prompt (auto code + locker number, or hand
// delivered), which fires the customer notification. Realtime, iPad-first.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
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

function randomCode() {
  return String(Math.floor(100 + Math.random() * 900)); // 100..999
}

function LockerModal({ order, onClose, onConfirm }) {
  const [locker, setLocker] = useState('');
  const [code] = useState(randomCode());
  if (!order) return null;
  const receipt = order.receipt_no || order.short_code;
  const lockerNum = parseInt(locker, 10);
  const validLocker = lockerNum >= 1 && lockerNum <= 20;

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div className="fixed inset-0 z-[80]" style={{ background: 'rgba(15,14,13,0.45)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" onClick={onClose}>
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-t-3xl sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
                <div>
                  <p className="text-base font-semibold">Mark ready</p>
                  <p className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{receipt} · {order.contact_name}</p>
                </div>
                <button onClick={onClose} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={20} /></button>
              </div>

              <div className="p-4">
                <p className="mb-2 text-xs font-medium" style={{ color: 'var(--mb-text-muted)' }}>Locker number</p>
                <input
                  value={locker}
                  onChange={(e) => setLocker(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={(e) => e.target.select()}
                  inputMode="numeric"
                  placeholder="1 to 20"
                  className="w-full rounded-xl px-3 py-3 text-center text-lg font-semibold outline-none"
                  style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }}
                />

                <div className="mt-4 rounded-xl p-4 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
                  <p className="text-xs font-medium uppercase" style={{ letterSpacing: '0.08em', color: 'var(--mb-text-muted)' }}>Code to set on locker</p>
                  <p className="mt-1 text-3xl font-bold" style={{ letterSpacing: '0.12em' }}>{code}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--mb-text-muted)' }}>Set this on the keypad. The customer gets it too.</p>
                </div>

                <button
                  onClick={() => onConfirm(order.id, lockerNum, code)}
                  disabled={!validLocker}
                  className="mt-4 w-full rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-50"
                  style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
                >
                  {validLocker ? `Assign locker ${lockerNum} and notify` : 'Enter a locker number'}
                </button>
                <button
                  onClick={() => onConfirm(order.id, null, null)}
                  className="mt-2 w-full py-2 text-xs font-medium"
                  style={{ color: 'var(--mb-text-muted)' }}
                >
                  hand delivered (no locker)
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function OrderCard({ order, lane, onAdvance, onReadyClick, onCancel }) {
  const receipt = order.receipt_no || order.short_code || order.id.slice(0, 6);
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const isReadyLane = lane.key === 'ready';
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

      {isReadyLane && order.locker_number && (
        <div className="mt-3 flex items-center justify-center gap-3 rounded-xl py-2" style={{ background: 'var(--mb-surface-paper)' }}>
          <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>locker <strong style={{ color: 'var(--mb-text-primary)' }}>{order.locker_number}</strong></span>
          <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>code <strong style={{ color: 'var(--mb-text-primary)', letterSpacing: '0.1em' }}>{order.locker_code}</strong></span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--mb-surface-line)' }}>
        <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>
          {itemCount} item{itemCount === 1 ? '' : 's'} · ${(order.total_cents / 100).toFixed(2)}
        </span>
        {order.preferred_channel && (
          <span className="text-xs" style={{ color: 'var(--mb-text-muted)' }}>{order.preferred_channel}</span>
        )}
      </div>

      <button
        onClick={() => (lane.key === 'preparing' ? onReadyClick(order) : onAdvance(order.id, lane.next))}
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
  const { orders, loading, setStatus, markReady } = useOrders();
  const [lockerFor, setLockerFor] = useState(null);

  const onCancel = (id) => {
    if (window.confirm('Cancel this order?')) setStatus(id, 'cancelled');
  };

  const onConfirmReady = (orderId, lockerNumber, lockerCode) => {
    markReady(orderId, lockerNumber, lockerCode);
    setLockerFor(null);
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
                    <OrderCard key={o.id} order={o} lane={lane} onAdvance={setStatus} onReadyClick={setLockerFor} onCancel={onCancel} />
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

      <LockerModal order={lockerFor} onClose={() => setLockerFor(null)} onConfirm={onConfirmReady} />
    </div>
  );
}
