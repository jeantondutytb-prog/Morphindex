"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthInput, AuthButton, AuthCheckbox, AuthError, AuthFooterLink } from "@/components/ui/auth-field";

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
      <AuthLayout title="Vérifie ton email">
        <p className="text-sm text-muted leading-relaxed mb-6 -mt-2">
          Un lien de confirmation vient d&apos;être envoyé à{" "}
          <span className="text-text font-medium">{email}</span>.
          Clique dessus pour activer ton compte, puis connecte-toi pour continuer l&apos;onboarding.
        </p>
        <Link
          href="/connexion"
          className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition"
        >
          Aller à la connexion →
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="3 minutes pour ton premier indice. Photo supprimée après analyse."
    >
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
        <AuthInput
          label="Mot de passe (10 caractères min.)"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={10}
          autoComplete="new-password"
        />

        <div className="space-y-3 pt-1">
          <AuthCheckbox checked={ageConfirmed} onChange={setAgeConfirmed}>
            J&apos;ai 18 ans ou plus et je suis la personne sur les photos.
          </AuthCheckbox>
          <AuthCheckbox checked={termsAccepted} onChange={setTermsAccepted}>
            J&apos;accepte les{" "}
            <Link href="/conditions" className="text-accent hover:brightness-110 transition">CGU</Link>
            {" "}et la{" "}
            <Link href="/confidentialite" className="text-accent hover:brightness-110 transition">politique de confidentialité</Link>.
          </AuthCheckbox>
        </div>

        <AuthError message={error} />
        <AuthButton loading={loading} disabled={!canSubmit}>
          {loading ? "Création…" : "Créer mon compte"}
        </AuthButton>
      </form>
      <AuthFooterLink>
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-accent hover:brightness-110 transition">Se connecter</Link>
      </AuthFooterLink>
    </AuthLayout>
  );
}
