import { choose } from "./controls";
import { test, expect } from "@playwright/test";
test("theme settings, header toggle, OS changes, persistence and progress export/import", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/profile");
  await expect(page.getByLabel("Theme", { exact: true })).toHaveAttribute(
    "data-value",
    "system",
  );
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await choose(page, "Theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await page.reload();
  await expect(page.getByLabel("Theme", { exact: true })).toHaveAttribute(
    "data-value",
    "light",
  );
  await page.getByRole("button", { name: /Theme: Light/ }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.getByLabel("Theme", { exact: true })).toHaveAttribute(
    "data-value",
    "dark",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export/ }).click();
  const file = await download;
  const stream = await file.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const progress = JSON.parse(Buffer.concat(chunks).toString());
  expect(progress.settings.theme).toBe("dark");
  await choose(page, "Theme", "light");
  await page.locator("input[type=file]").setInputFiles({
    name: "progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(progress)),
  });
  await expect(page.getByLabel("Theme", { exact: true })).toHaveAttribute(
    "data-value",
    "dark",
  );
  await choose(page, "Theme", "system");
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
  await choose(page, "Choose words", "11");
  await expect(page.locator(".spoken-word")).toHaveText("conscience");
  await page.goto("/dictation");
  await choose(page, "Dictation level", "13");
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
