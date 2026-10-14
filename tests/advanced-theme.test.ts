import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { emptyData } from "../src/lib/storage";
import {
  levels,
  words,
  patterns,
  dictationLevels,
} from "../src/lib/curriculum";
import { unlockedLevel } from "../src/lib/learning";
import { validateSeed } from "../src/db/seed";
import { isLearnerData } from "../src/lib/validation";
import { isThemeChoice, THEME_BOOTSTRAP } from "../src/lib/theme";
import { mergeSyncedSettings } from "../src/lib/sync-settings";
import type { LearnerData } from "../src/lib/types";
function addSessions(
  data: LearnerData,
  level: number,
  days = ["01", "02", "03"],
  correct = 5,
) {
  const items = words.filter((w) => w.level === level).slice(0, 5);
  for (const day of days) {
    const sessionId = crypto.randomUUID(),
      time = `2026-09-${day}T08:00:00Z`;
    data.sessions.push({
      id: sessionId,
      level,
      startedAt: time,
      endedAt: time,
      durationSeconds: 90,
      completed: true,
      cursor: 4,
      wordIds: items.map((w) => w.id),
    });
    items.forEach((w, i) =>
      data.attempts.push({
        id: crypto.randomUUID(),
        sessionId,
        wordId: w.id,
        typedAnswer: w.text,
        isCorrect: true,
        isFirstTry: i < correct,
        errorsCount: i < correct ? 0 : 1,
        hintsUsed: 0,
        timeSpentMs: 1000,
        attemptedAt: time,
        mistakeTypes: [],
        mistakes: [],
        mode: "spelling",
      }),
    );
  }
}
test("13 complete levels, 408 items and 24 recognised patterns", () => {
  validateSeed();
  assert.equal(levels.length, 13);
  assert.equal(words.length, 408);
  assert.equal(patterns.length, 24);
  assert.deepEqual(
    dictationLevels.map((l) => l.id),
    [8, 13],
  );
  for (const level of levels.filter((l) => l.id >= 9)) {
    assert.equal(level.unlockAccuracyPercent, 80);
    assert.equal(level.requiredSessions, 3);
    assert.equal(words.filter((w) => w.level === level.id).length, 33);
  }
});
test("all levels stay open regardless of existing session history", () => {
  const data = emptyData();
  data.settings.timezone = "UTC";
  for (const level of levels.slice(0, -1)) {
    addSessions(data, level.id, ["01", "02", "03"], 4);
    assert.equal(unlockedLevel(data), 13);
  }
  assert.equal(unlockedLevel(data), 13);
  assert.ok(isLearnerData(data));
});
test("same-day repetition and low accuracy never restrict level access", () => {
  const data = emptyData();
  data.settings.timezone = "UTC";
  for (let level = 1; level < 8; level++) addSessions(data, level);
  addSessions(data, 8, ["01", "01", "01"]);
  assert.equal(unlockedLevel(data), 13);
  data.sessions = data.sessions.filter((s) => s.level !== 8);
  data.attempts = data.attempts.filter((a) => !a.wordId.startsWith("8:"));
  addSessions(data, 8, ["01", "02", "03"], 3);
  assert.equal(unlockedLevel(data), 13);
});
test("legacy exports work, advanced sessions import, invalid themes and level 14 fail", () => {
  const legacy = emptyData();
  delete legacy.settings.theme;
  assert.ok(isLearnerData(legacy));
  for (const theme of ["light", "dark", "system"] as const)
    assert.ok(
      isLearnerData({ ...legacy, settings: { ...legacy.settings, theme } }),
    );
  assert.equal(
    isLearnerData({
      ...legacy,
      settings: { ...legacy.settings, theme: "purple" },
    }),
    false,
  );
  const advanced = emptyData();
  addSessions(advanced, 13);
  assert.ok(isLearnerData(advanced));
  advanced.sessions[0].level = 14;
  assert.equal(isLearnerData(advanced), false);
});
test("prepaint theme respects choice, OS, invalid choice and unavailable storage", () => {
  for (const [choice, os, expected] of [
    ["dark", false, true],
    ["light", true, false],
    ["system", true, true],
    ["system", false, false],
    ["invalid", true, true],
    [null, false, false],
    ["blocked", true, true],
  ] as const) {
    const root = {
      classList: {
        toggle: (_name: string, dark: boolean) => {
          applied = dark;
        },
      },
      style: { colorScheme: "" },
      dataset: { theme: "" },
    };
    let applied = false;
    vm.runInNewContext(THEME_BOOTSTRAP, {
      document: { documentElement: root },
      localStorage: {
        getItem: () => {
          if (choice === "blocked") throw Error("denied");
          return choice;
        },
      },
      matchMedia: () => ({ matches: os }),
    });
    assert.equal(applied, expected);
    assert.equal(root.style.colorScheme, expected ? "dark" : "light");
  }
  assert.ok(isThemeChoice("system"));
  assert.equal(isThemeChoice("invalid"), false);
});
test("cloud theme round trip prefers latest edit even without attempts and handles legacy", () => {
  const remote = emptyData();
  remote.settings.theme = "dark";
  remote.settings.updatedAt = "2026-10-14T08:00:00Z";
  const fresh = emptyData();
  assert.equal(mergeSyncedSettings(fresh, remote).theme, "dark");
  fresh.settings.theme = "light";
  fresh.settings.updatedAt = "2026-10-14T09:00:00Z";
  assert.equal(mergeSyncedSettings(fresh, remote).theme, "light");
  delete remote.settings.theme;
  delete remote.settings.updatedAt;
  delete fresh.settings.updatedAt;
  assert.equal(mergeSyncedSettings(fresh, remote).theme, "system");
});
