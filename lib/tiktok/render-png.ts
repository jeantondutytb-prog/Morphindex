import { createCanvas, GlobalFonts, loadImage, type Image, type SKRSContext2D } from "@napi-rs/canvas";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

const FONT_DIR = join(process.cwd(), "lib/tiktok/fonts");
const ACCENT = "#00E5A0";
const TEXT = "#F5F6F7";
const BG = "#08090B";

let fontsReady = false;

function ensureFonts() {
  if (fontsReady) return;
  GlobalFonts.registerFromPath(join(FONT_DIR, "Inter-Bold.ttf"), "InterBold");
  GlobalFonts.registerFromPath(join(FONT_DIR, "Inter-ExtraBold.ttf"), "InterExtraBold");
  GlobalFonts.registerFromPath(join(FONT_DIR, "JetBrainsMono-Medium.ttf"), "JetBrainsMono");
  fontsReady = true;
}

function splitBrand(name: string): { prefix: string; suffix: string } {
  const m = name.match(/^(.*?)(index)$/i);
  if (m) return { prefix: m[1], suffix: m[2] };
  return { prefix: name, suffix: "" };
}

function roundRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function measureText(ctx: SKRSContext2D, text: string): number {
  return ctx.measureText(text).width;
}

function drawGlowBackground(ctx: SKRSContext2D, width: number, height: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  const g1 = ctx.createRadialGradient(width / 2, height * 0.35, 0, width / 2, height * 0.35, width * 0.45);
  g1.addColorStop(0, "rgba(0,229,160,0.12)");
  g1.addColorStop(1, "rgba(0,229,160,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, width, height);

  const g2 = ctx.createRadialGradient(width / 2, height * 0.9, 0, width / 2, height * 0.9, width * 0.35);
  g2.addColorStop(0, "rgba(0,229,160,0.06)");
  g2.addColorStop(1, "rgba(0,229,160,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);
}

function drawScanIcon(ctx: SKRSContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeRect(8, 8, 0, 0); // noop anchor
  ctx.beginPath();
  ctx.moveTo(8, 14); ctx.lineTo(8, 8); ctx.lineTo(14, 8);
  ctx.moveTo(30, 8); ctx.lineTo(36, 8); ctx.lineTo(36, 14);
  ctx.moveTo(36, 30); ctx.lineTo(36, 36); ctx.lineTo(30, 36);
  ctx.moveTo(14, 36); ctx.lineTo(8, 36); ctx.lineTo(8, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, 22, 9, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawImageCover(
  ctx: SKRSContext2D,
  img: Image,
  cx: number,
  cy: number,
  diameter: number,
) {
  const scale = Math.max(diameter / img.width, diameter / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function drawProgressBar(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  progress: number,
) {
  const fillW = Math.max(0, Math.min(w, (w * progress) / 100));
  roundRect(ctx, x, y, w, 18, 9);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,229,160,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (fillW > 0) {
    roundRect(ctx, x, y, fillW, 18, 9);
    const grad = ctx.createLinearGradient(x, y, x + fillW, y);
    grad.addColorStop(0, "rgba(0,229,160,0.55)");
    grad.addColorStop(0.5, ACCENT);
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function drawScoreCard(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  score: number,
  scoreFontSize: number,
) {
  const tier = scoreTier(score);
  const progress = scoreProgress(score);

  roundRect(ctx, x, y, w, h, 20);
  ctx.fillStyle = "rgba(12,14,18,0.92)";
  ctx.fill();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `500 20px JetBrainsMono`;
  ctx.fillStyle = ACCENT;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(label.toUpperCase(), x + 24, y + 34);

  ctx.font = `800 ${scoreFontSize}px InterExtraBold`;
  ctx.fillStyle = TEXT;
  const scoreY = y + 36 + scoreFontSize * 0.88;
  ctx.fillText(formatScore(score), x + 24, scoreY);

  const tierY = scoreY + scoreFontSize * 0.42 + 12;
  ctx.beginPath();
  ctx.arc(x + 29, tierY, 5, 0, Math.PI * 2);
  ctx.fillStyle = ACCENT;
  ctx.fill();

  ctx.font = "700 24px InterBold";
  ctx.fillStyle = TEXT;
  ctx.fillText(tier, x + 44, tierY + 6);

  drawProgressBar(ctx, x + 24, y + h - 40, w - 48, progress);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

export async function renderTikTokPng(input: TikTokRenderInput): Promise<Buffer> {
  ensureFonts();

  const { width, height } = EXPORT_SIZE[input.exportAspect];
  const layout = EXPORT_LAYOUT[input.exportAspect];
  const padX = input.exportAspect === "1:1" ? 40 : 48;
  const topPad = input.exportAspect === "1:1" ? 44 : 56;
  const bottomPad = input.exportAspect === "1:1" ? 40 : 56;
  const cardGap = 24;
  const cardW = (width - padX * 2 - cardGap) / 2;
  const cardH = layout.scoreCardMinHeight;
  const cardY = height - bottomPad - cardH;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  drawGlowBackground(ctx, width, height);

  const siteBoxH = layout.siteFontSize + 32;
  ctx.font = `800 ${layout.siteFontSize}px InterExtraBold`;
  const siteTextW = measureText(ctx, input.siteLabel);
  const siteBoxW = Math.min(width * 0.52, Math.max(220, siteTextW + 56));
  const siteBoxX = (width - siteBoxW) / 2;
  const siteBoxY = topPad;
  const siteTextY = siteBoxY + siteBoxH / 2 + layout.siteFontSize * 0.12;

  const headerBottom = siteBoxY + siteBoxH + 16;
  const photoR = layout.photoDiameter / 2;
  const photoCx = width / 2;
  const photoCy = headerBottom + (cardY - headerBottom) / 2;
  const iconY = siteBoxY + (siteBoxH - 44) / 2;

  drawScanIcon(ctx, padX, iconY);

  roundRect(ctx, siteBoxX, siteBoxY, siteBoxW, siteBoxH, 20);
  ctx.fillStyle = "rgba(0,229,160,0.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,229,160,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = `800 ${layout.siteFontSize}px InterExtraBold`;
  ctx.fillStyle = ACCENT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(input.siteLabel, width / 2, siteBoxY + siteBoxH / 2);

  const brand = splitBrand(input.brandName);
  ctx.font = `800 ${layout.brandFontSize}px InterExtraBold`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  if (brand.suffix) {
    const suffixW = measureText(ctx, brand.suffix);
    ctx.font = `800 ${layout.brandFontSize}px InterExtraBold`;
    const prefixW = measureText(ctx, brand.prefix);
    const totalW = prefixW + suffixW;
    const startX = width - padX - totalW;
    ctx.fillStyle = TEXT;
    ctx.textAlign = "left";
    ctx.fillText(brand.prefix, startX, siteBoxY + siteBoxH / 2);
    ctx.fillStyle = ACCENT;
    ctx.fillText(brand.suffix, startX + prefixW, siteBoxY + siteBoxH / 2);
  } else {
    ctx.fillStyle = TEXT;
    ctx.textAlign = "right";
    ctx.fillText(input.brandName, width - padX, siteBoxY + siteBoxH / 2);
  }

  ctx.beginPath();
  ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
  ctx.fillStyle = "#0C0E12";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,229,160,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
  ctx.clip();
  const img = await loadImage(input.photoDataUrl);
  drawImageCover(ctx, img, photoCx, photoCy, layout.photoDiameter);
  ctx.restore();

  drawScoreCard(ctx, padX, cardY, cardW, cardH, "Indice", input.scoreActuel, layout.scoreFontSize);
  drawScoreCard(ctx, padX + cardW + cardGap, cardY, cardW, cardH, "Potentiel", input.scorePotentiel, layout.scoreFontSize);

  return canvas.toBuffer("image/png");
}

/** Vérifie que les fichiers de fonts existent (diagnostic). */
export function assertFontsPresent(): void {
  for (const f of ["Inter-Bold.ttf", "Inter-ExtraBold.ttf", "JetBrainsMono-Medium.ttf"]) {
    readFileSync(join(FONT_DIR, f));
  }
}
