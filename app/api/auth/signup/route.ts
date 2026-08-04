import { NextResponse } from "next/server";
import { signupInputSchema } from "@/lib/auth/signup-input";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function signupErrorMessage(error: { message: string; status?: number; code?: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (msg.includes("database error") || msg.includes("saving new user")) {
    return "Erreur base de données à l'inscription — vérifie que les migrations Supabase (0001–0004) sont appliquées.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "Adresse email invalide.";
  }
  if (msg.includes("password")) {
    return "Mot de passe refusé par le serveur d'authentification.";
  }
  if (msg.includes("signups not allowed") || msg.includes("signup is disabled")) {
    return "Les inscriptions sont désactivées sur ce projet Supabase.";
  }
  return "Inscription impossible.";
}

export async function POST(req: Request) {
  const parsed = signupInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.morphindex.com";
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback/`,
    },
  });

  if (error) {
    console.error("[signup] auth.signUp:", error.message, error.status, error.code);
    return NextResponse.json({ error: signupErrorMessage(error) }, { status: 400 });
  }

  if (!data.user) {
    console.error("[signup] auth.signUp: utilisateur absent dans la réponse");
    return NextResponse.json({ error: "Inscription impossible." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { error: profileErr } = await admin.from("profiles")
    .update({ age_confirmed_at: now, terms_accepted_at: now })
    .eq("id", data.user.id);

  if (profileErr) {
    console.error("[signup] profiles.update:", profileErr.message, profileErr.code);
    return NextResponse.json(
      { error: "Compte créé mais profil introuvable — vérifie le trigger handle_new_user et les migrations." },
      { status: 500 },
    );
  }

  await admin.from("events").insert({ user_id: data.user.id, type: "signup" });

  const needsEmailConfirmation = !data.session;

  return NextResponse.json({ ok: true, needsEmailConfirmation });
}
