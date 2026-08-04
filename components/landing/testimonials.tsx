import { Section } from "@/components/ui/section";

const TESTIMONIALS = [
  {
    quote: "Enfin un outil qui me dit quoi faire concrètement — pas juste une note vague. La routine semaine 1 est claire.",
    name: "Lucas M.",
    role: "26 ans · Paris",
    date: "12/01/2026",
  },
  {
    quote: "J'ai compris pourquoi ma barbe et ma coupe plafonnaient mon indice. Deux changements, résultat visible en 6 semaines.",
    name: "Sarah K.",
    role: "23 ans · Lyon",
    date: "28/01/2026",
  },
  {
    quote: "Le rapport est direct, sans langue de bois. Ça m'a évité d'acheter dix produits inutiles.",
    name: "Antoine D.",
    role: "29 ans · Bordeaux",
    date: "03/02/2026",
  },
  {
    quote: "Sceptique au début — la photo supprimée et le ton mesuré m'ont rassuré. L'indice atteignable est motivant.",
    name: "Mehdi B.",
    role: "31 ans · Lille",
    date: "22/01/2026",
  },
  {
    quote: "Interface sobre, rapide. J'ai eu mon indice actuel et ma routine le soir même.",
    name: "Chloé R.",
    role: "24 ans · Nantes",
    date: "01/02/2026",
  },
  {
    quote: "Les scores par dimension m'ont montré où concentrer mes efforts. Beaucoup plus utile qu'un miroir.",
    name: "Thomas G.",
    role: "27 ans · Toulouse",
    date: "05/02/2026",
  },
];

export function Testimonials() {
  const track = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <Section kicker="Témoignages" title="Ils ont mesuré, puis agi">
      <div className="relative -mx-5 md:-mx-11 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-bg to-transparent z-10" />

        <div className="testimonial-track flex w-max gap-4 px-5 md:px-11 py-1">
          {track.map((t, i) => (
            <article
              key={`${t.name}-${i}`}
              className="w-[min(320px,78vw)] shrink-0 rounded-xl border border-line bg-surface p-5 flex flex-col"
            >
              <p className="text-sm text-muted leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 pt-4 border-t border-line flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">{t.name}</p>
                  <p className="text-xs text-dim">{t.role}</p>
                </div>
                <time className="font-mono text-[10px] text-dim">{t.date}</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
