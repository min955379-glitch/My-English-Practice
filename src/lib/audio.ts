export const AUDIO_CONSENT_KEY = "english-practice-enhanced-audio-consent-v1";
export function hasAudioConsent() {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(AUDIO_CONSENT_KEY) === "yes"
    );
  } catch {
    return false;
  }
}
export function setAudioConsent(value: boolean) {
  try {
    if (value) localStorage.setItem(AUDIO_CONSENT_KEY, "yes");
    else localStorage.removeItem(AUDIO_CONSENT_KEY);
  } catch {}
  window.dispatchEvent(new Event("english-practice-audio-consent"));
}
