import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: [
        "--no-sandbox",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: "node --import tsx server.ts",
    url: "http://127.0.0.1:4173",
    env: {
      NODE_ENV: "development",
      PORT: "4173",
      PUBLIC_ORIGIN: "http://127.0.0.1:4173",
      BACKEND_ORIGIN: "http://127.0.0.1:4199",
    },
    reuseExistingServer: false,
  },
});
