import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "local-integration.spec.ts", workers: 1, timeout: 90000,
  outputDir: "test-results/integration",
  use: { baseURL: "http://localhost:3001", trace: "retain-on-failure" },
  projects: [{ name: "real-local-chromium", use: { ...devices["Desktop Chrome"] } }],
});
