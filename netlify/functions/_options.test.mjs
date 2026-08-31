// netlify/functions/_options.test.mjs
//
// The add on money rule, run against its attack cases. `yarn test:options`.
//
// ── WHY THIS FILE EXISTS AND WHY IT IS THE ONLY TEST IN THE REPO ────────────
//
// priceLine is the code standing between a request body and a Stripe charge.
// The browser sends option IDS, which a caller can type, and the function
// decides from them what a line costs. Everything else on this site can be
// checked by looking at it. This cannot, because the interesting inputs are the
// ones no honest client ever sends.
//
// No framework on purpose. Plain node, no dependency, no config, runs in about
// a tenth of a second. A test you can run without thinking is one that gets run.
//
// ADD A CASE HERE whenever the rule changes, especially when an option first
// carries a NEGATIVE price_delta. The whole shape of the first attack below
// assumes a discount option will exist one day and must never be attachable to
// something that does not offer it.
//
// No em dashes, oxford commas or colons.

import { priceLine } from './_options.js';

const groups = [
  { id: 'g-milk', name: 'Milk', min_select: 1, max_select: 1, is_active: true },
  { id: 'g-extra', name: 'Extras', min_select: 0, max_select: 2, is_active: true },
  { id: 'g-off', name: 'Retired', min_select: 0, max_select: 1, is_active: false },
];

const options = [
  { id: 'o-whole', slug: 'whole', name: 'Whole milk', price_delta: 0, option_group_id: 'g-milk', is_active: true },
  { id: 'o-oat', slug: 'oat', name: 'Oat milk', price_delta: 75, option_group_id: 'g-milk', is_active: true },
  { id: 'o-shot', slug: 'shot', name: 'Extra shot', price_delta: 150, option_group_id: 'g-extra', is_active: true },
  { id: 'o-foam', slug: 'foam', name: 'Cold foam', price_delta: 100, option_group_id: 'g-extra', is_active: true },
  // a THIRD extra, so the max of two can actually be exceeded with extras
  // alone. Without it the over the ceiling case below had to borrow a second
  // milk to reach three, and then it passed by tripping the Milk rule instead
  // of the Extras rule it was written to check.
  { id: 'o-syrup', slug: 'syrup', name: 'Vanilla syrup', price_delta: 50, option_group_id: 'g-extra', is_active: true },
  // the one that matters. a discount belonging to a group this drink does not
  // offer, exactly the thing an attacker would go looking for.
  { id: 'o-evil', slug: 'evil', name: 'Staff discount', price_delta: -500, option_group_id: 'g-other', is_active: true },
  { id: 'o-dead', slug: 'dead', name: 'Retired syrup', price_delta: 0, option_group_id: 'g-off', is_active: false },
];

// the drink is asked both questions. the donut is asked none.
const links = [
  { item_id: 'drink', option_group_id: 'g-milk' },
  { item_id: 'drink', option_group_id: 'g-extra' },
];

const drink = { id: 'drink', name: 'Nitro with Milk', price: 550 };
const donut = { id: 'donut', name: 'Vanilla Milk', price: 200 };

let failures = 0;

function check(label, item, ids, expect) {
  const r = priceLine({ item, submittedOptionIds: ids, links, options, groups });
  const got = r.ok ? `ok $${(r.unitPrice / 100).toFixed(2)}` : `reject, ${r.error}`;
  const pass = r.ok ? expect === r.unitPrice : expect === 'reject';
  if (!pass) failures += 1;
  console.log(`${pass ? 'pass' : 'FAIL'}  ${label}\n      ${got}`);
}

check('whole milk, nothing else', drink, ['o-whole'], 550);
check('oat plus shot plus foam', drink, ['o-oat', 'o-shot', 'o-foam'], 550 + 75 + 150 + 100);

check('attack, discount option from a group this item does not offer', drink, ['o-whole', 'o-evil'], 'reject');
check('attack, an option on an item that offers none', donut, ['o-oat'], 'reject');
check('attack, required milk left out', drink, [], 'reject');
check('attack, two milks when the max is one', drink, ['o-whole', 'o-oat'], 'reject');
check('attack, an option switched off', drink, ['o-whole', 'o-dead'], 'reject');
check('attack, an id that does not exist', drink, ['o-whole', 'deadbeef'], 'reject');

// deduped, so the repeat is charged once and counts once toward the max of two
check('attack, the same extra sent twice', drink, ['o-whole', 'o-shot', 'o-shot'], 550 + 150);
// three DISTINCT extras against a max of two. the milk is valid here on
// purpose, so the only thing that can reject this is the Extras ceiling.
check('attack, three distinct extras when the max is two', drink,
  ['o-whole', 'o-shot', 'o-foam', 'o-syrup'], 'reject');

console.log(failures === 0 ? '\nall pass' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
