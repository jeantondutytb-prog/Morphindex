"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [showPaywall, setShowPaywall] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showPaywall) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showPaywall]);

  useEffect(() => {
    if (!showPaywall) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowPaywall(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPaywall]);

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-xl border border-line bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">
            Analyse terminée
          </p>
          <p className="font-display text-2xl font-extrabold tnum mb-1">
            {pointsCount} points identifiés
          </p>
          <p className="text-sm text-muted mb-1">Le plus impactant :</p>
          <p className="text-text font-medium leading-snug">
            {premierPointLibelle}
          </p>
        </section>

        <section className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-dim">Ton rapport</span>
            <span className="font-mono text-[10px] text-dim">softmaxing · 7 axes</span>
          </div>

          <div className="grid md:grid-cols-[120px_1fr] gap-0">
            {blurredUrl && (
              <div className="p-4 border-b md:border-b-0 md:border-r border-line flex justify-center md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blurredUrl}
                  alt=""
                  className="w-24 md:w-full rounded-lg aspect-[4/5] object-cover opacity-80"
                />
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="flex items-baseline gap-3 tnum select-none pointer-events-none" aria-hidden>
                <span className="font-display text-4xl font-extrabold text-num-idle blur-[7px]">?,?</span>
                <span className="text-xl text-dim">→</span>
                <span className="font-display text-4xl font-extrabold text-accent blur-[7px]">?,?</span>
              </div>
              <p className="text-[11px] text-dim -mt-2">Indice actuel → atteignable</p>

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
              <p className="text-sm text-muted">Crème hydratante légère — soir</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none" />
          </div>
        </section>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowPaywall(true)}
            className="w-full rounded-xl bg-accent px-6 py-4 font-bold text-accent-ink hover:brightness-110 transition text-[15px]"
          >
            Débloquer mon rapport
          </button>
          <p className="mt-3 text-center text-xs text-dim">
            Indice complet, 7 scores et routine personnalisée
          </p>
        </div>
      </div>

      {showPaywall && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-title"
        >
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
            onClick={() => setShowPaywall(false)}
          />
          <div className="relative z-10 w-full max-w-md max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl border border-line-strong bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,.55)]">
            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 font-mono text-sm text-dim hover:text-muted transition leading-none"
              aria-label="Fermer"
            >
              ✕
            </button>
            <p id="paywall-title" className="font-display text-xl font-extrabold text-text mb-1 pr-8">
              Débloquer ton rapport
            </p>
            <p className="text-sm text-muted mb-5">
              Indice, 7 scores et routine personnalisée — livraison immédiate.
            </p>
            <Paywall analysisId={analysisId} compact />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
