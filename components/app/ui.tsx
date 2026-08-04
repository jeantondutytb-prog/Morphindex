import Link from "next/link";

export function AppCard({
  children,
  className = "",
  accent = false,
  padding = "default",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  padding?: "default" | "none";
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        padding === "default" ? "p-5 lg:p-6" : ""
      } ${
        accent
          ? "border-accent/20 bg-gradient-to-br from-surface via-surface to-accent/5 shadow-[0_8px_32px_rgba(0,229,160,.06)]"
          : "border-line bg-surface/80 backdrop-blur-sm hover:border-line-strong"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AppButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:brightness-110 cta-shine overflow-hidden relative"
      : "border border-line text-muted hover:border-accent/30 hover:text-text";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function AppEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <AppCard className="p-8 lg:p-12 text-center relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative">
        <p className="font-display text-xl lg:text-2xl font-extrabold mb-2">{title}</p>
        <p className="text-muted mb-6 max-w-md mx-auto">{description}</p>
        <AppButton href={actionHref}>{actionLabel} →</AppButton>
      </div>
    </AppCard>
  );
}

export function AppSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[.14em] text-dim mb-3">{children}</p>
  );
}

export function AppNavPill({
  href,
  children,
  accent = false,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const className = `inline-flex text-xs font-medium rounded-full px-3.5 py-1.5 transition ${
    accent
      ? "text-accent border border-accent/30 bg-accent/8 hover:bg-accent/12"
      : "text-dim border border-line hover:text-muted hover:border-line-strong"
  }`;

  if (href.startsWith("#")) {
    return <a href={href} className={className}>{children}</a>;
  }

  return <Link href={href} className={className}>{children}</Link>;
}
