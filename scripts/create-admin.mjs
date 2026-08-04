#!/usr/bin/env node
/**
 * Crée un compte admin MorphIndex (local ou CI).
 *
 * Usage :
 *   ADMIN_EMAIL=admin@morphindex.com ADMIN_PASSWORD='...' \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/create-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL ?? "admin@morphindex.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error("Manque ADMIN_PASSWORD (8 caractères minimum)");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date().toISOString();
const onboarding = {
  objectif: "general",
  tranche_age: "25-34",
  sexe: "homme",
  phototype: 3,
  type_cheveux: "ondules",
  sensibilite: "normale",
  routine_actuelle: [],
  mode_prefere: "soft",
};

const { data: profileRow } = await admin
  .from("profiles")
  .select("id")
  .eq("email", email)
  .maybeSingle();

let userId;
let created = false;

if (profileRow) {
  userId = profileRow.id;
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("updateUser:", error.message);
    process.exit(1);
  }
  console.log("Compte existant mis à jour → admin");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error("createUser:", error?.message ?? "échec");
    process.exit(1);
  }
  userId = data.user.id;
  created = true;
  console.log("Compte créé");
}

const { error: profileErr } = await admin.from("profiles").upsert({
  id: userId,
  email,
  is_admin: true,
  age_confirmed_at: now,
  terms_accepted_at: now,
  onboarding_done_at: now,
  ...onboarding,
});
if (profileErr) {
  console.error("profiles:", profileErr.message);
  process.exit(1);
}

await admin.from("subscriptions").upsert({ user_id: userId });

console.log("\n✓ Compte admin prêt");
console.log("  Email   :", email);
console.log("  Connexion : /connexion");
console.log("  Admin   : /app/admin");
if (created) console.log("  (nouveau compte)");
