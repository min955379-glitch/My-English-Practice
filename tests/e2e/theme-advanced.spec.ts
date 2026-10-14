import { test, expect } from "@playwright/test";
test("theme settings, header toggle, OS changes, persistence and progress export/import", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/profile");
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("system");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await page.getByLabel("Theme", { exact: true }).selectOption("light");
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await page.reload();
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("light");
  await page.getByRole("button", { name: /Theme: Light/ }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("dark");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export/ }).click();
  const file = await download;
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const progress = JSON.parse(Buffer.concat(chunks).toString());
  expect(progress.settings.theme).toBe("dark");
  await page.getByLabel("Theme", { exact: true }).selectOption("light");
  await page.locator("input[type=file]").setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(progress)),
  });
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("dark");
  await page.getByLabel("Theme", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
});
test("advanced vocabulary and sentence dictation are selectable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".path-card")).toHaveCount(13);
  await page.goto("/pronunciation");
  await page.getByLabel("Choose words").selectOption("11");
  await expect(page.locator(".spoken-word")).toHaveText("conscience");
  await page.goto("/dictation");
  await page.getByLabel("Dictation level").selectOption("13");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("as soon as possible");
  await expect(page.locator(".word-result")).toBeVisible();
});

test("saved choice is applied before body paint and overrides OS", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("english-practice-theme", "dark");
    const observer = new MutationObserver(() => {
      if (document.body) {
        (window as Window & { themeBeforeBody?: boolean }).themeBeforeBody =
          document.documentElement.classList.contains("dark");
        observer.disconnect();
      }
    });
    observer.observe(document, { subtree: true, childList: true });
  });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => (window as Window & { themeBeforeBody?: boolean }).themeBeforeBody,
    ),
  ).toBe(true);
});
