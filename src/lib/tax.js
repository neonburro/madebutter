// src/lib/tax.js
//
// ── THE ONLY PLACE THE TAX RATE IS WRITTEN DOWN ─────────────────────────────
//
// Ridgway sits in Ouray County, Colorado, and the combined rate is 9.05%:
//
//   2.90   Colorado state
//   2.55   Ouray County
//   3.60   Town of Ridgway
//   ────
//   9.05   verified 2026-08-30
//
// The components are spelled out because a rate that is just "0.0905" cannot be
// checked by anybody, and when one of the three moves you need to know which
// number you are editing. Colorado publishes changes twice a year, so this is
// worth re-checking each January and July.
//
// ── IT USED TO BE WRITTEN DOWN THREE TIMES ──────────────────────────────────
//
// This constant also lived at the top of netlify/functions/create-payment-
// intent.js and netlify/functions/pos-order.js, each carrying a comment asking
// the next person to keep them in sync by hand. Three copies of a tax rate is
// three chances to charge a different number online than at the register, and
// the comment is not a mechanism. Both functions import from this file now.
//
// Netlify bundles functions with esbuild and follows relative imports, and this
// module is pure arithmetic with no browser dependency, which is what makes it
// safe to share across both sides. KEEP IT THAT WAY. The moment something in
// here touches window or a react import, the functions stop bundling.
//
// ── WHY EVERYTHING IS TAXED ─────────────────────────────────────────────────
//
// Colorado exempts food for home consumption but NOT prepared food or food sold
// for immediate consumption, which is what a bakery and coffee counter sells.
// So the rate applies to the whole ticket and the items table's is_taxable
// column is not consulted by anything. That column is dead. If a genuinely
// exempt product ever appears, packaged retail goods for instance, this is
// where the per item split would go, and it would have to go into both callers
// at the same time.
//
// Amounts are ALWAYS in cents. Round once, at the end, on the whole subtotal,
// which is what the state expects and what the register does.
//
// No em dashes, oxford commas or colons.

export const TAX_COMPONENTS = {
  state: 0.029,
  county: 0.0255,
  town: 0.036,
};

// Written out rather than summed from the parts above. Adding those three in
// binary floating point gives 0.09049999999999999, not 0.0905, and while the
// two agree on every amount we currently sell, a rate used for money should not
// depend on nobody ever landing on the cent where they disagree. The components
// are documentation, this is the number. If you change one, change both.
export const TAX_RATE = 0.0905;

export function computeTax(subtotalCents) {
  return Math.round((subtotalCents || 0) * TAX_RATE);
}

export function withTax(subtotalCents) {
  const subtotal = subtotalCents || 0;
  const tax = computeTax(subtotal);
  return { subtotal, tax, total: subtotal + tax };
}
