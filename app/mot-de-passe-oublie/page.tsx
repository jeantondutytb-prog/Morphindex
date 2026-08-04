"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthInput, AuthButton, AuthFooterLink } from "@/components/ui/auth-field";

const CONFIRMATION =
  "Si un compte existe avec cette adresse, tu recevras un email avec un lien pour choisir un nouveau mot de passe.";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback/?next=${encodeURIComponent("/nouveau-mot-de-passe/")}`;

    await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entre l'adresse email de ton compte. On t'enverra un lien pour en choisir un nouveau."
    >
      {sent ? (
        <p className="text-sm text-muted leading-relaxed -mt-2">{CONFIRMATION}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <AuthButton loading={loading} disabled={!email}>
            {loading ? "Envoi…" : "Envoyer le lien"}
          </AuthButton>
        </form>
      )}
      <AuthFooterLink>
        <Link href="/connexion" className="text-accent hover:brightness-110 transition">Retour à la connexion</Link>
      </AuthFooterLink>
    </AuthLayout>
  );
}
