import { Cta } from "@/components/ui/cta";

export function FinalCta() {
  return (
    <section className="px-5 py-14 md:px-11 md:py-20 text-center">
      <h2 className="font-display text-[27px] font-extrabold leading-[1.08] tracking-[-.035em] mb-3">
        Ton indice existe déjà. Autant le connaître.
      </h2>
      <p className="text-muted mb-6">Trois minutes. 18 ans et plus.</p>
      <Cta />
    </section>
  );
}
