import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = new Set([
  "hardmaxing_interest",
  "onboarding_step",
  "paywall_viewed",
  "checkout_started",
  "photo_uploaded",
]);

export async function POST(req: Request) {
  const body = await req.json();
  const { type, payload } = body;

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "type invalide" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  await admin.from("events").insert({
    user_id: user?.id ?? null,
    type,
    payload: payload ?? {},
  });

  return NextResponse.json({ ok: true });
}
