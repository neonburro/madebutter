// src/data/crumbs.js
//
// ── CRUMBS ARE THE LOYALTY POINTS AND THEY ARE NOT DONUTS ───────────────────
//
// The currency is CRUMBS. Ten per dollar spent, so a ten dollar order is a
// hundred crumbs. The database has always called them that and the admin
// leaderboard has always called them that. The customer facing copy called them
// donuts in four places, which meant the shop was running one loyalty program
// under two names and the one the customer saw was the wrong one.
//
// If you are writing copy, the rule is short. A donut is a thing you eat. A
// crumb is a thing you collect. Never mix them.
//
// ── THIS FILE IS THE ONLY PLACE THE NUMBERS LIVE ────────────────────────────
//
// The rate, the start date, which order statuses earn, and the ladder. Rewards
// .jsx used to hold its own private copies of the first three, which was fine
// while it was the only screen that counted crumbs and stopped being fine the
// moment the customer could see a balance too. Two screens computing a balance
// from two sets of constants is how a person gets told they have 400 crumbs on
// one page and 380 on another.
//
// ── THERE IS NO STORED BALANCE YET ──────────────────────────────────────────
//
// A balance is derived by replaying a customer's orders every time it is asked
// for. That is correct and cheap at this size and it has one real consequence:
// REDEEMING IS NOT BUILT. Nothing subtracts. The ladder below tells a person
// what they have earned, and today an actual free donut is handed over at the
// counter by a human reading the number.
//
// Building redemption means a stored balance, a ledger of spends, and a way for
// the POS to apply one. Do NOT bolt subtraction onto the derived number, it
// will not survive a refund.
//
// No em dashes, oxford commas or colons.

// Crumbs count from this date forward, which was the fresh start. Move it
// earlier to sweep in older history.
export const CRUMBS_START = '2026-06-27T00:00:00Z';
export const CRUMBS_PER_DOLLAR = 10;

// A refunded or cancelled order earns nothing. These are the statuses that do.
export const EARNING_STATUSES = ['paid', 'preparing', 'ready', 'picked_up'];

export const crumbsFor = (totalCents) =>
  Math.round(((totalCents || 0) / 100) * CRUMBS_PER_DOLLAR);

// ── THE LADDER ──────────────────────────────────────────────────────────────
//
// Every rung is worth between five and seven percent of what it takes to reach
// it, which is a normal bakery rate and is the constraint to hold if you add
// one. At ten crumbs per dollar, 400 crumbs is forty dollars spent and a donut
// is about two seventy five, so that rung pays back just under seven percent.
// Check the arithmetic before adding a rung, generosity that was not costed is
// how a loyalty program quietly becomes the whole margin.
export const LADDER = [
  {
    at: 400,
    reward: 'a donut, on us',
    note: 'any one in the case. yes, including the fritters.',
  },
  {
    at: 800,
    reward: 'any drink',
    note: 'nitro counts. we thought about it and we are fine with it.',
  },
  {
    at: 1500,
    reward: 'a stuffed roll',
    note: 'a whole one. no crumbs involved.',
  },
  {
    at: 3000,
    reward: 'half a dozen',
    note: 'at this point you are basically staff.',
  },
];

// What they have unlocked, and what is next. Past the top rung `next` is null
// and `toGo` is 0, which the UI reads as "you are at the end of the ladder"
// rather than as an error.
export function progress(crumbs) {
  const earned = LADDER.filter((r) => crumbs >= r.at);
  const next = LADDER.find((r) => crumbs < r.at) || null;
  const floor = earned.length ? earned[earned.length - 1].at : 0;
  const span = next ? next.at - floor : 1;
  return {
    earned,
    next,
    toGo: next ? next.at - crumbs : 0,
    // 0..1 through the CURRENT rung, not through the whole ladder, so the bar
    // moves at a visible rate instead of crawling for the first four hundred.
    fill: next ? Math.max(0, Math.min(1, (crumbs - floor) / span)) : 1,
  };
}

// Sum a set of order rows into a balance. Both the admin board and the customer
// account go through here so they cannot disagree.
export function crumbsFromOrders(orders) {
  return (orders || [])
    .filter((o) => EARNING_STATUSES.includes(o.status))
    .filter((o) => !CRUMBS_START || o.created_at >= CRUMBS_START)
    .reduce((n, o) => n + crumbsFor(o.total_cents), 0);
}
