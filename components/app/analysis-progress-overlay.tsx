"use client";

const STEPS = [
  { label: "Envoi de la photo", duration: 8 },
  { label: "Lecture du visage", duration: 15 },
  { label: "90 dimensions mesurées", duration: 45 },
  { label: "Indice & routine générés", duration: 30 },
  { label: "Finalisation", duration: 12 },
];

export type AnalysisPhase = "uploading" | "analyzing" | "done" | "error";

export function AnalysisProgressOverlay({
  phase,
  stepIndex,
  error,
  onRetry,
}: {
  phase: AnalysisPhase;
  stepIndex: number;
  error?: string;
  onRetry?: () => void;
}) {
  const isDone = phase === "done";
  const isError = phase === "error";
  const progress = isDone
    ? 100
    : Math.min(95, ((stepIndex + 1) / STEPS.length) * 90);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 backdrop-blur-md p-5">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-40" aria-hidden />

        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            {!isDone && !isError && (
              <span className="size-2 rounded-full bg-accent animate-pulse shrink-0" aria-hidden />
            )}
            {isDone && (
              <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent text-sm shrink-0" aria-hidden>✓</span>
            )}
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {isError ? "Erreur" : isDone ? "Terminé" : phase === "uploading" ? "Envoi…" : "Analyse en cours"}
            </p>
          </div>

          <h2 className="font-display text-xl font-extrabold mb-1">
            {isError ? "Analyse interrompue" : isDone ? "Rapport prêt !" : "MorphIndex analyse ta photo"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {isError
              ? error
              : isDone
                ? "Redirection vers ton rapport…"
                : "Environ 1 à 2 minutes · ne ferme pas cette page"}
          </p>

          {!isError && (
            <>
              <div className="h-2 bg-line rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? "bg-accent" : "bg-accent animate-pulse"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ul className="space-y-2.5">
                {STEPS.map((step, i) => {
                  const done = isDone || i < stepIndex;
                  const current = !isDone && i === stepIndex;
                  return (
                    <li
                      key={step.label}
                      className={`flex items-center gap-3 text-sm transition-colors ${
                        done ? "text-accent" : current ? "text-text" : "text-dim"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono ${
                          done
                            ? "border-accent/40 bg-accent/10"
                            : current
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-line"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="flex-1">{step.label}</span>
                      {current && !isDone && (
                        <span className="font-mono text-[9px] text-dim shrink-0">…</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 w-full rounded-xl border border-line py-3 text-sm text-muted hover:border-accent/30 transition"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Avance les étapes visuelles pendant l'attente API (durées indicatives). */
export function useAnalysisStepTimer(active: boolean, maxStep = STEPS.length - 1) {
  // Implemented in photo-upload via useEffect
  return STEPS.length;
}

export { STEPS as ANALYSIS_STEPS };
