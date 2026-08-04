import { describe, it, expect } from "vitest";
import { signupInputSchema } from "./signup-input";

describe("signupInputSchema", () => {
  it("accepte email et mot de passe", () => {
    expect(signupInputSchema.safeParse({ email: "a@b.fr", password: "secret" }).success).toBe(true);
  });

  it("refuse un email invalide", () => {
    expect(signupInputSchema.safeParse({ email: "bad", password: "secret" }).success).toBe(false);
  });

  it("refuse un mot de passe vide", () => {
    expect(signupInputSchema.safeParse({ email: "a@b.fr", password: "" }).success).toBe(false);
  });
});
