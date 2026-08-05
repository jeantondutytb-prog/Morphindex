import { describe, it, expect } from "vitest";
import { parseRoutinePayload, fallbackWeekPlans } from "./data";

describe("parseRoutinePayload", () => {
  it("accepte un tableau legacy", () => {
    const items = [{ moment: "matin" as const, action: "test", produit: null, frequence: "quotidien", semaine_debut: 1 }];
    const payload = parseRoutinePayload(items);
    expect(payload.items).toHaveLength(1);
    expect(payload.plan_semaines).toBeNull();
  });

  it("accepte un objet enrichi", () => {
    const stored = {
      items: [{ moment: "matin" as const, action: "test", produit: null, frequence: "quotidien", semaine_debut: 1 }],
      plan_semaines: [{ semaine: 1, titre: "A", objectif: "Objectif de la semaine un test.", resultat_attendu: "Résultat attendu fin S1." }],
      resume: { vision: "Vision sur quatre semaines avec assez de texte.", axes_cibles: ["peau" as const] },
    };
    const payload = parseRoutinePayload(stored);
    expect(payload.items).toHaveLength(1);
    expect(payload.plan_semaines).toHaveLength(1);
    expect(payload.resume?.axes_cibles).toEqual(["peau"]);
  });
});

describe("fallbackWeekPlans", () => {
  it("génère 4 semaines", () => {
    const plans = fallbackWeekPlans([
      { moment: "matin", action: "SPF", produit: null, frequence: "quotidien", semaine_debut: 1, axe: "peau" },
      { moment: "soir", action: "Rétinol", produit: null, frequence: "quotidien", semaine_debut: 3, axe: "peau" },
    ]);
    expect(plans).toHaveLength(4);
    expect(plans[0].semaine).toBe(1);
    expect(plans[2].objectif).toMatch(/peau/i);
  });
});
