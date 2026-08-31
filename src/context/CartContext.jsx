// src/context/CartContext.jsx
//
// The box.
//
// ── A LINE IS AN ITEM PLUS ITS CHOICES ──────────────────────────────────────
//
// This was keyed by item id, which was right while an item was one thing. Now
// that drinks carry add ons, a nitro with oat milk and a nitro with almond milk
// are the SAME item and two different lines, so the identity of a line is the
// item plus the options chosen on it. That key comes from lineKeyFor in
// src/data/options.js, which sorts the option ids so that picking oat then
// vanilla lands on the same line as picking vanilla then oat.
//
// Two consequences worth knowing before you touch anything here:
//
//   decrement and remove take a LINE KEY, not an item id
//   qtyOf takes an ITEM id and sums every line of that item
//
// The second one is what keeps the grid honest. The badge on a card and the
// stock cap both mean "how many of this thing are in the box", and three nitros
// with three different milks is still three nitros against a stock of four.
//
// ── PRICES ARE STILL NOT DECIDED HERE ───────────────────────────────────────
//
// unit_price is base plus the option deltas and it exists so the sheet can show
// a number. It is not trusted by anything. create-payment-intent.js looks up
// every item and every option again, re-checks that the item actually offers
// each option, and recomputes the total server side. See the note in
// src/data/options.js for the specific attack that closes.
//
// ── IT SURVIVES A REFRESH ───────────────────────────────────────────────────
//
// Written to localStorage on every change, read back on mount, expired after a
// day because half this menu changes daily. Restoring a stale box is safe for
// the same reason the browser's prices are not trusted: the server revalidates
// everything and answers 409 with the shortfalls when something is gone.
//
// The storage key is v2. v1 lines had no options and no unit_price, and feeding
// one to a checkout that now expects them would price a drink at its base. A
// version bump drops those boxes rather than half reading them. BUMP IT AGAIN
// if you change the shape of a line.
//
// Every storage call is wrapped, because localStorage throws outright in some
// private browsing modes rather than returning null, and a shop that will not
// render is worse than a shop that forgets your box.
//
// No em dashes, oxford commas or colons.

import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { lineKeyFor, unitPrice as computeUnitPrice } from '../data/options';

const CartContext = createContext(null);

const STORAGE_KEY = 'mb.cart.v2';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.lines)) return [];
    if (!parsed.at || Date.now() - parsed.at > MAX_AGE_MS) return [];
    return parsed.lines.filter(
      (l) => l && l.key && l.id && typeof l.qty === 'number' && l.qty > 0,
    );
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
  const [lines, setLines] = useState(readStored);
  const [bump, setBump] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    writeStored(lines);
  }, [lines]);

  // add(menuItem, chosenOptions) from the picker, or add(existingLine) from the
  // sheet's plus button, where the line already carries its options.
  const add = useCallback((itemOrLine, options) => {
    const chosen = options || itemOrLine.options || [];
    const itemId = itemOrLine.id;
    const key = lineKeyFor(itemId, chosen);
    const cap = capFor(itemOrLine);

    let added = false;
    setLines((prev) => {
      // the cap counts every line of this ITEM, not just this line
      const currentForItem = prev
        .filter((l) => l.id === itemId)
        .reduce((n, l) => n + l.qty, 0);
      if (cap != null && currentForItem >= cap) return prev;

      added = true;
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, {
        key,
        id: itemId,
        slug: itemOrLine.slug,
        name: itemOrLine.name,
        price: itemOrLine.price,
        unit_price: computeUnitPrice(itemOrLine, chosen),
        image_path: itemOrLine.image_path,
        options: chosen.map((o) => ({
          id: o.id, slug: o.slug, name: o.name, price_delta: o.price_delta || 0,
        })),
        qty: 1,
        cap,
      }];
    });
    if (added) setBump((b) => b + 1);
    return added;
  }, []);

  const decrement = useCallback((key) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    );
  }, []);

  const remove = useCallback((key) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  // by ITEM id, summing every line of it. see the note at the top.
  const qtyOf = useCallback((itemId) =>
    lines.filter((l) => l.id === itemId).reduce((n, l) => n + l.qty, 0), [lines]);

  const atCap = useCallback((item) => {
    const cap = capFor(item);
    if (cap == null) return false;
    return qtyOf(item.id) >= cap;
  }, [qtyOf]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + (l.unit_price ?? l.price ?? 0) * l.qty, 0),
    [lines],
  );

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
