"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    router.refresh();
    router.push("/app");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-extrabold mb-8 inline-block">
          Morph<span className="text-accent">Index</span>
        </Link>
        <h1 className="font-display text-2xl font-extrabold mb-6">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-muted mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-text outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-muted mb-1">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-text outline-none focus:border-accent/50"
            />
          </div>
          <p className="text-right">
            <Link href="/mot-de-passe-oublie" className="text-sm text-accent underline">
              Mot de passe oublié ?
            </Link>
          </p>
          {error && <p className="text-sm text-muted">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-sm text-dim">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-accent underline">S&apos;inscrire</Link>
        </p>
      </div>
    </main>
  );
}
