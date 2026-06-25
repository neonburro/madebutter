// src/pages/Home/components/Hero.jsx
// Hero slideshow with a FIXED ribbon. The photo crossfades behind with a slow
// drift (Ken Burns), but the ribbon stays put. Only the ribbon TINT and the words
// change per slide, so nothing jumps. Japanese-clean: calm frame, content breathes.
// Desktop/iPad: landscape photo, ribbon bottom-left. Mobile: portrait photo,
// ribbon as a low horizontal band. Built so a new campaign is just an image set
// plus two lines of copy.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDES = [
  {
    key: 'matcha',
    base: '/home/heros/matcha-party-week',
    title: 'Matcha Party Week',
    sub: 'Big matcha energy, small batch as always.',
    tint: 'rgba(124,150,74,0.82)',
    tintText: '#ffffff',
    stack: true,
  },
  {
    key: 'sesame',
    base: '/home/heros/new-flavor-toasted-black-sesame-glaze',
    title: 'Toasted Sesame Drop',
    sub: 'Nutty, toasty, a little weird in the best way.',
    tint: 'rgba(34,30,26,0.78)',
    tintText: '#F5F2EB',
    stack: true,
  },
  {
    key: 'rolls',
    base: '/home/heros/stuffed-rolls-experiments',
    title: 'Stuffed Rolls, Still in the Lab',
    sub: 'Fresh experiments straight from the kitchen.',
    tint: 'rgba(120,72,28,0.80)',
    tintText: '#F5F2EB',
    stack: false,
  },
];

const AUTO_MS = 6500;

export default function Hero({ onOrder }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), AUTO_MS);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[i];

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'var(--mb-surface-cream)' }}>
      <div className="relative h-[78vh] w-full sm:h-[88vh]">
        <AnimatePresence>
          <motion.div
            key={slide.key}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1, ease: 'easeInOut' }, scale: { duration: AUTO_MS / 1000 + 1.1, ease: 'linear' } }}
          >
            <picture>
              <source media="(max-width: 767px)" srcSet={`${slide.base}-mobile.png`} />
              <source media="(max-width: 1023px)" srcSet={`${slide.base}-ipad.png`} />
              <img
                src={`${slide.base}-desktop.png`}
                alt={slide.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-end">
          <div className="w-full p-4 sm:p-8 lg:p-12">
            <motion.div
              className="pointer-events-auto inline-block w-full overflow-hidden rounded-2xl px-5 py-4 backdrop-blur-md sm:w-auto sm:max-w-md sm:px-7 sm:py-6"
              animate={{ background: slide.tint }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1
                    className="text-2xl font-bold sm:text-4xl lg:text-5xl"
                    style={{ color: slide.tintText, letterSpacing: 'var(--tracking-heading)', lineHeight: 1.05 }}
                  >
                    {slide.title}
                  </h1>
                  <p className="mt-2 text-sm sm:mt-3 sm:text-base" style={{ color: slide.tintText, opacity: 0.92 }}>
                    {slide.sub}
                  </p>
                  <button
                    onClick={() => onOrder?.()}
                    className="mt-4 rounded-full px-7 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
                    style={{ background: '#161412', color: '#F5D66B' }}
                  >
                    See the menu
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-30 flex gap-2 sm:bottom-8 sm:right-8">
          {SLIDES.map((s, idx) => (
            <button
              key={s.key}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? '22px' : '8px',
                background: idx === i ? '#ffffff' : 'rgba(255,255,255,0.55)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
