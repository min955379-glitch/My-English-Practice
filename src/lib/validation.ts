import type { LearnerData } from "./types";
import { isVoiceGender } from "./voices";
import { isThemeChoice } from "./theme";
import { wordById, levelIds } from "./curriculum";
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const date = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));
const number = (value: unknown, min = 0, max = 1e9) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
const uuid = (value: unknown) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function isLearnerData(value: unknown): value is LearnerData {
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.attempts) ||
    !Array.isArray(value.sessions) ||
    !record(value.reviews) ||
    !record(value.settings)
  )
    return false;
  if (value.attempts.length > 5000 || value.sessions.length > 1000)
    return false;
  const s = value.settings;
  if (s.voiceGender !== undefined && !isVoiceGender(s.voiceGender))
    return false;
  if (s.updatedAt !== undefined && !date(s.updatedAt)) return false;
  if (s.theme !== undefined && !isThemeChoice(s.theme)) return false;
  if (
    !number(s.dailyTargetMinutes, 15, 25) ||
    !number(s.slowRate, 0.6, 0.75) ||
    typeof s.preferredVoice !== "string" ||
    s.preferredVoice.length > 255 ||
    typeof s.spokenInstructions !== "boolean" ||
    typeof s.timezone !== "string"
  )
    return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: s.timezone });
  } catch {
    return false;
  }
  const sessionIds = new Set(value.sessions.filter(record).map((s) => s.id));
  for (const session of value.sessions) {
    if (
      !record(session) ||
      !uuid(session.id) ||
      !date(session.startedAt) ||
      (session.endedAt !== undefined && !date(session.endedAt)) ||
      !number(session.durationSeconds) ||
      !Number.isInteger(session.level) ||
      !levelIds.has(session.level as number) ||
      !Array.isArray(session.wordIds) ||
      session.wordIds.length > 1000 ||
      !session.wordIds.every(
        (id) => typeof id === "string" && wordById.has(id),
      ) ||
      !Number.isInteger(session.cursor) ||
      !number(session.cursor, 0, Math.max(0, session.wordIds.length - 1)) ||
      typeof session.completed !== "boolean"
    )
      return false;
  }
  for (const session of value.sessions) {
    if (!record(session)) return false;
    if (session.draft !== undefined) {
      const draft = session.draft;
      if (
        !record(draft) ||
        typeof draft.wordId !== "string" ||
        !wordById.has(draft.wordId) ||
        !Number.isInteger(draft.index) ||
        !number(draft.index, 0, wordById.get(draft.wordId)!.text.length - 1) ||
        typeof draft.bad !== "string" ||
        draft.bad.length > 1 ||
        !number(draft.errors, 0, 10000) ||
        !number(draft.hints, 0, 3) ||
        !number(draft.elapsedMs) ||
        !Array.isArray(draft.mistakes) ||
        !draft.mistakes.every(
          (m) =>
            record(m) &&
            typeof m.expected === "string" &&
            m.expected.length <= 1 &&
            typeof m.typed === "string" &&
            m.typed.length <= 1 &&
            number(m.position, 0, 255),
        )
      )
        return false;
    }
  }
  for (const attempt of value.attempts) {
    if (
      !record(attempt) ||
      !uuid(attempt.id) ||
      !sessionIds.has(attempt.sessionId) ||
      typeof attempt.wordId !== "string" ||
      !wordById.has(attempt.wordId) ||
      !date(attempt.attemptedAt) ||
      typeof attempt.typedAnswer !== "string" ||
      attempt.typedAnswer.length > 255 ||
      typeof attempt.isCorrect !== "boolean" ||
      typeof attempt.isFirstTry !== "boolean" ||
      !number(attempt.errorsCount) ||
      !number(attempt.hintsUsed, 0, 3) ||
      !number(attempt.timeSpentMs) ||
      !["spelling", "dictation", "phonics"].includes(String(attempt.mode)) ||
      !Array.isArray(attempt.mistakeTypes) ||
      !attempt.mistakeTypes.every(
        (t) => typeof t === "string" && t.length < 50,
      ) ||
      !Array.isArray(attempt.mistakes) ||
      attempt.mistakes.length > 1000 ||
      !attempt.mistakes.every(
        (m) =>
          record(m) &&
          typeof m.expected === "string" &&
          m.expected.length <= 1 &&
          typeof m.typed === "string" &&
          m.typed.length <= 1 &&
          number(m.position, 0, 255),
      )
    )
      return false;
  }
  for (const [key, review] of Object.entries(value.reviews)) {
    if (
      !record(review) ||
      !wordById.has(key) ||
      review.wordId !== key ||
      !date(review.dueDate) ||
      !date(review.lastReviewedAt) ||
      !number(review.stability, 0, 10) ||
      !number(review.difficulty, 0.1, 0.9) ||
      !number(review.repetitions) ||
      !number(review.intervalDays, 1, 365) ||
      !Array.isArray(review.successfulDates) ||
      !review.successfulDates.every(
        (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
      ) ||
      typeof review.mastered !== "boolean" ||
      (review.lastMistake !== undefined && !date(review.lastMistake))
    )
      return false;
  }
  return true;
}
