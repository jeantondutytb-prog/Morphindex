import { describe, it, expect } from "vitest";
import {
  DIMENSION_CATALOG,
  DIMENSION_COUNT,
  aggregateDomainScores,
  dimensionLabel,
  dimensionsByDomain,
} from "./dimensions";

describe("dimensions catalog", () => {
  it("contient environ 90 dimensions", () => {
    expect(DIMENSION_COUNT).toBeGreaterThanOrEqual(85);
    expect(DIMENSION_COUNT).toBeLessThanOrEqual(100);
  });

  it("a des ids uniques", () => {
    const ids = DIMENSION_CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("agrège les scores par domaine", () => {
    const dims = dimensionsByDomain("peau").slice(0, 3).map((d, i) => ({ id: d.id, score: 4 + i }));
    const agg = aggregateDomainScores(dims);
    expect(agg.peau).toBeGreaterThan(4);
  });

  it("retourne un libellé lisible", () => {
    expect(dimensionLabel("peau_hydratation")).toMatch(/hydrat/i);
  });
});
