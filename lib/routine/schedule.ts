export type RoutineItem = {
  moment: "matin" | "soir" | "hebdo";
  action: string;
  produit: string | null;
  frequence: string;
  semaine_debut: number;
};

export const ROUTINE_WEEKS = [1, 2, 3, 4] as const;
export type RoutineWeek = (typeof ROUTINE_WEEKS)[number];

export function routineItemId(item: RoutineItem, index: number): string {
  return `${item.moment}-${item.semaine_debut}-${index}`;
}

/** Items actifs pour une semaine donnée (introduits cette semaine ou avant). */
export function itemsForWeek(routine: RoutineItem[], week: RoutineWeek): RoutineItem[] {
  return routine.filter((item) => item.semaine_debut <= week);
}

/** Semaine courante (1–4) à partir de la date de début du plan. */
export function currentRoutineWeek(startDate: Date, now = new Date()): RoutineWeek {
  const ms = now.getTime() - startDate.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  const week = Math.floor(days / 7) + 1;
  return Math.min(4, Math.max(1, week)) as RoutineWeek;
}

export function isDailyFrequency(frequence: string): boolean {
  return /quotidien/i.test(frequence);
}

function weeklyOccurrenceDays(frequence: string): number[] | null {
  if (/3\s*[×x]\s*par\s*semaine/i.test(frequence)) return [0, 2, 4];
  if (/2\s*[×x]\s*par\s*semaine/i.test(frequence)) return [0, 3];
  if (/1\s*[×x]\s*par\s*semaine|hebdo/i.test(frequence)) return [0];
  return null;
}

export function weekDayLabels(): string[] {
  return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
}

export function weekDayFullLabels(): string[] {
  return ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
}

export function isDayComplete(tasks: RoutineDayTask[], checked: Record<string, boolean>): boolean {
  if (tasks.length === 0) return true;
  return tasks.every((t) => checked[t.id]);
}

/** Premier jour non terminé (0–6), ou 6 si la semaine est finie. */
export function activeDayIndex(
  routine: RoutineItem[],
  week: RoutineWeek,
  checked: Record<string, boolean>,
): number {
  const labels = weekDayLabels();
  for (let i = 0; i < labels.length; i++) {
    const tasks = tasksForDay(routine, week, i);
    if (tasks.length === 0) continue;
    if (!isDayComplete(tasks, checked)) return i;
  }
  return labels.length - 1;
}

export function isDayUnlocked(
  routine: RoutineItem[],
  week: RoutineWeek,
  dayIndex: number,
  checked: Record<string, boolean>,
): boolean {
  if (dayIndex === 0) return true;
  for (let i = 0; i < dayIndex; i++) {
    const tasks = tasksForDay(routine, week, i);
    if (tasks.length === 0) continue;
    if (!isDayComplete(tasks, checked)) return false;
  }
  return true;
}

export type RoutineDayTask = {
  id: string;
  item: RoutineItem;
  itemIndex: number;
  label: string;
  sublabel?: string;
  isNew: boolean;
};

/** Tâches d'un jour pour une semaine — matin/soir quotidiens + hebdo le lundi. */
export function tasksForDay(
  routine: RoutineItem[],
  week: RoutineWeek,
  dayIndex: number,
): RoutineDayTask[] {
  const active = itemsForWeek(routine, week);
  const tasks: RoutineDayTask[] = [];

  active.forEach((item, itemIndex) => {
    const id = `${week}-${dayIndex}-${routineItemId(item, itemIndex)}`;
    const isNew = item.semaine_debut === week;

    if (item.moment === "hebdo") {
      if (dayIndex !== 0) return;
      tasks.push({
        id,
        item,
        itemIndex,
        label: item.action,
        sublabel: item.produit ? `${item.produit} · ${item.frequence}` : item.frequence,
        isNew,
      });
      return;
    }

    if (isDailyFrequency(item.frequence)) {
      tasks.push({
        id,
        item,
        itemIndex,
        label: item.action,
        sublabel: [
          item.moment === "matin" ? "Matin" : "Soir",
          item.produit,
          item.frequence,
        ].filter(Boolean).join(" · "),
        isNew,
      });
      return;
    }

    const days = weeklyOccurrenceDays(item.frequence);
    if (days && !days.includes(dayIndex)) return;

    tasks.push({
      id,
      item,
      itemIndex,
      label: item.action,
      sublabel: [
        item.moment === "matin" ? "Matin" : "Soir",
        item.produit,
        item.frequence,
      ].filter(Boolean).join(" · "),
      isNew,
    });
  });

  return tasks.sort((a, b) => {
    const order = { matin: 0, soir: 1, hebdo: 2 };
    return order[a.item.moment] - order[b.item.moment];
  });
}

export function countDayTasks(routine: RoutineItem[], week: RoutineWeek): number {
  return weekDayLabels().reduce((n, _, i) => n + tasksForDay(routine, week, i).length, 0);
}
