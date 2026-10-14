import { test, expect, type Page } from "@playwright/test";
async function fakeSpeech(page: Page) {
  await page.addInitScript(() => {
    const records: {
      text: string;
      voice: string;
      rate: number;
      lang: string;
    }[] = [];
    const names = ["Google UK English Female", "Google UK English Male"];
    let voices = names.map((name) => ({
      name,
      voiceURI: name,
      lang: "en-GB",
      default: name.endsWith("Female"),
      localService: true,
    }));
    class Utterance {
      constructor(public text: string) {}
      voice: { name: string } | null = null;
      lang = "";
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: null = null;
    }
    class Synth extends EventTarget {
      getVoices() {
        return voices;
      }
      cancel() {}
      speak(utterance: Utterance) {
        records.push({
          text: utterance.text,
          voice: utterance.voice?.name ?? "",
          rate: utterance.rate,
          lang: utterance.lang,
        });
        queueMicrotask(() => {
          utterance.onstart?.();
          utterance.onend?.();
        });
      }
    }
    const synth = new Synth();
    Object.defineProperty(window, "speechSynthesis", {
      value: synth,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: Utterance,
      configurable: true,
    });
    Object.assign(window, {
      __spoken: records,
      __setVoices: (next: string[]) => {
        voices = next.map((name) => ({
          name,
          voiceURI: name,
          lang: "en-GB",
          default: true,
          localService: true,
        }));
        synth.dispatchEvent(new Event("voiceschanged"));
      },
    });
  });
}
const spoken = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as Window & {
          __spoken: {
            text: string;
            voice: string;
            rate: number;
            lang: string;
          }[];
        }
      ).__spoken,
  );
test("every level is selectable from a fresh visit and Level 13 can start immediately", async ({
  page,
}) => {
  await page.goto("/session");
  const picker = page.getByLabel("Your practice level");
  await expect(picker.locator("option")).toHaveCount(13);
  await expect(picker.locator("option:disabled")).toHaveCount(0);
  for (let level = 1; level <= 13; level++) {
    await picker.selectOption(String(level));
    await expect(picker).toHaveValue(String(level));
  }
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("as soon as possible");
  await expect(page.locator(".word-result")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.locator(".level-progress")).toHaveCount(13);
  await expect(page.locator(".level-number.locked")).toHaveCount(0);
  await expect(page.getByText(/not unlocked|\(locked\)/i)).toHaveCount(0);
});
test("settings has no authentication form or entry points and auth page URLs return 404", async ({
  page,
  request,
}) => {
  await page.goto("/profile");
  await expect(page.getByLabel("Voice", { exact: true })).toBeVisible();
  await expect(
    page.locator("input[type=email],input[type=password]"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: /^(Sign in|Log in|Sign up|Create account)$/i,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: /^(Sign in|Log in|Sign up|Create account)$/i,
    }),
  ).toHaveCount(0);
  for (const route of [
    "/login",
    "/signup",
    "/sign-in",
    "/sign-up",
    "/register",
  ])
    expect((await request.get(route)).status()).toBe(404);
});
test("male voice preference persists, exports and imports and is used by all playback modes", async ({
  page,
}) => {
  await fakeSpeech(page);
  await page.goto("/profile");
  await expect(page.getByLabel("Voice", { exact: true })).toHaveValue("female");
  await page.getByLabel("Voice", { exact: true }).selectOption("male");
  await page.reload();
  await expect(page.getByLabel("Voice", { exact: true })).toHaveValue("male");
  await page.getByRole("button", { name: "Try this voice" }).click();
  expect((await spoken(page)).at(-1)?.voice).toBe("Google UK English Male");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const file = await download;
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const backup = Buffer.concat(chunks);
  expect(JSON.parse(backup.toString()).settings.voiceGender).toBe("male");
  await page.getByLabel("Voice", { exact: true }).selectOption("female");
  await page.locator("input[type=file]").setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: backup,
  });
  await expect(page.getByLabel("Voice", { exact: true })).toHaveValue("male");
  for (const path of ["/session", "/dictation"]) {
    await page.goto(path);
    await page.getByRole("button", { name: "Start my practice" }).click();
    await page.getByRole("button", { name: "Listen", exact: true }).click();
    await page
      .getByRole("button", { name: /Listen slowly|Slow listen/, exact: true })
      .click();
    const records = await spoken(page);
    expect(records.length).toBeGreaterThan(1);
    expect(
      records.every(
        (record) =>
          record.voice === "Google UK English Male" && record.lang === "en-GB",
      ),
    ).toBe(true);
    expect(records.some((record) => record.rate === 1)).toBe(true);
    expect(records.some((record) => record.rate === 0.65)).toBe(true);
  }
  await page.goto("/pronunciation");
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await page
    .getByRole("button", { name: "Listen slowly", exact: true })
    .click();
  expect(
    (await spoken(page)).every(
      (record) => record.voice === "Google UK English Male",
    ),
  ).toBe(true);
  await page.goto("/reading");
  await page.getByRole("button", { name: "Listen to the passage" }).click();
  await page.getByRole("button", { name: "Slow sentence" }).click();
  expect(
    (await spoken(page)).every(
      (record) => record.voice === "Google UK English Male",
    ),
  ).toBe(true);
  await page.goto("/profile");
  await page.getByLabel("Voice", { exact: true }).selectOption("female");
  await page.getByRole("button", { name: "Try this voice" }).click();
  expect((await spoken(page)).at(-1)?.voice).toBe("Google UK English Female");
});
test("missing male voice uses British fallback, and delayed voice availability honours saved choice", async ({
  page,
}) => {
  await fakeSpeech(page);
  await page.goto("/profile");
  await page.getByLabel("Voice", { exact: true }).selectOption("male");
  await page.evaluate(() =>
    (
      window as unknown as Window & { __setVoices: (names: string[]) => void }
    ).__setVoices(["Custom British Voice"]),
  );
  await page.getByRole("button", { name: "Try this voice" }).click();
  expect((await spoken(page)).at(-1)?.voice).toBe("Custom British Voice");
  await expect(
    page.getByText(/best available British English voice on this device/),
  ).toBeVisible();
  await page.evaluate(() =>
    (
      window as unknown as Window & { __setVoices: (names: string[]) => void }
    ).__setVoices(["Google UK English Male"]),
  );
  await page.getByRole("button", { name: "Try this voice" }).click();
  expect((await spoken(page)).at(-1)?.voice).toBe("Google UK English Male");
});
