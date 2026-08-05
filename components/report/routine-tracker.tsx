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

function storageKey(analysisId: string, week: RoutineWeek) {
  return `morphindex-routine:${analysisId}:w${week}`;
}

export function RoutineTracker({
  analysisId,
  routine,
  startDate,
}: {
  analysisId: string;
  routine: RoutineItem[];
  startDate: string;
}) {
  const start = useMemo(() => new Date(startDate), [startDate]);
  const suggestedWeek = currentRoutineWeek(start);
  const [week, setWeek] = useState<RoutineWeek>(suggestedWeek);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [viewDay, setViewDay] = useState<number | null>(null);

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
    <div className="space-y-6 max-w-lg">
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
        <ul className="space-y-2">
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
                    <span className={`block text-[15px] leading-snug ${done ? "line-through text-dim" : "text-text font-medium"}`}>
                      {task.label}
                    </span>
                    {task.sublabel && (
                      <span className="block text-xs text-dim mt-1">{task.sublabel}</span>
                    )}
                    {task.isNew && (
                      <span className="inline-block mt-2 font-mono text-[8px] uppercase tracking-wider text-accent border border-accent/25 bg-accent/8 px-1.5 py-0.5 rounded">
                        nouveau
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
