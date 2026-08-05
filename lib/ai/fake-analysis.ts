import {
  DIMENSION_CATALOG,
  DOMAIN_LABELS,
  dimensionLabel,
  domainOfDimension,
  type Domain,
  type DimensionId,
} from "@/lib/ai/dimensions";
import type { Analysis } from "@/lib/ai/analysis-schema";

const DOMAIN_SCORES: Record<Domain, number> = {
  peau: 5.8,
  cernes: 4.4,
  pilosite: 7.9,
  coupe: 6.2,
  posture: 5.1,
  composition: 6.0,
  dents: 7.1,
};

function fakeDimensionScores(): Analysis["dimensions"] {
  return DIMENSION_CATALOG.map((d, i) => {
    const base = DOMAIN_SCORES[d.domain];
    const jitter = ((i * 7) % 11 - 5) / 10;
    const score = Math.min(10, Math.max(0, Math.round((base + jitter) * 10) / 10));
    return { id: d.id as DimensionId, score };
  });
}

export function buildFakeAnalysisData(): Analysis {
  const dimensions = fakeDimensionScores();

  return {
    scores: { ...DOMAIN_SCORES },
    dimensions,
    indice_actuel: 6.4,
    indice_atteignable: 7.8,
    points: [
      { dimension: "peau_hydratation", libelle: "hydratation insuffisante de la peau", impact: "fort" },
      { dimension: "cernes_coloration", libelle: "coloration sous-orbitaire visible", impact: "fort" },
      { dimension: "coupe_adaptation_visage", libelle: "coupe peu adaptée à la forme du visage", impact: "moyen" },
      { dimension: "posture_avant_tete", libelle: "port de tête légèrement avancé", impact: "moyen" },
      { dimension: "pilosite_barbe_lignes", libelle: "lignes de barbe irrégulières", impact: "faible" },
    ],
    routine_resume: {
      vision:
        "Sur 4 semaines, tu stabilises ta barrière cutanée (peau_hydratation 5,3), tu attaques la coloration sous les yeux (cernes_coloration 4,1), et tu corriges coupe et posture pour rapprocher ton indice de 7,8. Plan construit sur 90 dimensions — aucun résultat garanti.",
      axes_cibles: ["peau", "cernes", "coupe", "posture"],
      dimensions_cibles: [
        "peau_hydratation",
        "peau_texture",
        "cernes_coloration",
        "cernes_vasculaires",
        "coupe_adaptation_visage",
        "posture_avant_tete",
        "pilosite_barbe_lignes",
      ],
    },
    plan_semaines: [
      {
        semaine: 1,
        titre: "Barrière cutanée + habitudes",
        objectif:
          "Poser nettoyage et hydratation ciblant peau_hydratation et peau_texture, sans tout recommencer puisque tu utilises déjà un nettoyant.",
        resultat_attendu: "Peau confortable le matin, SPF systématique, barbe délimitée (pilosite_barbe_lignes).",
      },
      {
        semaine: 2,
        titre: "Éclat et cernes",
        objectif:
          "Vitamine C + soin caféine pour cernes_coloration et cernes_vasculaires (scores < 4,5).",
        resultat_attendu: "Teint plus homogène, contour des yeux moins marqué au réveil.",
      },
      {
        semaine: 3,
        titre: "Renouvellement ciblé",
        objectif:
          "Rétinaldéhyde pour peau_texture, chin tucks pour posture_avant_tete, entretien barbe.",
        resultat_attendu: "Texture affinée, barbe nette, nuque dégagée.",
      },
      {
        semaine: 4,
        titre: "Consolidation",
        objectif: "Soins hebdo peau + consultation coiffeur pour coupe_adaptation_visage.",
        resultat_attendu: "Routine fluide < 15 min, gains stables sur les dimensions ciblées.",
      },
    ],
    routine: [
      {
        moment: "matin",
        action: "Nettoyer avec nettoyant doux pH 5,5",
        produit: "nettoyant doux pH 5,5",
        frequence: "quotidien",
        semaine_debut: 1,
        pourquoi: "Score peau_hydratation bas — un nettoyage agressif aggraverait les tiraillements.",
        dimension: "peau_hydratation",
        detail: "30 s de massage sur peau humide, rincer à l'eau tiède, tamponner sans frotter.",
      },
      {
        moment: "matin",
        action: "Appliquer crème solaire SPF 50 fluide",
        produit: "crème solaire SPF 50 texture fluide",
        frequence: "quotidien",
        semaine_debut: 1,
        pourquoi: "Protège peau_marques_pi et prépare l'introduction des actifs.",
        dimension: "peau_marques_pi",
        detail: "2 doigts sur visage et cou, réappliquer si exposition > 2 h.",
      },
      {
        moment: "soir",
        action: "Hydrater avec crème légère non comédogène",
        produit: "crème hydratante légère",
        frequence: "quotidien",
        semaine_debut: 1,
        pourquoi: "Cible directement peau_hydratation (5,3/10).",
        dimension: "peau_hydratation",
        detail: "Noisette sur peau humide, étaler du centre vers l'extérieur.",
      },
      {
        moment: "hebdo",
        action: "Redessiner la ligne de barbe et nuque",
        produit: null,
        frequence: "2× par semaine",
        semaine_debut: 1,
        pourquoi: "pilosite_barbe_lignes faible — contour net structure le visage.",
        dimension: "pilosite_barbe_lignes",
        detail: "Ligne joues au zygomatique, nuque 2 cm au-dessus de la pomme d'Adam.",
      },
      {
        moment: "matin",
        action: "Sérum vitamine C 10 %",
        produit: "sérum vitamine C 10 %",
        frequence: "quotidien",
        semaine_debut: 2,
        pourquoi: "Améliore peau_eclat et peau_uniformite_teint.",
        dimension: "peau_eclat",
        detail: "3–4 gouttes, laisser 1 min avant SPF.",
      },
      {
        moment: "soir",
        action: "Contour des yeux caféine 5 %",
        produit: "contour des yeux caféine 5 %",
        frequence: "quotidien",
        semaine_debut: 2,
        pourquoi: "Cible cernes_coloration et cernes_vasculaires (< 4,5).",
        dimension: "cernes_coloration",
        detail: "Grain de riz par œil, tapoter avec l'annulaire.",
      },
      {
        moment: "soir",
        action: "Rétinaldéhyde 0,05 %",
        produit: "rétinaldéhyde 0,05 %",
        frequence: "3× par semaine",
        semaine_debut: 3,
        pourquoi: "peau_texture et peau_pores en dessous de la moyenne.",
        dimension: "peau_texture",
        detail: "Lun/mer/ven soir — pas le même soir que l'exfoliation.",
      },
      {
        moment: "hebdo",
        action: "Exercice posture nuque (chin tucks)",
        produit: null,
        frequence: "3× par semaine",
        semaine_debut: 3,
        pourquoi: "posture_avant_tete et posture_port_tete à corriger.",
        dimension: "posture_avant_tete",
        detail: "10 reps, menton reculé 5 s, dos droit.",
      },
      {
        moment: "hebdo",
        action: "Exfoliation enzymatique douce",
        produit: "exfoliant enzymatique doux",
        frequence: "1× par semaine",
        semaine_debut: 4,
        pourquoi: "Désobstrue peau_pores avant stabilisation long terme.",
        dimension: "peau_pores",
        detail: "Dimanche soir, 2 min max, rincer.",
      },
      {
        moment: "hebdo",
        action: "Masque hydratant 15 min",
        produit: "masque hydratant",
        frequence: "1× par semaine",
        semaine_debut: 4,
        pourquoi: "Boost hebdo peau_hydratation.",
        dimension: "peau_hydratation",
        detail: "15 min, retirer l'excédent sans rincer si gel.",
      },
    ],
  };
}

export { DOMAIN_LABELS, dimensionLabel, domainOfDimension };
