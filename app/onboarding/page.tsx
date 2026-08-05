import { OnboardingSteps } from "@/components/onboarding/steps";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14 border-b border-line/80">
        <Link href="/" className="font-display text-lg font-extrabold">
          Morph<span className="text-accent">Index</span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-wider text-dim">Onboarding</span>
      </header>

      <main className="relative flex-1 px-5 py-10 lg:py-16">
        <div className="auth-panel-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative w-full max-w-lg mx-auto hero-enter">
          <div className="mb-8">
            <h1 className="font-display text-[28px] sm:text-[32px] font-extrabold leading-tight tracking-[-.03em] mb-2">
              Personnalise ton rapport
            </h1>
            <p className="text-sm text-muted">
              2 minutes — tes réponses orientent l&apos;analyse et la routine.
            </p>
          </div>
          <OnboardingSteps />
        </div>
      </main>
    </div>
  );
}
