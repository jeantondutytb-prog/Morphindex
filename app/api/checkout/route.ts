import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { PRICE_IDS, type Formule } from "@/lib/stripe/products";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const { formule, analysisId } = await req.json() as { formule: Formule; analysisId: string };
  if (!formule || !analysisId || !PRICE_IDS[formule]) {
    return NextResponse.json({ error: "paramètres invalides" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.morphindex.com";

  const session = await getStripe().checkout.sessions.create({
    mode: formule === "vie" ? "payment" : "subscription",
    line_items: [{ price: PRICE_IDS[formule], quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id, formule, analysis_id: analysisId },
    locale: "fr",
    success_url: `${siteUrl}/app/rapport/${analysisId}?ok=1`,
    cancel_url: `${siteUrl}/app/rapport/${analysisId}`,
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message:
          "J'accepte que le contenu numérique soit livré immédiatement et je renonce " +
          "expressément à mon droit de rétractation de 14 jours.",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
