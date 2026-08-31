// netlify/functions/_options.js
//
// ── THE ADD ON MONEY RULE, IN ONE PURE FUNCTION ─────────────────────────────
//
// Given an item, the option ids a browser submitted, and the option tables read
// fresh from the database, work out what was actually chosen and what a single
// one of that line costs. Returns { ok, unitPrice, chosen } or { ok: false,
// error } with a sentence fit to show a customer.
//
// It lives on its own, takes everything as arguments and touches no network, so
// it can be run against the attack cases directly. That is the entire reason it
// is not inline in create-payment-intent.js, where it started: this is the code
// standing between a request body and a charge, and code like that should be
// executable in a test rather than only reviewable by eye.
//
// ── WHAT IT IS DEFENDING AGAINST ────────────────────────────────────────────
//
// The browser sends OPTION IDS ONLY, never names or prices, and every one of
// them is a uuid a caller can type. Three things follow:
//
//   1. An id from another item's group. A minus five dollar option invented for
//      some future promotion, attached to a donut. Rejected by checking every
//      submitted option against the groups this item actually offers.
//
//   2. A required group left unanswered, which would otherwise mean a drink
//      priced without the milk it has to have. Rejected by walking the offered
//      groups, not the submitted ones.
//
//   3. The same id sent twice, which counts twice toward a maximum and, the day
//      a delta goes negative, subtracts twice. Rejected by deduping first.
//
// An inactive option or group is treated as not offered. A group that has been
// switched off stops being enforced AND stops being purchasable in the same
// move, which is the behaviour you want from one flag.
//
// No em dashes, oxford commas or colons.

export function priceLine({ item, submittedOptionIds, links, options, groups }) {
  const offered = new Set(
    (links || []).filter((l) => l.item_id === item.id).map((l) => l.option_group_id),
  );

  // dedupe before anything counts. see 3 above.
  const submitted = Array.isArray(submittedOptionIds) ? [...new Set(submittedOptionIds)] : [];

  const chosen = [];
  const countByGroup = new Map();

  for (const id of submitted) {
    const opt = (options || []).find((o) => o.id === id && o.is_active);
    if (!opt) return { ok: false, error: 'That add on is no longer available.' };

    const group = (groups || []).find((g) => g.id === opt.option_group_id && g.is_active);
    if (!group || !offered.has(opt.option_group_id)) {
      return { ok: false, error: `${opt.name} is not offered on ${item.name}.` };
    }

    chosen.push(opt);
    countByGroup.set(group.id, (countByGroup.get(group.id) || 0) + 1);
  }

  // walk what the ITEM OFFERS, not what was sent, so an omitted required group
  // is caught rather than silently defaulted. see 2 above.
  for (const groupId of offered) {
    const g = (groups || []).find((x) => x.id === groupId && x.is_active);
    if (!g) continue;
    const n = countByGroup.get(groupId) || 0;
    if (n < (g.min_select || 0)) {
      return { ok: false, error: `Choose a ${g.name.toLowerCase()} for ${item.name}.` };
    }
    if (n > (g.max_select || 1)) {
      return { ok: false, error: `Too many chosen for ${g.name} on ${item.name}.` };
    }
  }

  const unitPrice = item.price + chosen.reduce((n, o) => n + (o.price_delta || 0), 0);

  return {
    ok: true,
    unitPrice,
    // a snapshot, so a receipt printed next year still says what was bought and
    // what it cost after the option has been renamed or repriced
    chosen: chosen.map((o) => ({
      id: o.id, slug: o.slug, name: o.name, price_delta: o.price_delta || 0,
    })),
  };
}
