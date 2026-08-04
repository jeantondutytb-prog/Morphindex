"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingData } from "@/lib/onboarding/schema";

const PHOTOTYPE_COLORS = ["#FDEBD0", "#F5CBA7", "#E0AC69", "#C68642", "#8D5524", "#3B2219"];

const OBJECTIFS = [
  { id: "peau", label: "Peau" },
  { id: "pilosite", label: "Pilosité / barbe" },
  { id: "sommeil", label: "Cernes / sommeil" },
  { id: "composition", label: "Composition" },
  { id: "general", label: "Vue d'ensemble" },
] as const;

const TRANCHES = ["18-24", "25-34", "35-44", "45+"] as const;
const SEXES = [
  { id: "homme", label: "Homme" },
  { id: "femme", label: "Femme" },
  { id: "nsp", label: "Ne souhaite pas préciser" },
] as const;
const CHEVEUX = ["raides", "ondules", "boucles", "crepus"] as const;
const SENSIBILITES = [
  { id: "normale", label: "Normale" },
  { id: "sensible", label: "Sensible" },
  { id: "tres_sensible", label: "Très sensible" },
] as const;
const ROUTINE_OPTS = [
  { id: "rien", label: "Rien" },
  { id: "nettoyant", label: "Nettoyant" },
  { id: "hydratant", label: "Hydratant" },
  { id: "spf", label: "SPF" },
  { id: "retinoides", label: "Rétinoïdes" },
  { id: "dermato", label: "Suivi dermato" },
] as const;

type PartialData = Partial<OnboardingData>;

export function OnboardingSteps() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<PartialData>({ mode_prefere: "soft", routine_actuelle: [] });
  const [loading, setLoading] = useState(false);

  const trackStep = useCallback(async (n: number) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "onboarding_step", payload: { step: n } }),
    });
  }, []);

  function next() {
    const n = step + 1;
    setStep(n);
    trackStep(n);
  }

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push("/app/photo");
    setLoading(false);
  }

  async function trackHardmaxing() {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hardmaxing_interest", payload: { source: "onboarding" } }),
    });
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="font-mono text-[10px] text-dim mb-6">{step}/5</div>

      {step === 1 && (
        <Step title="Quel est ton objectif principal ?">
          <div className="space-y-2">
            {OBJECTIFS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setData({ ...data, objectif: id }); next(); }}
                className="w-full text-left rounded-lg border border-line bg-surface px-4 py-3 hover:border-accent/50 transition"
              >
                {label}
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step title="Quelques infos sur toi">
          <Field label="Tranche d'âge">
            <div className="flex flex-wrap gap-2">
              {TRANCHES.map((t) => (
                <Chip key={t} active={data.tranche_age === t} onClick={() => setData({ ...data, tranche_age: t })}>{t}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Sexe">
            <div className="flex flex-wrap gap-2">
              {SEXES.map(({ id, label }) => (
                <Chip key={id} active={data.sexe === id} onClick={() => setData({ ...data, sexe: id })}>{label}</Chip>
              ))}
            </div>
          </Field>
          <button
            type="button"
            disabled={!data.tranche_age || !data.sexe}
            onClick={next}
            className="mt-4 w-full rounded-lg bg-accent py-3 font-bold text-accent-ink disabled:opacity-40"
          >
            Continuer
          </button>
        </Step>
      )}

      {step === 3 && (
        <Step title="Ton phototype (Fitzpatrick)">
          <p className="text-sm text-muted mb-4">Choisis la teinte la plus proche de ta peau au repos, sans bronzage.</p>
          <div className="flex gap-3 flex-wrap">
            {PHOTOTYPE_COLORS.map((color, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setData({ ...data, phototype: i + 1 })}
                className={`w-12 h-12 rounded-full border-2 transition ${data.phototype === i + 1 ? "border-accent scale-110" : "border-line"}`}
                style={{ backgroundColor: color }}
                aria-label={`Phototype ${i + 1}`}
              />
            ))}
          </div>
          <Field label="Type de cheveux" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {CHEVEUX.map((t) => (
                <Chip key={t} active={data.type_cheveux === t} onClick={() => setData({ ...data, type_cheveux: t })}>{t}</Chip>
              ))}
            </div>
          </Field>
          <button
            type="button"
            disabled={!data.phototype || !data.type_cheveux}
            onClick={next}
            className="mt-4 w-full rounded-lg bg-accent py-3 font-bold text-accent-ink disabled:opacity-40"
          >
            Continuer
          </button>
        </Step>
      )}

      {step === 4 && (
        <Step title="Ta routine actuelle">
          <Field label="Sensibilité cutanée">
            <div className="flex flex-wrap gap-2">
              {SENSIBILITES.map(({ id, label }) => (
                <Chip key={id} active={data.sensibilite === id} onClick={() => setData({ ...data, sensibilite: id })}>{label}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Produits utilisés (plusieurs choix possibles)">
            <div className="flex flex-wrap gap-2">
              {ROUTINE_OPTS.map(({ id, label }) => {
                const selected = data.routine_actuelle?.includes(id) ?? false;
                return (
                  <Chip
                    key={id}
                    active={selected}
                    onClick={() => {
                      const cur = data.routine_actuelle ?? [];
                      setData({
                        ...data,
                        routine_actuelle: selected ? cur.filter((x) => x !== id) : [...cur, id],
                      });
                    }}
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
          </Field>
          <button
            type="button"
            disabled={!data.sensibilite}
            onClick={next}
            className="mt-4 w-full rounded-lg bg-accent py-3 font-bold text-accent-ink disabled:opacity-40"
          >
            Continuer
          </button>
        </Step>
      )}

      {step === 5 && (
        <Step title="Quelle lecture veux-tu ?">
          <div className="space-y-3">
            <div className="rounded-lg border border-accent/30 bg-accent/4 px-4 py-3">
              <span className="font-bold text-text">Softmaxing</span>
              <p className="text-sm text-muted mt-1">Peau, cernes, pilosité, coupe, posture, dents</p>
            </div>
            <button
              type="button"
              disabled
              onClick={trackHardmaxing}
              className="w-full text-left rounded-lg border border-line px-4 py-3 opacity-50 cursor-not-allowed"
            >
              <span className="font-bold text-text">Hardmaxing</span>
              <span className="ml-2 font-mono text-[9px] uppercase text-dim border border-line px-2 py-0.5 rounded">bientôt</span>
            </button>
            <button
              type="button"
              disabled
              onClick={trackHardmaxing}
              className="w-full text-left rounded-lg border border-line px-4 py-3 opacity-50 cursor-not-allowed"
            >
              <span className="font-bold text-text">Les deux</span>
              <span className="ml-2 font-mono text-[9px] uppercase text-dim border border-line px-2 py-0.5 rounded">bientôt</span>
            </button>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="mt-6 w-full rounded-lg bg-accent py-3 font-bold text-accent-ink disabled:opacity-40"
          >
            {loading ? "Enregistrement…" : "Terminer"}
          </button>
        </Step>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">{title}</h1>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className ?? "mb-4"}>
      <p className="text-sm text-muted mb-2">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        active ? "border-accent bg-accent/10 text-text" : "border-line text-muted hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}
