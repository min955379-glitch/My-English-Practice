import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const path of [
  "/",
  "/session",
  "/dashboard",
  "/phonics",
  "/profile",
  "/reading",
  "/pronunciation",
]) {
  test(`automated accessibility: ${path}`, async ({ page }) => {
    await page.goto(path);
    if (path === "/session")
      await expect(
        page.getByRole("button", { name: "Start my practice" }),
      ).toBeVisible();
    if (path === "/profile")
      await expect(page.getByLabel("Your daily aim")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
test("wrong-letter state remains accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/session");
  await page.getByRole("button", { name: "Start my practice" }).click();
  await page.getByRole("textbox").pressSequentially("x");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
