import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4321" },
  webServer: {
    command: process.env.CI ? "npm run preview" : "npm run dev",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
  },
  reporter: "list",
});
