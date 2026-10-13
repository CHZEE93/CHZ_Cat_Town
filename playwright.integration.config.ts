import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "persistence.spec.ts",
  timeout: 180_000,
  workers: 1,
  use: {
    baseURL: "http://localhost:5181",
    actionTimeout: 20_000,
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1050 },
    screenshot: "only-on-failure",
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  reporter: "list",
});
