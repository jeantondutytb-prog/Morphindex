import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin.from("analyses")
    .select("status, points_count, premier_point_libelle, blurred_image_path, user_id")
    .eq("id", id).single();

  if (!data || data.user_id !== user.id) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  const { data: signed } = await admin.storage
    .from("photos").createSignedUrl(data.blurred_image_path!, 300);

  return NextResponse.json({
    status: data.status,
    points_count: data.points_count,
    premier_point_libelle: data.premier_point_libelle,
    blurred_url: signed?.signedUrl ?? null,
  });
}
