// src/pages/Build/sections/HowItGoes.jsx
//
// How it goes. The build sequence as a quiet labelled list rather
// than a salesy process pitch. A left rail of steps with a hairline
// connecting them. Clean lowercase content with no oxford commas and
// no dashes.
// v1 · 2026-06-18

import Container from "../../../components/Layout/Container";
import Eyebrow from "../../../components/Atoms/Eyebrow";
import Reveal from "../../../components/Atoms/Reveal";

const STEPS = [
  { k: "survey", line: "We learn the terrain first. What exists, what hurts and what the win actually looks like." },
  { k: "draft", line: "A small honest plan. The shape of the thing before a line of code is written." },
  { k: "build", line: "Steady work in the open. You see it move as it comes together." },
  { k: "ship", line: "Onto real infrastructure and into your hands. Then we watch it run." },
];

function HowItGoes() {
  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden" style={{ background: "var(--color-surface-engine)", borderTop: "1px solid var(--color-line)" }}>
      <Container size="full" className="relative z-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <Reveal><Eyebrow signal>how it goes</Eyebrow></Reveal>
            <Reveal delay={0.06}><h2 className="text-display-lg mt-5 text-ink lowercase">four moves. no surprises.</h2></Reveal>
            <Reveal delay={0.12}><p className="text-lead mt-5 max-w-[40ch]">The same rhythm every time. Small enough to trust and quick enough to keep momentum.</p></Reveal>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <div className="flex flex-col">
              {STEPS.map((s, i) => (
                <Reveal key={s.k} delay={0.1 + i * 0.08}><Step s={s} last={i === STEPS.length - 1} /></Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Step({ s, last }) {
  return (
    <div className="flex gap-6 pb-8" style={{ borderBottom: last ? "none" : "1px solid var(--color-line)", marginBottom: last ? 0 : "2rem" }}>
      <span className="beacon-dot sm mt-2" aria-hidden="true" />
      <div className="flex-1">
        <h3 className="text-display-sm text-ink mb-2 lowercase">{s.k}</h3>
        <p className="text-body text-ink-muted max-w-[44ch]">{s.line}</p>
      </div>
    </div>
  );
}

export default HowItGoes;
