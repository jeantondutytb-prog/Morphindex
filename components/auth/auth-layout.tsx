import Link from "next/link";

const TRUST_ITEMS = [
  "Photo supprimée après analyse",
  "Rapport en 3 minutes",
  "100 % en français",
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative flex-col justify-between border-r border-line p-10 xl:p-14 overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative">
          <Link href="/" className="font-display text-xl font-extrabold inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-accent mb-4">
              Analyse faciale
            </p>
            <h2 className="font-display text-[32px] xl:text-[38px] font-extrabold leading-[1.02] tracking-[-.04em] max-w-[14ch]">
              Mesure d&apos;abord.{" "}
              <em className="font-serif italic font-normal text-accent not-italic-fix">Décide ensuite.</em>
            </h2>
          </div>

          <div className="inline-flex items-baseline gap-3 tnum rounded-2xl border border-line bg-surface/60 px-5 py-4">
            <span className="font-display text-4xl font-extrabold text-num-idle">6,4</span>
            <span className="text-dim">→</span>
            <span className="font-display text-4xl font-extrabold text-accent score-glow">7,8</span>
          </div>

          <ul className="space-y-3">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[10px] text-dim">18 ans et plus</p>
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center px-5 py-12 lg:py-16">
        <div className="hero-glow pointer-events-none absolute inset-0 lg:opacity-60" aria-hidden />

        <div className="relative w-full max-w-md">
          <Link href="/" className="lg:hidden font-display text-xl font-extrabold mb-8 inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>

          <div className="rounded-2xl border border-line bg-surface/80 backdrop-blur-sm p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,.25)] hero-enter">
            <h1 className="font-display text-2xl font-extrabold mb-2">{title}</h1>
            {subtitle && <p className="text-sm text-muted mb-6 leading-relaxed">{subtitle}</p>}
            {!subtitle && <div className="mb-6" />}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
