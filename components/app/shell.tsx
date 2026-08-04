"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/app", label: "Accueil", match: (p: string) => p === "/app" },
  { href: "/app/routine", label: "Routine", match: (p: string) => p.startsWith("/app/routine") },
  { href: "/app/compte", label: "Compte", match: (p: string) => p.startsWith("/app/compte") },
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/app" className="font-display text-lg font-extrabold shrink-0">
            Morph<span className="text-accent">Index</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg transition ${
                  match(pathname) || (href === "/app" && pathname.startsWith("/app/rapport"))
                    ? "text-text bg-line/60"
                    : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/app/admin"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname.startsWith("/app/admin")
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-accent"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-line px-5 py-4">
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
