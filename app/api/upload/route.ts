import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth/is-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 10 * 1024 * 1024;
const UPLOADS_PER_HOUR = 5;
const SAVED_PATH = (userId: string) => `${userId}/saved.jpg`;

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const adminUser = await isAdminUser(admin, user.id);

  if (!adminUser) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "photo_uploaded")
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= UPLOADS_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans une heure." },
        { status: 429 },
      );
    }
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Format non supporté." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (10 Mo max)." }, { status: 400 });
  }

  const path = SAVED_PATH(user.id);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from("photos").upload(path, buffer, {
    contentType: file.type === "image/png" ? "image/png" : "image/jpeg",
    upsert: true,
  });
  if (error) {
    return NextResponse.json({ error: "Upload échoué." }, { status: 500 });
  }

  await admin.from("profiles").update({ saved_photo_path: path }).eq("id", user.id);
  await admin.from("events").insert({ user_id: user.id, type: "photo_uploaded" });

  return NextResponse.json({ path });
}
