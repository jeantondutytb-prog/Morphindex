import { z } from "zod";

export const AXES = ["peau", "cernes", "pilosite", "coupe", "posture", "composition", "dents"] as const;

const score = z.number().min(0).max(10);

export const analysisSchema = z.object({
  scores: z.object({
    peau: score, cernes: score, pilosite: score, coupe: score,
    posture: score, composition: score, dents: score,
  }),
  indice_actuel: score,
  indice_atteignable: score,
  points: z.array(z.object({
    axe: z.enum(AXES),
    libelle: z.string().min(3).max(120),
    impact: z.enum(["faible", "moyen", "fort"]),
  })).min(3).max(10),
  routine_resume: z.object({
    vision: z.string().min(30).max(450),
    axes_cibles: z.array(z.enum(AXES)).min(1).max(5),
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
    axe: z.enum(AXES).nullable(),
    detail: z.string().min(20).max(350),
  })).min(6).max(30),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["scores", "indice_actuel", "indice_atteignable", "points", "routine_resume", "plan_semaines", "routine"],
  properties: {
    scores: {
      type: "object", additionalProperties: false,
      required: [...AXES],
      properties: Object.fromEntries(AXES.map((a) => [a, { type: "number" }])),
    },
    indice_actuel: { type: "number" },
    indice_atteignable: { type: "number" },
    points: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["axe", "libelle", "impact"],
        properties: {
          axe: { type: "string", enum: [...AXES] },
          libelle: { type: "string" },
          impact: { type: "string", enum: ["faible", "moyen", "fort"] },
        },
      },
    },
    routine_resume: {
      type: "object", additionalProperties: false,
      required: ["vision", "axes_cibles"],
      properties: {
        vision: { type: "string" },
        axes_cibles: { type: "array", items: { type: "string", enum: [...AXES] } },
      },
    },
    plan_semaines: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
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
        type: "object", additionalProperties: false,
        required: ["moment", "action", "produit", "frequence", "semaine_debut", "pourquoi", "axe", "detail"],
        properties: {
          moment: { type: "string", enum: ["matin", "soir", "hebdo"] },
          action: { type: "string" },
          produit: { type: ["string", "null"] },
          frequence: { type: "string" },
          semaine_debut: { type: "integer" },
          pourquoi: { type: "string" },
          axe: { type: ["string", "null"], enum: [...AXES, null] },
          detail: { type: "string" },
        },
      },
    },
  },
} as const;
