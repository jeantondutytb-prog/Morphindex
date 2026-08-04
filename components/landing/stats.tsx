import { ScrollReveal } from "./scroll-reveal";

const STATS = [
  { value: "12", suffix: " mois", label: "Horizon d'indice atteignable" },
  { value: "7", suffix: "", label: "Dimensions softmaxing mesurées" },
  { value: "3", suffix: " min", label: "Pour obtenir ton rapport" },
  { value: "0", suffix: "", label: "Photo conservée après analyse" },
];

export function Stats() {
  return (
    <section className="border-b border-line px-5 py-10 md:px-11 md:py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {STATS.map(({ value, suffix, label }, i) => (
          <ScrollReveal key={label} delay={i * 80}>
            <div className="text-center md:text-left">
              <p className="font-display text-[36px] md:text-[42px] font-extrabold leading-none tracking-[-.04em] tnum">
                {value}
                <span className="text-accent text-[22px] md:text-[26px]">{suffix}</span>
              </p>
              <p className="mt-2 text-sm text-muted leading-snug">{label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
