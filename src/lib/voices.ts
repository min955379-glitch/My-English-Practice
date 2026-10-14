export type VoiceGender = "female" | "male";
export const isVoiceGender = (value: unknown): value is VoiceGender =>
  value === "female" || value === "male";
export type VoiceDescriptor = Pick<
  SpeechSynthesisVoice,
  "name" | "lang" | "voiceURI" | "default" | "localService"
>;
export function isBritishVoice(voice: VoiceDescriptor) {
  return voice.lang.toLowerCase().replaceAll("_", "-") === "en-gb";
}
// Web Speech exposes no standard gender field. Only explicit labels and known
// British vendor names are classified; an unknown name is never guessed.
export function namedVoiceGender(
  voice: VoiceDescriptor,
): VoiceGender | undefined {
  const name = voice.name.toLowerCase();
  if (/\bfemale\b/.test(name)) return "female";
  if (/\bmale\b/.test(name)) return "male";
  if (
    /\b(sonia|hazel|susan|libby|maisie|abbi|ada|bella|hollie|olivia|serena|kate|stephanie)\b/.test(
      name,
    )
  )
    return "female";
  if (/\b(daniel|george|ryan|thomas|arthur|oliver|ollie|alfie)\b/.test(name))
    return "male";
  return undefined;
}
export function selectSpeechVoice<T extends VoiceDescriptor>(
  voices: readonly T[],
  gender: VoiceGender,
  preferredURI = "",
) {
  const british = voices.filter(isBritishVoice);
  const matching = british.filter(
    (voice) => namedVoiceGender(voice) === gender,
  );
  const english = voices.filter((voice) => /^en(?:[-_]|$)/i.test(voice.lang));
  const pool = matching.length ? matching : british.length ? british : english;
  const score = (voice: T) =>
    (voice.voiceURI === preferredURI && preferredURI ? 8 : 0) +
    (voice.default ? 4 : 0) +
    (voice.localService ? 2 : 0);
  const voice = [...pool].sort(
    (a, b) => score(b) - score(a) || a.name.localeCompare(b.name),
  )[0];
  return {
    voice,
    british: !!voice && isBritishVoice(voice),
    genderMatched:
      !!voice && isBritishVoice(voice) && namedVoiceGender(voice) === gender,
  };
}
export function voiceFallbackMessage(
  gender: VoiceGender,
  selection: ReturnType<typeof selectSpeechVoice>,
) {
  if (!selection.voice)
    return "No English voice is installed. You can use the written hints, or install a British English voice in your device settings.";
  if (!selection.british)
    return "Using a standard English voice. Install a British English voice for en-GB pronunciation.";
  if (!selection.genderMatched)
    return `A named British English ${gender} voice is not available. Using ${selection.voice.name}, the best available British English voice on this device.`;
  return "";
}
