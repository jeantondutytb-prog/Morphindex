export const APP_NAV = [
  { href: "/app", label: "Dashboard", icon: "grid", match: (p: string) => p === "/app" },
  { href: "/app/routine", label: "Routine", icon: "list", match: (p: string) => p.startsWith("/app/routine") },
  { href: "/app/photo", label: "Analyser", icon: "scan", match: (p: string) => p.startsWith("/app/photo") || p.startsWith("/app/analyse") },
] as const;

export const APP_NAV_SECONDARY = [
  { href: "/app/compte", label: "Mon compte", icon: "user", match: (p: string) => p.startsWith("/app/compte") },
] as const;

export function rapportMatch(pathname: string) {
  return pathname.startsWith("/app/rapport");
}
