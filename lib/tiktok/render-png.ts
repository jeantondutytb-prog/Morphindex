import sharp from "sharp";
import {
  EXPORT_LAYOUT,
  EXPORT_SIZE,
  type ExportAspect,
} from "@/lib/tiktok/export-layout";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";
import {
  estimateTextWidth,
  FONT_MONO,
  FONT_SANS,
  svgEmbeddedFontStyles,
} from "@/lib/tiktok/svg-fonts";

export type TikTokRenderInput = {
  photoDataUrl: string;
  exportAspect: ExportAspect;
  brandName: string;
  siteLabel: string;
  scoreActuel: number;
  scorePotentiel: number;
};

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitBrand(name: string): { prefix: string; suffix: string } {
  const m = name.match(/^(.*?)(index)$/i);
  if (m) return { prefix: m[1], suffix: m[2] };
  return { prefix: name, suffix: "" };
}

function progressBarSvg(
  x: number,
  y: number,
  w: number,
  progress: number,
  accent: string,
): string {
  const fillW = Math.max(0, Math.min(w, (w * progress) / 100));
  return `
    <rect x="${x}" y="${y}" width="${w}" height="18" rx="9" fill="rgba(255,255,255,0.06)" stroke="${accent}" stroke-opacity="0.35"/>
    <rect x="${x}" y="${y}" width="${fillW}" height="18" rx="9" fill="${accent}"/>
    <rect x="${x}" y="${y}" width="${fillW}" height="18" rx="9" fill="url(#barShine)" opacity="0.55"/>
  `;
}

function scoreCardSvg(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  score: number,
  accent: string,
  scoreFontSize: number,
): string {
  const tier = scoreTier(score);
  const progress = scoreProgress(score);
  const scoreY = y + 36 + scoreFontSize;
  const tierY = scoreY + 44;

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#0C0E12" fill-opacity="0.92" stroke="${accent}" stroke-width="1.5"/>
    <text x="${x + 24}" y="${y + 34}" fill="${accent}" font-family="${FONT_MONO}" font-size="20" font-weight="500" letter-spacing="2">${esc(label.toUpperCase())}</text>
    <text x="${x + 24}" y="${scoreY}" fill="#F5F6F7" font-family="${FONT_SANS}" font-size="${scoreFontSize}" font-weight="800">${esc(formatScore(score))}</text>
    <circle cx="${x + 29}" cy="${tierY}" r="5" fill="${accent}"/>
    <text x="${x + 44}" y="${tierY + 6}" fill="#F5F6F7" font-family="${FONT_SANS}" font-size="24" font-weight="700">${esc(tier)}</text>
    ${progressBarSvg(x + 24, y + h - 52, w - 48, progress, accent)}
    <text x="${x + 24}" y="${y + h - 18}" fill="${accent}" font-family="${FONT_MONO}" font-size="12" font-weight="500" opacity="0.85">0</text>
    <text x="${x + w / 2}" y="${y + h - 18}" fill="${accent}" font-family="${FONT_MONO}" font-size="12" font-weight="500" opacity="0.85" text-anchor="middle">${Math.round(progress)}%</text>
    <text x="${x + w - 24}" y="${y + h - 18}" fill="${accent}" font-family="${FONT_MONO}" font-size="12" font-weight="500" opacity="0.85" text-anchor="end">10</text>
  `;
}

function buildSvg(input: TikTokRenderInput): string {
  const { width, height } = EXPORT_SIZE[input.exportAspect];
  const layout = EXPORT_LAYOUT[input.exportAspect];
  const padX = input.exportAspect === "1:1" ? 40 : 48;
  const topPad = input.exportAspect === "1:1" ? 44 : 56;
  const bottomPad = input.exportAspect === "1:1" ? 40 : 56;
  const cardGap = 24;
  const cardW = (width - padX * 2 - cardGap) / 2;
  const cardH = layout.scoreCardMinHeight;
  const cardY = height - bottomPad - cardH;

  const siteBoxH = layout.siteFontSize + 32;
  const siteBoxW = Math.min(
    width * 0.52,
    Math.max(220, estimateTextWidth(input.siteLabel, layout.siteFontSize) + 56),
  );
  const siteBoxX = (width - siteBoxW) / 2;
  const siteBoxY = topPad;
  const siteTextY = siteBoxY + siteBoxH / 2 + layout.siteFontSize * 0.36;

  const headerBottom = siteBoxY + siteBoxH + 16;
  const photoR = layout.photoDiameter / 2;
  const photoCx = width / 2;
  const photoCy = headerBottom + (cardY - headerBottom) / 2;

  const brand = splitBrand(input.brandName);
  const brandY = siteTextY;
  const iconY = siteBoxY + (siteBoxH - 44) / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style type="text/css"><![CDATA[
      ${svgEmbeddedFontStyles()}
    ]]></style>
    <radialGradient id="glow1" cx="50%" cy="35%" rx="50%" ry="40%">
      <stop offset="0%" stop-color="#00E5A0" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#00E5A0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="90%" rx="45%" ry="35%">
      <stop offset="0%" stop-color="#00E5A0" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#00E5A0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="barShine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="52%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="photoClip">
      <circle cx="${photoCx}" cy="${photoCy}" r="${photoR}"/>
    </clipPath>
  </defs>

  <rect width="${width}" height="${height}" fill="#08090B"/>
  <rect width="${width}" height="${height}" fill="url(#glow1)"/>
  <rect width="${width}" height="${height}" fill="url(#glow2)"/>

  <g transform="translate(${padX}, ${iconY})">
    <path d="M8 14V8h6M30 8h6v6M36 30v6h-6M14 36H8v-6" stroke="#00E5A0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="22" r="9" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none"/>
  </g>

  <rect x="${siteBoxX}" y="${siteBoxY}" width="${siteBoxW}" height="${siteBoxH}" rx="20" fill="rgba(0,229,160,0.12)" stroke="#00E5A0" stroke-opacity="0.55" stroke-width="2"/>
  <text x="${width / 2}" y="${siteTextY}" fill="#00E5A0" font-family="${FONT_SANS}" font-size="${layout.siteFontSize}" font-weight="800" text-anchor="middle">${esc(input.siteLabel)}</text>

  <text x="${width - padX}" y="${brandY}" fill="#F5F6F7" font-family="${FONT_SANS}" font-size="${layout.brandFontSize}" font-weight="800" text-anchor="end">
    ${esc(brand.prefix)}<tspan fill="#00E5A0">${esc(brand.suffix)}</tspan>
  </text>

  <circle cx="${photoCx}" cy="${photoCy}" r="${photoR}" fill="#0C0E12" stroke="#00E5A0" stroke-opacity="0.35" stroke-width="3"/>
  <image href="${input.photoDataUrl}" x="${photoCx - photoR}" y="${photoCy - photoR}" width="${layout.photoDiameter}" height="${layout.photoDiameter}" clip-path="url(#photoClip)" preserveAspectRatio="xMidYMid slice"/>

  ${scoreCardSvg(padX, cardY, cardW, cardH, "Indice", input.scoreActuel, "#00E5A0", layout.scoreFontSize)}
  ${scoreCardSvg(padX + cardW + cardGap, cardY, cardW, cardH, "Potentiel", input.scorePotentiel, "#00E5A0", layout.scoreFontSize)}
</svg>`;
}

export async function renderTikTokPng(input: TikTokRenderInput): Promise<Buffer> {
  const svg = buildSvg(input);
  const { width, height } = EXPORT_SIZE[input.exportAspect];
  return sharp(Buffer.from(svg)).png().resize(width, height).toBuffer();
}

export { buildSvg };
