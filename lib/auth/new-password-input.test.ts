import { describe, it, expect } from "vitest";
import { newPasswordSchema } from "./new-password-input";

describe("newPasswordSchema", () => {
  it("accepte un mot de passe de 10 caractères ou plus", () => {
    expect(newPasswordSchema.safeParse({ password: "0123456789" }).success).toBe(true);
  });

  it("refuse un mot de passe de moins de 10 caractères", () => {
    expect(newPasswordSchema.safeParse({ password: "123456789" }).success).toBe(false);
  });

  it("refuse un mot de passe vide", () => {
    expect(newPasswordSchema.safeParse({ password: "" }).success).toBe(false);
  });
});
