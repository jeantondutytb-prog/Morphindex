import { Section } from "@/components/ui/section";

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
    a: "La première analyse est incluse à l'inscription. Ensuite, ton abonnement inclut 2 analyses par mois — suffisant pour suivre une routine sur plusieurs semaines.",
  },
  {
    q: "Puis-je me rétracter après paiement ?",
    a: "Le rapport est un contenu numérique livré immédiatement. Lors du paiement, tu es invité à renoncer expressément à ton droit de rétractation de 14 jours conformément à l'article L221-28 du code de la consommation, afin d'accéder au rapport sans délai.",
  },
];

export function Faq() {
  return (
    <Section id="faq" kicker="05 · FAQ" title="Questions fréquentes">
      <div className="space-y-2">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group rounded-lg border border-line bg-surface">
            <summary className="cursor-pointer px-5 py-4 font-medium text-text list-none flex items-center justify-between">
              {q}
              <span className="text-dim group-open:rotate-45 transition-transform text-lg">+</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
