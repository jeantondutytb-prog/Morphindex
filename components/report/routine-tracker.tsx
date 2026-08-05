"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoutineItem } from "@/lib/routine/schedule";
import {
  ROUTINE_WEEKS,
  activeDayIndex,
  countDayTasks,
  currentRoutineWeek,
  isDayComplete,
  isDayUnlocked,
  tasksForDay,
  type RoutineWeek,
  weekDayFullLabels,
  weekDayLabels,
} from "@/lib/routine/schedule";
import {
  AXE_LABELS,
  resolveWeekPlans,
  type RoutineResume,
  type WeekPlan,
} from "@/lib/routine/data";

function storageKey(analysisId: string, week: RoutineWeek) {
  return `morphindex-routine:${analysisId}:w${week}`;
}

function RoutineRoadmap({
  plans,
  activeWeek,
  onSelect,
}: {
  plans: WeekPlan[];
  activeWeek: RoutineWeek;
  onSelect: (week: RoutineWeek) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {plans.map((plan) => (
        <button
          key={plan.semaine}
          type="button"
          onClick={() => onSelect(plan.semaine as RoutineWeek)}
          className={`rounded-xl border px-4 py-3 text-left transition ${
            activeWeek === plan.semaine
              ? "border-accent/40 bg-accent/8 ring-1 ring-accent/25"
              : "border-line bg-bg/30 hover:border-accent/20"
          }`}
        >
          <p className="font-mono text-[9px] uppercase tracking-wider text-dim mb-1">
            Semaine {plan.semaine}
          </p>
          <p className="text-sm font-medium text-text mb-1">{plan.titre}</p>
          <p className="text-xs text-muted line-clamp-2">{plan.objectif}</p>
        </button>
      ))}
    </div>
  );
}

function WeekObjectiveCard({ plan }: { plan: WeekPlan }) {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
        Objectif · Semaine {plan.semaine}
      </p>
      <p className="font-display font-bold text-text">{plan.titre}</p>
      <p className="text-sm text-muted leading-relaxed">{plan.objectif}</p>
      <p className="text-xs text-dim border-t border-line/60 pt-2">
        <span className="text-muted">Fin de semaine : </span>
        {plan.resultat_attendu}
      </p>
    </div>
  );
}

export function RoutineTracker({
  analysisId,
  routine,
  startDate,
  weekPlans,
  resume,
}: {
  analysisId: string;
  routine: RoutineItem[];
  startDate: string;
  weekPlans?: WeekPlan[] | null;
  resume?: RoutineResume | null;
}) {
  const plans = useMemo(
    () => (weekPlans?.length === 4 ? weekPlans : resolveWeekPlans({ items: routine, plan_semaines: weekPlans ?? null, resume: resume ?? null })),
    [weekPlans, routine, resume],
  );

  const start = useMemo(() => new Date(startDate), [startDate]);
  const suggestedWeek = currentRoutineWeek(start);
  const [week, setWeek] = useState<RoutineWeek>(suggestedWeek);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [viewDay, setViewDay] = useState<number | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(analysisId, week));
      setChecked(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setChecked({});
    }
    setViewDay(null);
  }, [analysisId, week]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setChecked(next);
      try {
        localStorage.setItem(storageKey(analysisId, week), JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [analysisId, week],
  );

  function toggle(id: string) {
    persist({ ...checked, [id]: !checked[id] });
  }

  const currentDay = activeDayIndex(routine, week, checked);
  const displayDay = viewDay ?? currentDay;
  const dayTasks = tasksForDay(routine, week, displayDay);
  const dayDone = dayTasks.filter((t) => checked[t.id]).length;
  const dayComplete = isDayComplete(dayTasks, checked);
  const canViewDay = isDayUnlocked(routine, week, displayDay, checked);
  const activePlan = plans.find((p) => p.semaine === week);

  const totalTasks = countDayTasks(routine, week);
  const doneTasks = useMemo(() => {
    let n = 0;
    for (let d = 0; d < 7; d++) {
      for (const t of tasksForDay(routine, week, d)) {
        if (checked[t.id]) n++;
      }
    }
    return n;
  }, [routine, week, checked]);

  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {resume && (
        <div className="rounded-xl border border-line bg-surface/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent mb-2">
            Où tu vas en 4 semaines
          </p>
          <p className="text-sm text-muted leading-relaxed mb-3">{resume.vision}</p>
          <div className="flex flex-wrap gap-1.5">
            {resume.axes_cibles.map((axe) => (
              <span
                key={axe}
                className="font-mono text-[9px] uppercase tracking-wider border border-line text-dim px-2 py-0.5 rounded-full"
              >
                {AXE_LABELS[axe]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowRoadmap((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted hover:text-text transition mb-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
            {showRoadmap ? "Masquer" : "Voir"} le plan 4 semaines
          </span>
          <span aria-hidden>{showRoadmap ? "▲" : "▼"}</span>
        </button>
        {showRoadmap && (
          <RoutineRoadmap plans={plans} activeWeek={week} onSelect={setWeek} />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ROUTINE_WEEKS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWeek(w)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              week === w
                ? "bg-accent text-accent-ink shadow-[0_4px_16px_rgba(0,229,160,.25)]"
                : "border border-line text-muted hover:border-accent/30 hover:text-text"
            }`}
          >
            Semaine {w}
            {w === suggestedWeek && (
              <span className="ml-1.5 font-mono text-[9px] uppercase opacity-80">actuelle</span>
            )}
          </button>
        ))}
      </div>

      {activePlan && <WeekObjectiveCard plan={activePlan} />}

      <div className="flex items-center justify-between gap-2">
        {weekDayLabels().map((short, i) => {
          const tasks = tasksForDay(routine, week, i);
          if (tasks.length === 0) return null;
          const unlocked = isDayUnlocked(routine, week, i, checked);
          const complete = isDayComplete(tasks, checked);
          const isCurrent = i === currentDay && !complete;
          const isViewing = i === displayDay;

          return (
            <button
              key={short}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && setViewDay(i)}
              title={
                !unlocked
                  ? "Termine le jour précédent"
                  : complete
                    ? "Jour terminé"
                    : `Jour ${i + 1}`
              }
              className={`flex flex-col items-center gap-1 min-w-0 flex-1 py-2 rounded-lg transition ${
                !unlocked
                  ? "opacity-30 cursor-not-allowed"
                  : isViewing
                    ? "bg-accent/10 ring-1 ring-accent/30"
                    : "hover:bg-surface/80"
              }`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[11px] font-mono font-medium ${
                  complete
                    ? "bg-accent/20 text-accent"
                    : isCurrent
                      ? "bg-accent text-accent-ink"
                      : unlocked
                        ? "border border-line text-muted"
                        : "border border-line text-dim"
                }`}
              >
                {complete ? "✓" : i + 1}
              </span>
              <span className="font-mono text-[9px] text-dim truncate w-full text-center">{short}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-line bg-bg/30 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
            Semaine {week} · {weekDayFullLabels()[displayDay]}
          </p>
          <p className="font-mono text-xs tnum text-muted">
            {dayDone}/{dayTasks.length}
          </p>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-dim">
          Semaine : {doneTasks}/{totalTasks} · Coche chaque étape pour débloquer le jour suivant.
        </p>
      </div>

      {!canViewDay ? (
        <div className="rounded-xl border border-line bg-surface/40 p-8 text-center">
          <p className="text-2xl mb-3 opacity-40" aria-hidden>🔒</p>
          <p className="font-display font-bold text-text mb-1">Jour verrouillé</p>
          <p className="text-sm text-muted">
            Termine {weekDayFullLabels()[displayDay - 1]} avant de voir ce jour.
          </p>
        </div>
      ) : dayTasks.length === 0 ? (
        <p className="text-sm text-dim text-center py-8">Rien de prévu ce jour.</p>
      ) : (
        <ul className="space-y-3">
          {dayTasks.map((task) => {
            const done = Boolean(checked[task.id]);
            const readOnly = displayDay < currentDay;

            return (
              <li key={task.id}>
                <label
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 transition ${
                    done
                      ? "border-accent/20 bg-accent/5 opacity-80"
                      : "border-line bg-surface/60 hover:border-accent/25"
                  } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border transition ${
                      done
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-line bg-bg/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      disabled={readOnly}
                      onChange={() => !readOnly && toggle(task.id)}
                      className="sr-only"
                    />
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-[15px] leading-snug ${done ? "line-through text-dim" : "text-text font-medium"}`}>
                        {task.label}
                      </span>
                      {task.dimensionTag && (
                        <span className="font-mono text-[8px] uppercase tracking-wider text-dim border border-line px-1.5 py-0.5 rounded">
                          {task.dimensionTag}
                        </span>
                      )}
                      {task.isNew && (
                        <span className="font-mono text-[8px] uppercase tracking-wider text-accent border border-accent/25 bg-accent/8 px-1.5 py-0.5 rounded">
                          nouveau
                        </span>
                      )}
                    </span>
                    {task.sublabel && (
                      <span className="block text-xs text-dim">{task.sublabel}</span>
                    )}
                    {task.detail && (
                      <span className="block text-sm text-muted mt-2 leading-relaxed">{task.detail}</span>
                    )}
                    {task.pourquoi && (
                      <span className="block text-xs text-dim mt-2 italic">
                        Pourquoi : {task.pourquoi}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {dayComplete && displayDay === currentDay && displayDay < 6 && (
        <div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-sm text-accent text-center">
          Jour terminé — {weekDayFullLabels()[displayDay + 1]} est débloqué.
        </div>
      )}

      {viewDay !== null && viewDay !== currentDay && (
        <button
          type="button"
          onClick={() => setViewDay(null)}
          className="w-full text-sm text-dim hover:text-muted transition py-2"
        >
          Revenir au jour actuel
        </button>
      )}
    </div>
  );
}
