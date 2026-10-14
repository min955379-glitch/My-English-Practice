"use client";
import Link from "next/link";
import { usePractice } from "@/components/PracticeProvider";
import { weeklyPlan, planLink, type PlanDay } from "@/lib/planner";
import { levels, shortLevelName } from "@/lib/curriculum";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
const names = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export default function PlannerPage() {
  const { data, ready, update } = usePractice();
  if (!ready)
    return (
      <div className="page-container">
        <h1>Your week. Your rhythm.</h1>
        <p className="lead">Loading your personal plan…</p>
      </div>
    );
  const plan = weeklyPlan(
    data.settings.practicePlan,
    data.settings.timezone,
    data.settings.dailyTargetMinutes,
  );
  const change = (index: number, patch: Partial<PlanDay>) =>
    update((d) => ({
      ...d,
      settings: {
        ...d.settings,
        practicePlan: {
          ...plan,
          days: plan.days.map((day, i) =>
            i === index ? { ...day, ...patch } : day,
          ),
        },
      },
    }));
  const done = plan.days.filter((d) => d.done).length;
  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">Make a little room for yourself</p>
        <h1>Your week. Your rhythm.</h1>
        <p className="lead">
          A useful plan, not another deadline. Choose a level, vary the activity
          and tick a day when you have practised.
        </p>
      </div>
      <section className="panel planner-summary">
        <div className="section-heading">
          <h2>
            Week of{" "}
            {new Date(`${plan.weekStart}T12:00:00Z`).toLocaleDateString(
              "en-GB",
              { day: "numeric", month: "long", timeZone: "UTC" },
            )}
          </h2>
          <Icon name="calendar" />
        </div>
        <p>
          {done} of 7 days ticked ·{" "}
          {plan.days.reduce((n, d) => n + d.minutes, 0)} minutes planned
        </p>
        <p className="small muted">
          This is a personal checklist. Ticks do not alter your practice
          accuracy, mastery or review schedule. Your plan is saved with your
          settings and included in progress export/import.
        </p>
      </section>
      <div className="planner-grid">
        {plan.days.map((day, i) => (
          <section className="panel planner-day" key={names[i]}>
            <div className="section-heading">
              <h2>{names[i]}</h2>
              <span className="small-badge">{day.minutes} minutes</span>
            </div>
            <Select
              label={`${names[i]} activity`}
              value={day.mode}
              disabled={!ready}
              options={[
                { value: "spelling", label: "Listen & spell" },
                { value: "pronunciation", label: "Listen & repeat" },
                { value: "reading", label: "Read aloud" },
              ]}
              onChange={(mode) => change(i, { mode: mode as PlanDay["mode"] })}
            />
            {day.mode !== "reading" && (
              <Select
                label={`${names[i]} level`}
                value={String(day.level)}
                disabled={!ready}
                options={levels.map((l) => ({
                  value: String(l.id),
                  label: `Level ${l.id} — ${shortLevelName(l.id)}`,
                }))}
                onChange={(v) => change(i, { level: Number(v) })}
              />
            )}
            <Select
              label={`${names[i]} length`}
              value={String(day.minutes)}
              disabled={!ready}
              options={[15, 20, 25].map((n) => ({
                value: String(n),
                label: `${n} minutes`,
              }))}
              onChange={(v) => change(i, { minutes: Number(v) })}
            />
            <label className="plan-check">
              <input
                type="checkbox"
                checked={day.done}
                disabled={!ready}
                onChange={(e) => change(i, { done: e.target.checked })}
              />
              I practised on {names[i]}
            </label>
            <Link
              className="text-button"
              href={planLink(day)}
              style={{ marginTop: 16 }}
            >
              Open this practice
              <Icon name="arrow" width={17} />
            </Link>
          </section>
        ))}
      </div>
      <div className="resource-banner">
        <div>
          <h2>A missed day does not close a door.</h2>
          <p>
            All levels stay open. When a new week begins, your choices stay and
            the checklist starts fresh.
          </p>
        </div>
        <Link href="/dashboard" className="button button-outline">
          See actual practice progress
          <Icon name="chart" />
        </Link>
      </div>
    </div>
  );
}
