import type { Attempt, LearnerData, Review } from "./types";
import { words, wordById } from "./curriculum";
export function localDate(time: string | number | Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(time));
}
export function mistakeCategory(
  expected: string,
  typed: string,
  previous: string,
) {
  if (expected === " " || typed === " ") return "spacing";
  if (expected === previous) return "double_letter";
  if ("aeiou".includes(expected.toLowerCase())) return "vowel_confusion";
  return "consonant_confusion";
}
// The repository specifies an adapted, simplified FSRS-style scheduler.
// Same-session retries are separate and do not inflate longer-term recall.
export function scheduleReview(
  previous: Review | undefined,
  attempt: Attempt,
  timezone: string,
): Review {
  const now = new Date(attempt.attemptedAt);
  const clean = attempt.isFirstTry;
  const sameDay =
    previous &&
    localDate(previous.lastReviewedAt, timezone) === localDate(now, timezone);
  if (sameDay && clean && !previous.lastMistake) return previous;
  const difficulty = clean
    ? Math.max(0.1, (previous?.difficulty ?? 0.35) - 0.05)
    : Math.min(0.9, (previous?.difficulty ?? 0.3) + 0.15);
  const stability = clean
    ? Math.min(10, (previous?.stability ?? 0.5) * 2)
    : Math.max(0.5, (previous?.stability ?? 1) * 0.5);
  const intervalDays =
    clean && previous && !sameDay
      ? Math.min(365, Math.max(1, Math.round(previous.intervalDays * 2.5)))
      : 1;
  const due = new Date(now);
  due.setDate(due.getDate() + intervalDays);
  const date = localDate(now, timezone);
  const successfulDates = clean
    ? Array.from(new Set([...(previous?.successfulDates ?? []), date]))
    : [];
  const mastered =
    clean &&
    successfulDates.length >= 3 &&
    (previous?.intervalDays ?? 0) >= 7 &&
    !sameDay;
  return {
    wordId: attempt.wordId,
    dueDate: due.toISOString(),
    difficulty,
    stability,
    intervalDays,
    repetitions: (previous?.repetitions ?? 0) + 1,
    lastReviewedAt: attempt.attemptedAt,
    successfulDates,
    mastered: mastered || (!!previous?.mastered && clean),
    lastMistake: clean ? previous?.lastMistake : attempt.attemptedAt,
  };
}
export function unlockedLevel(data: LearnerData) {
  let unlocked = 1;
  for (let level = 1; level <= 7; level++) {
    const threshold = level === 7 ? 0.75 : 0.8;
    const qualifying = data.sessions
      .filter((s) => s.level === level && s.completed)
      .filter((s) => {
        const attempts = data.attempts.filter((a) => a.sessionId === s.id);
        const initial = [
          ...new Map(
            attempts.map((a) => [
              a.wordId,
              attempts.find((b) => b.wordId === a.wordId)!,
            ]),
          ).values(),
        ];
        return (
          initial.length >= 5 &&
          initial.filter((a) => a.isFirstTry).length / initial.length >=
            threshold
        );
      });
    const days = new Set(
      qualifying.map((s) => localDate(s.startedAt, data.settings.timezone)),
    );
    const recent = qualifying.some(
      (s) =>
        Date.now() - new Date(s.endedAt ?? s.startedAt).getTime() <
        48 * 3600_000,
    );
    if (days.size < 3 || !recent) break;
    unlocked = level + 1;
  }
  return unlocked;
}
export function selectSessionWords(
  data: LearnerData,
  level: number,
  now = Date.now(),
) {
  const highest = unlockedLevel(data);
  const reviews = Object.values(data.reviews)
    .filter((r) => (wordById.get(r.wordId)?.level ?? 9) <= highest)
    .filter(
      (r) =>
        localDate(r.dueDate, data.settings.timezone) <=
        localDate(now, data.settings.timezone),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const mistakes = Object.values(data.reviews)
    .filter((r) => (wordById.get(r.wordId)?.level ?? 9) <= highest)
    .filter(
      (r) =>
        r.lastMistake &&
        now - new Date(r.lastMistake).getTime() <= 7 * 86400_000,
    );
  const fresh = words.filter((w) => w.level === level && !data.reviews[w.id]);
  const practice = words.filter((w) => w.level === level);
  return Array.from(
    new Set([
      ...reviews.slice(0, 9).map((r) => r.wordId),
      ...mistakes.slice(0, 4).map((r) => r.wordId),
      ...fresh.slice(0, 12).map((w) => w.id),
      ...practice.map((w) => w.id),
    ]),
  );
}
export function accuracy(data: LearnerData) {
  const first = data.attempts.filter(
    (a, i, all) =>
      all.findIndex(
        (b) => b.sessionId === a.sessionId && b.wordId === a.wordId,
      ) === i,
  );
  return {
    total: first.length,
    correct: first.filter((a) => a.isFirstTry).length,
    percent: first.length
      ? Math.round(
          (first.filter((a) => a.isFirstTry).length / first.length) * 100,
        )
      : null,
  };
}

export function practiceStreak(data: LearnerData, now = new Date()) {
  const days = new Set(
    data.sessions
      .filter(
        (s) =>
          s.durationSeconds > 0 ||
          data.attempts.some((a) => a.sessionId === s.id),
      )
      .map((s) => localDate(s.startedAt, data.settings.timezone)),
  );
  let cursor = new Date(`${localDate(now, data.settings.timezone)}T12:00:00Z`);
  const key = () => cursor.toISOString().slice(0, 10);
  if (!days.has(key())) cursor = new Date(cursor.getTime() - 86400_000);
  let count = 0;
  while (days.has(key())) {
    count++;
    cursor = new Date(cursor.getTime() - 86400_000);
  }
  return count;
}
