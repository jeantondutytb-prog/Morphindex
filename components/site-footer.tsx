import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 py-10 md:px-11">
      <p className="text-sm text-dim mb-4">
        MorphIndex n&apos;est pas un dispositif médical, ne fournit pas de diagnostic et ne garantit aucun résultat physique.
      </p>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted mb-6">
        <Link href="/conditions" className="hover:text-text transition">CGU</Link>
        <Link href="/confidentialite" className="hover:text-text transition">Confidentialité</Link>
        <Link href="/mentions-legales" className="hover:text-text transition">Mentions légales</Link>
        <a href="mailto:contact@morphindex.com" className="hover:text-text transition">Contact</a>
      </nav>
      <p className="text-xs text-dim">© {new Date().getFullYear()} MorphIndex</p>
    </footer>
  );
}
