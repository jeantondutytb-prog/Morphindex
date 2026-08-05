import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfill-checkout";

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
    const result = await fulfillCheckoutSession(admin, event.data.object);
    if (!result.ok) {
      console.error("[stripe/webhook] checkout.session.completed", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const periodEnd = sub.items?.data?.[0]?.current_period_end;
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      })
      .eq("stripe_subscription_id", sub.id);

    if (error) {
      console.error("[stripe/webhook] subscription update", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
