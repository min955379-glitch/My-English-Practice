import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  currentWeek,
  isPracticePlan,
  weeklyPlan,
  planLink,
} from "../src/lib/planner";
import { emptyData } from "../src/lib/storage";
import { isLearnerData } from "../src/lib/validation";
import { mergeSyncedSettings } from "../src/lib/sync-settings";
import {
  createSpeechGuard,
  isSpeechRequest,
  speechSsml,
  synthesise,
} from "../src/lib/speech-service";
import { passages } from "../src/content/reading";
import { words } from "../src/lib/curriculum";
test("planner uses local Monday boundaries and seven days", () => {
  assert.equal(
    currentWeek("Asia/Karachi", new Date("2026-10-11T20:00:00Z")),
    "2026-10-12",
  );
  assert.equal(
    currentWeek("UTC", new Date("2026-10-11T20:00:00Z")),
    "2026-10-05",
  );
  const plan = weeklyPlan(undefined, "UTC", 20, new Date("2026-10-14"));
  assert.equal(plan.days.length, 7);
  assert.ok(isPracticePlan(plan));
  assert.ok(plan.days.every((d) => d.minutes === 20));
});
test("new week retains choices and clears ticks without touching progress", () => {
  const now = new Date("2026-10-14");
  const plan = weeklyPlan(undefined, "UTC", 20, now);
  plan.days[0] = { level: 13, mode: "pronunciation", minutes: 25, done: true };
  assert.equal(weeklyPlan(plan, "UTC", 20, now), plan);
  const next = weeklyPlan(plan, "UTC", 20, new Date("2026-10-21"));
  assert.equal(next.days[0].level, 13);
  assert.equal(next.days[0].done, false);
  assert.equal(planLink(next.days[0]), "/pronunciation?level=13");
  assert.equal(
    planLink({ level: 1, mode: "reading", minutes: 15, done: false }),
    "/reading",
  );
});
test("planner and audio preferences export/import/sync and invalid preferences are rejected", () => {
  const data = emptyData();
  data.settings.practicePlan = weeklyPlan(
    undefined,
    "UTC",
    20,
    new Date("2026-10-14"),
  );
  data.settings.audioSource = "enhanced";
  data.settings.updatedAt = "2026-10-14T10:00:00Z";
  assert.ok(isLearnerData(JSON.parse(JSON.stringify(data))));
  assert.equal(mergeSyncedSettings(data, emptyData()).audioSource, "enhanced");
  assert.deepEqual(
    mergeSyncedSettings(data).practicePlan,
    data.settings.practicePlan,
  );
  assert.equal(
    isLearnerData({
      ...data,
      settings: { ...data.settings, audioSource: "unsafe" },
    }),
    false,
  );
  assert.equal(
    isPracticePlan({ ...data.settings.practicePlan, weekStart: "2026-02-30" }),
    false,
  );
  assert.equal(
    isPracticePlan({ ...data.settings.practicePlan, days: [] }),
    false,
  );
});
test("enhanced audio only accepts listed lesson text, supported rates and explicit consent", () => {
  for (const text of [
    words[0].text,
    words[407].example,
    passages[0].sentences.join(" "),
  ])
    assert.ok(
      isSpeechRequest({ text, gender: "male", rate: 0.65, consent: true }),
    );
  assert.equal(
    isSpeechRequest({
      text: "a private free-form message",
      gender: "male",
      rate: 1,
      consent: true,
    }),
    false,
  );
  assert.equal(
    isSpeechRequest({ text: "cat", gender: "male", rate: 1, consent: false }),
    false,
  );
  assert.equal(
    isSpeechRequest({ text: "cat", gender: "male", rate: 9, consent: true }),
    false,
  );
});
test("provider requests use fixed British voices, escaped SSML and supported slow rate", () => {
  const male = speechSsml({
    text: "cat",
    gender: "male",
    rate: 0.6,
    consent: true,
  });
  assert.match(male, /en-GB-RyanNeural/);
  assert.match(male, /rate="-40%"/);
  assert.match(
    speechSsml({ text: "<tag>&", gender: "female", rate: 1, consent: true }),
    /en-GB-SoniaNeural/,
  );
  assert.match(
    speechSsml({ text: "<tag>&", gender: "female", rate: 1, consent: true }),
    /&lt;tag&gt;&amp;/,
  );
});
test("speech provider adapter returns audio and fails safely, without a real provider call", async () => {
  let body = "",
    target = "";
  const response = await synthesise(
    { text: "cat", gender: "male", rate: 1, consent: true },
    { key: "test-key", region: "uksouth" },
    async (url, init) => {
      target = String(url);
      body = String(init?.body);
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "audio/mpeg" },
      });
    },
  );
  assert.equal(response.byteLength, 3);
  assert.equal(
    target,
    "https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1",
  );
  assert.match(body, /RyanNeural/);
  await assert.rejects(
    synthesise(
      { text: "cat", gender: "male", rate: 1, consent: true },
      { key: "test-key", region: "uksouth" },
      async () => new Response("no", { status: 429 }),
    ),
  );
});
test("speech guard caps requests and daily characters and rolls over correctly", () => {
  const guard = createSpeechGuard();
  for (let i = 0; i < 30; i++) assert.ok(guard("one", 1, 1000));
  assert.equal(guard("one", 1, 1000), false);
  assert.ok(guard("two", 9970, 1000));
  assert.equal(guard("three", 1, 1000), false);
  assert.ok(guard("one", 1, 86400001));
});
test("all former green palette values are removed and normal text contrast is AA", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  for (const hex of [
    "#f1f5f2",
    "#386b68",
    "#1b2b2c",
    "#9ac8bd",
    "#78a7a7",
    "#5b9caa",
    "#e0f7fa",
  ])
    assert.equal(css.includes(hex), false);
  const luminance = (hex: string) => {
    const n = hex.replace("#", "");
    const rgb = [0, 2, 4]
      .map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const contrast = (a: string, b: string) => {
    const x = luminance(a),
      y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  for (const [foreground, background] of [
    ["#586581", "#e9edff"],
    ["#4847a3", "#eef0ff"],
    ["#a8b7d3", "#232e52"],
    ["#b7c1ff", "#1b2341"],
    ["#ffffff", "#6152c1"],
  ])
    assert.ok(
      contrast(foreground, background) >= 4.5,
      `${foreground} on ${background}`,
    );
});

test("pending preference checkpoint survives immediate reload and does not overwrite newer disk settings", async () => {
  const { restoreSettingsCheckpoint } = await import("../src/lib/checkpoint");
  const data = emptyData();
  const settings = {
    ...data.settings,
    dailyTargetMinutes: 25,
    voiceGender: "male" as const,
    updatedAt: "2026-10-14T10:00:00Z",
    practicePlan: weeklyPlan(undefined, "UTC", 25, new Date("2026-10-14")),
  };
  settings.practicePlan.days[0].done = true;
  const restored = restoreSettingsCheckpoint(data, JSON.stringify(settings));
  assert.equal(restored.settings.dailyTargetMinutes, 25);
  assert.equal(restored.settings.voiceGender, "male");
  assert.equal(restored.settings.practicePlan?.days[0].done, true);
  assert.equal(restored.attempts, data.attempts);
  data.settings.updatedAt = "2026-10-14T11:00:00Z";
  assert.equal(restoreSettingsCheckpoint(data, JSON.stringify(settings)), data);
  assert.equal(restoreSettingsCheckpoint(data, "bad JSON"), data);
});

test("speech origin accepts same-site and canonical proxy origin, never arbitrary sites", async () => {
  const { isTrustedSpeechOrigin } = await import("../src/lib/speech-service");
  assert.ok(
    isTrustedSpeechOrigin(
      "https://practice.example",
      "http://localhost:3000/api/speech",
      "https://practice.example",
    ),
  );
  assert.ok(
    isTrustedSpeechOrigin(
      "http://localhost:3000",
      "http://localhost:3000/api/speech",
      "",
    ),
  );
  assert.equal(
    isTrustedSpeechOrigin(
      "https://other.example",
      "https://practice.example/api/speech",
      "https://practice.example",
    ),
    false,
  );
  assert.equal(
    isTrustedSpeechOrigin(null, "https://practice.example/api/speech", ""),
    false,
  );
});
