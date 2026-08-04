import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Retour",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-dim hover:text-muted transition mb-4"
        >
          ← {backLabel}
        </Link>
      )}
      <h1 className="font-display text-2xl font-extrabold">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
    </header>
  );
}
