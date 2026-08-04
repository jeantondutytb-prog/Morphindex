import { Section } from "@/components/ui/section";
import { ScrollReveal } from "./scroll-reveal";

const STEPS = [
  {
    num: "01",
    title: "Quelques questions",
    desc: "Objectif, phototype, routine actuelle — 2 minutes.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h4M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Une photo",
    desc: "Selfie face, lumière naturelle. Supprimée après analyse.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M3 6a2 2 0 012-2h2l1-2h4l1 2h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Ton rapport",
    desc: "Indice actuel, indice atteignable, points d'action et routine.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 4h12v12H4V4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 8h6M7 11h4M7 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Method() {
  return (
    <Section id="methode" kicker="Méthode" title="De la photo au rapport en 3 étapes">
      <p className="text-muted text-sm md:text-[15px] max-w-xl mb-10 -mt-1">
        Pas de jargon. Pas de note vague. Un indice mesurable et une routine concrète.
      </p>

      <div className="relative grid md:grid-cols-3 gap-4 md:gap-5">
        <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" aria-hidden />

        {STEPS.map((step, i) => (
          <ScrollReveal key={step.num} delay={i * 100}>
            <div className="group relative rounded-2xl border border-line bg-surface p-6 h-full transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.03] hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex size-10 items-center justify-center rounded-xl border border-line bg-bg text-muted group-hover:text-accent group-hover:border-accent/30 transition-colors">
                  {step.icon}
                </div>
                <span className="font-mono text-[10px] text-accent tracking-wider">{step.num}</span>
              </div>
              <h3 className="font-display font-bold text-text text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
