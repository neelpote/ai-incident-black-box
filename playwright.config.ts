import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
