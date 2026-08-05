import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { assertFontsPresent, renderTikTokPng } from "@/lib/tiktok/render-png";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const INPUT = {
  photoDataUrl: TINY_PNG,
  exportAspect: "1:1" as const,
  brandName: "MorphIndex",
  siteLabel: "morphindex.com",
  scoreActuel: 6.4,
  scorePotentiel: 7.8,
};

async function countColorPixels(
  png: Buffer,
  region: { left: number; top: number; width: number; height: number },
  target: [number, number, number],
): Promise<number> {
  const { data } = await sharp(png)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let count = 0;
  for (let i = 0; i < data.length; i += 3) {
    const dr = Math.abs(data[i] - target[0]);
    const dg = Math.abs(data[i + 1] - target[1]);
    const db = Math.abs(data[i + 2] - target[2]);
    if (dr <= 30 && dg <= 30 && db <= 30) count++;
  }
  return count;
}

describe("renderTikTokPng", () => {
  it("loads font files", () => {
    expect(() => assertFontsPresent()).not.toThrow();
  });

  it("renders visible text pixels in the PNG", async () => {
    const png = await renderTikTokPng(INPUT);

    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.length).toBeGreaterThan(50_000);

    const greenCta = await countColorPixels(png, { left: 350, top: 50, width: 380, height: 70 }, [0, 229, 160]);
    expect(greenCta).toBeGreaterThan(100);

    const whiteScore = await countColorPixels(png, { left: 60, top: 820, width: 220, height: 100 }, [245, 246, 247]);
    expect(whiteScore).toBeGreaterThan(80);

    // Score « 6,4 » — vérifie chiffres + virgule
    const scoreArea = await countColorPixels(png, { left: 60, top: 850, width: 120, height: 80 }, [245, 246, 247]);
    expect(scoreArea).toBeGreaterThan(30);
  });
});
