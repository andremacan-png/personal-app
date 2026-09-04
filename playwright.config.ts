import { defineConfig, devices } from "@playwright/test";
import { config as dotenv } from "dotenv";

dotenv({ path: ".env.test.local" });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100", trace: "on-first-retry" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run dev:test", url: "http://localhost:3100", reuseExistingServer: !process.env.CI },
});
