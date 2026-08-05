import { describe, expect, it } from "vitest";
import { formatScore, scoreProgress, scoreTier } from "@/lib/tiktok/score-tier";

describe("score-tier", () => {
  it("formats scores with comma decimal", () => {
    expect(formatScore(7.2)).toBe("7,2");
  });

  it("maps score to tier label", () => {
    expect(scoreTier(7.8)).toBe("Chad");
    expect(scoreTier(5.5)).toBe("MTN");
  });

  it("computes progress percentage", () => {
    expect(scoreProgress(7.2)).toBe(72);
  });
});
