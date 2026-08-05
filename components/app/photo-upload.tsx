"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppContainer } from "@/components/app/app-container";
import { PageHeader } from "@/components/app/page-header";
import { AnalysisProgressOverlay, ANALYSIS_STEPS } from "@/components/app/analysis-progress-overlay";
import { BuyAnalysisButton } from "@/components/app/buy-analysis-button";
import type { QuotaStatus } from "@/lib/credits/quota-status";

const TIPS = [
  "Selfie face, lumière naturelle",
  "Pas de filtre ni de lunettes",
  "Photo supprimée après analyse",
];

type Phase = "idle" | "uploading" | "analyzing" | "done" | "error";

export function PhotoUpload({
  savedPhoto,
  quota,
  purchaseSuccess = false,
}: {
  savedPhoto: { path: string; url: string } | null;
  quota: QuotaStatus;
  purchaseSuccess?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(savedPhoto?.url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(savedPhoto?.path ?? null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const isBusy = phase === "uploading" || phase === "analyzing" || phase === "done";
  const hasPhoto = file !== null || savedPath !== null;
  const canAnalyze = !isBusy && hasPhoto && quota.canAnalyze;

  useEffect(() => {
    if (phase !== "analyzing" && phase !== "uploading") return;

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, phase === "uploading" ? 2000 : 12000);

    return () => clearInterval(interval);
  }, [phase]);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  const runAnalysis = useCallback(async () => {
    setError("");
    setStepIndex(0);

    let path = savedPath;

    if (file) {
      setPhase("uploading");
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error ?? "Upload échoué");
        setPhase("error");
        return;
      }
      path = uploadData.path as string;
      setSavedPath(path);
    }

    if (!path) {
      setError("Ajoute une photo pour lancer l'analyse.");
      setPhase("idle");
      return;
    }

    setPhase("analyzing");
    setStepIndex(file ? 1 : 0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "L'analyse n'a pas abouti.");
        setPhase("error");
        return;
      }

      setStepIndex(ANALYSIS_STEPS.length - 1);
      setPhase("done");
      setTimeout(() => {
        router.replace(`/app/rapport/${data.analysisId}`);
      }, 900);
    } catch {
      setError("Connexion interrompue. Vérifie ta connexion et réessaie.");
      setPhase("error");
    }
  }, [file, savedPath, router]);

  function handleRetry() {
    setPhase("idle");
    setStepIndex(0);
    setError("");
  }

  return (
    <>
      {isBusy && (
        <AnalysisProgressOverlay
          phase={phase === "uploading" ? "uploading" : phase === "done" ? "done" : "analyzing"}
          stepIndex={stepIndex}
        />
      )}
      {phase === "error" && (
        <AnalysisProgressOverlay
          phase="error"
          stepIndex={stepIndex}
          error={error}
          onRetry={handleRetry}
        />
      )}

      <AppContainer narrow className="pb-28 lg:pb-10">
        <PageHeader
          kicker="Analyse"
          title="Ta photo"
          subtitle={
            savedPath && !file
              ? "Photo enregistrée — relance sans re-téléverser"
              : "Selfie face, lumière naturelle"
          }
          backHref="/app"
          backLabel="Dashboard"
        />

        <QuotaBanner quota={quota} purchaseSuccess={purchaseSuccess} />

        <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-6 lg:gap-8 items-start">
          {/* Aperçu compact — visible sans scroll */}
          <div className="mx-auto w-full max-w-[280px] lg:max-w-none lg:mx-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isBusy && inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && !isBusy && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (isBusy) return;
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className={`rounded-2xl border-2 border-dashed aspect-[3/4] max-h-[min(320px,42vh)] w-full flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                isBusy ? "pointer-events-none opacity-60" : ""
              } ${
                dragOver
                  ? "border-accent bg-accent/5"
                  : preview
                    ? "border-line bg-surface"
                    : "border-line bg-surface hover:border-accent/30"
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-4">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-line bg-bg/60">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dim" />
                      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dim" />
                    </svg>
                  </div>
                  <p className="text-muted text-sm">Glisse ou clique</p>
                  <p className="font-mono text-[9px] text-dim mt-1">JPEG · PNG · WebP</p>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {savedPath && !file && (
              <p className="mt-2 text-[11px] text-dim text-center">Clique pour remplacer</p>
            )}
          </div>

          {/* Panneau action — visible sans scroll sur desktop */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">
                Prochaine étape
              </p>
              {!hasPhoto ? (
                <p className="text-sm text-muted">Ajoute une photo pour lancer l&apos;analyse des 90 dimensions.</p>
              ) : !quota.canAnalyze ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{quota.hint}</p>
                  {quota.needsPurchase && (
                    <BuyAnalysisButton className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-50" />
                  )}
                  {quota.latestLockedReportId && !quota.hasActiveSubscription && (
                    <Link
                      href={`/app/rapport/${quota.latestLockedReportId}`}
                      className="block text-center text-sm text-muted hover:text-accent transition py-2"
                    >
                      Débloquer mon rapport avec un abonnement →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  {savedPath && !file
                    ? "Ta photo est prête. L'analyse prend environ 1 à 2 minutes."
                    : "Nouvelle photo sélectionnée. Lance l'analyse quand tu es prêt."}
                </p>
              )}

              <button
                type="button"
                disabled={!canAnalyze}
                onClick={runAnalysis}
                className="mt-5 w-full hidden lg:flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40 hover:brightness-110 transition cta-shine overflow-hidden relative"
              >
                {savedPath && !file ? "Relancer mon analyse" : "Lancer mon analyse"}
                <span aria-hidden>→</span>
              </button>
            </div>

            <aside className="rounded-2xl border border-line bg-surface/60 p-5 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-dim">Conseils</p>
              <ul className="space-y-2">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-accent shrink-0 mt-0.5" aria-hidden>✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </aside>

            {error && phase === "idle" && (
              <p className="rounded-lg border border-line-strong bg-bg/40 px-3 py-2 text-sm text-muted">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* CTA sticky mobile */}
        <div className="lg:hidden fixed bottom-[68px] inset-x-0 z-20 border-t border-line bg-surface/95 backdrop-blur-xl px-5 py-3 safe-area-pb space-y-2">
          {!canAnalyze && quota.needsPurchase ? (
            <BuyAnalysisButton className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-50" />
          ) : (
            <button
              type="button"
              disabled={!canAnalyze}
              onClick={runAnalysis}
              className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40 hover:brightness-110 transition"
            >
              {!hasPhoto
                ? "Ajoute une photo"
                : !quota.canAnalyze
                  ? "Paiement requis"
                  : savedPath && !file
                    ? "Relancer mon analyse"
                    : "Lancer mon analyse"}
            </button>
          )}
        </div>
      </AppContainer>
    </>
  );
}

function QuotaBanner({ quota, purchaseSuccess }: { quota: QuotaStatus; purchaseSuccess?: boolean }) {
  return (
    <div className="mb-5 space-y-2">
      {purchaseSuccess && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Paiement reçu — tu peux lancer ton analyse de suivi, le rapport sera débloillé automatiquement.
        </div>
      )}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          quota.unlimited
            ? "border-accent/25 bg-accent/8"
            : quota.canAnalyze
              ? "border-line bg-surface/60"
              : "border-line-strong bg-bg/40"
        }`}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-0.5">
            Quota analyses
          </p>
          <p className={`text-sm font-medium ${quota.unlimited ? "text-accent" : "text-text"}`}>
            {quota.unlimited ? "Illimité (admin)" : quota.label}
          </p>
        </div>
        <p className="text-xs text-muted max-w-[240px] text-right">{quota.hint}</p>
      </div>
    </div>
  );
}
