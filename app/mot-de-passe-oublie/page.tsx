"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-extrabold mb-8 inline-block">
          Morph<span className="text-accent">Index</span>
        </Link>
        <h1 className="font-display text-2xl font-extrabold mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-muted mb-6">
          Entre l&apos;adresse email de ton compte. On t&apos;enverra un lien pour en choisir un nouveau.
        </p>

        {sent ? (
          <p className="text-sm text-muted leading-relaxed">{CONFIRMATION}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-muted mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-text outline-none focus:border-accent/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40"
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-dim">
          <Link href="/connexion" className="text-accent underline">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
