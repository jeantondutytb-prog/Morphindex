import type { SupabaseClient } from "@supabase/supabase-js";

const ADMIN_ONBOARDING = {
  objectif: "general" as const,
  tranche_age: "25-34" as const,
  sexe: "homme" as const,
  phototype: 3,
  type_cheveux: "ondules" as const,
  sensibilite: "normale" as const,
  routine_actuelle: [] as string[],
  mode_prefere: "soft" as const,
};

export type CreateAdminResult =
  | { ok: true; userId: string; email: string; created: boolean }
  | { ok: false; error: string };

/** Crée ou promeut un compte admin avec onboarding déjà complété. */
export async function createAdminUser(
  admin: SupabaseClient,
  email: string,
  password: string,
): Promise<CreateAdminResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || password.length < 8) {
    return { ok: false, error: "Email et mot de passe (8 car. min.) requis." };
  }

  const now = new Date().toISOString();

  const { data: profileRow } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  let userId: string;
  let created = false;

  if (profileRow) {
    userId = profileRow.id;
    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updateErr) {
      return { ok: false, error: updateErr.message };
    }
  } else {
    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email: normalized,
      password,
      email_confirm: true,
    });
    if (createErr || !createdUser.user) {
      return { ok: false, error: createErr?.message ?? "création impossible" };
    }
    userId = createdUser.user.id;
    created = true;
  }

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: userId,
    email: normalized,
    is_admin: true,
    age_confirmed_at: now,
    terms_accepted_at: now,
    onboarding_done_at: now,
    ...ADMIN_ONBOARDING,
  });

  if (profileErr) {
    return { ok: false, error: profileErr.message };
  }

  await admin.from("subscriptions").upsert({ user_id: userId });

  await admin.from("events").insert({
    user_id: userId,
    type: "admin_bootstrap",
    payload: { email: normalized },
  });

  return { ok: true, userId, email: normalized, created };
}
