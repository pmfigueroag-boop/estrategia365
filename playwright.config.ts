// ============================================================
// Estrategia 365 — Playwright Configuration (Phase 8)
// ============================================================
// E2E testing for API and Frontend flows
//
// Usage:
//   npx playwright test
//   npx playwright test --headed
//   npx playwright show-report

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined, // Allow some parallelism in CI
  timeout: 60_000,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['./e2e/reporters/gcp-reporter.ts'],
    process.env.CI ? ['github'] : ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'api',
      testDir: './e2e/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
