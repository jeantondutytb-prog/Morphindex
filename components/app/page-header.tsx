import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  kicker,
  backHref,
  backLabel = "Retour",
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-8 lg:mb-10">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-muted transition mb-4 group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          {backLabel}
        </Link>
      )}
      {kicker && (
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-dim mb-2">{kicker}</p>
      )}
      <h1 className="font-display text-2xl lg:text-3xl font-extrabold tracking-[-.02em]">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-2 max-w-xl">{subtitle}</p>}
    </header>
  );
}
