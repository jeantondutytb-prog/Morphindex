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
  routine: z.array(z.object({
    moment: z.enum(["matin", "soir", "hebdo"]),
    action: z.string().min(3).max(200),
    produit: z.string().max(120).nullable(),
    frequence: z.string().min(1).max(60),
    semaine_debut: z.number().int().min(1).max(52),
  })).min(3).max(30),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["scores", "indice_actuel", "indice_atteignable", "points", "routine"],
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
    routine: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["moment", "action", "produit", "frequence", "semaine_debut"],
        properties: {
          moment: { type: "string", enum: ["matin", "soir", "hebdo"] },
          action: { type: "string" },
          produit: { type: ["string", "null"] },
          frequence: { type: "string" },
          semaine_debut: { type: "integer" },
        },
      },
    },
  },
} as const;
