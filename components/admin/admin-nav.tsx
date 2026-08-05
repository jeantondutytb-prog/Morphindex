"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/app/admin", label: "Vue d'ensemble" },
  { href: "/app/admin/tiktok", label: "TikTok" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 mb-6">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-line text-muted hover:border-accent/30 hover:text-text"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
