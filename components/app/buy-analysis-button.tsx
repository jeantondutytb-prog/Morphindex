"use client";

import { useState } from "react";
import { FOLLOW_UP_OFFER, type Formule } from "@/lib/stripe/products";

export function BuyAnalysisButton({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checkout_started", payload: { formule: "analyse" } }),
    });
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formule: "analyse" satisfies Formule }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={checkout}
      className={
        className ||
        "w-full rounded-xl border border-accent/30 bg-accent/10 py-3.5 font-bold text-accent hover:bg-accent/15 transition disabled:opacity-50"
      }
    >
      {loading ? "Redirection…" : (label ?? `Analyse de suivi — ${FOLLOW_UP_OFFER.price}`)}
    </button>
  );
}
