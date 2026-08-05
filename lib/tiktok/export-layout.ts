export type ExportAspect = "1:1" | "2:3";

export const EXPORT_SIZE: Record<ExportAspect, { width: number; height: number }> = {
  "1:1": { width: 1080, height: 1080 },
  "2:3": { width: 1080, height: 1620 },
};

/** Mise en page interne selon le format d'export (photo toujours en cercle). */
export const EXPORT_LAYOUT: Record<
  ExportAspect,
  {
    photoDiameter: number;
    headerPad: string;
    portraitPad: string;
    scorePad: string;
    brandFontSize: number;
    siteFontSize: number;
    scoreFontSize: number;
    scoreCardMinHeight: number;
  }
> = {
  "1:1": {
    photoDiameter: 420,
    headerPad: "40px 40px 0",
    portraitPad: "24px 40px",
    scorePad: "0 40px 40px",
    brandFontSize: 36,
    siteFontSize: 42,
    scoreFontSize: 60,
    scoreCardMinHeight: 200,
  },
  "2:3": {
    photoDiameter: 520,
    headerPad: "56px 48px 0",
    portraitPad: "40px 48px",
    scorePad: "0 48px 56px",
    brandFontSize: 44,
    siteFontSize: 52,
    scoreFontSize: 72,
    scoreCardMinHeight: 240,
  },
};
