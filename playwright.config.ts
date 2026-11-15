import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-360",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 780 },
      },
    },
  ],
  webServer: [
    {
      command: "npm --prefix backend run start",
      url: "http://127.0.0.1:4000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: "npm --prefix frontend run preview",
      url: "http://127.0.0.1:3000/login",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
