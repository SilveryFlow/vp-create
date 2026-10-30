import { defineConfig } from '@playwright/test'

const applications = [
  { name: 'web', port: 4173 },
  { name: 'admin', port: 4174 },
]

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never', outputFolder: '.artifacts/playwright-report' }]],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  outputDir: '.artifacts/playwright',
  projects: applications.map(app => ({
    name: app.name,
    use: { baseURL: `http://127.0.0.1:${app.port}` },
  })),
  webServer: applications.map(app => ({
    command: `vp run @starter/${app.name}#preview --host 127.0.0.1 --port ${app.port} --strictPort`,
    url: `http://127.0.0.1:${app.port}`,
    reuseExistingServer: !process.env.CI,
  })),
})
