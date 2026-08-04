"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "./scroll-reveal";

const SOFT_ITEMS = [
  "État de peau", "Cernes et sommeil", "Pilosité et barbe",
  "Coupe de cheveux", "Posture", "Composition corporelle", "Dents",
];

const HARD_ITEMS = [
  "Structure osseuse", "Canthal tilt", "Proportions faciales",
  "Harmonie et symétrie", "Taille et charpente",
];

export function TwoReadings() {
  const [active, setActive] = useState<"soft" | "hard">("soft");

  async function trackHardmaxingInterest() {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hardmaxing_interest", payload: { source: "landing" } }),
    });
  }

  return (
    <Section id="lectures" kicker="Analyse" title="Softmaxing ou hardmaxing — tu choisis">
      <p className="text-muted text-sm md:text-[15px] max-w-xl mb-8 -mt-1">
        Deux lectures complémentaires. Rien ne t&apos;est imposé à l&apos;inscription.
      </p>

      <ScrollReveal>
        <div className="inline-flex rounded-xl border border-line bg-surface p-1 mb-6">
          <button
            type="button"
            onClick={() => setActive("soft")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              active === "soft"
                ? "bg-accent text-accent-ink shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            Softmaxing
          </button>
          <button
            type="button"
            onClick={() => {
              setActive("hard");
              void trackHardmaxingInterest();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              active === "hard"
                ? "bg-line-strong text-text shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            Hardmaxing
            <span className="font-mono text-[8px] uppercase tracking-wider text-dim border border-line px-1.5 py-0.5 rounded">
              bientôt
            </span>
          </button>
        </div>

        <div className="relative rounded-2xl border border-line bg-surface overflow-hidden min-h-[280px]">
          <div
            className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
              active === "soft" ? "from-accent/8 to-transparent opacity-100" : "opacity-0"
            }`}
            aria-hidden
          />

          <div className="relative p-6 md:p-8">
            {active === "soft" ? (
              <div className="animate-tab-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex size-2 rounded-full bg-accent" />
                  <h3 className="font-display font-bold text-xl text-text">Ce que tu peux faire évoluer</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {SOFT_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-line/80 bg-bg/40 px-4 py-3 text-sm text-muted"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="animate-tab-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex size-2 rounded-full bg-dim" />
                  <h3 className="font-display font-bold text-xl text-text">Structure et proportions</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {HARD_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-line/80 bg-bg/40 px-4 py-3 text-sm text-muted"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-line text-dim text-xs">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-dim">
                  Intérêt enregistré — tu seras prévenu à l&apos;ouverture.
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
