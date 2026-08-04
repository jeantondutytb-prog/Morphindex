"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
  /** Désactivé dans le shell /app — le contenu principal gère déjà la transition */
  disabled?: boolean;
};

export function PageTransition({ children, disabled = false }: PageTransitionProps) {
  const pathname = usePathname();
  const visited = useRef(false);

  if (disabled || pathname.startsWith("/app")) {
    return <>{children}</>;
  }

  const animate = visited.current;
  if (!visited.current) visited.current = true;

  return (
    <div key={pathname} className={animate ? "page-transition" : undefined}>
      {children}
    </div>
  );
}

/** Transition du contenu principal (sidebar / nav restent fixes) */
export function AppPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const visited = useRef(false);

  const animate = visited.current;
  if (!visited.current) visited.current = true;

  return (
    <div key={pathname} className={animate ? "page-transition page-transition--app" : undefined}>
      {children}
    </div>
  );
}
