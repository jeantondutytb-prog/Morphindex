"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#lectures", label: "Analyse" },
  { href: "#methode", label: "Méthode" },
  { href: "#apercu", label: "Aperçu" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/80 bg-bg/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,.35)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-11 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-base font-extrabold shrink-0">
          Morph<span className="text-accent">Index</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[13px] text-muted hover:text-text transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden min-[480px]:inline text-[13px] text-muted hover:text-text transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-[12.5px] font-bold text-accent-ink hover:brightness-110 transition"
          >
            Commencer
          </Link>
        </div>
      </div>
    </header>
  );
}
