import { NextResponse } from "next/server";
import { signupInputSchema } from "@/lib/auth/signup-input";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const parsed = signupInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ error: "Inscription impossible." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const admin = createAdminClient();
  await admin.from("profiles")
    .update({ age_confirmed_at: now, terms_accepted_at: now })
    .eq("id", data.user.id);
  await admin.from("events")
    .insert({ user_id: data.user.id, type: "signup" });

  return NextResponse.json({ ok: true });
}
