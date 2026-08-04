import { describe, it, expect } from "vitest";
import { newPasswordSchema } from "./new-password-input";

describe("newPasswordSchema", () => {
  it("accepte un mot de passe non vide", () => {
    expect(newPasswordSchema.safeParse({ password: "secret" }).success).toBe(true);
  });

  it("refuse un mot de passe vide", () => {
    expect(newPasswordSchema.safeParse({ password: "" }).success).toBe(false);
  });
});
