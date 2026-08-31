// src/data/options.js
//
// ── ADD ONS, AND THE RULES THAT GOVERN THEM ─────────────────────────────────
//
// An option_group is a QUESTION ("Milk") and an option is an ANSWER ("Oat milk",
// plus seventy five cents). item_option_groups says which items get asked which
// questions, so one Milk group is shared by every drink that needs it rather
// than each item carrying its own copy.
//
// The shape of a question is carried by two numbers:
//
//   min 1, max 1   required, pick exactly one      Milk
//   min 0, max 1   optional, pick at most one      Add a flavor
//   min 0, max N   optional, pick up to N          Extras
//
// ── THE BROWSER DOES NOT DECIDE PRICES ──────────────────────────────────────
//
// Everything in this file is for DISPLAY and for stopping a person submitting
// something incoherent. None of it is trusted. netlify/functions/create-payment
// -intent.js looks every option up again, checks that the item actually offers
// it, re-checks min and max, and recomputes the money from the database. That
// duplication is deliberate and it is the only reason it is safe to compute a
// price here at all.
//
// The specific attack it closes: option ids are just uuids in a request body,
// so without the offered check you could attach a minus five dollar option from
// some other item to a donut. The server rejects any option the item does not
// list.
//
// ── WHY A LINE KEY ──────────────────────────────────────────────────────────
//
// A cart used to be keyed by item id, which was fine when an item was one
// thing. A nitro with oat milk and a nitro with almond milk are the SAME item
// and different lines, so the identity of a line is the item plus its chosen
// options. Ids are sorted so that picking oat then vanilla and picking vanilla
// then oat land on the same line instead of two lines that look identical.
//
// No em dashes, oxford commas or colons.

export function optionGroupsFor(item) {
  return item?.option_groups || [];
}

export function hasOptions(item) {
  return optionGroupsFor(item).length > 0;
}

// An item you cannot add without answering something first. The grid's plus
// button checks this and opens the picker instead of quick adding.
export function requiresChoice(item) {
  return optionGroupsFor(item).some((g) => (g.min_select || 0) > 0);
}

export function optionsPrice(options) {
  return (options || []).reduce((n, o) => n + (o.price_delta || 0), 0);
}

export function unitPrice(item, options) {
  return (item?.price || 0) + optionsPrice(options);
}

export function lineKeyFor(itemId, options) {
  const ids = (options || []).map((o) => o.id).sort();
  return ids.length ? `${itemId}::${ids.join(',')}` : String(itemId);
}

// A one line summary for a cart row, "oat milk, vanilla". Names only, because
// the price is already in the line total and repeating every delta turns a
// two line cart into a wall.
export function describeOptions(options) {
  return (options || []).map((o) => o.name).join(', ');
}

// What is wrong with a selection, or null when nothing is. Returns the FIRST
// problem rather than all of them, because a picker shows one message.
export function selectionProblem(groups, selectedByGroup) {
  for (const g of groups || []) {
    const picked = selectedByGroup[g.id] || [];
    const min = g.min_select || 0;
    const max = g.max_select || 1;
    if (picked.length < min) {
      return min === 1 ? `choose a ${g.name.toLowerCase()}` : `choose at least ${min} from ${g.name.toLowerCase()}`;
    }
    if (picked.length > max) {
      return `choose at most ${max} from ${g.name.toLowerCase()}`;
    }
  }
  return null;
}

// Flatten the per group selection into the ordered list a cart line stores.
// Group order then option order, so two people picking the same things always
// produce the same list and therefore the same line key.
export function flattenSelection(groups, selectedByGroup) {
  const out = [];
  for (const g of groups || []) {
    const picked = selectedByGroup[g.id] || [];
    for (const opt of g.options || []) {
      if (picked.includes(opt.id)) out.push(opt);
    }
  }
  return out;
}
