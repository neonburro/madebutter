// src/context/CartContext.jsx
//
// The box. add(item) respects stock_qty when an item tracks stock, so the cart
// can never hold more of something than the shop has.
//
// ── IT SURVIVES A REFRESH NOW ───────────────────────────────────────────────
//
// This was plain useState, which meant the box lived only as long as the tab
// did. Refresh it, switch apps on a phone and come back, follow a link to the
// terms page and hit back, and everything you picked was gone. On a shop that
// is mostly phones and mostly order ahead that is the cheapest conversion you
// will ever lose.
//
// It is written to localStorage on every change and read back on mount.
//
// ── WHY A STALE BOX IS SAFE TO RESTORE ──────────────────────────────────────
//
// A restored cart can hold a price that has changed or a flavour that sold out
// while the tab was closed, and NEITHER can hurt anybody, because the browser's
// copy of a price is never trusted. netlify/functions/create-payment-intent.js
// looks every slug up again, recomputes the total server side, and answers 409
// stock_changed with the shortfalls when something is gone. So the worst case
// is a clear message at checkout rather than a wrong charge. Do not add price
// checking here, it would be a second implementation of a rule that already has
// one home.
//
// ── IT EXPIRES AFTER A DAY ──────────────────────────────────────────────────
//
// This menu turns over daily, about half the flavours change, so a box from
// last Tuesday is mostly things that are not out. A day is the honest life for
// it. The key carries a VERSION too, so changing the shape of a line cannot
// resurrect an old one that no longer parses. Bump the version if you change
// what a line holds.
//
// Every storage call is wrapped, because localStorage throws outright in some
// private browsing modes rather than returning null, and a shop that will not
// render is worse than a shop that forgets your box.
//
// No em dashes, oxford commas or colons.

import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'mb.cart.v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.lines)) return [];
    if (!parsed.at || Date.now() - parsed.at > MAX_AGE_MS) return [];
    // only keep lines that still look like lines
    return parsed.lines.filter((l) => l && l.id && typeof l.qty === 'number' && l.qty > 0);
  } catch {
    return [];
  }
}

function writeStored(lines) {
  try {
    if (!lines.length) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), lines }));
  } catch {
    // private mode, or storage full. the box just will not outlive the tab.
  }
}

function capFor(item) {
  if (item && item.track_stock && item.stock_qty != null) return item.stock_qty;
  return null;
}

export function CartProvider({ children }) {
  // read synchronously on first render so the cart button never flashes empty
  const [lines, setLines] = useState(readStored);
  const [bump, setBump] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    // skip the write that would immediately follow the initial read
    if (first.current) { first.current = false; return; }
    writeStored(lines);
  }, [lines]);

  const add = useCallback((item) => {
    const cap = capFor(item);
    let added = false;
    setLines((prev) => {
      const found = prev.find((l) => l.id === item.id);
      const current = found ? found.qty : 0;
      if (cap != null && current >= cap) {
        return prev;
      }
      added = true;
      if (found) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, {
        id: item.id, slug: item.slug, name: item.name, price: item.price,
        image_path: item.image_path, qty: 1, cap,
      }];
    });
    if (added) setBump((b) => b + 1);
    return added;
  }, []);

  const decrement = useCallback((id) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    );
  }, []);

  const remove = useCallback((id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const qtyOf = useCallback((id) => {
    const found = lines.find((l) => l.id === id);
    return found ? found.qty : 0;
  }, [lines]);

  const atCap = useCallback((item) => {
    const cap = capFor(item);
    if (cap == null) return false;
    return qtyOf(item.id) >= cap;
  }, [qtyOf]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((n, l) => n + (l.price || 0) * l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, add, decrement, remove, clear, qtyOf, atCap, count, subtotal, bump }),
    [lines, add, decrement, remove, clear, qtyOf, atCap, count, subtotal, bump]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
