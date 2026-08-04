"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAV, APP_NAV_SECONDARY, rapportMatch } from "@/components/app/nav-items";
import { NavIcon } from "@/components/app/icons";

const MOBILE_NAV = [
  { href: "/app", label: "Accueil", short: "Accueil", match: (p: string) => p === "/app" || rapportMatch(p) },
  { href: "/app/routine", label: "Routine", short: "Routine", match: (p: string) => p.startsWith("/app/routine") },
  { href: "/onboarding/photo", label: "Analyser", short: "+", match: (p: string) => p.startsWith("/onboarding/photo") || p.startsWith("/app/analyse") },
  { href: "/app/compte", label: "Compte", short: "Compte", match: (p: string) => p.startsWith("/app/compte") },
] as const;

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-muted hover:text-text hover:bg-line/40"
      }`}
    >
      <NavIcon name={icon} className="w-[18px] h-[18px] shrink-0" />
      {label}
    </Link>
  );
}

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
  const initial = (email[0] ?? "?").toUpperCase();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(match: (p: string) => boolean, href: string) {
    return match(pathname) || (href === "/app" && rapportMatch(pathname));
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop — style Donezo / NL Corp */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 fixed inset-y-0 left-0 border-r border-line bg-surface z-30">
        <div className="p-6 pb-4">
          <Link href="/app" className="font-display text-xl font-extrabold">
            Morph<span className="text-accent">Index</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim px-3 mb-2">Menu</p>
            <div className="space-y-1">
              {APP_NAV.map(({ href, label, icon, match }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={isActive(match, href)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim px-3 mb-2">Compte</p>
            <div className="space-y-1">
              {APP_NAV_SECONDARY.map(({ href, label, icon, match }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={isActive(match, href)}
                />
              ))}
              {isAdmin && (
                <NavLink
                  href="/app/admin"
                  label="Admin"
                  icon="shield"
                  active={pathname.startsWith("/app/admin")}
                />
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 space-y-4">
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-4">
            <p className="font-display text-sm font-bold mb-1">Nouvelle analyse</p>
            <p className="text-xs text-dim mb-3">7 axes · indice · routine</p>
            <Link
              href="/onboarding/photo"
              className="block text-center rounded-lg bg-accent py-2 text-xs font-bold text-accent-ink hover:brightness-110 transition"
            >
              Lancer →
            </Link>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center font-mono text-sm text-accent shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted truncate">{email}</p>
              <button
                type="button"
                onClick={signOut}
                className="text-[11px] text-dim hover:text-muted transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] pb-20 lg:pb-0">
        <header className="lg:hidden sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm px-5 h-14 flex items-center justify-between">
          <Link href="/app" className="font-display text-lg font-extrabold">
            Morph<span className="text-accent">Index</span>
          </Link>
          <Link href="/onboarding/photo" className="text-sm font-bold text-accent">
            + Analyser
          </Link>
        </header>

        <main className="flex-1 w-full bg-bg">{children}</main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface/95 backdrop-blur-sm">
          <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
            {MOBILE_NAV.map(({ href, short, match }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                  isActive(match, href) ? "text-accent" : "text-dim"
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
      </div>
    </div>
  );
}
