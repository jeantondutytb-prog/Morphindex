import Link from "next/link";

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
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 border-b border-line/80">
        <Link href="/" className="font-display text-lg font-extrabold">
          Morph<span className="text-accent">Index</span>
        </Link>
        <Link href="/" className="text-sm text-dim hover:text-muted transition">
          ← Retour
        </Link>
      </header>

      <main className="relative flex-1 flex flex-col justify-center px-6 py-12 sm:px-10">
        <div className="auth-panel-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative w-full max-w-[380px] mx-auto hero-enter">
          <div className="mb-8">
            <h1 className="font-display text-[30px] sm:text-[34px] font-extrabold leading-[1.05] tracking-[-.03em] mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted leading-relaxed">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
