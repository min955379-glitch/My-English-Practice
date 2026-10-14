import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const paths = [
  "/",
  "/learn",
  "/guides",
  "/planner",
  "/session",
  "/dashboard",
  "/phonics",
  "/dictation",
  "/profile",
  "/reading",
  "/pronunciation",
  "/about",
  "/contact",
  "/help",
  "/privacy",
  "/terms",
];
for (const theme of ["light", "dark"] as const) {
  for (const path of paths) {
    test(`automated accessibility ${theme}: ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await expect(
        page.getByRole("button", { name: /Theme: System/ }),
      ).toBeEnabled();
      if (theme === "dark")
        await expect(page.locator("html")).toHaveClass(/\bdark\b/);
      else await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.setViewportSize({ width: 375, height: 812 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
  test(`wrong-letter and feedback accessibility on mobile ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/session");
    await page.getByRole("button", { name: "Start my practice" }).click();
    await page.getByRole("textbox").pressSequentially("x");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole("textbox").pressSequentially("cat");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
