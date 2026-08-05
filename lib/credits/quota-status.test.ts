import { describe, it, expect } from "vitest";
import { getQuotaStatus } from "./quota-status";

describe("getQuotaStatus", () => {
  it("retourne illimité pour admin", async () => {
    const status = await getQuotaStatus({} as never, "user-1", true);
    expect(status.unlimited).toBe(true);
    expect(status.canAnalyze).toBe(true);
    expect(status.label).toMatch(/illimit/i);
  });
});
