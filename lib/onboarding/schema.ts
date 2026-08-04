import { z } from "zod";

export const onboardingSchema = z.object({
  objectif:     z.enum(["peau", "pilosite", "sommeil", "composition", "general"]),
  tranche_age:  z.enum(["18-24", "25-34", "35-44", "45+"]),
  sexe:         z.enum(["homme", "femme", "nsp"]),
  phototype:    z.number().int().min(1).max(6),
  type_cheveux: z.enum(["raides", "ondules", "boucles", "crepus"]),
  sensibilite:  z.enum(["normale", "sensible", "tres_sensible"]),
  routine_actuelle: z.array(
    z.enum(["rien", "nettoyant", "hydratant", "spf", "retinoides", "dermato"]),
  ),
  mode_prefere: z.literal("soft"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
