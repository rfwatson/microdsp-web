import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      // NOTE: Chromium tests MUST be run in headed mode.
      name: 'web-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        bypassCSP: true,
        launchOptions: {
          args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
            // Opening devtools seems to be necessary to make the tests pass in
            // Chromium:
            '--auto-open-devtools-for-tabs',
          ],
        },
      },
    },
    {
      name: 'web-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000',
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.permission.disabled': true,
            'media.navigator.streams.fake': true,
            'media.navigator.audio.fake_frequency': 400,
          },
        },
      },
    },
  ],

  webServer: {
    command: 'pnpm --filter example run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
