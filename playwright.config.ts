import { defineConfig, devices } from '@playwright/test';

// Playwright config for the Unbounded Technologies landing site.
//
// Notes:
// - We point `webServer` at `pnpm start` (the production Next.js server).
//   The site contract is "test against the production build" (see
//   memory feedback `feedback_run_production_for_r3f_testing.md`); the
//   dev server pulls in HMR + double-effect overhead that distorts
//   visual + 3D timing.
// - `reuseExistingServer: !process.env.CI` lets a developer iterate
//   locally with `pnpm build && pnpm start` running in another terminal
//   while CI always boots fresh.
// - Single chromium project for now. We'll add WebKit + mobile devices
//   in a follow-up if cross-browser regressions appear.

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Cap workers to keep the production server responsive: each homepage
  // mounts a WebGL ParticleField + R3F infinity logo, and 16 parallel
  // workers can saturate the dev machine, which produces flaky URL
  // assertions in the language-switcher tests. Four is a comfortable
  // ceiling that still keeps the suite under 30s.
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    locale: 'en-US',
    timezoneId: 'America/Toronto',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
