import {
  createSpeechGuard,
  isSpeechRequest,
  isTrustedSpeechOrigin,
  speechConfiguration,
  synthesise,
} from "@/lib/speech-service";
export const runtime = "nodejs";
export const maxDuration = 15;
const guard = createSpeechGuard();
const cache = new Map<string, ArrayBuffer>();
export async function GET() {
  return Response.json(
    {
      available: !!speechConfiguration(),
      provider: "Azure Speech",
      requiresConsent: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const config = speechConfiguration();
  if (!config)
    return Response.json(
      {
        error:
          "Enhanced audio is not configured. Device voices remain available.",
      },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (!isTrustedSpeechOrigin(origin, request.url))
    return Response.json(
      { error: "Use the audio controls on this website." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 6000)
    return Response.json({ error: "Request too large." }, { status: 413 });
  let value: unknown;
  try {
    const body = await request.text();
    if (body.length > 6000)
      return Response.json({ error: "Request too large." }, { status: 413 });
    value = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isSpeechRequest(value))
    return Response.json(
      { error: "Only listed lesson text with consent is supported." },
      { status: 400 },
    );
  const key = JSON.stringify([value.text, value.gender, value.rate]);
  const cached = cache.get(key);
  const identity =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 80) ??
    "local";
  if (!guard(identity, cached ? 0 : value.text.length))
    return Response.json(
      { error: "Audio usage limit reached. Use device voices for now." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  try {
    const bytes = cached ?? (await synthesise(value, config));
    if (!cached) {
      if (cache.size >= 32) cache.delete(cache.keys().next().value!);
      cache.set(key, bytes);
    }
    return new Response(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Enhanced audio is temporarily unavailable. Use device voices for now.",
      },
      { status: 502 },
    );
  }
}
