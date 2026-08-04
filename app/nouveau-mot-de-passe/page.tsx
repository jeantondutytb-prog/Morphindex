"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { newPasswordSchema } from "@/lib/auth/new-password-input";

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
      setError("10 caractères minimum.");
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
      <main className="min-h-screen flex items-center justify-center px-5">
        <p className="text-sm text-muted">Chargement…</p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="font-display text-xl font-extrabold mb-8 inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>
          <h1 className="font-display text-2xl font-extrabold mb-4">Lien invalide ou expiré</h1>
          <p className="text-sm text-muted mb-6">
            Ouvre le lien reçu par email, ou demande-en un nouveau.
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="text-sm text-accent underline"
          >
            Mot de passe oublié
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-extrabold mb-8 inline-block">
          Morph<span className="text-accent">Index</span>
        </Link>
        <h1 className="font-display text-2xl font-extrabold mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-muted mb-6">Choisis un mot de passe d&apos;au moins 10 caractères.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-muted mb-1">
              Nouveau mot de passe (10 caractères min.)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-text outline-none focus:border-accent/50"
            />
          </div>
          {error && <p className="text-sm text-muted">{error}</p>}
          <button
            type="submit"
            disabled={loading || password.length < 10}
            className="w-full rounded-lg bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>

        <p className="mt-6 text-sm text-dim">
          <Link href="/connexion" className="text-accent underline">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
