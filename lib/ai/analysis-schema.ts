import { z } from "zod";
import { DIMENSION_IDS, DOMAINS } from "@/lib/ai/dimensions";

export { DOMAINS, AXES, DIMENSION_IDS, DIMENSION_CATALOG, DIMENSION_COUNT } from "@/lib/ai/dimensions";
export type { Domain, Axe, DimensionId } from "@/lib/ai/dimensions";

const score = z.number().min(0).max(10);
const domainEnum = z.enum(DOMAINS);
const dimensionEnum = z.enum(DIMENSION_IDS);

const dimensionScore = z.object({
  id: dimensionEnum,
  score,
});

export const analysisSchema = z.object({
  scores: z.object({
    peau: score,
    cernes: score,
    pilosite: score,
    coupe: score,
    posture: score,
    composition: score,
    dents: score,
  }),
  dimensions: z.array(dimensionScore).min(70).max(90),
  indice_actuel: score,
  indice_atteignable: score,
  points: z.array(z.object({
    dimension: dimensionEnum,
    libelle: z.string().min(3).max(120),
    impact: z.enum(["faible", "moyen", "fort"]),
  })).min(5).max(15),
  routine_resume: z.object({
    vision: z.string().min(30).max(450),
    axes_cibles: z.array(domainEnum).min(1).max(5),
    dimensions_cibles: z.array(dimensionEnum).min(5).max(15),
  }),
  plan_semaines: z.array(z.object({
    semaine: z.number().int().min(1).max(4),
    titre: z.string().min(5).max(80),
    objectif: z.string().min(20).max(350),
    resultat_attendu: z.string().min(15).max(200),
  })).length(4),
  routine: z.array(z.object({
    moment: z.enum(["matin", "soir", "hebdo"]),
    action: z.string().min(3).max(200),
    produit: z.string().max(120).nullable(),
    frequence: z.string().min(1).max(60),
    semaine_debut: z.number().int().min(1).max(4),
    pourquoi: z.string().min(15).max(250),
    dimension: dimensionEnum.nullable(),
    detail: z.string().min(20).max(350),
  })).min(8).max(40),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "scores",
    "dimensions",
    "indice_actuel",
    "indice_atteignable",
    "points",
    "routine_resume",
    "plan_semaines",
    "routine",
  ],
  properties: {
    scores: {
      type: "object",
      additionalProperties: false,
      required: [...DOMAINS],
      properties: Object.fromEntries(DOMAINS.map((d) => [d, { type: "number" }])),
    },
    dimensions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score"],
        properties: {
          id: { type: "string", enum: [...DIMENSION_IDS] },
          score: { type: "number" },
        },
      },
    },
    indice_actuel: { type: "number" },
    indice_atteignable: { type: "number" },
    points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dimension", "libelle", "impact"],
        properties: {
          dimension: { type: "string", enum: [...DIMENSION_IDS] },
          libelle: { type: "string" },
          impact: { type: "string", enum: ["faible", "moyen", "fort"] },
        },
      },
    },
    routine_resume: {
      type: "object",
      additionalProperties: false,
      required: ["vision", "axes_cibles", "dimensions_cibles"],
      properties: {
        vision: { type: "string" },
        axes_cibles: { type: "array", items: { type: "string", enum: [...DOMAINS] } },
        dimensions_cibles: { type: "array", items: { type: "string", enum: [...DIMENSION_IDS] } },
      },
    },
    plan_semaines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["semaine", "titre", "objectif", "resultat_attendu"],
        properties: {
          semaine: { type: "integer" },
          titre: { type: "string" },
          objectif: { type: "string" },
          resultat_attendu: { type: "string" },
        },
      },
    },
    routine: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["moment", "action", "produit", "frequence", "semaine_debut", "pourquoi", "dimension", "detail"],
        properties: {
          moment: { type: "string", enum: ["matin", "soir", "hebdo"] },
          action: { type: "string" },
          produit: { type: ["string", "null"] },
          frequence: { type: "string" },
          semaine_debut: { type: "integer" },
          pourquoi: { type: "string" },
          dimension: { type: ["string", "null"], enum: [...DIMENSION_IDS, null] },
          detail: { type: "string" },
        },
      },
    },
  },
} as const;
