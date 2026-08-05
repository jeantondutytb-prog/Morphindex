import type { AXES } from "@/lib/ai/analysis-schema";
import type { RoutineItem } from "@/lib/routine/schedule";

export type WeekPlan = {
  semaine: 1 | 2 | 3 | 4;
  titre: string;
  objectif: string;
  resultat_attendu: string;
};

export type RoutineResume = {
  vision: string;
  axes_cibles: (typeof AXES)[number][];
};

export type RoutinePayload = {
  items: RoutineItem[];
  plan_semaines: WeekPlan[] | null;
  resume: RoutineResume | null;
};

const WEEK_TITLES = [
  "Poser les bases",
  "Corriger les priorités",
  "Intensifier les actifs",
  "Consolider et entretenir",
] as const;

function isRoutineItemArray(value: unknown): value is RoutineItem[] {
  return Array.isArray(value) && value.every((v) => v && typeof v === "object" && "action" in v);
}

function isStoredPayload(value: unknown): value is {
  items: RoutineItem[];
  plan_semaines?: WeekPlan[];
  resume?: RoutineResume;
} {
  return Boolean(value && typeof value === "object" && "items" in value && Array.isArray((value as { items: unknown }).items));
}

/** Normalise la routine en base (tableau legacy ou objet enrichi). */
export function parseRoutinePayload(routine: unknown): RoutinePayload {
  if (isStoredPayload(routine)) {
    return {
      items: routine.items,
      plan_semaines: routine.plan_semaines ?? null,
      resume: routine.resume ?? null,
    };
  }
  if (isRoutineItemArray(routine)) {
    return { items: routine, plan_semaines: null, resume: null };
  }
  return { items: [], plan_semaines: null, resume: null };
}

export function serializeRoutinePayload(payload: RoutinePayload): unknown {
  return {
    items: payload.items,
    plan_semaines: payload.plan_semaines ?? undefined,
    resume: payload.resume ?? undefined,
  };
}

export function fallbackWeekPlans(routine: RoutineItem[]): WeekPlan[] {
  return ([1, 2, 3, 4] as const).map((semaine) => {
    const newItems = routine.filter((item) => item.semaine_debut === semaine);
    const axes = [...new Set(newItems.map((i) => i.axe).filter(Boolean))];
    const focus =
      axes.length > 0
        ? axes.slice(0, 2).join(", ")
        : newItems.map((i) => i.action).slice(0, 2).join(" · ") || "habitudes quotidiennes";

    return {
      semaine,
      titre: WEEK_TITLES[semaine - 1],
      objectif: `Semaine ${semaine} : ${focus}.`,
      resultat_attendu:
        semaine === 4
          ? "Tu tiens une routine stable que tu peux prolonger au-delà du plan."
          : `Tu maîtrises les étapes de la semaine ${semaine} avant d'ajouter la suivante.`,
    };
  });
}

export function resolveWeekPlans(payload: RoutinePayload): WeekPlan[] {
  if (payload.plan_semaines?.length === 4) return payload.plan_semaines;
  return fallbackWeekPlans(payload.items);
}

export function fallbackRoutineResume(
  indiceActuel: number,
  indiceAtteignable: number,
  points: { axe: string }[],
): RoutineResume {
  const axes = [...new Set(points.slice(0, 3).map((p) => p.axe))] as RoutineResume["axes_cibles"];
  return {
    vision: `En 4 semaines, tu poses les bases pour viser un indice autour de ${indiceAtteignable.toFixed(1).replace(".", ",")} (aujourd'hui ${indiceActuel.toFixed(1).replace(".", ",")}), en travaillant d'abord sur ${axes.join(", ") || "tes points faibles"}.`,
    axes_cibles: axes.length > 0 ? axes : ["peau"],
  };
}

export const AXE_LABELS: Record<(typeof AXES)[number], string> = {
  peau: "Peau",
  cernes: "Cernes",
  pilosite: "Pilosité",
  coupe: "Coupe",
  posture: "Posture",
  composition: "Composition",
  dents: "Dents",
};
