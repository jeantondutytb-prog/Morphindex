import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { prepareForModel } from "./prepare";

async function makeImage(w: number, h: number) {
  return sharp({ create: { width: w, height: h, channels: 3, background: "#888" } })
    .jpeg().toBuffer();
}

describe("prepareForModel", () => {
  it("ramène le grand côté à 1568 px", async () => {
    const { base64 } = await prepareForModel(await makeImage(3000, 2000));
    const meta = await sharp(Buffer.from(base64, "base64")).metadata();
    expect(meta.width).toBe(1568);
    expect(meta.height).toBe(1045);
  });

  it("n'agrandit pas une image déjà plus petite", async () => {
    const { base64 } = await prepareForModel(await makeImage(800, 600));
    const meta = await sharp(Buffer.from(base64, "base64")).metadata();
    expect(meta.width).toBe(800);
  });

  it("sort toujours du JPEG", async () => {
    const { base64, mediaType } = await prepareForModel(await makeImage(2000, 2000));
    expect(mediaType).toBe("image/jpeg");
    expect((await sharp(Buffer.from(base64, "base64")).metadata()).format).toBe("jpeg");
  });
});
