import { expect, type Page } from "@playwright/test";
export async function choose(page: Page, label: string, value: string) {
  const trigger = page.getByRole("combobox", { name: label, exact: true });
  await expect(trigger).toBeVisible();
  if ((await trigger.getAttribute("aria-expanded")) !== "true")
    await trigger.click();
  await page.locator(`[role="option"][data-value="${value}"]`).click();
  await expect(trigger).toHaveAttribute("data-value", value);
}
