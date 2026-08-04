import { OnboardingSteps } from "@/components/onboarding/steps";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:w-[38%] relative flex-col justify-center border-r border-line p-10 xl:p-14 overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative space-y-6">
          <Link href="/" className="font-display text-xl font-extrabold inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-accent">Onboarding</p>
          <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-[-.03em] max-w-[18ch]">
            Quelques questions pour personnaliser ton rapport.
          </h2>
          <p className="text-sm text-muted max-w-sm">
            2 minutes. Tes réponses orientent l&apos;analyse et la routine — rien n&apos;est imposé.
          </p>
        </div>
      </aside>

      <main className="flex-1 relative px-5 py-10 lg:py-16">
        <div className="hero-glow pointer-events-none absolute inset-0 lg:opacity-50" aria-hidden />
        <div className="relative w-full max-w-lg mx-auto">
          <Link href="/" className="lg:hidden font-display text-xl font-extrabold mb-8 inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>
          <div className="rounded-2xl border border-line bg-surface/80 backdrop-blur-sm p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,.2)]">
            <OnboardingSteps />
          </div>
        </div>
      </main>
    </div>
  );
}
