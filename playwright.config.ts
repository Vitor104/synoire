import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

const env = loadEnv('development', process.cwd(), '')

const e2eEnvKeys = [
  'VITE_TEST_EMAIL',
  'VITE_TEST_PASSWORD',
  'VITE_TEST_USER2_EMAIL',
  'VITE_TEST_USER2_PASSWORD',
  'VITE_TEST_USER2_USERNAME',
] as const

for (const key of e2eEnvKeys) {
  if (env[key]) process.env[key] = env[key]
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev -- --mode test',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_E2E_TEST_MODE: 'true',
    },
  },
})
