import { z } from "zod";

export const newPasswordSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
