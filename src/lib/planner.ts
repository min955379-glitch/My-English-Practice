import { localDate } from "./learning";
import { levelIds } from "./curriculum";
export type PlanMode = "spelling" | "pronunciation" | "reading";
export type PlanDay = {
  level: number;
  minutes: number;
  mode: PlanMode;
  done: boolean;
};
export type PracticePlan = { weekStart: string; days: PlanDay[] };
export function currentWeek(timezone: string, now: Date = new Date()) {
  const date = new Date(`${localDate(now, timezone)}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
export function isPracticePlan(value: unknown): value is PracticePlan {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<PracticePlan>;
  return (
    typeof p.weekStart === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.weekStart) &&
    Number.isFinite(Date.parse(p.weekStart)) &&
    new Date(`${p.weekStart}T12:00:00Z`).toISOString().slice(0, 10) ===
      p.weekStart &&
    new Date(`${p.weekStart}T12:00:00Z`).getUTCDay() === 1 &&
    Array.isArray(p.days) &&
    p.days.length === 7 &&
    p.days.every(
      (d) =>
        !!d &&
        typeof d === "object" &&
        Number.isInteger(d.level) &&
        levelIds.has(d.level) &&
        [15, 20, 25].includes(d.minutes) &&
        ["spelling", "pronunciation", "reading"].includes(d.mode) &&
        typeof d.done === "boolean",
    )
  );
}
export function weeklyPlan(
  stored: PracticePlan | undefined,
  timezone: string,
  minutes: number,
  now?: Date,
): PracticePlan {
  stored = isPracticePlan(stored) ? stored : undefined;
  const weekStart = currentWeek(timezone, now);
  if (stored?.weekStart === weekStart) return stored;
  return {
    weekStart,
    days: Array.from({ length: 7 }, (_, i) =>
      stored
        ? { ...stored.days[i], done: false }
        : {
            level: i + 1,
            minutes,
            mode: i === 5 ? "reading" : i === 6 ? "pronunciation" : "spelling",
            done: false,
          },
    ),
  };
}
export function planLink(day: PlanDay) {
  return day.mode === "reading"
    ? "/reading"
    : `${day.mode === "spelling" ? "/session" : "/pronunciation"}?level=${day.level}`;
}
