"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { TikTokCard } from "@/components/admin/tiktok-card";
import { AppCard, AppSectionLabel } from "@/components/app/ui";
import { SITE_NAME, siteHostname } from "@/lib/site";

const DEFAULT_SCORE_ACTUEL = 6.4;
const DEFAULT_SCORE_POTENTIEL = 7.8;
const CARD_W = 1080;
const CARD_H = 1920;
const PREVIEW_SCALE = 0.32;

export function TikTokGenerator() {
  const exportRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState(SITE_NAME);
  const [siteLabel, setSiteLabel] = useState(siteHostname());
  const [scoreActuel, setScoreActuel] = useState(DEFAULT_SCORE_ACTUEL);
  const [scorePotentiel, setScorePotentiel] = useState(DEFAULT_SCORE_POTENTIEL);
  const [downloading, setDownloading] = useState(false);

  const cardProps = { photoUrl, brandName, siteLabel, scoreActuel, scorePotentiel };

  const onPhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  async function downloadPng() {
    if (!exportRef.current || !photoUrl) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: CARD_W,
        height: CARD_H,
      });
      const link = document.createElement("a");
      link.download = `morphindex-tiktok-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-8 gap-6">
      {/* Full-size card off-screen for PNG export */}
      <div
        ref={exportRef}
        aria-hidden
        className="fixed pointer-events-none opacity-0"
        style={{ left: -9999, top: 0 }}
      >
        <TikTokCard {...cardProps} />
      </div>

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
          {downloading ? "Génération…" : "Télécharger PNG (1080×1920)"}
        </button>
        <p className="text-xs text-dim text-center">
          Format TikTok vertical · prêt à publier
        </p>
      </div>

      <AppCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-line">
          <AppSectionLabel>Aperçu</AppSectionLabel>
          <p className="text-xs text-dim">1080 × 1920 px</p>
        </div>
        <div className="overflow-auto p-4 flex justify-center bg-bg/40">
          <div
            style={{
              width: CARD_W * PREVIEW_SCALE,
              height: CARD_H * PREVIEW_SCALE,
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid rgba(0,229,160,0.2)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left" }}>
              <TikTokCard {...cardProps} />
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
