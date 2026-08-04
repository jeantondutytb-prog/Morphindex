"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      setError(uploadData.error ?? "Upload échoué");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("analysisPath", uploadData.path);
    router.push("/app/analyse");
  }

  return (
    <main className="min-h-screen px-5 py-12 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-extrabold mb-2">Ta photo</h1>
      <p className="font-mono text-[10.5px] text-dim mb-6">
        18 ans et plus · tu dois être la personne sur la photo · elle est supprimée après analyse
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
        {preview ? (
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

      {error && <p className="mt-4 text-sm text-muted">{error}</p>}

      <button
        type="button"
        disabled={!file || loading}
        onClick={handleAnalyze}
        className="mt-6 w-full rounded-lg bg-accent py-3.5 font-bold text-accent-ink disabled:opacity-40"
      >
        {loading ? "Envoi…" : "Lancer mon analyse"}
      </button>
    </main>
  );
}
