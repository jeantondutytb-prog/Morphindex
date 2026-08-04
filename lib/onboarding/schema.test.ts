import { describe, it, expect } from "vitest";
import { onboardingSchema } from "./schema";

const ok = {
  objectif: "peau", tranche_age: "25-34", sexe: "homme",
  phototype: 3, type_cheveux: "ondules", sensibilite: "normale",
  routine_actuelle: ["nettoyant"], mode_prefere: "soft",
};

describe("onboardingSchema", () => {
  it("accepte une entrée complète", () => {
    expect(onboardingSchema.safeParse(ok).success).toBe(true);
  });

  it("refuse un phototype hors de l'échelle Fitzpatrick", () => {
    expect(onboardingSchema.safeParse({ ...ok, phototype: 7 }).success).toBe(false);
  });

  it("refuse un mode autre que soft en v1", () => {
    expect(onboardingSchema.safeParse({ ...ok, mode_prefere: "hard" }).success).toBe(false);
  });
});
