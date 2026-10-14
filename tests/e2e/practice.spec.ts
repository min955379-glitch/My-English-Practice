import { test, expect } from "@playwright/test";
test("landing page is accessible and has no horizontal overflow on mobile", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /A little practice/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Start practising", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start my practice" }),
  ).toBeVisible();
});
test("wrong letters block, hints activate, mistakes persist and return in-session", async ({
  page,
}) => {
  await page.goto("/session");
  await page.getByRole("button", { name: "Start my practice" }).click();
  const input = page.getByRole("textbox", {
    name: "Type the spelling one letter at a time",
  });
  await input.pressSequentially("xx");
  await expect(page.locator(".wrong-letter")).toHaveText("X");
  await expect(
    page.getByRole("button", { name: "I need a hint" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "I need a hint" }).click();
  await input.pressSequentially("cat");
  await expect(page.getByRole("button", { name: "Next word" })).toBeVisible();
  await expect(page.locator(".letter-slot").nth(0)).toHaveText("C");
  await page.getByRole("button", { name: "Next word" }).click();
  await input.pressSequentially("dog");
  await page.getByRole("button", { name: "Next word" }).click();
  await input.pressSequentially("sun");
  await page.getByRole("button", { name: "Next word" }).click();
  await input.pressSequentially("cat");
  await expect(page.locator(".word-result")).toContainText(
    "A small domestic animal.",
  );
  await page.getByRole("button", { name: "Finish for now" }).click();
  await page.getByRole("link", { name: "See my progress" }).click();
  await expect(
    page.getByRole("heading", { name: "Your progress, at your pace." }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Vowel sounds", { exact: true })
      .or(page.getByText("Consonant sounds", { exact: true }))
      .first(),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".metric-card").first()).toContainText("67%");
});
test("phonics, dictation, reading, pronunciation and settings work", async ({
  page,
}) => {
  await page.goto("/phonics");
  await page
    .getByRole("button", { name: /Practise this pattern/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Start my practice" }).click();
  await expect(
    page.getByRole("button", { name: "Listen", exact: true }),
  ).toBeVisible();
  await page.goto("/dictation");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("thank you very much");
  await expect(page.locator(".word-result")).toBeVisible();
  await page.goto("/reading");
  await page
    .getByRole("button", { name: "At the train station", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "At the train station", exact: true }),
  ).toBeVisible();
  await page.goto("/pronunciation");
  await expect(page.locator(".spoken-word")).toHaveText("cat");
  await page.getByRole("button", { name: "Try another word" }).click();
  await expect(page.locator(".spoken-word")).toHaveText("dog");
  await page.goto("/profile");
  await page.getByLabel("Your daily aim").selectOption("15");
  await page.reload();
  await expect(page.getByLabel("Your daily aim")).toHaveValue("15");
});
test("health and unauthenticated API access", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  expect((await request.post("/api/sync", { data: {} })).status()).toBe(401);
  expect((await request.delete("/api/account")).status()).toBe(401);
});
test("loaded drill works without a network connection", async ({
  page,
  context,
}) => {
  await page.goto("/session");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await context.setOffline(true);
  await page.getByRole("textbox").pressSequentially("cat");
  await expect(page.locator(".word-result")).toBeVisible();
  await context.setOffline(false);
});
test("unfinished letters resume after reload", async ({ page }) => {
  await page.goto("/session");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("c");
  await page.reload();
  await page.getByRole("button", { name: "Resume unfinished session" }).click();
  await expect(page.locator(".letter-slot").first()).toHaveText("C");
  await page.getByRole("textbox").pressSequentially("at");
  await expect(page.locator(".word-result")).toBeVisible();
});
test("production cached pages reload offline", async ({ page, context }) => {
  test.skip(
    process.env.TEST_PRODUCTION !== "1",
    "Service-worker caching is only enabled in production.",
  );
  await page.goto("/session");
  await expect(
    page.getByRole("button", { name: "Start my practice" }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Your progress, at your pace." }),
  ).toBeVisible();
  await page.goto("/session");
  await context.setOffline(true);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Your progress, at your pace." }),
  ).toBeVisible();
  await context.setOffline(false);
});
