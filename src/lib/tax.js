// src/lib/tax.js
// Single source of truth for sales tax. Ridgway CO is 9.05% (2.9 state + 2.55 county
// + 3.6 city). Applies to pickup and in-person food. Change the rate in ONE place and
// it flows to the POS and (next) online checkout. Amounts are always in cents.
// Last updated 2026-06-27.

export const TAX_RATE = 0.0905;

export function computeTax(subtotalCents) {
  return Math.round((subtotalCents || 0) * TAX_RATE);
}

export function withTax(subtotalCents) {
  const subtotal = subtotalCents || 0;
  const tax = computeTax(subtotal);
  return { subtotal, tax, total: subtotal + tax };
}
