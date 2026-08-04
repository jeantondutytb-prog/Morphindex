import { Section } from "@/components/ui/section";

const STEPS = [
  { num: "01", title: "Quelques questions", desc: "Objectif, phototype, routine actuelle — 2 minutes." },
  { num: "02", title: "Une photo", desc: "Selfie face, lumière naturelle. Supprimée après analyse." },
  { num: "03", title: "Ton rapport", desc: "Indice actuel, indice atteignable, points d'action et routine." },
];

export function Method() {
  return (
    <Section id="methode" kicker="03 · Méthode" title="Trois étapes, un rapport">
      <div className="grid md:grid-cols-3 gap-4">
        {STEPS.map((step) => (
          <div key={step.num} className="rounded-xl border border-line bg-surface p-5">
            <span className="font-mono text-[10px] text-accent tracking-wider">{step.num}</span>
            <h3 className="font-display font-bold text-text mt-2 mb-1">{step.title}</h3>
            <p className="text-sm text-muted">{step.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
