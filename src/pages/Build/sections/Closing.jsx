// src/pages/Build/sections/Closing.jsx
//
// Closing band. A short line and a way forward so the page does not
// dead end. Quiet sky blue advance back to the invitation on home.
// Clean lowercase content with no oxford commas and no dashes.
// v1 · 2026-06-18

import { Link } from "react-router-dom";
import Container from "../../../components/Layout/Container";
import Reveal from "../../../components/Atoms/Reveal";

function Closing() {
  return (
    <section className="relative py-28 md:py-40 w-full overflow-hidden" style={{ background: "#000000", borderTop: "1px solid var(--color-line)" }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91,180,240,0.05) 0%, transparent 70%)" }} />

      <Container size="reading" className="relative z-10 text-center">
        <Reveal><h2 className="text-display-lg text-ink lowercase mb-8">have something worth building?</h2></Reveal>
        <Reveal delay={0.08}>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            <a href="mailto:hello@neonburro.com" className="inline-flex items-center gap-2.5 transition-all duration-200" style={{ padding: "12px 22px", borderRadius: "999px", background: "var(--color-accent)", color: "#000000", boxShadow: "0 0 16px var(--color-accent-glow)" }}>
              <span className="text-mono lowercase">start a conversation</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
            </a>
            <Link to="/" className="text-mono text-ink-muted hover:text-ink transition-colors duration-200 lowercase">back to the field</Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export default Closing;
