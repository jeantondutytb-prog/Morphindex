import { describe, it, expect } from "vitest";
import { analysisSchema } from "./analysis-schema";

const valide = {
  scores: { peau: 5.8, cernes: 4.4, pilosite: 7.9, coupe: 6.2, posture: 5.1, composition: 6.0, dents: 7.1 },
  indice_actuel: 6.4,
  indice_atteignable: 7.8,
  points: [
    { axe: "peau" as const, libelle: "hydratation de la peau", impact: "fort" as const },
    { axe: "cernes" as const, libelle: "sommeil insuffisant", impact: "moyen" as const },
    { axe: "coupe" as const, libelle: "coupe à affiner", impact: "faible" as const },
  ],
  routine: [
    { moment: "matin" as const, action: "nettoyant doux", produit: null, frequence: "quotidien", semaine_debut: 1 },
    { moment: "soir" as const, action: "crème hydratante", produit: null, frequence: "quotidien", semaine_debut: 1 },
    { moment: "matin" as const, action: "crème solaire SPF 50", produit: null, frequence: "quotidien", semaine_debut: 2 },
  ],
};

describe("analysisSchema", () => {
  it("accepte une sortie valide", () => {
    expect(analysisSchema.safeParse(valide).success).toBe(true);
  });

  it("refuse un score au-dessus de 10", () => {
    const ko = { ...valide, scores: { ...valide.scores, peau: 11 } };
    expect(analysisSchema.safeParse(ko).success).toBe(false);
  });

  it("refuse un indice négatif", () => {
    expect(analysisSchema.safeParse({ ...valide, indice_actuel: -1 }).success).toBe(false);
  });

  it("refuse une liste de points vide", () => {
    expect(analysisSchema.safeParse({ ...valide, points: [] }).success).toBe(false);
  });

  it("refuse un axe inconnu", () => {
    const ko = { ...valide, points: [{ axe: "canthal_tilt", libelle: "x", impact: "fort" }] };
    expect(analysisSchema.safeParse(ko).success).toBe(false);
  });

  it("refuse une routine vide", () => {
    expect(analysisSchema.safeParse({ ...valide, routine: [] }).success).toBe(false);
  });
});
