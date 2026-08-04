import { describe, it, expect } from "vitest";
import { signupInputSchema } from "./signup-input";

const base = { email: "a@b.fr", password: "0123456789", ageConfirmed: true, termsAccepted: true };

describe("signupInputSchema", () => {
  it("accepte une entrée complète", () => {
    expect(signupInputSchema.safeParse(base).success).toBe(true);
  });

  it("refuse si la case 18+ n'est pas cochée", () => {
    const r = signupInputSchema.safeParse({ ...base, ageConfirmed: false });
    expect(r.success).toBe(false);
  });

  it("refuse si les CGU ne sont pas acceptées", () => {
    const r = signupInputSchema.safeParse({ ...base, termsAccepted: false });
    expect(r.success).toBe(false);
  });

  it("refuse un mot de passe de moins de 10 caractères", () => {
    const r = signupInputSchema.safeParse({ ...base, password: "123456789" });
    expect(r.success).toBe(false);
  });
});
