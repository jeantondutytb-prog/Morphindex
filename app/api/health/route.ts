import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Vérifie que la service role atteint les tables MVP (recette prod). */
export async function GET() {
  try {
    const admin = createAdminClient();
    const { error: profilesErr } = await admin.from("profiles").select("id", { head: true, count: "exact" });
    const { error: subsErr } = await admin.from("subscriptions").select("user_id", { head: true, count: "exact" });

    if (profilesErr || subsErr) {
      return NextResponse.json(
        {
          ok: false,
          profiles: profilesErr?.message ?? null,
          subscriptions: subsErr?.message ?? null,
          hint: "Appliquer supabase/migrations/0001 à 0004 dans le SQL Editor Supabase.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 503 });
  }
}
