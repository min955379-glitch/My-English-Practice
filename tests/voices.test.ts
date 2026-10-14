import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  selectSpeechVoice,
  namedVoiceGender,
  voiceFallbackMessage,
  type VoiceDescriptor,
} from "../src/lib/voices";
import { emptyData } from "../src/lib/storage";
import { mergeSyncedSettings } from "../src/lib/sync-settings";
import { isLearnerData } from "../src/lib/validation";
import { words, levels, patterns } from "../src/lib/curriculum";
import { unlockedLevel } from "../src/lib/learning";
const voice = (
  name: string,
  lang = "en-GB",
  isDefault = false,
): VoiceDescriptor => ({
  name,
  lang,
  default: isDefault,
  localService: true,
  voiceURI: name,
});
test("Google UK female and male voices are selected rather than opposite gender or US default", () => {
  const voices = [
    voice("US male", "en-US", true),
    voice("Google UK English Female"),
    voice("Google UK English Male"),
  ];
  assert.equal(
    selectSpeechVoice(voices, "male").voice?.name,
    "Google UK English Male",
  );
  assert.equal(
    selectSpeechVoice(voices, "female").voice?.name,
    "Google UK English Female",
  );
  assert.equal(namedVoiceGender(voices[1]), "female");
});
test("named Microsoft British male and female voices, mixed-case tags and underscore tags work", () => {
  const voices = [
    voice(
      "Microsoft Sonia Online (Natural) - English (United Kingdom)",
      "EN-gb",
    ),
    voice(
      "Microsoft Ryan Online (Natural) - English (United Kingdom)",
      "en_GB",
    ),
  ];
  assert.equal(selectSpeechVoice(voices, "male").voice?.name, voices[1].name);
  assert.equal(selectSpeechVoice(voices, "female").voice?.name, voices[0].name);
});
test("British Apple voices are recognised and unknown voices are not guessed", () => {
  assert.equal(namedVoiceGender(voice("Daniel")), "male");
  assert.equal(namedVoiceGender(voice("Serena")), "female");
  assert.equal(namedVoiceGender(voice("Custom Voice")), undefined);
});
test("missing gender falls back to best British voice and gives a clear message", () => {
  const voices = [
    voice("US Male", "en-US", true),
    voice("Custom British Voice", "en-GB", true),
    voice("Google UK English Female"),
  ];
  const result = selectSpeechVoice(voices, "male");
  assert.equal(result.voice?.name, "Custom British Voice");
  assert.ok(result.british);
  assert.equal(result.genderMatched, false);
  assert.match(
    voiceFallbackMessage("male", result),
    /best available British English voice/,
  );
});
test("legacy preferred URI cannot override a matching requested gender", () => {
  const voices = [
    voice("Google UK English Female"),
    voice("Google UK English Male"),
  ];
  assert.equal(
    selectSpeechVoice(voices, "male", voices[0].voiceURI).voice?.name,
    voices[1].name,
  );
});
test("without British voices use labelled English fallback; without English do not crash", () => {
  const fallback = selectSpeechVoice([voice("English", "en-AU")], "male");
  assert.equal(fallback.british, false);
  assert.match(voiceFallbackMessage("male", fallback), /standard English/);
  const missing = selectSpeechVoice([voice("French", "fr-FR")], "female");
  assert.equal(missing.voice, undefined);
  assert.match(voiceFallbackMessage("female", missing), /No English voice/);
});
test("voice preference exports/imports, rejects invalid values and remains legacy-compatible", () => {
  const data = emptyData();
  data.settings.voiceGender = "male";
  assert.ok(isLearnerData(JSON.parse(JSON.stringify(data))));
  delete data.settings.voiceGender;
  assert.ok(isLearnerData(data));
  assert.equal(
    isLearnerData({
      ...data,
      settings: { ...data.settings, voiceGender: "other" },
    }),
    false,
  );
});
test("voice sync chooses latest edit without attempts and normalises legacy snapshots", () => {
  const local = emptyData(),
    remote = emptyData();
  remote.settings.voiceGender = "male";
  remote.settings.updatedAt = "2026-10-14T08:00:00Z";
  assert.equal(mergeSyncedSettings(local, remote).voiceGender, "male");
  local.settings.updatedAt = "2026-10-14T09:00:00Z";
  assert.equal(mergeSyncedSettings(local, remote).voiceGender, "female");
  delete local.settings.voiceGender;
  assert.equal(mergeSyncedSettings(local).voiceGender, "female");
});
test("all 13 levels are available for guest and account-shaped data without attempts", () => {
  for (const data of [
    emptyData(),
    {
      ...emptyData(),
      settings: {
        ...emptyData().settings,
        theme: "dark" as const,
        voiceGender: "male" as const,
      },
    },
  ])
    assert.equal(unlockedLevel(data), 13);
});
test("curriculum has precisely 25 additions to each original level with complete unique metadata", () => {
  assert.equal(words.length, 408);
  assert.equal(patterns.length, 24);
  for (const level of levels) {
    const items = words.filter((w) => w.level === level.id);
    assert.equal(items.length, level.id <= 7 ? 30 : 33);
    assert.equal(
      new Set(items.map((w) => w.text.toLocaleLowerCase("en-GB"))).size,
      items.length,
    );
    for (const item of items) {
      assert.equal(item.id, `${item.level}:${item.text}`);
      assert.equal(item.syllableCount, item.syllables.length);
      assert.equal(item.stressPattern.split("-").length, item.syllableCount);
      assert.ok(item.phonetic.startsWith("/") && item.phonetic.endsWith("/"));
      assert.ok(
        item.meaning &&
          item.example &&
          item.wordFamily &&
          item.kind &&
          item.syllableSplit,
      );
      assert.ok(patterns.some((p) => p.category === item.patternCategory));
    }
  }
});
test("all speech construction remains in the shared preference-aware hook", () => {
  const routes = [
    "src/components/practice/DrillEngine.tsx",
    "src/components/practice/PronunciationPractice.tsx",
    "src/app/reading/page.tsx",
    "src/app/phonics/page.tsx",
    "src/components/practice/ListenInstructions.tsx",
  ];
  for (const file of routes) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /useSpeech/);
    assert.doesNotMatch(source, /new SpeechSynthesisUtterance/);
  }
});

test("draft checkpoint restores letters without changing attempts, reviews or level access", async () => {
  const { restoreCheckpoint } = await import("../src/lib/checkpoint");
  const data = emptyData();
  const session = {
    id: crypto.randomUUID(),
    startedAt: "2026-10-14T08:00:00Z",
    durationSeconds: 0,
    level: 1,
    wordIds: ["1:cat"],
    cursor: 0,
    completed: false,
  };
  data.sessions.push(session);
  const checkpoint = {
    ...session,
    draft: {
      wordId: "1:cat",
      index: 1,
      bad: "",
      errors: 0,
      hints: 0,
      mistakes: [],
      elapsedMs: 100,
    },
  };
  const restored = restoreCheckpoint(data, JSON.stringify(checkpoint));
  assert.equal(restored.sessions[0].draft?.index, 1);
  assert.equal(restored.attempts, data.attempts);
  assert.equal(restored.reviews, data.reviews);
  assert.equal(unlockedLevel(restored), 13);
  assert.equal(restoreCheckpoint(data, "invalid"), data);
  assert.equal(
    restoreCheckpoint(data, JSON.stringify({ ...checkpoint, cursor: 1 })),
    data,
  );
  data.sessions[0].endedAt = "2026-10-14T08:01:00Z";
  assert.equal(restoreCheckpoint(data, JSON.stringify(checkpoint)), data);
});
