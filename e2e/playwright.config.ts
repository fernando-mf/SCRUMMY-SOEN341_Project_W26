import { defineConfig, devices } from "@playwright/test";

const isDocker = !!process.env.FRONTEND_URL;

export default defineConfig({
  testDir: "./tests",
  retries: process.env.CI ? 1 : 0,
  timeout: 15000,
  expect: { timeout: 3000 },
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.FRONTEND_URL || "http://localhost:8080",
    trace: "on-first-retry",
    actionTimeout: 3000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: isDocker
    ? undefined
    : {
        command: "npx http-server ../frontend -p 8080 --cors -c-1 -s",
        port: 8080,
        reuseExistingServer: !process.env.CI,
      },
});
