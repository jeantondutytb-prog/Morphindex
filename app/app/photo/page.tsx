import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQuotaStatus } from "@/lib/credits/quota-status";
import { PhotoUpload } from "@/components/app/photo-upload";

export default async function PhotoPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("saved_photo_path, is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const quota = await getQuotaStatus(admin, user.id, isAdmin);

  let savedPhoto: { path: string; url: string } | null = null;
  if (profile?.saved_photo_path) {
    const { data: signed } = await admin.storage
      .from("photos")
      .createSignedUrl(profile.saved_photo_path, 3600);
    if (signed?.signedUrl) {
      savedPhoto = { path: profile.saved_photo_path, url: signed.signedUrl };
    }
  }

  return <PhotoUpload savedPhoto={savedPhoto} quota={quota} />;
}
