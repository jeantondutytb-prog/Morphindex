"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthInput, AuthButton, AuthError, AuthFooterLink } from "@/components/ui/auth-field";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }
    router.push("/app");
  }

  return (
    <AuthLayout title="Connexion">
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
        <div>
          <AuthInput
            label="Mot de passe"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <p className="text-right mt-2">
            <Link href="/mot-de-passe-oublie" className="text-sm text-accent hover:brightness-110 transition">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
        <AuthError message={error} />
        <AuthButton loading={loading}>{loading ? "Connexion…" : "Se connecter"}</AuthButton>
      </form>
      <AuthFooterLink>
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-accent hover:brightness-110 transition">S&apos;inscrire</Link>
      </AuthFooterLink>
    </AuthLayout>
  );
}
