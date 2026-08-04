"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [error, setError] = useState("");

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
    <main className="min-h-screen px-5 py-12 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-extrabold mb-2">Ta photo</h1>
      <p className="font-mono text-[10.5px] text-dim mb-6">
        {savedPath && !file
          ? "Ta photo enregistrée — relance l'analyse sans la re-téléverser"
          : "18 ans et plus · tu dois être la personne sur la photo"}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className="rounded-xl border-2 border-dashed border-line bg-surface aspect-[4/5] flex items-center justify-center cursor-pointer hover:border-accent/30 transition overflow-hidden"
      >
        {loadingSaved ? (
          <p className="text-muted text-sm">Chargement…</p>
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
        ) : (
          <p className="text-muted text-sm text-center px-4">Glisse une photo ou clique pour sélectionner</p>
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
        <p className="mt-3 text-xs text-dim text-center">
          Clique sur la zone pour remplacer la photo
        </p>
      )}

      {error && <p className="mt-4 text-sm text-muted">{error}</p>}

      <button
        type="button"
        disabled={!canAnalyze}
        onClick={handleAnalyze}
        className="mt-6 w-full rounded-lg bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40"
      >
        {loading ? "Envoi…" : savedPath && !file ? "Relancer mon analyse" : "Lancer mon analyse"}
      </button>
    </main>
  );
}
