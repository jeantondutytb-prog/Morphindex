import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — MorphIndex",
  description: "Conditions d'utilisation MorphIndex.",
};

function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-5 py-4 md:px-11">
        <Link href="/" className="font-display text-lg font-extrabold">
          Morph<span className="text-accent">Index</span>
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-10 md:px-11 prose-legal">
        <Link href="/" className="text-sm text-dim hover:text-muted transition mb-6 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export default function ConditionsPage() {
  return (
    <LegalLayout>
      <h1 className="font-display text-3xl font-extrabold mb-2">Conditions d&apos;utilisation</h1>
      <p className="text-sm text-dim mb-8">Dernière mise à jour : 4 août 2026</p>

      <section className="space-y-6 text-muted leading-relaxed">
        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">1. Objet</h2>
          <p>MorphIndex est un service d&apos;analyse faciale en ligne qui mesure ce qu&apos;une personne peut faire évoluer dans son apparence et lui rend un plan d&apos;action personnalisé.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">2. Accès au service — 18 ans et plus</h2>
          <p>Le service est réservé aux personnes âgées de 18 ans ou plus. En créant un compte, tu déclares avoir au moins 18 ans et être la personne figurant sur les photos que tu soumets à l&apos;analyse.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">3. Compte utilisateur</h2>
          <p>Tu es responsable de la confidentialité de tes identifiants. Tu t&apos;engages à fournir des informations exactes lors de l&apos;inscription.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">4. Nature des résultats — non médical</h2>
          <p>MorphIndex n&apos;est pas un dispositif médical, ne fournit pas de diagnostic et ne garantit aucun résultat physique. Les scores et recommandations sont indicatifs. Tu utilises le service sous ta seule responsabilité.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">5. Contenu numérique et droit de rétractation</h2>
          <p>Conformément aux articles L221-18 et suivants du code de la consommation, tu disposes d&apos;un délai de 14 jours pour exercer ton droit de rétractation.</p>
          <p>Le contenu numérique (rapport d&apos;analyse) est livré immédiatement après paiement. En acceptant la livraison immédiate lors du checkout, tu renonces expressément à ton droit de rétractation de 14 jours, conformément à l&apos;article L221-28 du code de la consommation.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">6. Contenu uploadé</h2>
          <p>En uploadant une photo, tu confirmes en détenir les droits et qu&apos;elle te représente. Tu t&apos;interdis d&apos;uploader du contenu illicite ou de tiers sans autorisation.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">7. Résiliation</h2>
          <p>Tu peux supprimer ton compte à tout moment. Nous pouvons suspendre un compte en cas de violation de ces conditions.</p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-text mb-2">8. Droit applicable</h2>
          <p>Ces conditions sont régies par le droit français. Voir aussi notre <Link href="/confidentialite" className="text-accent underline">politique de confidentialité</Link> et nos <Link href="/mentions-legales" className="text-accent underline">mentions légales</Link>.</p>
        </div>
      </section>
    </LegalLayout>
  );
}
