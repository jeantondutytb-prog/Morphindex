"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "./scroll-reveal";

const FAQ = [
  {
    q: "C'est quoi un indice MorphIndex ?",
    a: "Un score de 0 à 10 qui synthétise ce que tu peux faire évoluer dans ton apparence — peau, cernes, pilosité, coupe, posture, composition, dents. Ce n'est pas une note de beauté : c'est un point de départ mesurable.",
  },
  {
    q: "Ma photo est-elle conservée ?",
    a: "Non. Ta photo est analysée puis supprimée immédiatement, que l'analyse réussisse ou échoue. Seuls les résultats (scores, routine) sont conservés.",
  },
  {
    q: "Quelle différence entre softmaxing et hardmaxing ?",
    a: "Le softmaxing mesure ce que tu peux changer avec une routine — peau, barbe, coupe, posture. Le hardmaxing (bientôt) porterait sur la structure osseuse et les proportions, éléments non modifiables sans intervention chirurgicale.",
  },
  {
    q: "MorphIndex remplace un dermatologue ?",
    a: "Non. MorphIndex n'est pas un dispositif médical et ne fournit pas de diagnostic. Si un signe te préoccupe, consulte un professionnel de santé.",
  },
  {
    q: "Combien d'analyses puis-je faire ?",
    a: "La première analyse est gratuite (aperçu flouté). Un abonnement débloque ton rapport et te donne accès au produit. Pour mesurer ta progression quelques semaines plus tard, une analyse de suivi est disponible à 7,90 € — elle complète et compare avec ta première analyse.",
  },
  {
    q: "Puis-je me rétracter après paiement ?",
    a: "Le rapport est un contenu numérique livré immédiatement. Lors du paiement, tu es invité à renoncer expressément à ton droit de rétractation de 14 jours conformément à l'article L221-28 du code de la consommation, afin d'accéder au rapport sans délai.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" kicker="FAQ" title="Questions fréquentes">
      <p className="text-muted text-sm md:text-[15px] max-w-xl mb-8 -mt-1">
        Une dernière question avant de commencer ? Trouve ta réponse ici.
      </p>

      <div className="space-y-2 max-w-3xl">
        {FAQ.map(({ q, a }, i) => {
          const isOpen = open === i;
          return (
            <ScrollReveal key={q} delay={i * 50}>
              <div
                className={`rounded-xl border transition-colors duration-300 ${
                  isOpen ? "border-accent/25 bg-accent/[0.03]" : "border-line bg-surface"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full cursor-pointer px-5 py-4 font-medium text-text text-left flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px]">{q}</span>
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen ? "border-accent/40 bg-accent/10 rotate-45 text-accent" : "border-line text-dim"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </Section>
  );
}
