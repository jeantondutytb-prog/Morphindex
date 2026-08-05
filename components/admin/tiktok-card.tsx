"use client";

import { forwardRef } from "react";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";

export type TikTokCardProps = {
  photoUrl: string | null;
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

function ScoreCard({
  label,
  score,
  accent = "#00E5A0",
}: {
  label: string;
  score: number;
  accent?: string;
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
        minHeight: 220,
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
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1,
          color: "#F5F6F7",
          fontVariantNumeric: "tabular-nums",
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
            boxShadow: `0 0 10px ${accent}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 26, fontWeight: 700, color: "#F5F6F7" }}>{tier}</span>
      </div>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 24,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}aa, ${accent})`,
            boxShadow: `0 0 16px ${accent}88`,
          }}
        />
      </div>
    </div>
  );
}

export const TikTokCard = forwardRef<HTMLDivElement, TikTokCardProps>(function TikTokCard(
  { photoUrl, brandName, siteLabel, scoreActuel, scorePotentiel },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
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
      {/* Glow background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 35%, rgba(0,229,160,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 90%, rgba(0,229,160,0.06) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 48px 0",
        }}
      >
        <ScanIcon />
        <div style={{ textAlign: "center", flex: 1, padding: "0 16px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {brandName}
          </p>
        </div>
        <div
          style={{
            borderRadius: 16,
            border: "1.5px solid rgba(0,229,160,0.45)",
            background: "rgba(0,229,160,0.1)",
            padding: "14px 18px",
            maxWidth: 220,
            textAlign: "center",
            boxShadow: "0 0 24px rgba(0,229,160,0.15)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#00E5A0",
              lineHeight: 1.3,
              wordBreak: "break-all",
            }}
          >
            {siteLabel}
          </p>
        </div>
      </div>

      {/* Portrait */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
        }}
      >
        <div
          style={{
            width: 520,
            height: 520,
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

      {/* Score cards */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 24,
          padding: "0 48px 72px",
        }}
      >
        <ScoreCard label="Indice" score={scoreActuel} />
        <ScoreCard label="Potentiel" score={scorePotentiel} accent="#00E5A0" />
      </div>
    </div>
  );
});
