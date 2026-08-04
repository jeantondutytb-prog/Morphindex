"use client";

import { useEffect, useState } from "react";
import { FORMULES, type Formule } from "@/lib/stripe/products";

export function Paywall({ analysisId }: { analysisId: string }) {
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
    <div className="mt-8">
      <h2 className="font-display text-lg font-bold mb-4">Débloquer ton rapport</h2>
      <div className="grid gap-3">
        {FORMULES.map(({ id, label, price, period, recommended }) => (
          <button
            key={id}
            type="button"
            disabled={loading !== null}
            onClick={() => checkout(id)}
            className={`relative rounded-xl border p-4 text-left transition hover:border-accent/50 ${
              recommended ? "border-accent/30 bg-accent/4" : "border-line bg-surface"
            }`}
          >
            {recommended && (
              <span className="absolute -top-2 right-4 font-mono text-[9px] uppercase tracking-wider bg-accent text-accent-ink px-2 py-0.5 rounded">
                recommandé
              </span>
            )}
            <span className="font-bold text-text">{label}</span>
            <span className="ml-2 tnum text-accent">{price}</span>
            {period && <span className="text-sm text-dim">{period}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
