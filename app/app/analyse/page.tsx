"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppContainer } from "@/components/app/app-container";

const STEPS = [
  "Lecture de la photo…",
  "Analyse des sept axes…",
  "Calcul de l'indice…",
  "Génération de la routine…",
  "Finalisation…",
];

export default function AnalysePage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const path = sessionStorage.getItem("analysisPath");
    if (!path) {
      router.replace("/app/photo");
      return;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur");
          return;
        }
        sessionStorage.removeItem("analysisPath");
        router.replace(`/app/rapport/${data.analysisId}`);
      })
      .catch(() => setError("Connexion interrompue."));
  }, [router]);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <AppContainer narrow>
      <div className="max-w-md mx-auto text-center py-8 lg:py-16">
        <div className="rounded-2xl border border-line bg-surface p-8 lg:p-10 relative overflow-hidden">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 mb-6">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent">Analyse en cours</span>
            </div>

            <h1 className="font-display text-2xl font-extrabold mb-6">On mesure ton indice</h1>

            <div className="h-1.5 bg-line rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3 text-left">
              {STEPS.map((label, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <p
                    key={label}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                      done ? "text-accent" : current ? "text-text" : "text-dim"
                    }`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono ${
                      done
                        ? "border-accent/40 bg-accent/10"
                        : current
                          ? "border-accent/30 bg-accent/5"
                          : "border-line"
                    }`}>
                      {done ? "✓" : i + 1}
                    </span>
                    {label}
                  </p>
                );
              })}
            </div>

            {error && (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-muted">{error}</p>
                <Link
                  href="/app/photo"
                  className="inline-flex rounded-xl border border-line px-5 py-2.5 text-sm text-muted hover:border-accent/30 transition"
                >
                  ← Retour à la photo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
