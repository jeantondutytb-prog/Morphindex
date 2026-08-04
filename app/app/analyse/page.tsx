"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      router.replace("/onboarding/photo");
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-2xl font-extrabold mb-8">Analyse en cours</h1>
        <div className="space-y-3">
          {STEPS.map((label, i) => (
            <p
              key={label}
              className={`text-sm transition ${i <= stepIndex ? "text-text" : "text-dim"}`}
            >
              {i < stepIndex ? "✓ " : i === stepIndex ? "→ " : "  "}{label}
            </p>
          ))}
        </div>
        {error && (
          <p className="mt-8 text-muted">{error}</p>
        )}
      </div>
    </main>
  );
}
