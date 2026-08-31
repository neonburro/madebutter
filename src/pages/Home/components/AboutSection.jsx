// src/pages/Home/components/AboutSection.jsx
//
// The band under the hero. One statement, centred, and nothing else.
//
// ── IT HAS BEEN THREE THINGS ────────────────────────────────────────────────
//
// A 50/50 with a photograph beside the copy, which was a picture of a bakery on
// the website of a bakery sitting directly above photographs of the actual
// food. Then a live board of what was out today, counts and style chips and a
// nearly gone line, which was useful and was also a second menu standing in
// front of the menu. Now the copy on its own.
//
// The availability information did not get lost when the board came out. Every
// style heading below carries its own "N today" and the style rail only lists
// styles that have something on, so the same answer is in the place a person is
// already looking. A panel restating it was one layer too many. See
// MenuSection.jsx and StyleNav.jsx.
//
// ── WHY THERE IS SO MUCH AIR ────────────────────────────────────────────────
//
// This is the only beat between a full bleed hero and a dense grid of sixty
// five things. Its whole job is to be a breath, so the padding is deliberately
// larger than it needs to be for the text alone. Do not fill it.
//
// The heading is the display face and the body is the reading face at a weight
// that does not look faint beside it. See the type note in src/index.css.
//
// heading and body come from the single about_section row in Supabase and stay
// editable there. src/data/seedMenu.js carries a copy for working without a
// database.
//
// No em dashes, oxford commas or colons.

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../../../lib/supabase';
import { SEED_ABOUT } from '../../../data/seedMenu';

export default function AboutSection() {
  const [about, setAbout] = useState(supabaseConfigured ? null : SEED_ABOUT);

  useEffect(() => {
    // same switch as useMenu.js, keyed off whether the env exists rather than
    // off whether a request failed, so it cannot mask a real outage
    if (!supabaseConfigured) return undefined;
    let active = true;
    supabase.from('about_section').select('*').eq('id', 1).single().then(({ data }) => {
      if (active) setAbout(data);
    });
    return () => { active = false; };
  }, []);

  if (!about) return null;

  return (
    <section className="w-full py-20 sm:py-28">
      <div className="mx-auto w-[92%] max-w-2xl text-center">
        <h2 className="mb-display text-4xl font-semibold sm:text-5xl" style={{ lineHeight: 1.05 }}>
          {about.heading}
        </h2>
        {about.body && (
          <p
            className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed sm:text-xl"
            style={{ color: 'var(--mb-text-secondary)' }}
          >
            {about.body}
          </p>
        )}
      </div>
    </section>
  );
}
