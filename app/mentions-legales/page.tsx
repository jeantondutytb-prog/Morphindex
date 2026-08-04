import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Mentions légales — MorphIndex",
  description: "Mentions légales MorphIndex.",
};

export default function MentionsLegalesPage() {
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
        <h1 className="font-display text-3xl font-extrabold mb-2">Mentions légales</h1>
        <p className="text-sm text-dim mb-8">Dernière mise à jour : 4 août 2026</p>

        <section className="space-y-6 text-muted leading-relaxed">
          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">1. Éditeur du site</h2>
            <p>
              Jean Tondut<br />
              Entreprise individuelle en cours d&apos;immatriculation<br />
              E-mail : <a href="mailto:contact@morphindex.com" className="text-accent underline">contact@morphindex.com</a>
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">2. Directeur de la publication</h2>
            <p>Jean Tondut</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">3. Hébergeur</h2>
            <p>
              Vercel Inc.<br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723<br />
              États-Unis d&apos;Amérique
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-text mb-2">4. Contact</h2>
            <p><a href="mailto:contact@morphindex.com" className="text-accent underline">contact@morphindex.com</a></p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
