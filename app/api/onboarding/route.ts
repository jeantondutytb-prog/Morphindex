import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { onboardingSchema } from "@/lib/onboarding/schema";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const parsed = onboardingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.from("profiles").update({
    ...parsed.data,
    onboarding_done_at: new Date().toISOString(),
  }).eq("id", user.id);

  await admin.from("events").insert({ user_id: user.id, type: "onboarding_complete" });

  return NextResponse.json({ ok: true });
}
