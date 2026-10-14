import curriculum from "../content/curriculum.json";
import { passages } from "../content/reading";
export const instructionText =
  "Listen to a word. Hear it slowly. Then type its spelling, one letter at a time. If a letter is not right, try that letter again. After two mistakes, you can choose a hint.";
export const normaliseLessonText = (text: string) =>
  text.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
const allowed = new Set(
  [
    "A little practice, a little more confidence.",
    instructionText,
    ...curriculum.words.flatMap((w) => [
      w.text,
      w.example,
      `The first letter is ${w.text[0]}`,
    ]),
    ...curriculum.patterns.flatMap((p) => p.exampleWords),
    ...passages.flatMap((p) => [...p.sentences, p.sentences.join(" ")]),
  ].map(normaliseLessonText),
);
export type SpeechRequest = {
  text: string;
  gender: "female" | "male";
  rate: number;
  consent: true;
};
export function isSpeechRequest(value: unknown): value is SpeechRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SpeechRequest>;
  return (
    v.consent === true &&
    typeof v.text === "string" &&
    v.text.length <= 1000 &&
    allowed.has(normaliseLessonText(v.text)) &&
    ["female", "male"].includes(v.gender ?? "") &&
    [1, 0.6, 0.65, 0.75].includes(v.rate ?? 0)
  );
}
export function speechConfiguration() {
  const key = process.env.AZURE_SPEECH_KEY?.trim(),
    region = process.env.AZURE_SPEECH_REGION?.trim();
  return key && region && /^[a-z0-9]{2,24}$/.test(region)
    ? { key, region }
    : undefined;
}
const escapeXml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
export function speechSsml(request: SpeechRequest) {
  const voice =
    request.gender === "male" ? "en-GB-RyanNeural" : "en-GB-SoniaNeural";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB"><voice name="${voice}"><prosody rate="${Math.round((request.rate - 1) * 100)}%">${escapeXml(request.text)}</prosody></voice></speak>`;
}
export async function synthesise(
  request: SpeechRequest,
  config: { key: string; region: string },
  transport: typeof fetch = fetch,
) {
  const response = await transport(
    `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": config.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "My-English-Practice",
      },
      body: speechSsml(request),
      signal: AbortSignal.timeout(12000),
    },
  );
  if (
    !response.ok ||
    !(response.headers.get("Content-Type") ?? "").startsWith("audio/")
  )
    throw new Error("Speech provider unavailable");
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 2_000_000)
    throw new Error("Invalid speech response");
  return bytes;
}
// These guards apply per server instance. Azure F0 quota is the final shared cap.
export function createSpeechGuard() {
  const buckets = new Map<string, { start: number; count: number }>();
  let day = -1,
    characters = 0;
  return (key: string, length: number, now = Date.now()) => {
    const date = Math.floor(now / 86400000);
    if (date !== day) {
      day = date;
      characters = 0;
      buckets.clear();
    }
    for (const [id, b] of buckets)
      if (now - b.start > 60000) buckets.delete(id);
    if (buckets.size >= 1000 && !buckets.has(key)) return false;
    const b = buckets.get(key) ?? { start: now, count: 0 };
    if (b.count >= 30 || characters + length > 10000) return false;
    b.count++;
    characters += length;
    buckets.set(key, b);
    return true;
  };
}

export function isTrustedSpeechOrigin(
  origin: string | null,
  requestURL: string,
  canonicalURL = process.env.NEXT_PUBLIC_SITE_URL,
) {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    return (
      origin === new URL(requestURL).origin ||
      (!!canonicalURL && origin === new URL(canonicalURL).origin)
    );
  } catch {
    return false;
  }
}
