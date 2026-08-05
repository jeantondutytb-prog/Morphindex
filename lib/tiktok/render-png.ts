import sharp from "sharp";
import {
  EXPORT_LAYOUT,
  EXPORT_SIZE,
  type ExportAspect,
} from "@/lib/tiktok/export-layout";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";

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
  const labelEsc = esc(label);
  const tierEsc = esc(tier);
  const scoreText = esc(formatScore(score));

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#0C0E12" fill-opacity="0.92" stroke="${accent}" stroke-width="1.5"/>
    <text x="${x + 24}" y="${y + 36}" fill="${accent}" font-family="monospace" font-size="22" font-weight="600" letter-spacing="3">${labelEsc}</text>
    <text x="${x + 24}" y="${y + 36 + scoreFontSize + 8}" fill="#F5F6F7" font-family="system-ui, sans-serif" font-size="${scoreFontSize}" font-weight="800">${scoreText}</text>
    <circle cx="${x + 29}" cy="${y + 36 + scoreFontSize + 44}" r="5" fill="${accent}"/>
    <text x="${x + 44}" y="${y + 36 + scoreFontSize + 50}" fill="#F5F6F7" font-family="system-ui, sans-serif" font-size="26" font-weight="700">${tierEsc}</text>
    ${progressBarSvg(x + 24, y + h - 52, w - 48, progress, accent)}
    <text x="${x + 24}" y="${y + h - 20}" fill="${accent}" font-family="monospace" font-size="13" opacity="0.85">0</text>
    <text x="${x + w / 2}" y="${y + h - 20}" fill="${accent}" font-family="monospace" font-size="13" opacity="0.85" text-anchor="middle">${Math.round(progress)}%</text>
    <text x="${x + w - 24}" y="${y + h - 20}" fill="${accent}" font-family="monospace" font-size="13" opacity="0.85" text-anchor="end">10</text>
  `;
}

function buildSvg(input: TikTokRenderInput): string {
  const { width, height } = EXPORT_SIZE[input.exportAspect];
  const layout = EXPORT_LAYOUT[input.exportAspect];
  const padX = input.exportAspect === "1:1" ? 40 : 48;
  const cardGap = 24;
  const cardW = (width - padX * 2 - cardGap) / 2;
  const cardH = layout.scoreCardMinHeight;
  const cardY = height - (input.exportAspect === "1:1" ? 40 : 56) - cardH;
  const photoR = layout.photoDiameter / 2;
  const photoCx = width / 2;
  const headerBottom = input.exportAspect === "1:1" ? 120 : 140;
  const photoCy = headerBottom + (cardY - headerBottom) / 2 + 20;
  const brand = splitBrand(input.brandName);

  const siteEsc = esc(input.siteLabel);
  const brandPrefixEsc = esc(brand.prefix);
  const brandSuffixEsc = esc(brand.suffix);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
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

  <!-- Scan icon -->
  <g transform="translate(${padX}, ${input.exportAspect === "1:1" ? 40 : 56})">
    <path d="M8 14V8h6M30 8h6v6M36 30v6h-6M14 36H8v-6" stroke="#00E5A0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="22" r="9" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none"/>
  </g>

  <!-- Site CTA center -->
  <rect x="${width / 2 - 200}" y="${input.exportAspect === "1:1" ? 48 : 64}" width="400" height="${layout.siteFontSize + 40}" rx="20" fill="rgba(0,229,160,0.12)" stroke="#00E5A0" stroke-opacity="0.55" stroke-width="2"/>
  <text x="${width / 2}" y="${(input.exportAspect === "1:1" ? 48 : 64) + layout.siteFontSize + 22}" fill="#00E5A0" font-family="system-ui, sans-serif" font-size="${layout.siteFontSize}" font-weight="800" text-anchor="middle">${siteEsc}</text>

  <!-- Brand right -->
  <text x="${width - padX}" y="${(input.exportAspect === "1:1" ? 48 : 64) + layout.brandFontSize}" fill="#F5F6F7" font-family="system-ui, sans-serif" font-size="${layout.brandFontSize}" font-weight="800" text-anchor="end">
    ${brandPrefixEsc}<tspan fill="#00E5A0">${brandSuffixEsc}</tspan>
  </text>

  <!-- Photo circle border -->
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
