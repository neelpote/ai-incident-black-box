import { chromium } from "playwright";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const appUrl = "https://filecoin-two.vercel.app";
const outputDir = path.resolve("demo");
const videoSize = { width: 1440, height: 960 };

await mkdir(outputDir, { recursive: true });
await rm(path.join(outputDir, "ai-incident-black-box-demo.webm"), { force: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: videoSize,
  recordVideo: { dir: outputDir, size: videoSize },
  colorScheme: "dark",
});
const page = await context.newPage();

async function pause(milliseconds) {
  await page.waitForTimeout(milliseconds);
}

await page.goto(appUrl, { waitUntil: "networkidle" });
await pause(2800);

await page.getByRole("link", { name: "Open console" }).first().click();
await page.waitForURL("**/console");
await pause(1800);

await page.getByRole("button", { name: "Load sample incident" }).click();
await pause(1800);

await page.getByRole("button", { name: "Analyze incident" }).click();
await pause(2400);

await page.getByRole("button", { name: "Store capsule" }).click();
await page.getByText("Mock Filecoin", { exact: true }).waitFor();
await pause(2000);

await page.getByRole("button", { name: "Verify receipt" }).click();
await page.getByText("VERIFIED", { exact: true }).waitFor();
await pause(3200);

const video = page.video();
await context.close();
await browser.close();

const recordedPath = await video.path();
const finalPath = path.join(outputDir, "ai-incident-black-box-demo.webm");
await rename(recordedPath, finalPath);

console.log(finalPath);
