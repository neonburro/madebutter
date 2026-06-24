// src/pages/Build/index.jsx
//
// The build page. Opens from the homepage pillar and goes deeper.
// Page hero, what we make, how it goes, closing. Common Nav and
// Footer come from App. Modular so new sections slot in easily.
// v1 · 2026-06-18

import PageHero from "../../components/Layout/PageHero";
import WhatWeMake from "./sections/WhatWeMake";
import HowItGoes from "./sections/HowItGoes";
import Closing from "./sections/Closing";

function Build() {
  return (
    <main id="main">
      <PageHero
        eyebrow="build"
        title="we make the software itself."
        lead="Sites, dashboards, internal tools and the odd thing nobody else will make. Built carefully, shipped on real infrastructure and handed over working."
      />
      <WhatWeMake />
      <HowItGoes />
      <Closing />
    </main>
  );
}

export default Build;
