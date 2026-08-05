import { describe, it, expect } from "vitest";
import { analysisSchema } from "./analysis-schema";
import { DIMENSION_CATALOG } from "./dimensions";

const valide = {
  scores: { peau: 5.8, cernes: 4.4, pilosite: 7.9, coupe: 6.2, posture: 5.1, composition: 6.0, dents: 7.1 },
  dimensions: DIMENSION_CATALOG.map((d, i) => ({
    id: d.id,
    score: Math.min(10, 5 + (i % 5) * 0.3),
  })),
  indice_actuel: 6.4,
  indice_atteignable: 7.8,
  points: [
    { dimension: "peau_hydratation" as const, libelle: "hydratation de la peau", impact: "fort" as const },
    { dimension: "cernes_coloration" as const, libelle: "sommeil insuffisant", impact: "moyen" as const },
    { dimension: "coupe_adaptation_visage" as const, libelle: "coupe à affiner", impact: "faible" as const },
    { dimension: "peau_texture" as const, libelle: "texture à affiner", impact: "moyen" as const },
    { dimension: "posture_avant_tete" as const, libelle: "tête en avant", impact: "faible" as const },
  ],
  routine_resume: {
    vision: "En quatre semaines tu travailles peau_hydratation et cernes_coloration pour rapprocher ton indice de 7,8 sans promesse de résultat garanti.",
    axes_cibles: ["peau", "cernes"] as const,
    dimensions_cibles: ["peau_hydratation", "cernes_coloration", "peau_texture", "cernes_vasculaires", "coupe_adaptation_visage"],
  },
  plan_semaines: [
    { semaine: 1, titre: "Bases", objectif: "Poser nettoyage et hydratation adaptés à peau_hydratation.", resultat_attendu: "Peau confortable chaque matin." },
    { semaine: 2, titre: "Cernes", objectif: "Introduire un soin caféine ciblant cernes_coloration.", resultat_attendu: "Contour des yeux moins marqué." },
    { semaine: 3, titre: "Actifs", objectif: "Ajouter un rétinaldéhyde pour peau_texture.", resultat_attendu: "Texture affinée sans irritation." },
    { semaine: 4, titre: "Consolidation", objectif: "Ancrer la routine avec soins hebdo.", resultat_attendu: "Routine fluide en moins de 15 min." },
  ],
  routine: [
    {
      moment: "matin" as const, action: "nettoyant doux", produit: "nettoyant pH 5,5", frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Ta peau manque d'hydratation — éviter un nettoyage agressif.", dimension: "peau_hydratation" as const,
      detail: "30 s sur peau humide, rincer à l'eau tiède.",
    },
    {
      moment: "soir" as const, action: "crème hydratante", produit: null, frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Compense le déficit d'hydratation identifié.", dimension: "peau_hydratation" as const,
      detail: "Noisette sur peau humide, étaler du centre vers l'extérieur.",
    },
    {
      moment: "matin" as const, action: "crème solaire SPF 50", produit: "SPF 50 fluide", frequence: "quotidien", semaine_debut: 1,
      pourquoi: "Protège la peau avant l'introduction d'actifs.", dimension: null,
      detail: "2 doigts de produit sur visage et cou.",
    },
    {
      moment: "matin" as const, action: "contour yeux caféine", produit: "caféine 5 %", frequence: "quotidien", semaine_debut: 2,
      pourquoi: "Cible cernes_coloration.", dimension: "cernes_coloration" as const,
      detail: "Grain de riz par œil, tapoter avec l'annulaire.",
    },
    {
      moment: "soir" as const, action: "rétinaldéhyde 0,05 %", produit: null, frequence: "3× par semaine", semaine_debut: 3,
      pourquoi: "Améliore peau_texture.", dimension: "peau_texture" as const,
      detail: "Lun/mer/ven soir, après nettoyage.",
    },
    {
      moment: "hebdo" as const, action: "masque hydratant", produit: "masque gel", frequence: "1× par semaine", semaine_debut: 4,
      pourquoi: "Boost hebdo peau_hydratation.", dimension: "peau_hydratation" as const,
      detail: "15 min, retirer l'excédent sans rincer.",
    },
    {
      moment: "hebdo" as const, action: "chin tucks", produit: null, frequence: "3× par semaine", semaine_debut: 3,
      pourquoi: "Corrige posture_avant_tete.", dimension: "posture_avant_tete" as const,
      detail: "10 répétitions, 5 s par rep.",
    },
    {
      moment: "hebdo" as const, action: "ligne barbe", produit: null, frequence: "2× par semaine", semaine_debut: 2,
      pourquoi: "pilosite_barbe_lignes irrégulières.", dimension: "pilosite_barbe_lignes" as const,
      detail: "Contours joues et nuque.",
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

  it("refuse moins de 25 dimensions", () => {
    expect(analysisSchema.safeParse({ ...valide, dimensions: valide.dimensions.slice(0, 20) }).success).toBe(false);
  });

  it("refuse une dimension inconnue", () => {
    const ko = {
      ...valide,
      dimensions: [...valide.dimensions.slice(0, 69), { id: "inconnu_xyz", score: 5 }],
    };
    expect(analysisSchema.safeParse(ko).success).toBe(false);
  });

  it("refuse une routine vide", () => {
    expect(analysisSchema.safeParse({ ...valide, routine: [] }).success).toBe(false);
  });
});
