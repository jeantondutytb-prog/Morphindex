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

const SHELL_INNER = "max-w-6xl mx-auto w-full px-5 lg:px-8";

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
        <div className={`${SHELL_INNER} h-14 lg:h-16 flex items-center justify-between gap-6`}>
          <Link href="/app" className="font-display text-lg lg:text-xl font-extrabold shrink-0">
            Morph<span className="text-accent">Index</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm lg:text-[15px] flex-1 justify-center">
            {NAV.map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 lg:px-4 py-2 rounded-lg transition ${
                  isActive(match) ? "text-text bg-line/60" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/app/admin"
                className={`px-3 lg:px-4 py-2 rounded-lg transition ${
                  pathname.startsWith("/app/admin") ? "text-accent bg-accent/10" : "text-muted hover:text-accent"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-xs text-dim max-w-[180px] truncate hidden lg:block">{email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-muted hover:text-text transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full">{children}</div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface/95 backdrop-blur-sm">
        <div className={`${SHELL_INNER} grid grid-cols-4 h-16`}>
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

      <footer className="hidden md:block border-t border-line">
        <div className={`${SHELL_INNER} py-4 flex items-center justify-between gap-2 text-xs text-dim`}>
          <span className="truncate">{email}</span>
          <p>MorphIndex · Analyse faciale</p>
        </div>
      </footer>
    </div>
  );
}
