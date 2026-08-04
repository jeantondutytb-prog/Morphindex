"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/app", label: "Accueil", short: "Accueil", match: (p: string) => p === "/app" || p.startsWith("/app/rapport") },
  { href: "/app/routine", label: "Routine", short: "Routine", match: (p: string) => p.startsWith("/app/routine") },
  { href: "/onboarding/photo", label: "Analyser", short: "+", match: (p: string) => p.startsWith("/onboarding/photo") || p.startsWith("/app/analyse") },
  { href: "/app/compte", label: "Compte", short: "Compte", match: (p: string) => p.startsWith("/app/compte") },
] as const;

export function AppShell({
  children,
  email,
  isAdmin,
}: {
  children: React.ReactNode;
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(match: (p: string) => boolean) {
    return match(pathname);
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <header className="border-b border-line bg-surface sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <Link href="/app" className="font-display text-lg font-extrabold shrink-0">
            Morph<span className="text-accent">Index</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV.slice(0, 3).map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive(match) ? "text-text bg-line/60" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/app/compte"
              className={`px-3 py-1.5 rounded-lg transition ${
                pathname.startsWith("/app/compte") ? "text-text bg-line/60" : "text-muted hover:text-text"
              }`}
            >
              Compte
            </Link>
            {isAdmin && (
              <Link
                href="/app/admin"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith("/app/admin") ? "text-accent bg-accent/10" : "text-muted hover:text-accent"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="hidden md:block text-xs text-dim hover:text-muted transition shrink-0"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      {/* Barre fixe mobile — toujours visible */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto grid grid-cols-4 h-16">
          {NAV.map(({ href, short, match }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                isActive(match) ? "text-accent" : "text-dim"
              }`}
            >
              <span className={`text-base leading-none ${href.includes("photo") ? "font-bold" : ""}`}>
                {short}
              </span>
              <span>{short === "+" ? "Analyser" : short}</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="hidden md:block border-t border-line px-5 py-4">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-dim">
          <span className="truncate max-w-[200px]">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="text-muted hover:text-text transition"
          >
            Déconnexion
          </button>
        </div>
      </footer>
    </div>
  );
}
