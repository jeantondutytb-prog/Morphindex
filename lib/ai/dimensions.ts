/** Sept domaines agrégés — conservés pour l'indice global et la navigation. */
export const DOMAINS = [
  "peau",
  "cernes",
  "pilosite",
  "coupe",
  "posture",
  "composition",
  "dents",
] as const;

export type Domain = (typeof DOMAINS)[number];

/** Alias rétrocompatibilité */
export const AXES = DOMAINS;
export type Axe = Domain;

export type DimensionDef = {
  id: string;
  domain: Domain;
  label: string;
};

/** ~90 dimensions actionnables — chaque entrée alimente le plan A→Z. */
export const DIMENSION_CATALOG: readonly DimensionDef[] = [
  // Peau (14)
  { id: "peau_texture", domain: "peau", label: "Texture cutanée" },
  { id: "peau_uniformite_teint", domain: "peau", label: "Uniformité du teint" },
  { id: "peau_pores", domain: "peau", label: "Pores visibles" },
  { id: "peau_brisance", domain: "peau", label: "Brillance / sébum" },
  { id: "peau_hydratation", domain: "peau", label: "Hydratation apparente" },
  { id: "peau_rougeurs", domain: "peau", label: "Rougeurs / inflammation" },
  { id: "peau_acne_active", domain: "peau", label: "Acné active" },
  { id: "peau_marques_pi", domain: "peau", label: "Marques post-inflammatoires" },
  { id: "peau_grain", domain: "peau", label: "Grain de peau" },
  { id: "peau_secheresse", domain: "peau", label: "Sécheresse / desquamation" },
  { id: "peau_eclat", domain: "peau", label: "Éclat / luminosité" },
  { id: "peau_taches", domain: "peau", label: "Taches pigmentaires" },
  { id: "peau_tiraillements", domain: "peau", label: "Tiraillements" },
  { id: "peau_cou", domain: "peau", label: "Peau du cou" },

  // Cernes & regard (12)
  { id: "cernes_coloration", domain: "cernes", label: "Coloration sous-orbitaire" },
  { id: "cernes_creux", domain: "cernes", label: "Creux sous-orbitaire" },
  { id: "cernes_poches", domain: "cernes", label: "Poches / gonflement" },
  { id: "cernes_vasculaires", domain: "cernes", label: "Cernes vasculaires (bleutées)" },
  { id: "cernes_pigmentaires", domain: "cernes", label: "Cernes pigmentaires (brunes)" },
  { id: "cernes_fatigue", domain: "cernes", label: "Signes de fatigue oculaire" },
  { id: "cernes_rides", domain: "cernes", label: "Rides périorbitaires" },
  { id: "cernes_volume", domain: "cernes", label: "Volume périorbitaire" },
  { id: "cernes_paupieres", domain: "cernes", label: "État des paupières" },
  { id: "cernes_cernes_symetrie", domain: "cernes", label: "Symétrie du regard" },
  { id: "yeux_blancheur", domain: "cernes", label: "Blancheur sclérale" },
  { id: "cernes_sommeil", domain: "cernes", label: "Traces de manque de sommeil" },

  // Pilosité (14)
  { id: "pilosite_barbe_densite", domain: "pilosite", label: "Densité barbe" },
  { id: "pilosite_barbe_uniformite", domain: "pilosite", label: "Uniformité repousse barbe" },
  { id: "pilosite_barbe_lignes", domain: "pilosite", label: "Netteté lignes de barbe" },
  { id: "pilosite_barbe_entretien", domain: "pilosite", label: "Entretien barbe" },
  { id: "pilosite_barbe_repousse", domain: "pilosite", label: "Repousse / patchs vides" },
  { id: "pilosite_duvet", domain: "pilosite", label: "Duvet / down beard" },
  { id: "pilosite_sourcils_densite", domain: "pilosite", label: "Densité sourcils" },
  { id: "pilosite_sourcils_forme", domain: "pilosite", label: "Forme sourcils" },
  { id: "pilosite_sourcils_symetrie", domain: "pilosite", label: "Symétrie sourcils" },
  { id: "pilosite_moustache", domain: "pilosite", label: "Moustache / lèvre supérieure" },
  { id: "pilosite_cils", domain: "pilosite", label: "Cils" },
  { id: "pilosite_poils_nez", domain: "pilosite", label: "Poils visibles nez" },
  { id: "pilosite_poils_oreilles", domain: "pilosite", label: "Poils oreilles" },
  { id: "pilosite_coherence_visage", domain: "pilosite", label: "Cohérence pilosité / visage" },

  // Coupe & cheveux (14)
  { id: "coupe_adaptation_visage", domain: "coupe", label: "Adéquation coupe / forme visage" },
  { id: "coupe_longueur", domain: "coupe", label: "Longueur actuelle" },
  { id: "coupe_volume", domain: "coupe", label: "Volume capillaire" },
  { id: "coupe_frisottis", domain: "coupe", label: "Frisottis / mèches rebelles" },
  { id: "coupe_pointes", domain: "coupe", label: "État des pointes" },
  { id: "coupe_racines", domain: "coupe", label: "Racines / cuir chevelu visible" },
  { id: "coupe_degrade", domain: "coupe", label: "Qualité du dégradé" },
  { id: "coupe_entretien", domain: "coupe", label: "Entretien / fraîcheur coupe" },
  { id: "coupe_implantation", domain: "coupe", label: "Implantation capillaire" },
  { id: "coupe_texture", domain: "coupe", label: "Texture cheveux" },
  { id: "coupe_brillance", domain: "coupe", label: "Brillance cheveux" },
  { id: "coupe_gonflant", domain: "coupe", label: "Gonflant / tenue coiffure" },
  { id: "coupe_fringe", domain: "coupe", label: "Frange / front" },
  { id: "coupe_proprete", domain: "coupe", label: "Propreté / lavage apparent" },

  // Posture (10)
  { id: "posture_port_tete", domain: "posture", label: "Port de tête" },
  { id: "posture_epaules", domain: "posture", label: "Position des épaules" },
  { id: "posture_nuque", domain: "posture", label: "Alignement nuque" },
  { id: "posture_avant_tete", domain: "posture", label: "Tête en avant (forward head)" },
  { id: "posture_symetrie", domain: "posture", label: "Symétrie épaules / cou" },
  { id: "posture_machoire", domain: "posture", label: "Tension mâchoire" },
  { id: "posture_dos", domain: "posture", label: "Dos (si visible)" },
  { id: "posture_cou", domain: "posture", label: "Cou / trapèzes" },
  { id: "posture_chin_tuck", domain: "posture", label: "Rétraction mentonnière" },
  { id: "posture_camera", domain: "posture", label: "Angle photo / posture caméra" },

  // Composition faciale (12)
  { id: "composition_masse_faciale", domain: "composition", label: "Masse faciale globale" },
  { id: "composition_machoire", domain: "composition", label: "Définition mâchoire" },
  { id: "composition_double_menton", domain: "composition", label: "Double menton" },
  { id: "composition_cou", domain: "composition", label: "Épaisseur du cou" },
  { id: "composition_pommettes", domain: "composition", label: "Définition pommettes" },
  { id: "composition_gonflement", domain: "composition", label: "Gonflement facial" },
  { id: "composition_retention", domain: "composition", label: "Rétention d'eau apparente" },
  { id: "composition_gras_sous_menton", domain: "composition", label: "Gras sous-menton" },
  { id: "composition_contours", domain: "composition", label: "Contours visage / mâchoire" },
  { id: "composition_buccal_fat", domain: "composition", label: "Volume joues" },
  { id: "composition_symetrie_masse", domain: "composition", label: "Répartition masse faciale" },
  { id: "composition_definition", domain: "composition", label: "Definition faciale globale" },

  // Dents & sourire (10)
  { id: "dents_alignement", domain: "dents", label: "Alignement dentaire" },
  { id: "dents_blancheur", domain: "dents", label: "Blancheur dentaire" },
  { id: "dents_gencives", domain: "dents", label: "État des gencives" },
  { id: "dents_espacement", domain: "dents", label: "Espacement / diastème" },
  { id: "dents_proprete", domain: "dents", label: "Propreté / plaque visible" },
  { id: "dents_sourire", domain: "dents", label: "Esthétique du sourire" },
  { id: "dents_levre", domain: "dents", label: "Lèvre supérieure / gum show" },
  { id: "dents_visibilite", domain: "dents", label: "Visibilité des dents" },
  { id: "dents_usure", domain: "dents", label: "Usure apparente" },
  { id: "dents_hygiene_buccale", domain: "dents", label: "Hygiène buccale globale" },

  // Transversal / entretien global (4) — domaine peau par défaut pour agrégation
  { id: "entretien_hygiene_globale", domain: "peau", label: "Hygiène / entretien global" },
  { id: "entretien_levres", domain: "peau", label: "État des lèvres" },
  { id: "entretien_oreilles", domain: "peau", label: "Propreté oreilles" },
  { id: "entretien_coherence", domain: "peau", label: "Cohérence entretien global" },
] as const;

export const DIMENSION_IDS = DIMENSION_CATALOG.map((d) => d.id) as [
  (typeof DIMENSION_CATALOG)[number]["id"],
  ...(typeof DIMENSION_CATALOG)[number]["id"][],
];

export type DimensionId = (typeof DIMENSION_IDS)[number];

export const DOMAIN_LABELS: Record<Domain, string> = {
  peau: "Peau",
  cernes: "Cernes & regard",
  pilosite: "Pilosité",
  coupe: "Coupe & cheveux",
  posture: "Posture",
  composition: "Composition faciale",
  dents: "Dents & sourire",
};

/** Alias rétrocompatibilité */
export const AXE_LABELS = DOMAIN_LABELS;

const DIMENSION_MAP = new Map(DIMENSION_CATALOG.map((d) => [d.id, d]));

export function getDimension(id: string): DimensionDef | undefined {
  return DIMENSION_MAP.get(id);
}

export function domainOfDimension(id: string): Domain | undefined {
  return DIMENSION_MAP.get(id)?.domain;
}

export function dimensionLabel(id: string): string {
  return DIMENSION_MAP.get(id)?.label ?? id.replace(/_/g, " ");
}

export const getDimensionLabel = dimensionLabel;

export function dimensionsByDomain(domain: Domain): DimensionDef[] {
  return DIMENSION_CATALOG.filter((d) => d.domain === domain);
}

export type DimensionScore = { id: DimensionId; score: number };

export function aggregateDomainScores(
  dimensions: DimensionScore[],
): Record<Domain, number> {
  const sums: Record<Domain, { total: number; count: number }> = Object.fromEntries(
    DOMAINS.map((d) => [d, { total: 0, count: 0 }]),
  ) as Record<Domain, { total: number; count: number }>;

  for (const { id, score } of dimensions) {
    const domain = domainOfDimension(id);
    if (!domain) continue;
    sums[domain].total += score;
    sums[domain].count += 1;
  }

  return Object.fromEntries(
    DOMAINS.map((d) => {
      const { total, count } = sums[d];
      const avg = count > 0 ? total / count : 5;
      return [d, Math.round(avg * 10) / 10];
    }),
  ) as Record<Domain, number>;
}

/** Liste compacte pour le prompt IA — une ligne par dimension. */
export function formatDimensionCatalogForPrompt(): string {
  return DOMAINS.map((domain) => {
    const lines = dimensionsByDomain(domain)
      .map((d) => `  - ${d.id} : ${d.label}`)
      .join("\n");
    return `### ${domain}\n${lines}`;
  }).join("\n\n");
}

export const DIMENSION_COUNT = DIMENSION_CATALOG.length;
