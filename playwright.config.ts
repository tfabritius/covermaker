import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 90_000 },
  reporter: [['html']],
  use: {
    baseURL: 'http://localhost:3001',
  },
  webServer: {
    command: 'pnpm exec serve .output/public -p 3001 -s',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
