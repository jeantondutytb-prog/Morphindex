import Link from "next/link";

const TRUST_ITEMS = [
  "Photo supprimée après analyse",
  "Rapport en 3 minutes",
  "100 % en français",
];

function AuthPreviewMini() {
  const scores = [
    { label: "peau", w: "58%" },
    { label: "cernes", w: "44%" },
    { label: "pilosité", w: "79%" },
  ];

  return (
    <div className="w-full max-w-[240px]">
      <p className="font-mono text-[9px] uppercase tracking-wider text-dim mb-4">Aperçu rapport</p>
      <div className="rounded-2xl border border-line bg-surface/60 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,.35)]">
        <div className="px-3 py-2 border-b border-line flex items-center justify-between">
          <span className="font-mono text-[8px] text-dim uppercase">Live</span>
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-baseline gap-2 tnum">
            <span className="font-display text-2xl font-extrabold text-num-idle">6,4</span>
            <span className="text-dim text-sm">→</span>
            <span className="font-display text-2xl font-extrabold text-accent score-glow">7,8</span>
          </div>
          <div className="space-y-2">
            {scores.map(({ label, w }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-mono text-[8px] text-dim w-10 uppercase">{label}</span>
                <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: w }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-dim leading-relaxed">
        Indice, scores et routine — livrés en quelques minutes.
      </p>
    </div>
  );
}

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
      <aside className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative flex-col justify-between border-r border-line p-10 xl:p-14 overflow-hidden">
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

        <Link href="/" className="relative text-sm text-dim hover:text-muted transition">
          ← Retour au site
        </Link>
      </aside>

      <main className="flex-1 relative flex min-h-screen">
        <div className="auth-panel-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-16">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0 lg:max-w-[420px] hero-enter">
            <Link href="/" className="lg:hidden font-display text-xl font-extrabold mb-10 inline-block">
              Morph<span className="text-accent">Index</span>
            </Link>

            <div className="mb-8">
              <h1 className="font-display text-[32px] sm:text-[36px] font-extrabold leading-[1.05] tracking-[-.03em] mb-3">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[15px] text-muted leading-relaxed max-w-sm">{subtitle}</p>
              )}
            </div>

            {children}
          </div>
        </div>

        <div className="relative hidden xl:flex w-[300px] shrink-0 border-l border-line/80 items-center justify-center p-10 bg-surface/20">
          <AuthPreviewMini />
        </div>
      </main>
    </div>
  );
}
