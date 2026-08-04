import { z } from "zod";

export const signupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "10 caractères minimum"),
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
