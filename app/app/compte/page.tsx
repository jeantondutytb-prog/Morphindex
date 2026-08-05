import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FREE_ANALYSES } from "@/lib/credits/quota";
import { FOLLOW_UP_OFFER } from "@/lib/stripe/products";
import { PageHeader } from "@/components/app/page-header";
import { AppContainer } from "@/components/app/app-container";
import { AppButton, AppCard, AppSectionLabel } from "@/components/app/ui";
import { StatCard } from "@/components/app/stat-card";

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
  const hasActiveSub = sub?.status === "active";
  const isAdmin = profile?.is_admin === true;
  const freeUsed = quotaUsed >= FREE_ANALYSES;

  return (
    <AppContainer>
      <PageHeader kicker="Compte" title="Mon compte" subtitle="Abonnement et analyses" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        <AppCard>
          <AppSectionLabel>Identité</AppSectionLabel>
          <p className="text-text font-medium text-lg">{profile?.email ?? user.email}</p>
          <p className="text-sm text-dim mt-2">
            Membre depuis{" "}
            {new Date(profile?.created_at ?? user.created_at).toLocaleDateString("fr-FR")}
          </p>
        </AppCard>

        <AppCard accent={hasActiveSub}>
          <AppSectionLabel>Abonnement</AppSectionLabel>
          {hasActiveSub ? (
            <>
              <p className="text-text font-medium text-lg">
                {sub.formule ? FORMULE_LABELS[sub.formule] ?? sub.formule : "Actif"}
              </p>
              <p className="text-sm text-muted mt-2">
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
              <p className="text-muted text-lg">Aucun abonnement actif</p>
              <p className="text-sm text-dim mt-2">
                Souscris depuis le paywall de ton rapport pour débloquer l&apos;accès.
              </p>
            </>
          )}
        </AppCard>

        <StatCard
          label="Analyses de suivi"
          value={isAdmin ? "—" : String(sub?.prepaid_credits ?? 0)}
          hint={`Crédits prépayés · ${FOLLOW_UP_OFFER.price} l'unité`}
        />

        <StatCard
          label="Première analyse"
          value={isAdmin ? "∞" : freeUsed ? "Utilisée" : "Disponible"}
          hint={
            isAdmin
              ? "Compte admin — analyses illimitées"
              : freeUsed
                ? hasActiveSub
                  ? "Analyses de suivi payantes à la demande"
                  : "Abonnement requis pour débloquer le rapport"
                : "Gratuite · aperçu flouté"
          }
          accent={isAdmin || hasActiveSub}
        />
      </div>

      {!isAdmin && (sub?.prepaid_credits ?? 0) > 0 && (
        <p className="mt-3 text-sm text-accent/90">
          {sub!.prepaid_credits} analyse{(sub!.prepaid_credits ?? 0) > 1 ? "s" : ""} de suivi — lance-la depuis Analyser.
        </p>
      )}

      <AppCard className="mt-4">
        <AppSectionLabel>Tarifs</AppSectionLabel>
        <ul className="text-sm text-muted space-y-2 mt-2">
          <li>· <strong className="text-text">1re analyse</strong> — gratuite (rapport flouté)</li>
          <li>· <strong className="text-text">Abonnement</strong> — débloque le rapport + accès produit (hebdo, annuel, à vie)</li>
          <li>· <strong className="text-text">Analyse de suivi</strong> — {FOLLOW_UP_OFFER.price} (compare avec ta première analyse)</li>
        </ul>
      </AppCard>

      {isAdmin && (
        <p className="mt-3 text-sm text-accent/80">
          Compte admin — tu peux lancer autant d&apos;analyses que tu veux.
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        <AppButton href="/app" variant="secondary">← Mes analyses</AppButton>
        <AppButton href="/app/photo">Nouvelle analyse</AppButton>
      </div>
    </AppContainer>
  );
}
