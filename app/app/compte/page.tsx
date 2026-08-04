import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MONTHLY_QUOTA } from "@/lib/credits/quota";

const FORMULE_LABELS: Record<string, string> = {
  hebdo: "Hebdomadaire · 4,90 €/sem",
  annuel: "Annuel · 49,90 €/an",
  vie: "À vie · 99,90 €",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  canceled: "Annulé",
  past_due: "Paiement en retard",
};

export default async function ComptePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("email, onboarding_done_at, created_at, is_admin").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
  ]);

  const quotaUsed =
    sub && new Date(sub.quota_reset_at) > new Date() ? sub.quota_used : 0;
  // Admin : analyses illimitées, pas de quota affiché
  const hasActiveSub = sub?.status === "active";
  const isAdmin = profile?.is_admin === true;

  return (
    <main className="px-5 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-extrabold mb-8">Mon compte</h1>

      <section className="rounded-xl border border-line bg-surface p-5 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">Identité</p>
        <p className="text-text font-medium">{profile?.email ?? user.email}</p>
        <p className="text-sm text-dim mt-1">
          Membre depuis{" "}
          {new Date(profile?.created_at ?? user.created_at).toLocaleDateString("fr-FR")}
        </p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">Abonnement</p>
        {hasActiveSub ? (
          <>
            <p className="text-text font-medium">
              {sub.formule ? FORMULE_LABELS[sub.formule] ?? sub.formule : "Actif"}
            </p>
            <p className="text-sm text-muted mt-1">
              Statut : {STATUS_LABELS[sub.status ?? ""] ?? sub.status}
            </p>
            {sub.current_period_end && sub.formule !== "vie" && (
              <p className="text-sm text-dim mt-1">
                Renouvellement :{" "}
                {new Date(sub.current_period_end).toLocaleDateString("fr-FR")}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-muted">Aucun abonnement actif</p>
            <p className="text-sm text-dim mt-2">
              Débloque ton dernier rapport ou souscris depuis le paywall.
            </p>
          </>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 mb-8">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">Quota analyses</p>
        {isAdmin ? (
          <>
            <p className="font-display text-2xl font-extrabold text-accent">Illimité</p>
            <p className="text-sm text-dim mt-2">Compte admin — analyses et rapports débloqués.</p>
          </>
        ) : (
          <>
            <p className="text-text">
              <span className="font-display text-2xl font-extrabold tnum">{quotaUsed}</span>
              <span className="text-muted"> / {hasActiveSub ? MONTHLY_QUOTA : 1} ce mois</span>
            </p>
            <p className="text-sm text-dim mt-2">
              {hasActiveSub
                ? `${MONTHLY_QUOTA} analyses complètes par mois avec abonnement actif.`
                : "1 analyse gratuite avant déblocage du rapport."}
            </p>
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app"
          className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:border-accent/30 transition"
        >
          ← Mes analyses
        </Link>
        <Link
          href="/onboarding/photo"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:brightness-110 transition"
        >
          Nouvelle analyse
        </Link>
      </div>
    </main>
  );
}
