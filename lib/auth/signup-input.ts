import { z } from "zod";

export const signupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
