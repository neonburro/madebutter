// src/pages/Home/components/FamilyNav.jsx
// Centered, sticky category nav. Sticks flush to the top (the floating top nav
// hides on scroll-down and layers above this on scroll-up). Tapping a category
// smooth-scrolls to its band; active gets a butter dot. Mobile: horizontal scroll.
import { useEffect, useState } from 'react';

export default function FamilyNav({ categories }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const ids = categories.map((c) => `cat-${c.slug}`);
    const onScroll = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 140) setActive(id);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [categories]);

  if (!categories.length) return null;

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderColor: 'var(--mb-surface-line)' }}
    >
      <div className="mx-auto flex w-[98%] justify-center gap-6 overflow-x-auto whitespace-nowrap py-3.5 sm:gap-8" style={{ scrollbarWidth: 'none' }}>
        {categories.map((c) => {
          const id = `cat-${c.slug}`;
          const isActive = active === id;
          return (
            <button
              key={c.id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              className="relative flex-shrink-0 text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--mb-text-primary)' : 'var(--mb-text-muted)' }}
            >
              {c.name}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: 'var(--mb-accent-butter)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
