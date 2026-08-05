"use client";

import { Cta } from "@/components/ui/cta";

const TRUST_PILLS = [
  "Photo supprimée",
  "3 minutes",
  "Sans carte bancaire",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20 px-5 md:px-11 border-b border-line">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative max-w-6xl mx-auto flex flex-col gap-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-16">
        <div className="flex-1 hero-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1.5 mb-6">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[.12em] text-accent">
              Analyse faciale · en français
            </span>
          </div>

          <h1 className="font-display text-[34px] min-[780px]:text-[52px] font-extrabold leading-[.98] tracking-[-.04em] max-w-[14ch] mb-6">
            Mesure d&apos;abord.{" "}
            <em className="font-serif italic font-normal text-accent not-italic-fix">Décide ensuite.</em>
          </h1>

          <p className="text-muted text-[15px] md:text-base leading-relaxed max-w-md mb-8">
            Indice actuel, indice atteignable en 12 mois, et la routine pour y aller — peau, cernes, pilosité, coupe, posture, dents.
          </p>

          <div className="inline-flex items-baseline gap-3 tnum mb-2 rounded-2xl border border-line bg-surface/80 px-5 py-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.14em] text-dim mb-1">Actuel</p>
              <span className="font-display text-[44px] min-[780px]:text-[56px] font-extrabold leading-none tracking-[-.055em] text-num-idle">
                6,4
              </span>
            </div>
            <span className="text-xl text-dim pb-1">→</span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.14em] text-accent/80 mb-1">Atteignable</p>
              <span className="font-display text-[44px] min-[780px]:text-[56px] font-extrabold leading-none tracking-[-.055em] text-accent score-glow">
                7,8
              </span>
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[.15em] text-dim mb-8">
            Exemple · horizon 12 mois
          </p>

          <Cta className="cta-shine" />
          <div className="mt-5 flex flex-wrap gap-2">
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 font-mono text-[10px] text-dim"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
                </svg>
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center min-[900px]:justify-end hero-enter hero-enter-delay">
          <div className="relative w-full max-w-[340px]">
            <div className="absolute -inset-4 rounded-[28px] bg-accent/5 blur-2xl" aria-hidden />
            <div className="relative rounded-[24px] border border-line-strong bg-surface overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.45)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-bg/50">
                <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Aperçu analyse</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-accent">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  Live
                </span>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden">
                <div
                  className="absolute inset-0 grayscale-[.68] contrast-[1.08] brightness-[.88]"
                  style={{
                    background: "linear-gradient(160deg, #1a1d24 0%, #0c0e12 45%, #1e2430 100%)",
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,229,160,.12),transparent_55%)]" />

                <Annotation label="cernes −0,4" className="top-[16%] left-[6%] delay-1" />
                <Annotation label="peau 5,8" className="top-[40%] right-[6%] delay-2" />
                <Annotation label="mâchoire nette" className="bottom-[20%] left-[10%] delay-3" />

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-bg via-bg/90 to-transparent">
                  <div className="rounded-xl border border-line bg-surface/95 backdrop-blur-sm p-3 space-y-2">
                    {[
                      { label: "peau", w: "58%" },
                      { label: "cernes", w: "44%" },
                      { label: "pilosité", w: "79%" },
                    ].map(({ label, w }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="font-mono text-[8px] text-dim w-12 uppercase">{label}</span>
                        <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full bar-fill" style={{ width: w }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <FloatingBadge className="-left-3 top-8 hidden sm:flex" value="+1,2" label="potentiel 12 mois" />
            <FloatingBadge className="-right-2 bottom-16 hidden sm:flex" value="7 pts" label="actionnables" accent />
          </div>
        </div>
      </div>
    </section>
  );
}

function Annotation({ label, className, delay }: { label: string; className: string; delay?: string }) {
  return (
    <span
      className={`absolute font-mono text-[10px] px-2.5 py-1 rounded-md annotation-pop ${className} ${delay ? `annotation-delay-${delay}` : ""}`}
      style={{ background: "rgba(8,9,11,.88)", border: "1px solid rgba(0,229,160,.32)", boxShadow: "0 4px 20px rgba(0,0,0,.35)" }}
    >
      {label}
    </span>
  );
}

function FloatingBadge({
  value,
  label,
  className,
  accent,
}: {
  value: string;
  label: string;
  className: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`absolute items-center gap-2 rounded-xl border border-line bg-surface/95 backdrop-blur-md px-3 py-2 shadow-lg float-badge ${className}`}
    >
      <span className={`font-display text-lg font-extrabold tnum ${accent ? "text-accent" : "text-text"}`}>{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-dim max-w-[72px] leading-tight">{label}</span>
    </div>
  );
}
