import type { LearnerData, Settings } from "./types";
// New preference edits win by timestamp, including edits made before any drills.
// Timestamp-free legacy clients retain their previous first-login merge policy.
export function mergeSyncedSettings(
  local: LearnerData,
  remote?: LearnerData,
): Settings {
  const localTime = Date.parse(local.settings.updatedAt ?? "") || 0;
  const remoteTime = Date.parse(remote?.settings.updatedAt ?? "") || 0;
  const selected =
    !remote ||
    localTime > remoteTime ||
    (localTime === remoteTime && local.attempts.length > 0)
      ? local.settings
      : remote.settings;
  return {
    ...selected,
    theme: selected.theme ?? "system",
    voiceGender: selected.voiceGender ?? "female",
  };
}
