import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { choose } from "./controls";
import { fakeSpeech, spoken } from "./speech";
test("mobile settings use themed menus, keyboard selection, large controls and saved values", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/profile");
  await expect(
    page.getByRole("combobox", { name: "Theme", exact: true }),
  ).toBeVisible();
  await expect(page.locator("select")).toHaveCount(0);
  await expect(page.locator(".theme-toggle")).not.toContainText("System");
  await expect(
    page.getByRole("link", { name: "Settings", exact: true }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Theme", exact: true }).click();
  const menu = page.getByRole("listbox");
  expect(
    await menu.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(20, 29, 50)");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("combobox", { name: "Theme", exact: true }).press("End");
  await page
    .getByRole("combobox", { name: "Theme", exact: true })
    .press("Enter");
  await expect(
    page.getByRole("combobox", { name: "Theme", exact: true }),
  ).toHaveAttribute("data-value", "dark");
  await choose(page, "Your daily aim", "25");
  await choose(page, "Voice", "male");
  await choose(page, "Slow playback speed", "0.6");
  await page.reload();
  for (const [label, value] of [
    ["Your daily aim", "25"],
    ["Voice", "male"],
    ["Slow playback speed", "0.6"],
  ])
    await expect(
      page.getByRole("combobox", { name: label, exact: true }),
    ).toHaveAttribute("data-value", value);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("learning hub search, guide navigation and direct level links work", async ({
  page,
}) => {
  await page.goto("/learn");
  await page
    .getByRole("searchbox", { name: "Find a level or word" })
    .fill("accommodation");
  await expect(page.locator(".hub-card")).toHaveCount(2);
  await page
    .locator(".hub-card")
    .first()
    .getByRole("link", { name: "Practise this level" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Your practice level", exact: true }),
  ).toHaveAttribute("data-value", "10");
  await page.goto("/guides");
  await page
    .getByRole("navigation", { name: "Study guide sections" })
    .getByRole("link", { name: "Return to a word on another day" })
    .click();
  await expect(page).toHaveURL(/#review$/);
  await page
    .getByRole("link", { name: "Make a weekly plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your week. Your rhythm." }),
  ).toBeVisible();
});
test("weekly plan saves checklist and choices and opens the right activity", async ({
  page,
}) => {
  await page.goto("/planner");
  await choose(page, "Monday activity", "pronunciation");
  await choose(page, "Monday level", "13");
  await choose(page, "Monday length", "25");
  await page.getByLabel("I practised on Monday").check();
  await page.reload();
  await expect(page.getByLabel("I practised on Monday")).toBeChecked();
  await expect(
    page.getByRole("combobox", { name: "Monday level", exact: true }),
  ).toHaveAttribute("data-value", "13");
  await page
    .locator(".planner-day")
    .first()
    .getByRole("link", { name: "Open this practice" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Choose words", exact: true }),
  ).toHaveAttribute("data-value", "13");
  await expect(page.locator(".spoken-word")).toHaveText("as soon as possible");
});
test("enhanced audio requires this-browser permission and sends selected British gender and rate", async ({
  page,
}) => {
  const requests: {
    text: string;
    gender: string;
    rate: number;
    consent: boolean;
  }[] = [];
  await page.route("**/api/speech", async (route) => {
    if (route.request().method() === "GET")
      await route.fulfill({
        json: {
          available: true,
          provider: "Azure Speech",
          requiresConsent: true,
        },
      });
    else {
      requests.push(route.request().postDataJSON());
      await route.fulfill({
        contentType: "audio/mpeg",
        body: Buffer.from([1, 2, 3]),
      });
    }
  });
  await page.addInitScript(() => {
    class Player {
      src = "";
      onended: null | (() => void) = null;
      onerror: null | (() => void) = null;
      constructor(src: string) {
        this.src = src;
      }
      pause() {}
      play() {
        return Promise.resolve();
      }
    }
    Object.defineProperty(window, "Audio", {
      value: Player,
      configurable: true,
    });
  });
  await page.goto("/profile");
  await choose(page, "Voice", "male");
  await page.getByRole("checkbox", { name: /I allow lesson text/ }).check();
  await choose(page, "Audio source", "enhanced");
  await page.getByRole("button", { name: "Try this voice" }).click();
  await expect(
    page.getByText("Using Ryan, a British English male voice.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(requests.at(-1)?.gender).toBe("male");
  expect(requests.at(-1)?.rate).toBe(0.65);
  await page.getByRole("checkbox", { name: /I allow lesson text/ }).uncheck();
  await expect(
    page.getByRole("combobox", { name: "Audio source", exact: true }),
  ).toHaveAttribute("data-value", "device");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("english-practice-enhanced-audio-consent-v1"),
    ),
  ).toBe(null);
});
test("enhanced source imported without consent makes no provider request", async ({
  page,
}) => {
  let posts = 0;
  await page.route("**/api/speech", async (route) => {
    if (route.request().method() === "GET")
      await route.fulfill({ json: { available: true } });
    else {
      posts++;
      await route.fulfill({ status: 500 });
    }
  });
  await page.goto("/profile");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const file = await download,
    stream = await file.createReadStream();
  const parts: Buffer[] = [];
  for await (const part of stream!) parts.push(part);
  const snapshot = JSON.parse(Buffer.concat(parts).toString());
  snapshot.settings.audioSource = "enhanced";
  await page.locator("input[type=file]").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(snapshot)),
  });
  await page.getByRole("button", { name: "Try this voice" }).click();
  expect(posts).toBe(0);
  await expect(
    page.getByText(/Enhanced audio needs your permission/),
  ).toBeVisible();
});
test("long sentence typing layout remains contained on mobile and honours reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/session?level=13");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("as soon as possible");
  await expect(page.locator(".word-result")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  expect(
    await page
      .locator(".practice-preview")
      .evaluate((el) => parseFloat(getComputedStyle(el).animationDuration)),
  ).toBeLessThan(0.01);
});
test("speech endpoint advertises unconfigured enhancement without exposing secrets", async ({
  request,
}) => {
  const response = await request.get("/api/speech");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    available: false,
    provider: "Azure Speech",
    requiresConsent: true,
  });
  expect(
    (
      await request.post("/api/speech", {
        data: { text: "cat", gender: "male", rate: 1, consent: true },
      })
    ).status(),
  ).toBe(503);
});

test("provider quota failure falls back to the selected device gender instead of pretending to play Ryan", async ({
  page,
}) => {
  await fakeSpeech(page);
  await page.route("**/api/speech", (route) =>
    route.fulfill(
      route.request().method() === "GET"
        ? { json: { available: true } }
        : { status: 429, json: { error: "Quota reached" } },
    ),
  );
  await page.goto("/profile");
  await choose(page, "Voice", "male");
  await page.getByRole("checkbox", { name: /I allow lesson text/ }).check();
  await choose(page, "Audio source", "enhanced");
  await page.getByRole("button", { name: "Try this voice" }).click();
  await expect(
    page.getByText(/Enhanced audio could not play. Using this device/),
  ).toBeVisible();
  expect((await spoken(page)).at(-1)?.voice).toBe("Google UK English Male");
  expect((await spoken(page)).at(-1)?.rate).toBe(0.65);
});
