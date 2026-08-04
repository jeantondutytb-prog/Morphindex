export async function blurForPaywall(buf: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buf)
    .rotate()
    .resize({ width: 380, height: 380, fit: "inside", withoutEnlargement: true })
    .blur(14)
    .jpeg({ quality: 65 })
    .toBuffer();
}
