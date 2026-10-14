import type { LearnerData } from "./types";
import { isLearnerData } from "./validation";
const key = (scope: string) => `english-practice-draft:${scope}`;
// A tiny, account-scoped write-ahead checkpoint protects unfinished letters if a
// reload interrupts IndexedDB's asynchronous commit. Attempts and reviews remain
// exclusively in the existing store and their learning rules are unchanged.
export function stageCheckpoint(data: LearnerData, scope: string): () => void {
  if (typeof localStorage === "undefined") return () => {};
  try {
    const session = [...data.sessions]
      .reverse()
      .find((s) => !s.endedAt && !s.completed && !s.wordCompleted && s.draft);
    if (!session) {
      localStorage.removeItem(key(scope));
      return () => {};
    }
    const raw = JSON.stringify(session);
    localStorage.setItem(key(scope), raw);
    return () => {
      try {
        if (localStorage.getItem(key(scope)) === raw)
          localStorage.removeItem(key(scope));
      } catch {}
    };
  } catch {
    return () => {};
  }
}
export function restoreCheckpoint(
  data: LearnerData,
  raw: string | null,
): LearnerData {
  if (!raw) return data;
  try {
    const session = JSON.parse(raw);
    if (
      !isLearnerData({
        ...data,
        attempts: [],
        reviews: {},
        sessions: [session],
      })
    )
      return data;
    const saved = data.sessions.find((s) => s.id === session.id);
    // Never advance the queue, recreate a finished session or rewrite attempts.
    if (
      !saved ||
      saved.endedAt ||
      saved.completed ||
      saved.wordCompleted ||
      saved.cursor !== session.cursor ||
      saved.wordIds[saved.cursor] !== session.draft?.wordId
    )
      return data;
    return {
      ...data,
      sessions: data.sessions.map((s) =>
        s.id === session.id
          ? {
              ...s,
              draft: session.draft,
              durationSeconds: Math.max(
                s.durationSeconds,
                session.durationSeconds,
              ),
            }
          : s,
      ),
    };
  } catch {
    return data;
  }
}
export function recoverCheckpoint(
  data: LearnerData,
  scope: string,
): LearnerData {
  if (typeof localStorage === "undefined") return data;
  try {
    return restoreCheckpoint(data, localStorage.getItem(key(scope)));
  } catch {
    return data;
  }
}
