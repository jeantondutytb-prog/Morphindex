import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Confidentialité — MorphIndex",
  description: "Politique de confidentialité MorphIndex.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-5 py-4 md:px-11">
        <Link href="/" className="font-display text-lg font-extrabold">
          Morph<span className="text-accent">Index</span>
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10 md:px-11">
        <Link href="/" className="text-sm text-dim hover:text-muted transition mb-6 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="font-display text-3xl font-extrabold mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-dim mb-8">Dernière mise à jour : 4 août 2026</p>

        <section className="space-y-6 text-muted leading-relaxed">
          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">1. Responsable de traitement</h2>
            <p>
              Jean Tondut, éditeur du site MorphIndex<br />
              Contact : <a href="mailto:contact@morphindex.com" className="text-accent underline">contact@morphindex.com</a>
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">2. Données collectées</h2>
            <p>Adresse e-mail, mot de passe (haché), données d&apos;onboarding (objectif, tranche d&apos;âge, phototype Fitzpatrick déclaré, type de cheveux, sensibilité cutanée, routine actuelle), et photo de visage soumise à l&apos;analyse.</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">3. Cycle de vie de la photo</h2>
            <p>Ta photo transite par nos serveurs uniquement le temps de l&apos;analyse. Elle est transmise à notre sous-traitant d&apos;analyse (Anthropic) sous contrat de rétention zéro : aucune conservation côté sous-traitant.</p>
            <p>La photo source est supprimée immédiatement à la fin de la requête d&apos;analyse, que celle-ci réussisse ou échoue. Seule une version floutée est conservée temporairement pour l&apos;écran de prévisualisation avant paiement.</p>
            <p>Seuls les résultats de l&apos;analyse (scores, indices, points d&apos;amélioration, routine) sont conservés en base de données.</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">4. Données biométriques</h2>
            <p>Les photos de visage constituent des données biométriques au sens de l&apos;article 9 du RGPD. En uploadant une photo et en lançant une analyse, tu donnes ton consentement explicite au traitement de ces données aux seules fins de génération de ton rapport.</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">5. Utilisation des données</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authentifier ton compte</li>
              <li>Calculer et afficher ton indice et ton plan personnalisé</li>
              <li>Gérer ton abonnement et tes quotas d&apos;analyse</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">6. Partage des données</h2>
            <p>Nous ne vendons ni ne louons tes données personnelles. Les sous-traitants (hébergement Supabase, analyse Anthropic, paiement Stripe) traitent les données uniquement pour fournir le service.</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">7. Tes droits</h2>
            <p>Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et de portabilité. Contact : <a href="mailto:contact@morphindex.com" className="text-accent underline">contact@morphindex.com</a></p>
            <p>Réclamation possible auprès de la <a href="https://www.cnil.fr/" rel="noopener noreferrer" className="text-accent underline">CNIL</a>.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
