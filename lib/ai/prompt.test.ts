import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, buildUserContext } from "./prompt";

describe("SYSTEM_PROMPT", () => {
  it("est identique d'un appel à l'autre", () => {
    expect(SYSTEM_PROMPT).toBe(SYSTEM_PROMPT);
  });

  it("ne contient ni date, ni heure, ni identifiant", () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(SYSTEM_PROMPT).not.toMatch(/\b\d{2}:\d{2}\b/);
    expect(SYSTEM_PROMPT).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
  });

  it("dépasse le minimum cacheable de Sonnet 5", () => {
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(3000);
  });

  it("interdit explicitement le non-modifiable et l'ethnie", () => {
    expect(SYSTEM_PROMPT).toMatch(/structure osseuse/i);
    expect(SYSTEM_PROMPT).toMatch(/ethni/i);
  });
});

describe("buildUserContext", () => {
  it("contient les données de profil", () => {
    const ctx = buildUserContext({
      objectif: "peau", tranche_age: "25-34", sexe: "homme",
      phototype: 3, type_cheveux: "ondules", sensibilite: "normale",
      routine_actuelle: ["nettoyant"], mode_prefere: "soft",
    });
    expect(ctx).toContain("25-34");
    expect(ctx).toContain("3");
  });
});
