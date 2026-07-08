import { expect, test } from "@playwright/test";

test("sample incident can be analyzed, stored, and verified", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Load sample incident" }).click();
  await page.getByRole("button", { name: "Analyze incident" }).click();

  await expect(page.getByText("Root cause")).toBeVisible();
  await expect(page.getByText("Timeline recorder strip")).toBeVisible();

  await page.getByRole("button", { name: "Store capsule" }).click();
  await expect(page.getByText("Mock Filecoin")).toBeVisible();
  await expect(page.getByText("CID")).toBeVisible();

  await page.getByRole("button", { name: "Verify receipt" }).click();
  await expect(page.getByText("VERIFIED")).toBeVisible();
});
