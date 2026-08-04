import { describe, it, expect } from "vitest";
import { canConsume, MONTHLY_QUOTA } from "./quota";

const now = new Date("2026-08-04T10:00:00Z");
const base = { status: "active", quota_used: 0, quota_reset_at: "2026-09-01T00:00:00Z" };

describe("canConsume", () => {
  it("laisse passer un abonné actif sous le quota", () => {
    expect(canConsume(base, now).ok).toBe(true);
  });

  it("bloque au-delà du quota mensuel", () => {
    expect(canConsume({ ...base, quota_used: MONTHLY_QUOTA }, now).ok).toBe(false);
  });

  it("bloque un abonnement annulé", () => {
    expect(canConsume({ ...base, status: "canceled" }, now).ok).toBe(false);
  });

  it("autorise la première analyse d'un compte non payant", () => {
    expect(canConsume({ ...base, status: null, quota_used: 0 }, now).ok).toBe(true);
  });

  it("bloque la deuxième analyse d'un compte non payant", () => {
    expect(canConsume({ ...base, status: null, quota_used: 1 }, now).ok).toBe(false);
  });

  it("remet le compteur à zéro quand la date de reset est passée", () => {
    const passe = { ...base, quota_used: MONTHLY_QUOTA, quota_reset_at: "2026-08-01T00:00:00Z" };
    expect(canConsume(passe, now).ok).toBe(true);
  });
});
