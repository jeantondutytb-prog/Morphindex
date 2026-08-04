import Link from "next/link";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "./scroll-reveal";

const SCORES = [
  { label: "peau", value: 5.8 },
  { label: "cernes", value: 4.4 },
  { label: "pilosité", value: 7.9 },
  { label: "coupe", value: 6.2 },
  { label: "posture", value: 5.1 },
];

const ROUTINE_LINES = [
  "Nettoyant doux pH 5,5 — matin",
  "Crème solaire SPF 50 — matin",
  "Sérum vitamine C — matin",
  "Rétinaldéhyde 0,05 % — soir",
  "Crème hydratante légère — soir",
];

export function ReportPreview() {
  return (
    <Section id="apercu" kicker="Aperçu" title="À quoi ressemble ton rapport">
      <ScrollReveal>
        <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.25)]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-line bg-bg/40">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] text-dim">Rapport d&apos;analyse — exemple</span>
            </div>
            <span className="font-mono text-[10px] text-accent border border-accent/25 bg-accent/8 px-2 py-0.5 rounded">
              softmaxing · 7 points actionnables
            </span>
          </div>

          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-0">
            <div className="p-5 md:p-6 space-y-3.5 border-b md:border-b-0 md:border-r border-line">
              <p className="font-mono text-[9px] uppercase tracking-wider text-dim mb-4">Scores par dimension</p>
              {SCORES.map(({ label, value }, i) => (
                <div key={label} className="flex items-center gap-3 group">
                  <span className="font-mono text-[10px] text-dim w-16 uppercase">{label}</span>
                  <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full bar-fill transition-all duration-700"
                      style={{ width: `${value * 10}%`, animationDelay: `${i * 80}ms` }}
                    />
                  </div>
                  <span className="font-mono text-xs tnum text-text w-8 text-right">{value.toFixed(1).replace(".", ",")}</span>
                </div>
              ))}
            </div>

            <div className="hidden md:flex flex-col items-center justify-center px-4 border-r border-line bg-bg/20">
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-wider text-dim mb-1">Indice</p>
                <p className="font-display text-3xl font-extrabold tnum text-num-idle">6,4</p>
                <p className="text-accent text-lg my-1">→</p>
                <p className="font-display text-3xl font-extrabold tnum text-accent score-glow">7,8</p>
              </div>
            </div>

            <div className="p-5 md:p-6 relative min-h-[220px]">
              <h3 className="font-display font-bold text-text mb-3">Ta routine — semaine 1 à 4</h3>
              <div className="space-y-2 blur-[6px] opacity-55 select-none pointer-events-none">
                {ROUTINE_LINES.map((line) => (
                  <p key={line} className="text-sm text-muted flex items-center gap-2">
                    <span className="size-1 rounded-full bg-dim shrink-0" />
                    {line}
                  </p>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface via-surface/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-5 flex justify-center">
                <Link
                  href="/inscription"
                  className="rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-accent-ink hover:brightness-110 transition shadow-[0_8px_24px_rgba(0,229,160,.25)]"
                >
                  Voir mon indice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <p className="mt-5 text-sm text-dim">
        Sur ton propre rapport, la routine reste floutée jusqu&apos;au paiement — sauf le nombre de points détectés.
      </p>
    </Section>
  );
}
