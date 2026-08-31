// src/components/Kolache/Kolache.jsx
//
// Kolache saying one thing. See src/data/kolache.js for who he is and for the
// rule that governs every use of this component: he only speaks where a person
// behind a counter would actually say something. Never to decorate a page.
//
// ── HE GETS A CIRCLE ────────────────────────────────────────────────────────
// House law across every neonburro property: burros are circles, hue mans are
// rounded squares. It is never explained anywhere on any site and it is always
// obeyed. Do not round this to a squircle because it looks more modern.
//
// ── TWO SIZES AND THAT IS ALL ───────────────────────────────────────────────
// `sm` is an inline aside next to something else on the page. `lg` is when he
// IS the content, which happens on an empty cart and on a finished order. A
// third size would mean somebody is using him as a layout element.
//
// ── TWO TONES, FOR THE TWO GROUNDS THIS SITE HAS ────────────────────────────
// The hairline around the avatar is what stops a photograph floating
// unsupported, and a hairline tuned for cream is invisible on the dark footer
// while one tuned for dark is a bright ring on cream. So the tone follows the
// surface he is standing on. Anything darker than the paper passes tone="dark".
//
// No em dashes, oxford commas or colons.

import { KOLACHE } from '../../data/kolache';

export default function Kolache({ say, size = 'sm', tone = 'light', className = '' }) {
  if (!say) return null;
  const lg = size === 'lg';
  const dark = tone === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={KOLACHE.avatar}
        alt=""
        width={lg ? 52 : 34}
        height={lg ? 52 : 34}
        loading="lazy"
        className="shrink-0 rounded-full object-cover"
        style={{
          width: lg ? 52 : 34,
          height: lg ? 52 : 34,
          // The hairline is what stops a photographic avatar floating
          // unsupported on a flat ground. Same treatment the family uses
          // everywhere else, tuned to whichever ground he is on.
          border: `1px solid ${dark ? 'var(--mb-dark-line)' : 'var(--mb-surface-line-strong)'}`,
          background: dark ? 'var(--mb-dark-raised)' : 'var(--mb-surface-raised)',
        }}
      />
      <p
        className={lg ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'}
        style={{ color: dark ? 'var(--mb-dark-text)' : 'var(--mb-text-secondary)' }}
      >
        {say}
      </p>
    </div>
  );
}
