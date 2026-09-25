import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function screenshotLayout(page: Page, name: string) {
  // Disable CSS animations and transitions for stable screenshots
  await page.addStyleTag({
    content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }',
  })

  // Wait for app to mount
  await page.getByRole('button', { name: 'Load demo images' }).waitFor()
  await expect(page).toHaveScreenshot(name, { fullPage: true })
}

test('light mode', async ({ page }) => {
  await page.goto('/')
  await screenshotLayout(page, 'app-layout-light.png')
})

test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('dark mode', async ({ page }) => {
    await page.goto('/')
    await screenshotLayout(page, 'app-layout-dark.png')
  })
})
