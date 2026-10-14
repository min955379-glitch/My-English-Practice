import { recoverCheckpoint, recoverSettingsCheckpoint } from "./checkpoint";
import { openDB } from "idb";
import type { LearnerData } from "./types";
import { isVoiceGender } from "./voices";
import { isThemeChoice } from "./theme";
export function emptyData(): LearnerData {
  return {
    version: 1,
    attempts: [],
    sessions: [],
    reviews: {},
    settings: {
      theme: "system",
      voiceGender: "female",
      audioSource: "device",
      dailyTargetMinutes: 20,
      preferredVoice: "",
      slowRate: 0.65,
      spokenInstructions: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}
const database = () =>
  openDB("my-english-practice", 1, {
    upgrade(db) {
      db.createObjectStore("learner");
    },
  });
export async function readData(scope = "local"): Promise<LearnerData> {
  const db = await database();
  try {
    const data: LearnerData = recoverCheckpoint(
      recoverSettingsCheckpoint(
        (await db.get("learner", scope)) ?? emptyData(),
        scope,
      ),
      scope,
    );
    return {
      ...data,
      settings: {
        ...data.settings,
        audioSource:
          data.settings.audioSource === "enhanced" ? "enhanced" : "device",
        voiceGender: isVoiceGender(data.settings.voiceGender)
          ? data.settings.voiceGender
          : "female",
        theme: isThemeChoice(data.settings.theme)
          ? data.settings.theme
          : "system",
      },
    };
  } finally {
    db.close();
  }
}
export async function writeData(data: LearnerData, scope = "local") {
  const db = await database();
  try {
    await db.put("learner", data, scope);
  } finally {
    db.close();
  }
}
export async function removeData(scope = "local") {
  const db = await database();
  try {
    await db.delete("learner", scope);
  } finally {
    db.close();
  }
}
