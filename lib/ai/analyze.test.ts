import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { OnboardingData } from "@/lib/onboarding/schema";

const profile: OnboardingData = {
  objectif: "peau",
  tranche_age: "25-34",
  sexe: "homme",
  phototype: 3,
  type_cheveux: "ondules",
  sensibilite: "normale",
  routine_actuelle: ["nettoyant"],
  mode_prefere: "soft",
};

describe("validateFakeAnalysisEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("lève une erreur si MORPHINDEX_FAKE_ANALYSIS=1 en production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MORPHINDEX_FAKE_ANALYSIS", "1");
    const { validateFakeAnalysisEnv } = await import("./analyze");
    expect(() => validateFakeAnalysisEnv()).toThrow(/interdit.*production/i);
  });
});

describe("runAnalysis mode factice", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renvoie une analyse factice après 2 s quand le mode est activé", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MORPHINDEX_FAKE_ANALYSIS", "1");
    const { runAnalysis } = await import("./analyze");

    const promise = runAnalysis("fake-base64", profile);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cacheRead).toBe(0);
      expect(result.data.points).toHaveLength(5);
      expect(result.data.dimensions).toHaveLength(90);
      expect(result.data.points[0].impact).toBe("fort");
      expect(result.data.points[1].impact).toBe("fort");
      expect(result.data.points[4].impact).toBe("faible");
    }
  });

  it("ne renvoie pas de données factices en production même si MORPHINDEX_FAKE_ANALYSIS=1", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MORPHINDEX_FAKE_ANALYSIS", "1");
    const { runAnalysis, validateFakeAnalysisEnv } = await import("./analyze");

    expect(() => validateFakeAnalysisEnv()).toThrow();
    await expect(runAnalysis("fake-base64", profile)).rejects.toThrow(/interdit.*production/i);
  });
});
