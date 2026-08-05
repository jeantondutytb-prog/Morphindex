import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId = s.metadata!.user_id;
    const analysisId = s.metadata!.analysis_id || null;
    const formule = s.metadata!.formule;
    const intent = s.metadata!.intent ?? "subscription";

    if (intent === "new_analysis") {
      await admin.rpc("add_prepaid_credit", { p_user: userId, p_n: 1 });
      await admin.from("events").insert({
        user_id: userId,
        type: "analysis_purchased",
        payload: { formule },
      });
    } else {
      // Abonnement hebdo / annuel / à vie — débloque le rapport lié au checkout
      await admin.from("subscriptions").update({
        stripe_customer_id: s.customer as string,
        stripe_subscription_id: (s.subscription as string) ?? null,
        formule,
        status: "active",
        withdrawal_waived_at: new Date().toISOString(),
      }).eq("user_id", userId);

      if (analysisId) {
        await admin.from("analyses").update({ unlocked: true }).eq("id", analysisId);
      }

      await admin.from("events").insert({
        user_id: userId,
        type: "payment_succeeded",
        payload: { formule, analysis_id: analysisId },
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const periodEnd = sub.items?.data?.[0]?.current_period_end;
    await admin.from("subscriptions").update({
      status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at:   sub.cancel_at   ? new Date(sub.cancel_at * 1000).toISOString()   : null,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
    }).eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ received: true });
}
