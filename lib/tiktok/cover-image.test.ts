import { describe, expect, it } from "vitest";

/** Même logique que drawImageCover dans render-png.ts */
function coverDimensions(
  imgW: number,
  imgH: number,
  diameter: number,
): { drawW: number; drawH: number } {
  const scale = Math.max(diameter / imgW, diameter / imgH);
  return { drawW: imgW * scale, drawH: imgH * scale };
}

describe("coverDimensions", () => {
  it("scale portrait photo to cover square without stretching ratio", () => {
    const { drawW, drawH } = coverDimensions(900, 1600, 420);
    expect(drawW / drawH).toBeCloseTo(900 / 1600, 5);
    expect(drawW).toBeGreaterThanOrEqual(420);
    expect(drawH).toBeGreaterThanOrEqual(420);
  });

  it("scale landscape photo to cover square", () => {
    const { drawW, drawH } = coverDimensions(1600, 900, 420);
    expect(drawW / drawH).toBeCloseTo(1600 / 900, 5);
    expect(drawW).toBeGreaterThanOrEqual(420);
    expect(drawH).toBeGreaterThanOrEqual(420);
  });
});
