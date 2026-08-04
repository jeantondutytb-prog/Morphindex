"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAV, APP_NAV_SECONDARY, rapportMatch } from "@/components/app/nav-items";
import { NavIcon } from "@/components/app/icons";
import { AppPageTransition } from "@/components/ui/page-transition";

const MOBILE_NAV = [
  { href: "/app", label: "Accueil", icon: "grid", match: (p: string) => p === "/app" || rapportMatch(p) },
  { href: "/app/routine", label: "Routine", icon: "list", match: (p: string) => p.startsWith("/app/routine") },
  { href: "/app/photo", label: "Analyser", icon: "scan", match: (p: string) => p.startsWith("/app/photo") || p.startsWith("/app/analyse") },
  { href: "/app/compte", label: "Compte", icon: "user", match: (p: string) => p.startsWith("/app/compte") },
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
        active
          ? "bg-accent/10 text-accent font-medium shadow-[inset_0_0_0_1px_rgba(0,229,160,.15)]"
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
    <div className="min-h-screen flex bg-bg">
      <aside
        className="hidden lg:flex flex-col w-[260px] shrink-0 fixed inset-y-0 left-0 border-r border-line bg-surface/95 backdrop-blur-xl z-30 app-shell-sidebar"
        style={{ viewTransitionName: "app-sidebar" }}
      >
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
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 size-20 rounded-full bg-accent/10 blur-2xl" aria-hidden />
            <p className="font-display text-sm font-bold mb-1 relative">Nouvelle analyse</p>
            <p className="text-xs text-dim mb-3 relative">7 axes · indice · routine</p>
            <Link
              href="/app/photo"
              className="relative block text-center rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-ink hover:brightness-110 transition cta-shine overflow-hidden"
            >
              Lancer →
            </Link>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-line flex items-center justify-center font-mono text-sm text-accent shrink-0 border border-accent/20">
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

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] pb-[72px] lg:pb-0">
        <header
          className="lg:hidden sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl px-5 h-14 flex items-center justify-between app-shell-header"
          style={{ viewTransitionName: "app-header" }}
        >
          <Link href="/app" className="font-display text-lg font-extrabold">
            Morph<span className="text-accent">Index</span>
          </Link>
          <Link
            href="/app/photo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-ink"
          >
            <NavIcon name="scan" className="w-4 h-4" />
            Analyser
          </Link>
        </header>

        <main className="flex-1 w-full relative">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <AppPageTransition>{children}</AppPageTransition>
        </main>

        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface/95 backdrop-blur-xl app-shell-tabbar safe-area-pb"
          style={{ viewTransitionName: "app-tabbar" }}
        >
          <div className="grid grid-cols-4 h-[68px] max-w-lg mx-auto px-2">
            {MOBILE_NAV.map(({ href, label, icon, match }) => {
              const active = isActive(match, href);
              const primary = href === "/app/photo";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-200 ${
                    active ? "text-accent" : "text-dim"
                  }`}
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-xl transition-all ${
                      primary
                        ? active
                          ? "bg-accent text-accent-ink shadow-[0_4px_16px_rgba(0,229,160,.3)]"
                          : "bg-accent/15 text-accent"
                        : active
                          ? "bg-accent/10"
                          : ""
                    }`}
                  >
                    <NavIcon name={icon} className="w-[18px] h-[18px]" />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
