"use client";
import Link from "next/link";
import { usePractice } from "@/components/PracticeProvider";
import { accuracy, localDate, practiceStreak } from "@/lib/learning";
import { levels, shortLevelName, wordById, words } from "@/lib/curriculum";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
const mistakeNames: Record<string, string> = {
  vowel_confusion: "Vowel sounds",
  consonant_confusion: "Consonant sounds",
  double_letter: "Double letters",
  spacing: "Spaces between words",
};
export default function DashboardPage() {
  const { data, ready, online, user, sync, syncState } = usePractice();
  if (!ready)
    return (
      <div className="page-container">
        <p>Loading your progress…</p>
      </div>
    );
  const stats = accuracy(data);
  const review = Object.values(data.reviews);
  const mastered = review.filter((r) => r.mastered).length;
  const due = review
    .filter(
      (r) =>
        localDate(r.dueDate, data.settings.timezone) <=
        localDate(new Date(), data.settings.timezone),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const today = localDate(new Date(), data.settings.timezone);
  const todaySessions = data.sessions.filter(
    (s) => localDate(s.startedAt, data.settings.timezone) === today,
  );
  const seconds = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const mistakes: Record<string, number> = {};
  data.attempts.forEach((a) =>
    a.mistakeTypes.forEach(
      (type) => (mistakes[type] = (mistakes[type] ?? 0) + 1),
    ),
  );
  const mistakeList = Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const cards: {
    label: string;
    value: string;
    note: string;
    icon: IconName;
  }[] = [
    {
      label: "First-try accuracy",
      value: stats.percent === null ? "Not yet" : `${stats.percent}%`,
      note: `${stats.correct} independent completions · ${stats.total} initial attempts`,
      icon: "chart",
    },
    {
      label: "Words mastered",
      value: String(mastered),
      note: "Remembered across separate days",
      icon: "book",
    },
    {
      label: "Ready to revisit",
      value: String(due.length),
      note: "A little review builds lasting memory",
      icon: "repeat",
    },
    {
      label: "Spelling practice today",
      value: `${Math.floor(seconds / 60)} min`,
      note: `Your gentle daily aim: ${data.settings.dailyTargetMinutes} minutes`,
      icon: "clock",
    },
  ];
  return (
    <div className="page-container">
      <div className="page-heading heading-with-action">
        <div>
          <p className="eyebrow">Every small step adds up</p>
          <h1>Your progress, at your pace.</h1>
          <p className="lead">A quiet look at what’s becoming more familiar.</p>
        </div>
        <Link className="button button-primary" href="/session">
          Keep practising <Icon name="arrow" />
        </Link>
      </div>
      <div className="metrics-grid">
        {cards.map((card) => (
          <div className="panel metric-card" key={card.label}>
            <div className="metric-top">
              <span>{card.label}</span>
              <Icon name={card.icon} />
            </div>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </div>
        ))}
      </div>
      {!stats.total && (
        <div className="empty-progress">
          <Icon name="sun" />
          <div>
            <strong>This is your starting point.</strong>
            <p>
              Complete your first practice session and your progress will appear
              here. No need to be perfect.
            </p>
          </div>
          <Link href="/session" className="text-button">
            Begin practice <Icon name="arrow" />
          </Link>
        </div>
      )}
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Your learning path</h2>
            <span>{levels.length} gentle levels</span>
          </div>
          <div className="level-progress-list">
            {levels.map((level) => {
              const levelWords = words.filter((w) => w.level === level.id);
              const completed = levelWords.filter((w) =>
                data.attempts.some((a) => a.wordId === w.id && a.isCorrect),
              ).length;
              return (
                <div className="level-progress" key={level.id}>
                  <span className="level-number">
                    {String(level.id).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="level-progress-title">
                      <strong>{shortLevelName(level.id)}</strong>
                      <span>
                        {completed} / {levelWords.length} items
                      </span>
                    </div>
                    <ProgressBar
                      value={completed}
                      max={levelWords.length}
                      label={`Level ${level.id} completion`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="small muted">
            Every level is open from your first visit. Choose what feels useful;
            your accuracy, completion and reviews are recorded without limiting
            access.
          </p>
        </section>
        <div className="dashboard-side">
          <section className="panel">
            <div className="section-heading">
              <h2>A little review</h2>
              <Icon name="repeat" />
            </div>
            {due.length ? (
              <ul className="review-list">
                {due.slice(0, 6).map((r) => (
                  <li key={r.wordId}>
                    <span>
                      <strong>{wordById.get(r.wordId)?.text}</strong>
                      <small>Level {wordById.get(r.wordId)?.level}</small>
                    </span>
                    <span className="small-badge">Ready</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="soft-empty">
                <Icon name="check" />
                <h3>Nothing due right now.</h3>
                <p>
                  New mistakes come back tomorrow. Your other words return when
                  it’s time.
                </p>
              </div>
            )}
            <Link href="/session" className="text-button">
              Open practice <Icon name="arrow" width={16} />
            </Link>
          </section>
          <section className="panel">
            <h2>Patterns to revisit</h2>
            {mistakeList.length ? (
              <ul className="mistake-list">
                {mistakeList.map(([type, count]) => (
                  <li key={type}>
                    <span>
                      {mistakeNames[type] ?? type.replaceAll("_", " ")}
                    </span>
                    <span>{count} practice items</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">
                Your spelling patterns will appear here after practice. Mistakes
                show us what to work on next.
              </p>
            )}
            <Link href="/phonics" className="text-button">
              Explore phonics <Icon name="arrow" width={16} />
            </Link>
          </section>
        </div>
      </div>
      <div className="routine-note">
        <Icon name="sun" />
        <p>
          <strong>
            {practiceStreak(data)} consecutive practice{" "}
            {practiceStreak(data) === 1 ? "day" : "days"}.
          </strong>{" "}
          A routine grows slowly. If you miss a day, simply begin again.
        </p>
      </div>
      <section className="panel history-panel">
        <div className="section-heading">
          <h2>Your recent practice</h2>
          <span>All times are local</span>
        </div>
        {data.sessions.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Time spent</th>
                  <th>Words practised</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...data.sessions]
                  .reverse()
                  .slice(0, 7)
                  .map((session) => (
                    <tr key={session.id}>
                      <td>
                        {new Date(session.startedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            timeZone: data.settings.timezone,
                          },
                        )}
                      </td>
                      <td>{session.level}</td>
                      <td>
                        {Math.floor(session.durationSeconds / 60)}m{" "}
                        {session.durationSeconds % 60}s
                      </td>
                      <td>
                        {
                          new Set(
                            data.attempts
                              .filter(
                                (a) =>
                                  a.sessionId === session.id && a.isCorrect,
                              )
                              .map((a) => a.wordId),
                          ).size
                        }
                      </td>
                      <td>
                        {session.completed
                          ? "Completed"
                          : session.endedAt
                            ? "Finished early"
                            : "In progress"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Your first session will start your story.</p>
        )}
      </section>
      <div className="sync-bar">
        <span>
          <Icon name="lock" />
          {user
            ? syncState
            : "Progress stays on this device. Sign in for optional cloud sync."}
        </span>
        {user ? (
          <button
            className="text-button"
            disabled={!online}
            onClick={() => void sync()}
          >
            Sync now
          </button>
        ) : (
          <Link href="/profile" className="text-button">
            Settings & account <Icon name="arrow" width={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
