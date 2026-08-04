"use client";

import { Section } from "@/components/ui/section";

const SOFT_ITEMS = [
  "État de peau", "Cernes et sommeil", "Pilosité et barbe",
  "Coupe de cheveux", "Posture", "Composition corporelle", "Dents",
];

const HARD_ITEMS = [
  "Structure osseuse", "Canthal tilt", "Proportions faciales",
  "Harmonie et symétrie", "Taille et charpente",
];

export function TwoReadings() {
  async function trackHardmaxingInterest() {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hardmaxing_interest", payload: { source: "landing" } }),
    });
  }

  return (
    <Section id="lectures" kicker="02 · Deux lectures" title="Softmaxing ou hardmaxing — tu choisis">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-accent/30 bg-accent/4 p-5">
          <h3 className="font-display font-bold text-text mb-3">Softmaxing</h3>
          <ul className="space-y-2 text-sm text-muted">
            {SOFT_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-accent">·</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={trackHardmaxingInterest}
          className="rounded-xl border border-line-strong p-5 text-left hover:border-muted transition"
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display font-bold text-text">Hardmaxing</h3>
            <span className="font-mono text-[9px] uppercase tracking-wider text-dim border border-line px-2 py-0.5 rounded">
              bientôt
            </span>
          </div>
          <ul className="space-y-2 text-sm text-muted">
            {HARD_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-dim">·</span> {item}
              </li>
            ))}
          </ul>
        </button>
      </div>
      <p className="text-sm text-dim">
        Tu choisis l&apos;une, l&apos;autre, ou les deux à l&apos;inscription. Rien ne t&apos;est imposé.
      </p>
    </Section>
  );
}
