import { NextResponse } from "next/server";
import { signupInputSchema } from "@/lib/auth/signup-input";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function authErrorMessage(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("already") && (msg.includes("registered") || msg.includes("exists"))) {
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
  return "Inscription impossible.";
}

export async function POST(req: Request) {
  const parsed = signupInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const admin = createAdminClient();

  // Inscription server-side : évite les cas où auth.signUp renvoie user=null
  // (confirmation email, redirect URL) tout en passant par le trigger Postgres.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created.user) {
    console.error("[signup] admin.createUser:", createErr?.message);
    return NextResponse.json(
      { error: authErrorMessage(createErr?.message ?? "création impossible") },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { error: profileErr } = await admin.from("profiles")
    .update({ age_confirmed_at: now, terms_accepted_at: now })
    .eq("id", created.user.id);

  if (profileErr) {
    console.error("[signup] profiles.update:", profileErr.message, profileErr.code);
    return NextResponse.json(
      { error: "Compte créé mais profil introuvable — vérifie le trigger handle_new_user." },
      { status: 500 },
    );
  }

  await admin.from("events").insert({ user_id: created.user.id, type: "signup" });

  // Session cookie pour enchaîner vers /onboarding sans repasser par la connexion.
  const supabase = await createServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    console.error("[signup] signInWithPassword:", signInErr.message);
    return NextResponse.json({ ok: true, needsLogin: true });
  }

  return NextResponse.json({ ok: true, needsEmailConfirmation: false });
}
