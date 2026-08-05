import { describe, it, expect } from "vitest";
import { normalizeDimensions, normalizeAnalysis } from "./normalize-analysis";
import { buildFakeAnalysisData } from "./fake-analysis";

describe("normalizeDimensions", () => {
  it("complète jusqu'à 90 dimensions", () => {
    const partial = [
      { id: "peau_hydratation" as const, score: 4.2 },
      { id: "cernes_coloration" as const, score: 3.8 },
    ];
    const full = normalizeDimensions(partial, {
      peau: 5,
      cernes: 4,
      pilosite: 7,
      coupe: 6,
      posture: 5,
      composition: 6,
      dents: 7,
    });
    expect(full).toHaveLength(90);
    expect(full.find((d) => d.id === "peau_hydratation")?.score).toBe(4.2);
  });
});

describe("normalizeAnalysis", () => {
  it("normalise une analyse factice complète", () => {
    const raw = buildFakeAnalysisData();
    const normalized = normalizeAnalysis(raw);
    expect(normalized.dimensions).toHaveLength(90);
  });
});
