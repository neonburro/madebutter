// src/data/menuShape.js
//
// ── THE MENU IS A MATRIX AND THE OLD UI TREATED IT AS A LIST ────────────────
//
// Look at the real data before changing anything here. Sixty five items, and
// fifty three of them are donuts sitting in SIX STYLES of nine flavours each,
// where the same flavour name appears in several styles. Vanilla Milk is a Milk
// Donut and it is also a Cruller. Black Sesame Honey is in both. So the choice
// a person is actually making is style first, flavour second, and a flat grid
// of fifty three cards shows a flavour name three times with no way to tell why.
//
// The nav used to offer four CATEGORIES, and one of them, Donuts, was eighty
// percent of the menu. Filtering to it removes almost nothing, so it was not
// really a filter. The useful unit is the GROUP, which is the style, and that
// is what this file promotes to a top level section.
//
// ── TODAY IS MOST OF THE MENU ──────────────────────────────────────────────
//
// Roughly half the donuts are off on any given day. Splitting today from the
// rest here, once, means no component has to think about it and the page can
// lead with the twenty five things you can actually buy instead of showing you
// fifty three and greying out half.
//
// ── THE ZERO PRICE GUARD, READ THIS BEFORE REMOVING IT ─────────────────────
//
// The seven Lunch stuffed rolls are in the database at price 0. They are all
// switched off today so nothing is wrong right now, but this shop runs LIVE
// Stripe keys, and the day somebody flips one on in the admin it becomes a
// sandwich that checks out for nothing. `orderable` is false for anything at or
// below zero, so it can be looked at but never added to a box. It is a guard,
// not a fix. The fix is real prices in the database, and once they are in this
// guard simply stops matching anything.
//
// No em dashes, oxford commas or colons.

// A style section is one group promoted to the top level, carrying the name of
// the category it came from so the page can still show the hierarchy.
export function toSections(categories) {
  const sections = [];

  for (const cat of categories || []) {
    for (const group of cat.groups || []) {
      const items = (group.items || []).map((it) => ({
        ...it,
        orderable: it.price != null && it.price > 0,
      }));

      // today, and everything else. an item with no price cannot be bought, so
      // it belongs with the rest whatever its flag says.
      const today = items.filter((it) => it.is_available_today && it.orderable);
      const rest = items.filter((it) => !(it.is_available_today && it.orderable));

      // an empty group is not a section. Drinks has three of them, Cold Brew,
      // Milks and Icy Machine, all with zero items, and they used to render as
      // three headings over nothing.
      if (!items.length) continue;

      sections.push({
        id: group.id,
        slug: `${cat.slug}-${group.slug}`,
        name: group.name,
        categoryName: cat.name,
        categorySlug: cat.slug,
        items,
        today,
        rest,
      });
    }
  }

  return sections;
}

// Sections that have something to sell right now, which is what the nav points
// at. A style with nothing on today is still rendered further down the page,
// but sending somebody to it from the nav would be sending them to a dead end.
export function navSections(sections) {
  return sections.filter((s) => s.today.length > 0);
}

export function countToday(sections) {
  return sections.reduce((n, s) => n + s.today.length, 0);
}
