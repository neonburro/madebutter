// src/components/Crumbs/CrumbJar.jsx
//
// What a customer has collected, and what it gets them. This is the half of the
// loyalty program that did not exist: crumbs were counted from day one and
// shown only on an admin leaderboard, so the people actually earning them had
// no way to see a balance or find out that a balance was worth anything.
//
// Numbers and rungs come from src/data/crumbs.js. Nothing is computed here.
//
// ── IT IS HONEST ABOUT NOT BEING AUTOMATIC ──────────────────────────────────
// Redemption is not built, there is no stored balance and nothing subtracts. So
// the card says to mention it at the counter rather than showing a redeem
// button that would do nothing. A loyalty program that overpromises in the UI
// is worse than one that is plainly manual, because the first one gets argued
// about at the till.
//
// No em dashes, oxford commas or colons.

import { progress, CRUMBS_PER_DOLLAR } from '../../data/crumbs';

export default function CrumbJar({ crumbs }) {
  const { earned, next, toGo, fill } = progress(crumbs);
  const top = earned[earned.length - 1] || null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--mb-surface-raised)', boxShadow: 'var(--mb-shadow-card)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--mb-text-muted)' }}>
          your crumbs
        </p>
        <p className="mb-nums text-3xl font-bold" style={{ letterSpacing: 'var(--tracking-heading)' }}>
          {crumbs.toLocaleString()}
        </p>
      </div>

      {crumbs === 0 ? (
        <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
          you get {CRUMBS_PER_DOLLAR} crumbs for every dollar. they add up faster than they sound like they do.
        </p>
      ) : (
        <>
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--mb-surface-sunk)' }}
            role="progressbar"
            aria-valuenow={crumbs}
            aria-valuemin={0}
            aria-valuemax={next ? next.at : crumbs}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(fill * 100)}%`,
                background: 'var(--mb-accent-butter)',
                transition: 'width 0.6s var(--mb-ease)',
              }}
            />
          </div>

          {next ? (
            <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
              <span className="mb-nums" style={{ color: 'var(--mb-text-primary)' }}>{toGo.toLocaleString()}</span>
              {' '}more and you have earned <span style={{ color: 'var(--mb-text-primary)' }}>{next.reward}</span>. {next.note}
            </p>
          ) : (
            <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
              you are at the top of the ladder. we will think of something else.
            </p>
          )}
        </>
      )}

      {top && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--mb-surface-line)' }}>
          <p className="text-sm font-bold">earned so far, {top.reward}</p>
          <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--mb-text-secondary)' }}>
            {/* honest about the manual step. see the note at the top of this file. */}
            mention it at the counter and we will sort it out.
          </p>
        </div>
      )}
    </div>
  );
}
