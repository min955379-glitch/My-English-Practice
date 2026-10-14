import test from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../src/app/api/speech/route";
test("configured speech endpoint enforces origin, consent, lesson whitelist and limits; provider is mocked", async () => {
  const oldKey = process.env.AZURE_SPEECH_KEY,
    oldRegion = process.env.AZURE_SPEECH_REGION,
    originalFetch = globalThis.fetch;
  process.env.AZURE_SPEECH_KEY = "test-key";
  process.env.AZURE_SPEECH_REGION = "uksouth";
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  };
  const request = (data: unknown, origin = "https://practice.test") =>
    new Request("https://practice.test/api/speech", {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-Forwarded-For": "api-unit",
      },
      body: JSON.stringify(data),
    });
  try {
    assert.equal((await (await GET()).json()).available, true);
    assert.equal(
      (
        await POST(
          request(
            { text: "cat", gender: "male", rate: 1, consent: true },
            "https://other.test",
          ),
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await POST(
          request({ text: "cat", gender: "male", rate: 1, consent: false }),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await POST(
          request({
            text: "unlisted personal sentence",
            gender: "male",
            rate: 1,
            consent: true,
          }),
        )
      ).status,
      400,
    );
    assert.equal((await POST(request({ text: "x".repeat(6100) }))).status, 413);
    const response = await POST(
      request({ text: "cat", gender: "male", rate: 1, consent: true }),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "audio/mpeg");
    assert.equal((await response.arrayBuffer()).byteLength, 3);
    assert.equal(
      (
        await POST(
          request({ text: "cat", gender: "male", rate: 1, consent: true }),
        )
      ).status,
      200,
    );
    assert.equal(calls, 1);
    globalThis.fetch = async () => new Response("", { status: 429 });
    assert.equal(
      (
        await POST(
          request({ text: "dog", gender: "female", rate: 1, consent: true }),
        )
      ).status,
      502,
    );
    for (let i = 0; i < 27; i++)
      await POST(
        request({ text: "cat", gender: "male", rate: 1, consent: true }),
      );
    assert.equal(
      (
        await POST(
          request({ text: "cat", gender: "male", rate: 1, consent: true }),
        )
      ).status,
      429,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.AZURE_SPEECH_KEY;
    else process.env.AZURE_SPEECH_KEY = oldKey;
    if (oldRegion === undefined) delete process.env.AZURE_SPEECH_REGION;
    else process.env.AZURE_SPEECH_REGION = oldRegion;
  }
});
