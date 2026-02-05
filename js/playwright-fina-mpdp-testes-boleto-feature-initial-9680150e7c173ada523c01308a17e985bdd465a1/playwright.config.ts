import {defineConfig, devices} from '@playwright/test';

/** https://playwright.dev/docs/test-configuration */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
    ['list', {printSteps: true}],
    ['json', {outputFile: 'test-results/results.json'}],
  ],

  use: {
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {name: '01-registrar', testMatch: 'tests/01-registrar-boleto.spec.ts', use: {...devices['Desktop Chrome']}},
    {name: '02-consultar', testMatch: 'tests/02-consultar-boleto.spec.ts', use: {...devices['Desktop Chrome']}},
    {name: '03-cancelar', testMatch: 'tests/03-cancelar-boleto.spec.ts', use: {...devices['Desktop Chrome']}},
    {name: '04-e2e', testMatch: 'tests/e2e/**/*.spec.ts', use: {...devices['Desktop Chrome']}},
    {name: '05-performance', testMatch: 'tests/05-performance.spec.ts', use: {...devices['Desktop Chrome']}},
  ],
});
