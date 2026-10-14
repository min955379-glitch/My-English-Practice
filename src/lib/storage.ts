import { openDB } from "idb";
import type { LearnerData } from "./types";
export function emptyData(): LearnerData {
  return {
    version: 1,
    attempts: [],
    sessions: [],
    reviews: {},
    settings: {
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
    return (await db.get("learner", scope)) ?? emptyData();
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
