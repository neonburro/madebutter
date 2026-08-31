// src/pages/Home/components/AboutSection.jsx
//
// The band under the hero. It used to be a 50/50 with a photograph on one side
// and the about copy on the other, and the photograph was doing nothing: it was
// a picture of a bakery on the website of a bakery, sitting directly above
// actual pictures of the actual food.
//
// ── IT ANSWERS THE FIRST QUESTION INSTEAD ───────────────────────────────────
//
// The thing somebody wants to know before they scroll a sixty five item menu is
// whether the thing they came for is out today, because about half of this menu
// changes daily. So the picture is replaced by a live board: how many things
// are out right now, broken down by style, and what is running low. It is built
// from the same sections the menu below is built from, passed down from
// src/pages/Home/index.jsx, so it can never disagree with the grid.
//
// The style counts are BUTTONS. This band is the first navigation on the page,
// which is what makes it worth the space, and a person who came for a cruller
// can be looking at crullers in one tap.
//
// ── THE COPY STAYED, THE WEIGHTS CHANGED ────────────────────────────────────
//
// The heading is the display face and the body is the reading face at a heavier
// weight than it was. The owner's note was that the paragraph looked skinny next
// to the title, which it did, because a 400 weight paragraph under a 700 weight
// heading reads as faint rather than as quiet. See src/index.css.
//
// about.heading and about.body come from the single about_section row in
// Supabase and stay editable there.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../../../lib/supabase';
import { SEED_ABOUT } from '../../../data/seedMenu';

const LOW_STOCK_AT = 6;

export default function AboutSection({ sections = [] }) {
  const [about, setAbout] = useState(supabaseConfigured ? null : SEED_ABOUT);

  useEffect(() => {
    // same switch as useMenu.js. keyed off whether the env exists, not off
    // whether a request failed, so it cannot mask a real outage.
    if (!supabaseConfigured) return undefined;
    let active = true;
    supabase.from('about_section').select('*').eq('id', 1).single().then(({ data }) => {
      if (active) setAbout(data);
    });
    return () => { active = false; };
  }, []);

  const withToday = sections.filter((s) => s.today.length > 0);
  const total = withToday.reduce((n, s) => n + s.today.length, 0);

  // anything tracked and nearly gone. worth saying out loud, it is the reason
  // somebody comes in the morning rather than the afternoon.
  const low = sections
    .flatMap((s) => s.today)
    .filter((i) => i.track_stock && i.stock_qty != null && i.stock_qty > 0 && i.stock_qty <= LOW_STOCK_AT)
    .sort((a, b) => a.stock_qty - b.stock_qty)
    .slice(0, 3);

  const jump = (slug) => document.getElementById(`style-${slug}`)?.scrollIntoView({ behavior: 'smooth' });

  if (!about && !total) return null;

  return (
    <section className="w-full py-14 sm:py-20">
      <div className="mx-auto grid w-[98%] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {about && (
          <div>
            <h2 className="mb-display text-4xl font-semibold sm:text-5xl" style={{ lineHeight: 1.05 }}>
              {about.heading}
            </h2>
            <p
              className="mt-5 max-w-xl text-lg font-medium leading-relaxed sm:text-xl"
              style={{ color: 'var(--mb-text-secondary)' }}
            >
              {about.body}
            </p>
          </div>
        )}

        {total > 0 && (
          <div
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
          >
            <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>
              out right now
            </p>

            <p className="mb-nums mb-display mt-1 text-6xl font-semibold sm:text-7xl" style={{ lineHeight: 1 }}>
              {total}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {withToday.map((s) => (
                <button
                  key={s.id}
                  onClick={() => jump(s.slug)}
                  className="flex min-h-[44px] items-center gap-2 rounded-full px-4 text-[15px] font-semibold lowercase"
                  style={{ background: 'var(--mb-surface-sunk)', color: 'var(--mb-text-primary)' }}
                >
                  {s.name}
                  <span className="mb-nums font-bold" style={{ color: 'var(--mb-accent-toast)' }}>
                    {s.today.length}
                  </span>
                </button>
              ))}
            </div>

            {low.length > 0 && (
              <p className="mt-5 border-t pt-4 text-[15px] font-medium" style={{ borderColor: 'var(--mb-surface-line)', color: 'var(--mb-text-secondary)' }}>
                nearly gone,{' '}
                {low.map((i, idx) => (
                  <span key={i.id}>
                    {idx > 0 && ', '}
                    <span style={{ color: 'var(--mb-text-primary)' }}>{i.name}</span>
                    {' '}
                    <span className="mb-nums">({i.stock_qty} left)</span>
                  </span>
                ))}
                .
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
