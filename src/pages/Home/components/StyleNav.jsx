// src/pages/Home/components/StyleNav.jsx
//
// The sticky rail of donut styles. Replaces the old category nav, and the
// reason is in src/data/menuShape.js: the four categories were Donuts, which is
// eighty percent of the menu, plus three small ones, so tapping Donuts filtered
// out almost nothing. The styles are the real choice. Milk Donut, Mochi Ring,
// Old Fashioned, Milk Bar, Cruller, Fritter.
//
// ── THE ACTIVE CHIP SCROLLS ITSELF INTO VIEW ────────────────────────────────
// There are nine of these and a phone shows about three. A rail that highlights
// a chip you cannot see is worse than no highlight, so when the active section
// changes the rail brings that chip to the middle. `scrollIntoView` with inline
// nearest is deliberate, block must stay nearest too or the browser scrolls the
// PAGE to the rail while you are already scrolling the page, which fights you.
//
// ── WHY SCROLL AND NOT INTERSECTIONOBSERVER ─────────────────────────────────
// Sections here are taller than the viewport, so an observer spends most of its
// time reporting two of them at once and the tie break logic ends up being the
// same arithmetic this does directly. Reading the position of each heading
// against the nav line is one pass and it is exact.
//
// HEIGHT IS 58px AND src/index.css .mb-anchor DEPENDS ON IT. If this bar gets
// taller, raise the scroll-margin-top there in the same commit or every jump
// lands with the heading tucked under the bar.
//
// No em dashes, oxford commas or colons.

import { useEffect, useRef, useState } from 'react';

export default function StyleNav({ sections }) {
  const [active, setActive] = useState(null);
  const railRef = useRef(null);
  const chipRefs = useRef({});

  useEffect(() => {
    if (!sections.length) return undefined;

    const onScroll = () => {
      // The line a heading has to cross before its style counts as the one you
      // are looking at. It is a THIRD OF THE WAY DOWN the viewport, not just
      // under the bar, because a section heading sitting at the very top of the
      // screen with its whole grid below it is plainly the section you are in,
      // and a line tucked under the bar leaves the previous chip lit while the
      // new style fills the screen. Never let this go below the bar height or a
      // heading can be visually stuck under the rail and still count as passed.
      const line = Math.max(160, window.innerHeight * 0.32);
      let current = sections[0].slug;
      for (const s of sections) {
        const el = document.getElementById(`style-${s.slug}`);
        if (el && el.getBoundingClientRect().top <= line) current = s.slug;
      }
      setActive(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  useEffect(() => {
    const chip = chipRefs.current[active];
    if (chip) chip.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [active]);

  if (!sections.length) return null;

  return (
    <nav
      className="sticky z-40 w-full"
      style={{
        // published by TopNav.jsx, which measures itself. It is 0px while the
        // top bar is away, so the rail rides up into its place instead of
        // being covered by it. Read the note in that file before changing this.
        top: 'var(--mb-nav-offset, 0px)',
        transition: 'top 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(250,246,236,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mb-surface-line)',
      }}
      aria-label="Jump to a style"
    >
      <div ref={railRef} className="mb-rail mx-auto flex w-[98%] items-center gap-2 whitespace-nowrap py-2.5">
        {sections.map((s) => {
          const isActive = active === s.slug;
          return (
            <button
              key={s.id}
              ref={(el) => { chipRefs.current[s.slug] = el; }}
              onClick={() => document.getElementById(`style-${s.slug}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold lowercase"
              style={{
                background: isActive ? 'var(--mb-accent-butter)' : 'transparent',
                color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-secondary)',
                boxShadow: isActive ? 'var(--mb-shadow-card)' : 'none',
                transition: 'background 0.25s var(--mb-ease), color 0.25s var(--mb-ease)',
              }}
              aria-current={isActive ? 'true' : undefined}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
