"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppContainer } from "@/components/app/app-container";
import { AnalysisProgressOverlay, ANALYSIS_STEPS } from "@/components/app/analysis-progress-overlay";

export default function AnalysePage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"analyzing" | "done" | "error">("analyzing");
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 12000);
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
          setPhase("error");
          return;
        }
        sessionStorage.removeItem("analysisPath");
        setStepIndex(ANALYSIS_STEPS.length - 1);
        setPhase("done");
        setTimeout(() => router.replace(`/app/rapport/${data.analysisId}`), 900);
      })
      .catch(() => {
        setError("Connexion interrompue.");
        setPhase("error");
      });
  }, [router]);

  return (
    <>
      <AnalysisProgressOverlay
        phase={phase}
        stepIndex={stepIndex}
        error={error}
        onRetry={phase === "error" ? () => router.push("/app/photo") : undefined}
      />
      <AppContainer narrow>
        <div className="max-w-md mx-auto py-8 text-center text-sm text-dim">
          Analyse en cours…
          {phase === "error" && (
            <Link href="/app/photo" className="block mt-4 text-accent">
              ← Retour à la photo
            </Link>
          )}
        </div>
      </AppContainer>
    </>
  );
}
