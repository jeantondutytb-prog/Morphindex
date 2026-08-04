import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { blurForPaywall } from "./blur";

describe("blurForPaywall", () => {
  it("produit une image lisiblement différente de la source", async () => {
    const src = await sharp({
      create: { width: 400, height: 400, channels: 3, background: "#fff" },
    }).composite([{
      input: Buffer.from(
        `<svg width="400" height="400">${
          Array.from({ length: 20 }, (_, i) =>
            Array.from({ length: 20 }, (_, j) =>
              (i + j) % 2 ? `<rect x="${j * 20}" y="${i * 20}" width="20" height="20" fill="#000"/>` : "",
            ).join("")).join("")
        }</svg>`,
      ),
    }]).jpeg().toBuffer();

    const out = await blurForPaywall(src);
    const srcStd = (await sharp(src).stats()).channels[0].stdev;
    const outStd = (await sharp(out).stats()).channels[0].stdev;

    expect(outStd).toBeLessThan(srcStd * 0.5);
  });

  it("réduit la définition sous 400 px", async () => {
    const src = await sharp({ create: { width: 1200, height: 1200, channels: 3, background: "#777" } })
      .jpeg().toBuffer();
    const meta = await sharp(await blurForPaywall(src)).metadata();
    expect(meta.width).toBeLessThanOrEqual(400);
  });
});
