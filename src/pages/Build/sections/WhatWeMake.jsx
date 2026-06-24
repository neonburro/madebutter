// src/pages/Build/sections/WhatWeMake.jsx
//
// What we make. The homepage gave one line. Here it opens into the
// real categories of work as a clean grid. Left aligned header with
// aligned cards underneath on desktop and a full width stack on
// mobile. Clean lowercase content with no oxford commas and no dashes.
// v1 · 2026-06-18

import Container from "../../../components/Layout/Container";
import Eyebrow from "../../../components/Atoms/Eyebrow";
import Reveal from "../../../components/Atoms/Reveal";

const KINDS = [
  { title: "sites", line: "Marketing sites and storefronts that load fast and read clean. The front door for a business that wants to look the part." },
  { title: "dashboards", line: "Live views into the numbers that matter. Revenue, jobs, signals. The screen you keep open all day." },
  { title: "internal tools", line: "The quiet software a team runs on. Intake forms, schedulers, billing flows and the glue between systems." },
  { title: "automations", line: "Work that runs without anyone watching. Scrapers, syncs, notifications and the agents that decide what to do next." },
  { title: "one offs", line: "The odd thing nobody else will build. If it can be described it can usually be made." },
  { title: "rescues", line: "Inherited code that needs a steady hand. We read it, fix it and leave it better than we found it." },
];

function WhatWeMake() {
  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-line)" }}>
      <div className="absolute inset-0 schematic-grid schematic-grid-fade pointer-events-none" aria-hidden="true" />

      <Container size="full" className="relative z-10">
        <div className="max-w-[54ch] mb-14 md:mb-20">
          <Reveal><Eyebrow signal>what we make</Eyebrow></Reveal>
          <Reveal delay={0.06}><h2 className="text-display-xl mt-5 text-ink lowercase">software that earns its keep.</h2></Reveal>
          <Reveal delay={0.12}><p className="text-lead mt-5 max-w-[50ch]">Different shapes, one standard. Everything we make has to pull its weight.</p></Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-px" style={{ background: "var(--color-line)" }}>
          {KINDS.map((k, i) => (
            <Reveal key={k.title} delay={0.08 + i * 0.06} className="h-full"><Card k={k} /></Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Card({ k }) {
  return (
    <div className="h-full flex flex-col p-8 md:p-10" style={{ background: "var(--color-bg)" }}>
      <h3 className="text-display-md text-ink mb-4 lowercase">{k.title}</h3>
      <p className="text-body text-ink-muted max-w-[34ch]">{k.line}</p>
    </div>
  );
}

export default WhatWeMake;
