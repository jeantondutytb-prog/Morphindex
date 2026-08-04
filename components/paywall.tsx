"use client";

import { useEffect, useState } from "react";
import { FORMULES, type Formule } from "@/lib/stripe/products";

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
        <h2 className="font-display text-lg font-bold mb-4">Débloquer ton rapport</h2>
      )}
<<<<<<< Updated upstream
      {compact && (
        <p className="font-display text-sm font-bold text-text mb-3">Débloquer ton rapport</p>
      )}
      <div className="grid gap-2.5">
        {FORMULES.map(({ id, label, price, period, recommended }) => (
=======
      <div className={compact ? "grid gap-3.5" : "grid gap-2.5"}>
        {FORMULES.map(({ id, label, price, period, hint, recommended }) => (
>>>>>>> Stashed changes
          <button
            key={id}
            type="button"
            disabled={loading !== null}
            onClick={() => checkout(id)}
            className={`relative rounded-xl border px-4 py-3.5 text-left transition hover:border-accent/50 ${
              recommended ? "border-accent/30 bg-surface" : "border-line bg-bg"
            }`}
          >
            {recommended && (
              <span className="absolute -top-2 right-3 font-mono text-[9px] uppercase tracking-wider bg-accent text-accent-ink px-2 py-0.5 rounded">
                recommandé
              </span>
            )}
<<<<<<< Updated upstream
            <span className="font-bold text-text text-sm">{label}</span>
            <span className="ml-2 tnum text-accent text-sm">{price}</span>
            {period && <span className="text-xs text-dim">{period}</span>}
=======
            <span className={`font-bold text-text ${compact ? "text-base" : "text-sm"}`}>{label}</span>
            <span className={`ml-2 tnum text-accent ${compact ? "text-lg" : "text-sm"}`}>{price}</span>
            {period && <span className={`text-dim ${compact ? "text-sm" : "text-xs"}`}>{period}</span>}
            {hint && (
              <span className={`block mt-1 text-dim ${compact ? "text-sm" : "text-xs"}`}>{hint}</span>
            )}
>>>>>>> Stashed changes
          </button>
        ))}
      </div>
    </div>
  );
}
