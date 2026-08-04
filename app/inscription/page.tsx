"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const canSubmit = ageConfirmed && termsAccepted && email && password.length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ageConfirmed, termsAccepted }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      setLoading(false);
      return;
    }
    if (data.needsEmailConfirmation || data.needsLogin) {
      setError("");
      setLoading(false);
      if (data.needsEmailConfirmation) {
        setEmailSent(true);
      } else {
        router.push("/connexion");
      }
      return;
    }
    router.push("/onboarding");
  }

  if (emailSent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="font-display text-xl font-extrabold mb-8 inline-block">
            Morph<span className="text-accent">Index</span>
          </Link>
          <h1 className="font-display text-2xl font-extrabold mb-4">Vérifie ton email</h1>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Un lien de confirmation vient d&apos;être envoyé à <span className="text-text">{email}</span>.
            Clique dessus pour activer ton compte, puis connecte-toi pour continuer l&apos;onboarding.
          </p>
          <Link href="/connexion" className="text-sm text-accent underline">Aller à la connexion</Link>
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
        <h1 className="font-display text-2xl font-extrabold mb-6">Créer un compte</h1>
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
            <label htmlFor="password" className="block text-sm text-muted mb-1">Mot de passe (10 caractères min.)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-text outline-none focus:border-accent/50"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-1 accent-accent"
            />
            <span className="text-sm text-muted">
              J&apos;ai 18 ans ou plus et je suis la personne sur les photos.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 accent-accent"
            />
            <span className="text-sm text-muted">
              J&apos;accepte les{" "}
              <Link href="/conditions" className="text-accent underline">CGU</Link>
              {" "}et la{" "}
              <Link href="/confidentialite" className="text-accent underline">politique de confidentialité</Link>.
            </span>
          </label>
          {error && <p className="text-sm text-muted">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-lg bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>
        <p className="mt-6 text-sm text-dim">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-accent underline">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
