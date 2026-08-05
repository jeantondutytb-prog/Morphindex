"use client";

import { forwardRef } from "react";
import {
  EXPORT_LAYOUT,
  EXPORT_SIZE,
  type ExportAspect,
} from "@/lib/tiktok/export-layout";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";

export type { ExportAspect };

export type TikTokCardProps = {
  photoUrl: string | null;
  exportAspect: ExportAspect;
  brandName: string;
  siteLabel: string;
  scoreActuel: number;
  scorePotentiel: number;
};

function ScanIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M8 14V8h6M30 8h6v6M36 30v6h-6M14 36H8v-6"
        stroke="#00E5A0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="22" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <circle cx="22" cy="20" r="3.5" fill="rgba(255,255,255,0.5)" />
      <path
        d="M17 28c1.5-2.5 3.5-3.5 5-3.5s3.5 1 5 3.5"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlashyProgressBar({ progress, accent = "#00E5A0" }: { progress: number; accent?: string }) {
  return (
    <div style={{ marginTop: "auto", paddingTop: 20 }}>
      <div
        style={{
          position: "relative",
          height: 18,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${accent}44`,
          boxShadow: `0 0 20px ${accent}33, inset 0 0 12px rgba(0,0,0,0.5)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}88 0%, ${accent} 45%, #ffffff 85%, ${accent} 100%)`,
            boxShadow: `0 0 24px ${accent}, 0 0 48px ${accent}66, inset 0 2px 4px rgba(255,255,255,0.45)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.15) 52%, transparent 70%)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          letterSpacing: "0.08em",
          color: accent,
          textTransform: "uppercase",
          opacity: 0.85,
        }}
      >
        <span>0</span>
        <span>{Math.round(progress)}%</span>
        <span>10</span>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  accent = "#00E5A0",
  scoreFontSize,
  minHeight,
}: {
  label: string;
  score: number;
  accent?: string;
  scoreFontSize: number;
  minHeight: number;
}) {
  const tier = scoreTier(score);
  const progress = scoreProgress(score);

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 20,
        border: `1.5px solid ${accent}`,
        background: "rgba(12, 14, 18, 0.92)",
        padding: "28px 24px 24px",
        boxShadow: `0 0 32px ${accent}33, inset 0 0 24px ${accent}0d`,
        display: "flex",
        flexDirection: "column",
        minHeight,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "ui-monospace, monospace",
          fontSize: 22,
          letterSpacing: "0.12em",
          color: accent,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "16px 0 0",
          fontFamily: "system-ui, sans-serif",
          fontSize: scoreFontSize,
          fontWeight: 800,
          lineHeight: 1,
          color: "#F5F6F7",
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 40px ${accent}44`,
        }}
      >
        {formatScore(score)}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}88`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 26, fontWeight: 700, color: "#F5F6F7" }}>{tier}</span>
      </div>
      <FlashyProgressBar progress={progress} accent={accent} />
    </div>
  );
}

export const TikTokCard = forwardRef<HTMLDivElement, TikTokCardProps>(function TikTokCard(
  { photoUrl, exportAspect, brandName, siteLabel, scoreActuel, scorePotentiel },
  ref,
) {
  const { width, height } = EXPORT_SIZE[exportAspect];
  const layout = EXPORT_LAYOUT[exportAspect];
  const d = layout.photoDiameter;

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        background: "#08090B",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#F5F6F7",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(0,229,160,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 90%, rgba(0,229,160,0.06) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          minHeight: layout.siteFontSize + 48,
          padding: layout.headerPad,
        }}
      >
        {/* Gauche — icône scan */}
        <div style={{ width: 44, flexShrink: 0 }}>
          <ScanIcon />
        </div>

        {/* Centre — CTA site (vraiment centré sur la carte) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "58%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              borderRadius: 20,
              border: "2px solid rgba(0,229,160,0.55)",
              background: "rgba(0,229,160,0.12)",
              padding: "16px 32px",
              boxShadow: "0 0 40px rgba(0,229,160,0.25), inset 0 0 20px rgba(0,229,160,0.08)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: layout.siteFontSize,
                fontWeight: 800,
                color: "#00E5A0",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                textShadow: "0 0 24px rgba(0,229,160,0.45)",
              }}
            >
              {siteLabel}
            </p>
          </div>
        </div>

        {/* Droite — MorphIndex en gros */}
        <div
          style={{
            marginLeft: "auto",
            textAlign: "right",
            flexShrink: 0,
            maxWidth: "28%",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: layout.brandFontSize,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {brandName.includes("Index") ? (
              <>
                {brandName.replace(/Index/i, "")}
                <span style={{ color: "#00E5A0" }}>Index</span>
              </>
            ) : (
              brandName
            )}
          </p>
        </div>
      </div>

      {/* Portrait — toujours en cercle */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: layout.portraitPad,
        }}
      >
        <div
          style={{
            width: d,
            height: d,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid rgba(0,229,160,0.35)",
            boxShadow: "0 0 60px rgba(0,229,160,0.2), 0 0 120px rgba(0,229,160,0.08)",
            background: "#0C0E12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#5C6470", padding: 32 }}>
              <ScanIcon />
              <p style={{ marginTop: 16, fontSize: 22 }}>Photo</p>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 24,
          padding: layout.scorePad,
        }}
      >
        <ScoreCard
          label="Indice"
          score={scoreActuel}
          scoreFontSize={layout.scoreFontSize}
          minHeight={layout.scoreCardMinHeight}
        />
        <ScoreCard
          label="Potentiel"
          score={scorePotentiel}
          accent="#00E5A0"
          scoreFontSize={layout.scoreFontSize}
          minHeight={layout.scoreCardMinHeight}
        />
      </div>
    </div>
  );
});
