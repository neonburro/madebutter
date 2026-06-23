// src/pages/Home/components/AboutSection.jsx
// 50/50 band below the hero. Reads the single about_section row from Supabase.
// Desktop: text left, image right. Mobile: image on top, text below.
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AboutSection() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.from('about_section').select('*').eq('id', 1).single().then(({ data }) => {
      if (active) setAbout(data);
    });
    return () => { active = false; };
  }, []);

  if (!about) return null;

  const img = about.image_path?.startsWith('http')
    ? about.image_path
    : about.image_path;

  return (
    <section className="w-full py-16 sm:py-24">
      <div className="mx-auto grid w-[98%] grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-12">
        <div className="order-first overflow-hidden rounded-3xl sm:order-last" style={{ background: 'var(--mb-surface-paper)' }}>
          {img && <img src={img} alt={about.heading} className="h-full w-full object-cover" />}
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-semibold sm:text-4xl" style={{ letterSpacing: 'var(--tracking-heading)', lineHeight: 1.1 }}>
            {about.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed sm:mx-0" style={{ color: 'var(--mb-text-secondary)' }}>
            {about.body}
          </p>
        </div>
      </div>
    </section>
  );
}
