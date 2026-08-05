import { describe, expect, it, vi } from "vitest";
import { fulfillCheckoutSession } from "./fulfill-checkout";

function mockAdmin(opts: {
  alreadyFulfilled?: boolean;
  rpcError?: string;
  subError?: string;
  unlockError?: string;
  eventError?: string;
}) {
  const eventTypes: string[] = [];

  const from = vi.fn((table: string) => {
    if (table === "events") {
      return {
        select: () => ({
          eq: () => ({
            contains: () => ({
              limit: () => ({
                maybeSingle: async () =>
                  opts.alreadyFulfilled ? { data: { id: 1 } } : { data: null },
              }),
            }),
          }),
        }),
        insert: async (row: { type: string }) => {
          if (opts.eventError && eventTypes.length > 0) {
            return { error: { message: opts.eventError } };
          }
          eventTypes.push(row.type);
          return { error: null };
        },
      };
    }

    if (table === "subscriptions") {
      return {
        update: () => ({
          eq: async () =>
            opts.subError ? { error: { message: opts.subError } } : { error: null },
        }),
      };
    }

    if (table === "analyses") {
      return {
        update: () => ({
          eq: () => ({
            eq: async () =>
              opts.unlockError ? { error: { message: opts.unlockError } } : { error: null },
          }),
        }),
      };
    }

    throw new Error(`unexpected table ${table}`);
  });

  const rpc = vi.fn(async () =>
    opts.rpcError ? { error: { message: opts.rpcError } } : { error: null },
  );

  return { from, rpc, eventTypes };
}

describe("fulfillCheckoutSession", () => {
  it("ignore les sessions déjà traitées", async () => {
    const admin = mockAdmin({ alreadyFulfilled: true });
    const result = await fulfillCheckoutSession(admin as never, {
      id: "cs_test_1",
      payment_status: "paid",
      metadata: { user_id: "u1", formule: "hebdo", intent: "subscription" },
    } as never);

    expect(result).toEqual({ ok: true, alreadyProcessed: true, intent: "subscription" });
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("active un abonnement et débloque le rapport", async () => {
    const admin = mockAdmin({});
    const result = await fulfillCheckoutSession(admin as never, {
      id: "cs_test_2",
      payment_status: "paid",
      customer: "cus_1",
      subscription: "sub_1",
      metadata: {
        user_id: "u1",
        formule: "annuel",
        intent: "subscription",
        analysis_id: "a1",
      },
    } as never);

    expect(result).toEqual({ ok: true, alreadyProcessed: false, intent: "subscription" });
    expect(admin.eventTypes).toEqual(["payment_succeeded", "checkout_fulfilled"]);
  });

  it("ajoute un crédit prépayé pour une nouvelle analyse", async () => {
    const admin = mockAdmin({});
    const result = await fulfillCheckoutSession(admin as never, {
      id: "cs_test_3",
      payment_status: "paid",
      metadata: { user_id: "u1", formule: "analyse", intent: "new_analysis" },
    } as never);

    expect(result).toEqual({ ok: true, alreadyProcessed: false, intent: "new_analysis" });
    expect(admin.rpc).toHaveBeenCalledWith("add_prepaid_credit", { p_user: "u1", p_n: 1 });
  });

  it("refuse un paiement non confirmé", async () => {
    const admin = mockAdmin({});
    const result = await fulfillCheckoutSession(admin as never, {
      id: "cs_test_4",
      payment_status: "unpaid",
      metadata: { user_id: "u1", formule: "hebdo" },
    } as never);

    expect(result).toEqual({ ok: false, error: "paiement non confirmé" });
  });
});
