"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppContainer } from "@/components/app/app-container";
import { PageHeader } from "@/components/app/page-header";

const TIPS = [
  "Selfie face, lumière naturelle",
  "Pas de filtre ni de lunettes",
  "Photo supprimée après analyse",
];

export function PhotoUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch("/api/photo/saved")
      .then((r) => r.json())
      .then((data: { saved?: boolean; path?: string; url?: string }) => {
        if (data.saved && data.path && data.url) {
          setSavedPath(data.path);
          setPreview(data.url);
        }
      })
      .finally(() => setLoadingSaved(false));
  }, []);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    setLoading(true);
    setError("");

    let path = savedPath;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error ?? "Upload échoué");
        setLoading(false);
        return;
      }
      path = uploadData.path as string;
      setSavedPath(path);
    }

    if (!path) {
      setError("Ajoute une photo pour lancer l'analyse.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("analysisPath", path);
    router.push("/app/analyse");
  }

  const canAnalyze = !loading && !loadingSaved && (file !== null || savedPath !== null);

  return (
    <AppContainer narrow>
      <PageHeader
        kicker="Analyse"
        title="Ta photo"
        subtitle={
          savedPath && !file
            ? "Ta photo enregistrée — relance l'analyse sans la re-téléverser"
            : "18 ans et plus · tu dois être la personne sur la photo"
        }
        backHref="/app"
        backLabel="Dashboard"
      />

      <div className="grid lg:grid-cols-[1fr,280px] gap-6 lg:gap-8 items-start">
        <div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={`rounded-2xl border-2 border-dashed aspect-[4/5] max-w-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
              dragOver
                ? "border-accent bg-accent/5 scale-[1.01]"
                : preview
                  ? "border-line bg-surface"
                  : "border-line bg-surface hover:border-accent/30"
            }`}
          >
            {loadingSaved ? (
              <p className="text-muted text-sm">Chargement…</p>
            ) : preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-6">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-line bg-bg/60">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dim" />
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dim" />
                  </svg>
                </div>
                <p className="text-muted text-sm">Glisse une photo ou clique pour sélectionner</p>
                <p className="font-mono text-[10px] text-dim mt-2">JPEG · PNG · WebP</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {savedPath && !file && (
            <p className="mt-3 text-xs text-dim text-center max-w-lg">
              Clique sur la zone pour remplacer la photo
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-line-strong bg-bg/40 px-3 py-2 text-sm text-muted max-w-lg">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={handleAnalyze}
            className="mt-6 w-full max-w-lg rounded-xl bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40 hover:brightness-110 transition cta-shine overflow-hidden relative"
          >
            {loading ? "Envoi…" : savedPath && !file ? "Relancer mon analyse" : "Lancer mon analyse"}
          </button>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-dim">Conseils</p>
          <ul className="space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-muted">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden>
                  <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-accent" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-line">
            <Link href="/app" className="text-xs text-dim hover:text-muted transition">
              ← Retour au dashboard
            </Link>
          </div>
        </aside>
      </div>
    </AppContainer>
  );
}
