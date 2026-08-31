// src/pages/Admin/pos/POSRegister.jsx
// The POS register. Tap live menu items into a cart, see subtotal + Ridgway tax +
// total, then Charge. Payment sheet: Cash (quick tender + change due) or Card (tap in
// the Stripe app, mark paid). After paying, an optional rewards step (phone pad, big
// skip) attaches crumbs. Then a sent-to-kitchen confirmation and the cart clears.
// POS orders post to pos-order and land on the Orders board like online ones.
// Built so saved cards drop in as a third payment path later.
// Last updated 2026-06-27.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus, X, Trash2, Check, Delete } from 'lucide-react';
import { useMenu } from '../../../data/useMenu';
import { menuImageUrl } from '../../../lib/supabase';
import { withTax } from '../../../lib/tax';
import { staffFetch } from '../../../lib/staffFetch';

const money = (c) => `$${((c || 0) / 100).toFixed(2)}`;

function MenuGrid({ categories, onAdd }) {
  const [activeCat, setActiveCat] = useState(0);
  const cats = categories || [];
  const cat = cats[activeCat];
  const items = useMemo(() => {
    if (!cat) return [];
    return cat.groups.flatMap((g) => g.items).filter((i) => i.is_available_today);
  }, [cat]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 overflow-x-auto pb-3">
        {cats.map((c, i) => (
          <button key={c.id} onClick={() => setActiveCat(i)}
            className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors"
            style={{ background: i === activeCat ? 'var(--mb-text-primary)' : 'var(--mb-surface-base)', color: i === activeCat ? 'var(--mb-text-inverse)' : 'var(--mb-text-secondary)' }}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => {
          const img = menuImageUrl(it.image_path);
          return (
            <button key={it.id} onClick={() => onAdd(it)}
              className="flex flex-col overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
              style={{ background: 'var(--mb-surface-base)', border: '1px solid var(--mb-surface-line)' }}>
              <div className="aspect-square w-full" style={{ background: 'var(--mb-surface-paper)' }}>
                {img && <img src={img} alt={it.name} className="h-full w-full object-contain" draggable={false} />}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold leading-tight">{it.name}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{money(it.price)}</p>
              </div>
            </button>
          );
        })}
        {items.length === 0 && <p className="col-span-full py-10 text-center text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Nothing available in this category today.</p>}
      </div>
    </div>
  );
}

function NumPad({ onKey }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button key={k} onClick={() => onKey(k)}
          className="rounded-2xl py-5 text-2xl font-bold transition-transform active:scale-95"
          style={{ background: 'var(--mb-surface-paper)' }}>
          {k === 'del' ? <Delete size={24} className="mx-auto" /> : k}
        </button>
      ))}
    </div>
  );
}

function CashSheet({ total, onConfirm, onBack, busy }) {
  const [tendered, setTendered] = useState('');
  const cents = Math.round((parseFloat(tendered) || 0) * 100);
  const change = cents - total;
  const enough = cents >= total;

  const quick = [total, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000, Math.ceil(total / 2000) * 2000]
    .filter((v, i, a) => a.indexOf(v) === i);

  const onKey = (k) => {
    if (k === 'del') return setTendered((t) => t.slice(0, -1));
    if (k === '.' && tendered.includes('.')) return;
    setTendered((t) => t + k);
  };

  return (
    <div>
      <p className="text-sm font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>Cash</p>
      <p className="mt-1 text-3xl font-bold">{money(total)} due</p>

      <div className="mt-4 flex gap-2">
        {quick.map((v) => (
          <button key={v} onClick={() => setTendered((v / 100).toFixed(2))}
            className="flex-1 rounded-xl py-3 text-base font-bold" style={{ background: 'var(--mb-surface-paper)' }}>
            {money(v)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Tendered</p>
        <p className="text-3xl font-bold">{tendered ? money(cents) : '$0.00'}</p>
        {enough && <p className="mt-1 text-lg font-bold" style={{ color: '#5E7A45' }}>Change {money(change)}</p>}
      </div>

      <div className="mt-4"><NumPad onKey={onKey} /></div>

      <button onClick={() => onConfirm(cents)} disabled={!enough || busy}
        className="mt-4 w-full rounded-full py-4 text-base font-bold disabled:opacity-40"
        style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
        {busy ? 'Saving…' : enough ? `Take ${money(cents)}, give ${money(change)}` : 'Enter cash amount'}
      </button>
      <button onClick={onBack} className="mt-2 w-full py-3 text-sm font-bold" style={{ color: 'var(--mb-text-muted)' }}>Back</button>
    </div>
  );
}

function CardSheet({ total, onConfirm, onBack, busy }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--mb-text-muted)' }}>Card</p>
      <p className="mt-1 text-3xl font-bold">{money(total)}</p>
      <div className="mt-4 rounded-2xl p-5 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-base font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>Take the tap payment in the Stripe app for {money(total)}, then mark it paid here.</p>
      </div>
      <button onClick={onConfirm} disabled={busy}
        className="mt-4 w-full rounded-full py-4 text-base font-bold disabled:opacity-50"
        style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
        {busy ? 'Saving…' : 'Mark paid'}
      </button>
      <button onClick={onBack} className="mt-2 w-full py-3 text-sm font-bold" style={{ color: 'var(--mb-text-muted)' }}>Back</button>
    </div>
  );
}

function RewardsSheet({ onAttach, onSkip, busy }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const onKey = (k) => {
    if (k === 'del') return setPhone((p) => p.slice(0, -1));
    if (k === '.') return;
    if (phone.replace(/\D/g, '').length >= 10) return;
    setPhone((p) => p + k);
  };
  return (
    <div>
      <p className="text-2xl font-bold">Earn crumbs?</p>
      <p className="mt-1 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Add a phone to collect rewards. Optional.</p>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="first name (optional)"
        className="mt-4 w-full rounded-2xl px-4 py-3.5 text-base font-medium outline-none"
        style={{ border: '1px solid var(--mb-surface-line-strong)', background: 'var(--mb-surface-base)' }} />

      <div className="mt-3 rounded-2xl p-4 text-center" style={{ background: 'var(--mb-surface-paper)' }}>
        <p className="text-2xl font-bold">{phone || 'phone number'}</p>
      </div>
      <div className="mt-3"><NumPad onKey={onKey} /></div>

      <button onClick={() => onAttach(phone, name)} disabled={phone.replace(/\D/g, '').length < 10 || busy}
        className="mt-4 w-full rounded-full py-4 text-base font-bold disabled:opacity-40"
        style={{ background: 'var(--mb-accent-butter)', color: 'var(--mb-text-primary)' }}>
        {busy ? 'Saving…' : 'Add rewards'}
      </button>
      <button onClick={onSkip} className="mt-2 w-full py-3 text-base font-bold" style={{ color: 'var(--mb-text-muted)' }}>No thanks</button>
    </div>
  );
}

export default function POSRegister() {
  const { categories, loading } = useMenu();
  const [cart, setCart] = useState([]);
  const [stage, setStage] = useState('cart');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const subtotal = cart.reduce((n, l) => n + l.item.price * l.qty, 0);
  const { tax, total } = withTax(subtotal);

  const add = (item) => setCart((c) => {
    const found = c.find((l) => l.item.id === item.id);
    if (found) return c.map((l) => l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l);
    return [...c, { item, qty: 1 }];
  });
  const setQty = (id, delta) => setCart((c) => c
    .map((l) => l.item.id === id ? { ...l, qty: l.qty + delta } : l)
    .filter((l) => l.qty > 0));
  const clear = () => setCart([]);

  const submit = async (payment_method, cash_tendered_cents, phone, first_name) => {
    setBusy(true); setError(null);
    try {
      const res = await staffFetch('/.netlify/functions/pos-order', {
        cart: cart.map((l) => ({ item_id: l.item.id, qty: l.qty })),
        payment_method, cash_tendered_cents, phone, first_name,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const payCash = async (cents) => {
    const data = await submit('cash', cents);
    if (data) { setResult(data); setStage('rewards'); }
  };
  const payCard = async () => {
    const data = await submit('card');
    if (data) { setResult(data); setStage('rewards'); }
  };
  const attachRewards = async (phone, name) => {
    setBusy(true);
    try {
      await staffFetch('/.netlify/functions/pos-attach-rewards', {
        order_id: result.order_id, phone, first_name: name,
      });
    } catch { /* best effort */ }
    setBusy(false);
    finish();
  };
  const finish = () => { setStage('done'); };
  const newSale = () => { clear(); setResult(null); setStage('cart'); setError(null); };

  if (loading) return <p className="p-8 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>loading register…</p>;

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col sm:h-screen sm:flex-row">
      <div className="flex-1 overflow-hidden px-4 py-6 sm:px-8">
        <h1 className="mb-4 text-3xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>Register</h1>
        <div className="h-[calc(100%-3rem)]">
          <MenuGrid categories={categories} onAdd={add} />
        </div>
      </div>

      <div className="flex w-full flex-col border-t sm:w-96 sm:border-l sm:border-t-0" style={{ background: 'var(--mb-surface-base)', borderColor: 'var(--mb-surface-line)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="text-lg font-bold">Cart</p>
          {cart.length > 0 && <button onClick={clear} className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--mb-text-muted)' }}><Trash2 size={15} /> clear</button>}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.length === 0 && <p className="py-10 text-center text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>Tap items to add them.</p>}
          {cart.map((l) => (
            <div key={l.item.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold">{l.item.name}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{money(l.item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(l.item.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--mb-surface-paper)' }}><Minus size={16} /></button>
                <span className="w-5 text-center text-base font-bold">{l.qty}</span>
                <button onClick={() => setQty(l.item.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--mb-surface-paper)' }}><Plus size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="border-t px-5 py-4" style={{ borderColor: 'var(--mb-surface-line)' }}>
            <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}><span>Tax</span><span>{money(tax)}</span></div>
            <div className="mt-1 flex justify-between text-xl font-bold"><span>Total</span><span>{money(total)}</span></div>
            <button onClick={() => setStage('pay')} className="mt-4 w-full rounded-full py-4 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>
              Charge {money(total)}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {stage !== 'cart' && (
          <>
            <motion.div className="fixed inset-0 z-[80]" style={{ background: 'rgba(15,14,13,0.45)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => stage === 'pay' && setStage('cart')} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[80] mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 sm:inset-y-0 sm:right-0 sm:left-auto sm:my-auto sm:mr-6 sm:max-h-[92vh] sm:rounded-3xl"
              style={{ background: 'var(--mb-surface-base)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}>

              {error && <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--mb-accent-toast)' }}>{error}</p>}

              {stage === 'pay' && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{money(total)}</p>
                    <button onClick={() => setStage('cart')} aria-label="close" style={{ color: 'var(--mb-text-muted)' }}><X size={24} /></button>
                  </div>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--mb-text-muted)' }}>How are they paying?</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => setStage('cash')} className="rounded-2xl py-6 text-lg font-bold" style={{ background: 'var(--mb-surface-paper)' }}>Cash</button>
                    <button onClick={() => setStage('card')} className="rounded-2xl py-6 text-lg font-bold" style={{ background: 'var(--mb-surface-paper)' }}>Card</button>
                  </div>
                </div>
              )}

              {stage === 'cash' && <CashSheet total={total} onConfirm={payCash} onBack={() => setStage('pay')} busy={busy} />}
              {stage === 'card' && <CardSheet total={total} onConfirm={payCard} onBack={() => setStage('pay')} busy={busy} />}
              {stage === 'rewards' && <RewardsSheet onAttach={attachRewards} onSkip={finish} busy={busy} />}

              {stage === 'done' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(122,168,90,0.15)' }}>
                    <Check size={32} style={{ color: '#5E7A45' }} />
                  </span>
                  <p className="mt-4 text-2xl font-bold">Sent to the kitchen</p>
                  <p className="mt-1 text-base font-semibold" style={{ color: 'var(--mb-text-muted)' }}>{result?.receipt}</p>
                  {result?.change_cents > 0 && <p className="mt-2 text-lg font-bold">Change due {money(result.change_cents)}</p>}
                  <button onClick={newSale} className="mt-6 w-full rounded-full py-4 text-base font-bold" style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}>New sale</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
