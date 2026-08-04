import { z } from "zod";
import { signupInputSchema } from "./signup-input";

export const newPasswordSchema = z.object({
  password: signupInputSchema.shape.password,
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
