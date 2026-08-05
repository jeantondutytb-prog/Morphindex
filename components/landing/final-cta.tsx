import { Cta } from "@/components/ui/cta";

const REASSURANCE = [
  "Sans carte bancaire pour démarrer",
  "Photo supprimée après analyse",
  "Rapport en 3 minutes",
];

export function FinalCta() {
  return (
    <section className="relative px-5 py-16 md:px-11 md:py-24 overflow-hidden">
      <div className="cta-section-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative max-w-2xl mx-auto text-center">
        <p className="font-mono text-[10px] uppercase tracking-[.16em] text-accent mb-4">
          Prêt à mesurer ?
        </p>
        <h2 className="font-display text-[28px] md:text-[36px] font-extrabold leading-[1.06] tracking-[-.035em] mb-4">
          Ton indice existe déjà.{" "}
          <span className="text-accent">Autant le connaître.</span>
        </h2>
        <p className="text-muted mb-8 text-[15px]">
          Trois minutes. Un rapport clair, pas une note vague.
        </p>

        <Cta className="cta-shine" label="Lancer mon analyse gratuitement" />

        <ul className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {REASSURANCE.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-dim">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
