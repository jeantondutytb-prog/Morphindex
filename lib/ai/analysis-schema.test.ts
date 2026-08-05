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
  routine_resume: {
    vision: "En quatre semaines tu travailles peau et cernes pour rapprocher ton indice de 7,8 sans promesse de résultat garanti.",
    axes_cibles: ["peau", "cernes"] as const,
  },
  plan_semaines: [
    { semaine: 1, titre: "Bases", objectif: "Poser nettoyage et hydratation adaptés à ta peau sensible.", resultat_attendu: "Peau confortable chaque matin." },
    { semaine: 2, titre: "Cernes", objectif: "Introduire un soin caféine ciblant la coloration sous-orbitaire.", resultat_attendu: "Contour des yeux moins marqué." },
    { semaine: 3, titre: "Actifs", objectif: "Ajouter un rétinaldéhyde progressif pour la texture.", resultat_attendu: "Texture affinée sans irritation." },
    { semaine: 4, titre: "Consolidation", objectif: "Ancrer la routine avec soins hebdo.", resultat_attendu: "Routine fluide en moins de 15 min." },
  ],
  routine: [
    {
      moment: "matin" as const, action: "nettoyant doux", produit: "nettoyant pH 5,5", frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Ta peau manque d'hydratation — éviter un nettoyage agressif.", axe: "peau" as const,
      detail: "30 s sur peau humide, rincer à l'eau tiède.",
    },
    {
      moment: "soir" as const, action: "crème hydratante", produit: null, frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Compense le déficit d'hydratation identifié.", axe: "peau" as const,
      detail: "Noisette sur peau humide, étaler du centre vers l'extérieur.",
    },
    {
      moment: "matin" as const, action: "crème solaire SPF 50", produit: "SPF 50 fluide", frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Protège la peau avant l'introduction d'actifs.", axe: null,
      detail: "2 doigts de produit sur visage et cou.",
    },
    {
      moment: "matin" as const, action: "contour yeux caféine", produit: "caféine 5 %", frequence: "quotidien", semaine_debut: 2,
      pourquoi: "Cible la coloration sous-orbitaire.", axe: "cernes" as const,
      detail: "Grain de riz par œil, tapoter avec l'annulaire.",
    },
    {
      moment: "soir" as const, action: "rétinaldéhyde 0,05 %", produit: null, frequence: "3× par semaine", semaine_debut: 3,
      pourquoi: "Améliore la texture sans agressivité.", axe: "peau" as const,
      detail: "Lun/mer/ven soir, après nettoyage.",
    },
    {
      moment: "hebdo" as const, action: "masque hydratant", produit: "masque gel", frequence: "1× par semaine", semaine_debut: 4,
      pourquoi: "Boost hebdo pour sceller l'hydratation.", axe: "peau" as const,
      detail: "15 min, retirer l'excédent sans rincer.",
    },
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

  it("refuse une routine sans pourquoi", () => {
    const ko = {
      ...valide,
      routine: [{ ...valide.routine[0], pourquoi: "court" }],
    };
    expect(analysisSchema.safeParse(ko).success).toBe(false);
  });

  it("exige exactement 4 semaines dans plan_semaines", () => {
    expect(analysisSchema.safeParse({ ...valide, plan_semaines: valide.plan_semaines.slice(0, 3) }).success).toBe(false);
  });
});
