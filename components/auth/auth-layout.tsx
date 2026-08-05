import Link from "next/link";

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
    <div className="min-h-screen flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14 border-b border-line/80">
        <Link href="/" className="font-display text-lg font-extrabold">
          Morph<span className="text-accent">Index</span>
        </Link>
        <Link href="/" className="text-sm text-dim hover:text-muted transition">
          ← Retour au site
        </Link>
      </header>

      <div className="relative flex flex-1">
        <div className="auth-panel-glow pointer-events-none absolute inset-0" aria-hidden />

        <main className="relative flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0 hero-enter">
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
        </main>

        <aside className="relative hidden xl:flex w-[320px] shrink-0 border-l border-line/80 items-center justify-center p-10 bg-surface/20">
          <AuthPreviewMini />
        </aside>
      </div>
    </div>
  );
}
