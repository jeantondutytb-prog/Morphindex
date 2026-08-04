import { AXES } from "@/lib/ai/analysis-schema";
import { Paywall } from "@/components/paywall";

/** Largeurs décoratives — aucun lien avec les vrais scores (interdit avant paiement). */
const DECO_BAR = [58, 44, 72, 51, 63, 48, 69];

type LockedReportPreviewProps = {
  analysisId: string;
  pointsCount: number;
  premierPointLibelle: string;
  blurredUrl: string | null;
};

export function LockedReportPreview({
  analysisId,
  pointsCount,
  premierPointLibelle,
  blurredUrl,
}: LockedReportPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Accroche + paywall en premier — visible sans scroll sur mobile */}
      <section className="rounded-xl border border-accent/20 bg-accent/4 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">
          Analyse terminée
        </p>
        <p className="font-display text-2xl font-extrabold tnum mb-1">
          {pointsCount} points identifiés
        </p>
        <p className="text-sm text-muted mb-1">Le plus impactant :</p>
        <p className="text-text font-medium leading-snug mb-5">
          {premierPointLibelle}
        </p>
        <Paywall analysisId={analysisId} compact />
      </section>

      {/* Aperçu visuel du rapport verrouillé — structure sans données réelles */}
      <section className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-dim">Ton rapport — aperçu verrouillé</span>
          <span className="font-mono text-[10px] text-dim">softmaxing · 7 axes</span>
        </div>

        <div className="grid md:grid-cols-[140px_1fr] gap-0">
          {blurredUrl && (
            <div className="p-4 border-b md:border-b-0 md:border-r border-line flex justify-center md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blurredUrl}
                alt=""
                className="w-28 md:w-full rounded-lg aspect-[4/5] object-cover opacity-80"
              />
            </div>
          )}

          <div className="p-5 space-y-4">
            <div className="flex items-baseline gap-3 tnum select-none pointer-events-none" aria-hidden>
              <span className="font-display text-3xl font-extrabold text-num-idle blur-[6px]">?,?</span>
              <span className="text-lg text-dim">→</span>
              <span className="font-display text-3xl font-extrabold text-accent blur-[6px]">?,?</span>
            </div>
            <p className="text-[11px] text-dim -mt-2">Indice actuel → atteignable · débloquer pour voir</p>

            <div className="space-y-2.5">
              {AXES.map((axe, i) => (
                <div key={axe} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-dim w-14 uppercase shrink-0">{axe}</span>
                  <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/40 rounded-full"
                      style={{ width: `${DECO_BAR[i]}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] tnum text-dim w-6 text-right blur-[4px]" aria-hidden>
                    ?,
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-line relative">
          <p className="font-display text-sm font-bold text-text mb-2">Ta routine — semaine 1 à 4</p>
          <div className="space-y-1.5 blur-[5px] opacity-50 select-none pointer-events-none" aria-hidden>
            <p className="text-sm text-muted">Nettoyant doux pH 5,5 — matin</p>
            <p className="text-sm text-muted">Crème solaire SPF 50 — matin</p>
            <p className="text-sm text-muted">Rétinaldéhyde 0,05 % — soir</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        </div>
      </section>

      <p className="text-xs text-dim text-center leading-relaxed">
        Scores, indice et routine complets après paiement — une seule donnée visible ici : ton premier point d&apos;action.
      </p>
    </div>
  );
}
