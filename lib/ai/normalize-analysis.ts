import {
  DIMENSION_CATALOG,
  type DimensionId,
  type DimensionScore,
  type Domain,
} from "@/lib/ai/dimensions";
import type { Analysis } from "@/lib/ai/analysis-schema";

const VALID_IDS = new Set<string>(DIMENSION_CATALOG.map((d) => d.id));

/** Complète les dimensions manquantes à partir des scores de domaine. */
export function normalizeDimensions(
  partial: DimensionScore[],
  domainScores: Record<Domain, number>,
): DimensionScore[] {
  const byId = new Map<string, number>();

  for (const { id, score } of partial) {
    if (VALID_IDS.has(id)) {
      byId.set(id, Math.min(10, Math.max(0, Math.round(score * 10) / 10)));
    }
  }

  DIMENSION_CATALOG.forEach((def, i) => {
    if (byId.has(def.id)) return;
    const base = domainScores[def.domain];
    const jitter = ((i * 7) % 9 - 4) / 10;
    const score = Math.min(10, Math.max(0, Math.round((base + jitter) * 10) / 10));
    byId.set(def.id, score);
  });

  return DIMENSION_CATALOG.map((d) => ({
    id: d.id as DimensionId,
    score: byId.get(d.id)!,
  }));
}

export function normalizeAnalysis(data: Analysis): Analysis {
  const dimensions = normalizeDimensions(data.dimensions, data.scores);

  const points = data.points.map((p) => ({
    ...p,
    dimension: VALID_IDS.has(p.dimension) ? p.dimension : ("peau_hydratation" as DimensionId),
  }));

  const dimensions_cibles = data.routine_resume.dimensions_cibles.filter((id) => VALID_IDS.has(id));
  const safeDimensionsCibles =
    dimensions_cibles.length >= 5
      ? dimensions_cibles
      : points.slice(0, 8).map((p) => p.dimension);

  const routine = data.routine.map((r) => ({
    ...r,
    dimension: r.dimension && VALID_IDS.has(r.dimension) ? r.dimension : null,
  }));

  return {
    ...data,
    dimensions,
    points,
    routine,
    routine_resume: {
      ...data.routine_resume,
      dimensions_cibles: safeDimensionsCibles.slice(0, 15),
    },
  };
}

/** Extrait les dimensions depuis une analyse en base (colonne ou scores imbriqués). */
export function parseStoredDimensions(analysis: {
  dimensions?: unknown;
  scores?: unknown;
}): DimensionScore[] | null {
  if (Array.isArray(analysis.dimensions) && analysis.dimensions.length > 0) {
    return analysis.dimensions as DimensionScore[];
  }
  const scores = analysis.scores as { dimensions?: DimensionScore[] } | null;
  if (Array.isArray(scores?.dimensions) && scores.dimensions.length > 0) {
    return scores.dimensions;
  }
  return null;
}

/** Payload scores sans le champ dimensions imbriqué (affichage domaines). */
export function domainScoresFromStored(scores: unknown): Record<Domain, number> | null {
  if (!scores || typeof scores !== "object") return null;
  const s = scores as Record<string, number>;
  const domains: Domain[] = ["peau", "cernes", "pilosite", "coupe", "posture", "composition", "dents"];
  if (!domains.every((d) => typeof s[d] === "number")) return null;
  return {
    peau: s.peau,
    cernes: s.cernes,
    pilosite: s.pilosite,
    coupe: s.coupe,
    posture: s.posture,
    composition: s.composition,
    dents: s.dents,
  };
}
