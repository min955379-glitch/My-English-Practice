import test from "node:test";
import assert from "node:assert/strict";
import {
  scheduleReview,
  selectSessionWords,
  accuracy,
  unlockedLevel,
} from "../src/lib/learning";
import { emptyData } from "../src/lib/storage";
import { words } from "../src/lib/curriculum";
import { isLearnerData } from "../src/lib/validation";
import type { Attempt } from "../src/lib/types";
const attempt = (overrides: Partial<Attempt> = {}): Attempt => ({
  id: crypto.randomUUID(),
  sessionId: crypto.randomUUID(),
  wordId: "1:cat",
  typedAnswer: "cat",
  isCorrect: true,
  isFirstTry: true,
  errorsCount: 0,
  hintsUsed: 0,
  timeSpentMs: 5000,
  attemptedAt: "2026-10-14T08:00:00Z",
  mistakeTypes: [],
  mistakes: [],
  mode: "spelling",
  ...overrides,
});
test("curriculum has at least five items for each level", () => {
  for (let i = 1; i <= 8; i++)
    assert.ok(words.filter((w) => w.level === i).length >= 5);
});
test("mistakes return tomorrow with one-day interval", () => {
  const review = scheduleReview(
    undefined,
    attempt({ isFirstTry: false, errorsCount: 1 }),
    "UTC",
  );
  assert.equal(review.intervalDays, 1);
  assert.equal(review.dueDate, "2026-10-15T08:00:00.000Z");
  assert.equal(review.mastered, false);
});
test("same-day success cannot create mastery", () => {
  let review = scheduleReview(undefined, attempt(), "UTC");
  for (let i = 0; i < 8; i++) review = scheduleReview(review, attempt(), "UTC");
  assert.equal(review.successfulDates.length, 1);
  assert.equal(review.mastered, false);
  assert.equal(review.repetitions, 1);
});
test("separate days and a long interval earn mastery", () => {
  let review = scheduleReview(undefined, attempt(), "UTC");
  review = scheduleReview(
    review,
    attempt({ attemptedAt: "2026-10-15T08:00:00Z" }),
    "UTC",
  );
  review = scheduleReview(
    review,
    attempt({ attemptedAt: "2026-10-18T08:00:00Z" }),
    "UTC",
  );
  assert.equal(review.mastered, false);
  review = scheduleReview(
    review,
    attempt({ attemptedAt: "2026-10-26T08:00:00Z" }),
    "UTC",
  );
  assert.equal(review.mastered, true);
});
test("new mistake removes mastery", () => {
  let review = scheduleReview(undefined, attempt(), "UTC");
  review = {
    ...review,
    mastered: true,
    successfulDates: ["2026-10-10", "2026-10-11", "2026-10-14"],
  };
  review = scheduleReview(
    review,
    attempt({ isFirstTry: false, errorsCount: 1 }),
    "UTC",
  );
  assert.equal(review.mastered, false);
  assert.equal(review.successfulDates.length, 0);
});
test("assisted retries do not inflate accuracy", () => {
  const data = emptyData();
  const first = attempt({ isFirstTry: false });
  data.attempts = [
    first,
    attempt({ sessionId: first.sessionId, isFirstTry: false }),
  ];
  assert.deepEqual(accuracy(data), { total: 1, correct: 0, percent: 0 });
});
test("due words are selected even before their exact time today", () => {
  const data = emptyData();
  data.settings.timezone = "UTC";
  data.reviews["1:cat"] = scheduleReview(
    undefined,
    attempt({ isFirstTry: false }),
    "UTC",
  );
  assert.ok(
    selectSessionWords(data, 1, Date.parse("2026-10-15T01:00:00Z")).includes(
      "1:cat",
    ),
  );
});
test("new learner begins at Level 1", () =>
  assert.equal(unlockedLevel(emptyData()), 1));
test("invalid imported data is rejected", () => {
  assert.equal(isLearnerData({ version: 1 }), false);
  assert.equal(
    isLearnerData({
      ...emptyData(),
      settings: { ...emptyData().settings, timezone: "invalid" },
    }),
    false,
  );
  assert.equal(isLearnerData(emptyData()), true);
});
test("previewed harder words do not enter locked spelling levels", () => {
  const data = emptyData();
  const review = scheduleReview(
    undefined,
    attempt({ wordId: "8:thank you very much", isFirstTry: false }),
    "UTC",
  );
  data.reviews[review.wordId] = review;
  assert.equal(
    selectSessionWords(data, 1, Date.parse("2026-10-15T09:00:00Z")).includes(
      review.wordId,
    ),
    false,
  );
});
