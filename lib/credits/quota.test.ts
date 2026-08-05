import { describe, it, expect } from "vitest";
import { canConsume, FREE_ANALYSES, MONTHLY_QUOTA } from "./quota";

const now = new Date("2026-08-04T10:00:00Z");
const base = { status: "active", quota_used: 0, quota_reset_at: "2026-09-01T00:00:00Z" };

describe("canConsume", () => {
  it("bloque un abonné actif sans crédit prépayé après la 1re gratuite", () => {
    expect(canConsume({ ...base, quota_used: FREE_ANALYSES }, now).ok).toBe(false);
  });

  it("laisse passer la 1re analyse gratuite même avec abonnement actif", () => {
    expect(canConsume(base, now).ok).toBe(true);
  });

  it("bloque un abonnement annulé après la 1re gratuite", () => {
    expect(canConsume({ ...base, status: "canceled", quota_used: 1 }, now).ok).toBe(false);
  });

  it("autorise la première analyse d'un compte non payant", () => {
    expect(canConsume({ ...base, status: null, quota_used: 0 }, now).ok).toBe(true);
  });

  it("bloque la deuxième analyse d'un compte non payant", () => {
    expect(canConsume({ ...base, status: null, quota_used: 1 }, now).ok).toBe(false);
  });

  it("autorise avec un crédit prépayé même sans abonnement", () => {
    expect(
      canConsume({ ...base, status: "canceled", quota_used: 5, prepaid_credits: 1 }, now).ok,
    ).toBe(true);
  });

  it("n'inclut plus d'analyses mensuelles dans l'abonnement", () => {
    expect(MONTHLY_QUOTA).toBe(0);
  });
});
