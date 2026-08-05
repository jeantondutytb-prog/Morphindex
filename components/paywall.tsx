"use client";

import { useEffect, useState } from "react";
import { UNLOCK_OFFERS, type Formule } from "@/lib/stripe/products";

export function Paywall({
  analysisId,
  compact = false,
}: {
  analysisId: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState<Formule | null>(null);

  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "paywall_viewed", payload: { analysis_id: analysisId } }),
    });
  }, [analysisId]);

  async function checkout(formule: Formule) {
    setLoading(formule);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checkout_started", payload: { formule, analysis_id: analysisId } }),
    });
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formule, analysisId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  return (
    <div className={compact ? "" : "mt-8"}>
      {!compact && (
        <>
          <h2 className="font-display text-lg font-extrabold mb-1">Débloquer ton rapport</h2>
          <p className="text-sm text-muted mb-4">
            Ta première analyse est prête — choisis un abonnement pour accéder au rapport complet, tes routines et le suivi.
          </p>
        </>
      )}
      <div className="grid gap-2.5">
        {UNLOCK_OFFERS.map(({ id, label, price, period, hint, recommended }) => (
          <button
            key={id}
            type="button"
            disabled={loading !== null}
            onClick={() => checkout(id)}
            className={`relative rounded-xl border px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
              recommended
                ? "border-accent/30 bg-gradient-to-br from-accent/8 to-surface hover:border-accent/50 shadow-[0_8px_24px_rgba(0,229,160,.08)]"
                : "border-line bg-bg/40 hover:border-line-strong"
            }`}
          >
            {recommended && (
              <span className="absolute -top-2 right-3 font-mono text-[9px] uppercase tracking-wider bg-accent text-accent-ink px-2 py-0.5 rounded-full">
                recommandé
              </span>
            )}
            <span className="font-bold text-text text-sm">{label}</span>
            <span className="ml-2 tnum text-accent text-sm">{price}</span>
            {period && <span className="text-xs text-dim">{period}</span>}
            {hint && <span className="block mt-1 text-xs text-dim">{hint}</span>}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-dim">
        Les abonnements incluent 2 analyses / mois · rapport débloillé à chaque analyse.
      </p>
    </div>
  );
}
