import { describe, expect, it } from "vitest";
import { renderTikTokPng } from "@/lib/tiktok/render-png";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("renderTikTokPng", () => {
  it("returns a non-empty PNG buffer", async () => {
    const buf = await renderTikTokPng({
      photoDataUrl: TINY_PNG,
      exportAspect: "1:1",
      brandName: "MorphIndex",
      siteLabel: "morphindex.com",
      scoreActuel: 6.4,
      scorePotentiel: 7.8,
    });

    expect(buf.length).toBeGreaterThan(5000);
    expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
});
