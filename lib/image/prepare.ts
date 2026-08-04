export const MAX_EDGE = 1568;

export async function prepareForModel(
  buf: Buffer,
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const sharp = (await import("sharp")).default;
  const out = await sharp(buf)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return { base64: out.toString("base64"), mediaType: "image/jpeg" };
}
