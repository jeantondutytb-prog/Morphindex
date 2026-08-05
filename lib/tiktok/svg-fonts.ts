import { readFileSync } from "node:fs";
import { join } from "node:path";

const FONT_DIR = join(process.cwd(), "lib/tiktok/fonts");

let cachedStyle: string | null = null;

function woffDataUrl(filename: string): string {
  const buf = readFileSync(join(FONT_DIR, filename));
  return `data:font/woff;base64,${buf.toString("base64")}`;
}

/** Polices embarquées pour le rendu SVG Sharp (librsvg n'a pas les fonts système). */
export function svgEmbeddedFontStyles(): string {
  if (cachedStyle) return cachedStyle;

  const sans700 = woffDataUrl("inter-latin-700-normal.woff");
  const sans800 = woffDataUrl("inter-latin-800-normal.woff");
  const mono500 = woffDataUrl("jetbrains-mono-latin-500-normal.woff");

  cachedStyle = `
    @font-face {
      font-family: 'MI Sans';
      font-style: normal;
      font-weight: 700;
      src: url('${sans700}') format('woff');
    }
    @font-face {
      font-family: 'MI Sans';
      font-style: normal;
      font-weight: 800;
      src: url('${sans800}') format('woff');
    }
    @font-face {
      font-family: 'MI Mono';
      font-style: normal;
      font-weight: 500;
      src: url('${mono500}') format('woff');
    }
  `;

  return cachedStyle;
}

export const FONT_SANS = "MI Sans, sans-serif";
export const FONT_MONO = "MI Mono, monospace";

/** Estimation largeur texte pour centrer les boîtes CTA. */
export function estimateTextWidth(text: string, fontSize: number, factor = 0.56): number {
  return text.length * fontSize * factor;
}
