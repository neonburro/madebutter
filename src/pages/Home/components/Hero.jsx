// src/pages/Home/components/Hero.jsx
// Full-bleed hero slideshow. Subtle cross-fade, dot controls.
// Each slide carries its own image base path + per-device files.
// Text sits centered on desktop, lower on tablet/mobile to land in the image's
// negative space (food clusters at the top on smaller screens).
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDES = [
  {
    key: 'today',
    base: '/home/heros/fresh-daily',
    files: { mobile: 'mobile', tablet: 'ipad', desktop: 'desktop' },
    title: 'Fresh today.',
    sub: "What's good right now, ready to grab.",
    cta: 'See the menu',
    action: 'menu',
  },
  {
    key: 'brand',
    base: null,
    title: 'A bakery that runs like a lab.',
    sub: 'Small batches, new flavors, made clean.',
    cta: 'Order now',
    action: 'menu',
  },
  {
    key: 'suggest',
    base: null,
    title: 'Tell us what to make.',
    sub: 'The best ideas end up on the menu. We hook you up.',
    cta: 'Send a suggestion',
    action: 'suggest',
  },
];

const AUTO_MS = 6000;

export default function Hero({ onOrder, onSuggest }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), AUTO_MS);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[i];
  const fire = (action) => {
    if (action === 'suggest') onSuggest?.();
    else onOrder?.();
  };

  return (
    <section className="relative flex min-h-[92vh] w-full items-end justify-center overflow-hidden sm:items-center">
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(180deg, var(--mb-surface-cream) 0%, var(--mb-surface-base) 100%)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {slide.base && (
              <picture>
                <source media="(max-width: 767px)" srcSet={`${slide.base}-${slide.files.mobile}.png`} />
                <source media="(max-width: 991px)" srcSet={`${slide.base}-${slide.files.tablet}.png`} />
                <img
                  src={`${slide.base}-${slide.files.desktop}.png`}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
              </picture>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-1/2" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 55%, transparent 100%)' }} />

      <div className="relative z-20 mx-auto max-w-3xl px-6 pb-20 text-center sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-semibold sm:text-6xl lg:text-7xl" style={{ letterSpacing: 'var(--tracking-heading)', lineHeight: 1.05 }}>
              {slide.title}
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base sm:text-lg" style={{ color: 'var(--mb-text-secondary)' }}>
              {slide.sub}
            </p>
            <button
              onClick={() => fire(slide.action)}
              className="mt-8 rounded-full px-9 py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
              style={{ background: 'var(--mb-dark-base)', color: 'var(--mb-dark-text)' }}
            >
              {slide.cta}
            </button>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-center gap-2.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.key}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? '20px' : '8px',
                background: idx === i ? 'var(--mb-accent-butter)' : 'var(--mb-surface-line-strong)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
