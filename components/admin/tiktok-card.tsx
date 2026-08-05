"use client";

import { forwardRef } from "react";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";

export type PhotoAspect = "1:1" | "2:3";

export type TikTokCardProps = {
  photoUrl: string | null;
  photoAspect: PhotoAspect;
  brandName: string;
  siteLabel: string;
  scoreActuel: number;
  scorePotentiel: number;
};

const PHOTO_SIZE: Record<PhotoAspect, { width: number; height: number; radius: number }> = {
  "1:1": { width: 560, height: 560, radius: 28 },
  "2:3": { width: 480, height: 720, radius: 28 },
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
        minHeight: 240,
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
  { photoUrl, photoAspect, brandName, siteLabel, scoreActuel, scorePotentiel },
  ref,
) {
  const photoFrame = PHOTO_SIZE[photoAspect];

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

      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: photoAspect === "2:3" ? "24px 48px" : "40px 48px",
        }}
      >
        <div
          style={{
            width: photoFrame.width,
            height: photoFrame.height,
            borderRadius: photoFrame.radius,
            overflow: "hidden",
            border: "3px solid rgba(0,229,160,0.45)",
            boxShadow: "0 0 60px rgba(0,229,160,0.25), 0 0 120px rgba(0,229,160,0.1)",
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
              <p style={{ marginTop: 16, fontSize: 22 }}>{photoAspect}</p>
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
          padding: "0 48px 72px",
        }}
      >
        <ScoreCard label="Indice" score={scoreActuel} />
        <ScoreCard label="Potentiel" score={scorePotentiel} accent="#00E5A0" />
      </div>
    </div>
  );
});
