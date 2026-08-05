"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { TikTokCard, type ExportAspect } from "@/components/admin/tiktok-card";
import { AppCard, AppSectionLabel } from "@/components/app/ui";
import { EXPORT_SIZE } from "@/lib/tiktok/export-layout";
import { downloadBlob, readFileAsDataUrl } from "@/lib/tiktok/export-image";
import { SITE_NAME, siteHostname } from "@/lib/site";

const DEFAULT_SCORE_ACTUEL = 6.4;
const DEFAULT_SCORE_POTENTIEL = 7.8;
const PREVIEW_MAX_W = 360;

export function TikTokGenerator() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [exportAspect, setExportAspect] = useState<ExportAspect>("1:1");
  const [brandName, setBrandName] = useState(SITE_NAME);
  const [siteLabel, setSiteLabel] = useState(siteHostname());
  const [scoreActuel, setScoreActuel] = useState(DEFAULT_SCORE_ACTUEL);
  const [scorePotentiel, setScorePotentiel] = useState(DEFAULT_SCORE_POTENTIEL);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardProps = { photoUrl, exportAspect, brandName, siteLabel, scoreActuel, scorePotentiel };
  const { width: cardW, height: cardH } = EXPORT_SIZE[exportAspect];

  const previewScale = useMemo(
    () => PREVIEW_MAX_W / cardW,
    [cardW],
  );

  const onPhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoUrl(dataUrl);
    } catch {
      setError("Impossible de charger la photo. Réessaie avec un JPEG ou PNG.");
    }
  }, []);

  async function downloadPng() {
    if (!photoUrl) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tiktok/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrl: photoUrl,
          exportAspect,
          brandName,
          siteLabel,
          scoreActuel,
          scorePotentiel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "export failed");
      }

      const blob = await res.blob();
      downloadBlob(
        blob,
        `morphindex-tiktok-${exportAspect.replace(":", "x")}-${Date.now()}.png`,
      );
    } catch {
      setError("Le téléchargement a échoué. Réessaie dans un instant.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-8 gap-6">
      <div className="space-y-4">
        <AppCard>
          <AppSectionLabel>Photo</AppSectionLabel>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-line-strong py-8 text-sm text-muted hover:border-accent/40 hover:text-text transition"
          >
            {photoUrl ? "Changer la photo" : "Uploader une photo (JPEG, PNG)"}
          </button>
          <p className="mt-2 text-xs text-dim">
            Affichée en cercle dans la carte (comme l&apos;aperçu).
          </p>
        </AppCard>

        <AppCard>
          <AppSectionLabel>Format de l&apos;image exportée</AppSectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(["1:1", "2:3"] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setExportAspect(ratio)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                  exportAspect === ratio
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-line text-muted hover:border-line-strong hover:text-text"
                }`}
              >
                {ratio === "1:1" ? "Carré 1:1" : "Portrait 2:3"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-dim tnum">
            Téléchargement : {cardW} × {cardH} px (aperçu complet avec notes)
          </p>
        </AppCard>

        <AppCard>
          <AppSectionLabel>CTA TikTok (en-tête)</AppSectionLabel>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-dim mb-1 block">Nom de la marque</span>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg/60 px-4 py-2.5 text-sm text-text focus:border-accent/40 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-dim mb-1 block">Lien affiché (CTA)</span>
              <input
                type="text"
                value={siteLabel}
                onChange={(e) => setSiteLabel(e.target.value)}
                placeholder="morphindex.com"
                className="w-full rounded-xl border border-line bg-bg/60 px-4 py-2.5 text-sm text-text focus:border-accent/40 outline-none"
              />
            </label>
          </div>
        </AppCard>

        <AppCard>
          <AppSectionLabel>Scores affichés</AppSectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-dim mb-1 block">Indice actuel</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={scoreActuel}
                onChange={(e) => setScoreActuel(Number(e.target.value))}
                className="w-full rounded-xl border border-line bg-bg/60 px-4 py-2.5 text-sm text-text tnum focus:border-accent/40 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-dim mb-1 block">Potentiel</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={scorePotentiel}
                onChange={(e) => setScorePotentiel(Number(e.target.value))}
                className="w-full rounded-xl border border-line bg-bg/60 px-4 py-2.5 text-sm text-text tnum focus:border-accent/40 outline-none"
              />
            </label>
          </div>
        </AppCard>

        <button
          type="button"
          disabled={!photoUrl || downloading}
          onClick={downloadPng}
          className="w-full rounded-xl bg-accent py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40 cta-shine overflow-hidden relative"
        >
          {downloading ? "Génération…" : `Télécharger PNG (${cardW}×${cardH})`}
        </button>

        {error && (
          <p className="text-sm text-red-400/90 text-center" role="alert">
            {error}
          </p>
        )}
      </div>

      <AppCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-line">
          <AppSectionLabel>Aperçu complet</AppSectionLabel>
          <p className="text-xs text-dim tnum">{cardW} × {cardH} px · {exportAspect}</p>
        </div>
        <div className="overflow-auto p-4 flex justify-center bg-bg/40">
          <div
            style={{
              width: cardW * previewScale,
              height: cardH * previewScale,
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid rgba(0,229,160,0.2)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
              <TikTokCard {...cardProps} />
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
