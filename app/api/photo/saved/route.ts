import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Retourne la photo enregistrée de l'utilisateur (réutilisable sans re-upload). */
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("saved_photo_path")
    .eq("id", user.id)
    .single();

  if (!profile?.saved_photo_path) {
    return NextResponse.json({ saved: false });
  }

  const { data: signed } = await admin.storage
    .from("photos")
    .createSignedUrl(profile.saved_photo_path, 3600);

  if (!signed?.signedUrl) {
    return NextResponse.json({ saved: false });
  }

  return NextResponse.json({
    saved: true,
    path: profile.saved_photo_path,
    url: signed.signedUrl,
  });
}
