"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { newPasswordSchema } from "@/lib/auth/new-password-input";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthInput, AuthButton, AuthError, AuthFooterLink } from "@/components/ui/auth-field";

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
      setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = newPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setError("Mot de passe requis.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password });

    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe. Réessaie ou demande un nouveau lien.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (!ready) {
    return (
      <AuthLayout title="Chargement…">
        <p className="text-sm text-muted -mt-2">Vérification du lien…</p>
      </AuthLayout>
    );
  }

  if (!hasSession) {
    return (
      <AuthLayout title="Lien invalide ou expiré">
        <p className="text-sm text-muted leading-relaxed mb-6 -mt-2">
          Ouvre le lien reçu par email, ou demande-en un nouveau.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition"
        >
          Mot de passe oublié →
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisis un nouveau mot de passe pour ton compte.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Nouveau mot de passe"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <AuthError message={error} />
        <AuthButton loading={loading} disabled={!password}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </AuthButton>
      </form>
      <AuthFooterLink>
        <Link href="/connexion" className="text-accent hover:brightness-110 transition">Retour à la connexion</Link>
      </AuthFooterLink>
    </AuthLayout>
  );
}
