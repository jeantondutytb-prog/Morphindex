import Link from "next/link";
import { Section } from "@/components/ui/section";

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
    <Section id="apercu" kicker="04 · Aperçu" title="À quoi ressemble ton rapport">
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-line">
          <span className="font-mono text-[10px] text-dim">Rapport d&apos;analyse — exemple</span>
          <span className="font-mono text-[10px] text-dim">softmaxing · 7 points actionnables</span>
        </div>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-5 space-y-3 border-b md:border-b-0 md:border-r border-line">
            {SCORES.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-dim w-16 uppercase">{label}</span>
                <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${value * 10}%` }} />
                </div>
                <span className="font-mono text-xs tnum text-text w-8 text-right">{value.toFixed(1).replace(".", ",")}</span>
              </div>
            ))}
          </div>
          <div className="p-5 relative">
            <h3 className="font-display font-bold text-text mb-3">Ta routine — semaine 1 à 4</h3>
            <div className="space-y-2 blur-[6px] opacity-55 select-none">
              {ROUTINE_LINES.map((line) => (
                <p key={line} className="text-sm text-muted">{line}</p>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <Link href="/inscription" className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-ink">
                Voir mon indice
              </Link>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-dim">
        Sur ton propre rapport, tout est flouté jusqu&apos;au paiement — sauf le nombre de points détectés.
      </p>
    </Section>
  );
}
