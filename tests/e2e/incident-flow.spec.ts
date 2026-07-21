import { expect, test } from "@playwright/test";

test("sample incident can be analyzed, retrieved, stored, and verified", async ({ page }) => {
  await page.goto("/console");

  await page.getByRole("button", { name: "Load sample incident" }).click();
  await page.getByRole("button", { name: "Analyze incident" }).click();

  await expect(page.getByText("Root cause")).toBeVisible();
  await expect(page.getByText("Timeline recorder strip")).toBeVisible();

  await page.getByRole("button", { name: "Store capsule" }).click();
  await expect(page.getByText("Demo simulation")).toBeVisible();
  await expect(page.getByText("CID", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Retrieve capsule" }).click();
  await expect(page.getByText("CAPSULE RETRIEVED")).toBeVisible();

  await page.getByRole("button", { name: "Verify receipt" }).click();
  await expect(page.getByText("verified", { exact: true }).last()).toBeVisible();
});
