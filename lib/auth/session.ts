import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export type UserProfile = {
  email: string;
  is_admin: boolean;
  onboarding_done_at: string | null;
  created_at: string | null;
};

/** Une seule validation JWT par requête serveur (layout + pages). */
export const getAuthUser = cache(async (): Promise<User> => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");
  return user;
});

/** Profil utilisateur mis en cache pour la durée de la requête. */
export const getUserProfile = cache(async (): Promise<UserProfile> => {
  const user = await getAuthUser();
  const supabase = await createServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, is_admin, onboarding_done_at, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("email, onboarding_done_at, created_at")
      .eq("id", user.id)
      .single();
    return {
      email: fallback?.email ?? user.email ?? "",
      is_admin: false,
      onboarding_done_at: fallback?.onboarding_done_at ?? null,
      created_at: fallback?.created_at ?? user.created_at ?? null,
    };
  }

  return {
    email: profile.email ?? user.email ?? "",
    is_admin: profile.is_admin === true,
    onboarding_done_at: profile.onboarding_done_at ?? null,
    created_at: profile.created_at ?? user.created_at ?? null,
  };
});

export async function requireAppSession() {
  const user = await getAuthUser();
  const profile = await getUserProfile();
  return {
    user,
    profile,
    email: profile.email || user.email || "",
    isAdmin: profile.is_admin,
  };
}
