import * as fs from 'node:fs'
import { expect, test } from '@playwright/test'
import JSZip from 'jszip'

test('load demo images once → 1 merge, twice → 2 merges, download as zip', async ({ page }) => {
  await page.goto('/')

  // --- Round 1: load 3 demo images ---
  await page.getByRole('button', { name: 'Load demo images' }).click()

  // Wait for 3 rows in the resize table — confirms all 3 images were added
  await expect(page.locator('tbody tr')).toHaveCount(3)

  // Wait for 1 completed merge card — confirms resize + merge WASM processing finished
  // ImagePreview renders <img> only when loading is false and objectUrl is set
  const mergeCardImgs = page.locator('[data-testid="merge-collection-card"] img')
  await expect(mergeCardImgs).toHaveCount(1)

  // --- Round 2: load 3 more demo images (6 total) ---
  await page.getByRole('button', { name: 'Load demo images' }).click()

  // Wait for 6 rows in the resize table
  await expect(page.locator('tbody tr')).toHaveCount(6)

  // Wait for 2 completed merge cards
  // (6 images with default 2×2 grid → collection 1: 4 images, collection 2: 2 images)
  await expect(mergeCardImgs).toHaveCount(2)

  // Visual regression: pixel-level check of each WASM-merged image
  await expect(mergeCardImgs.nth(0)).toHaveScreenshot('merge-1.png')
  await expect(mergeCardImgs.nth(1)).toHaveScreenshot('merge-2.png')

  // --- Download both merged images as a zip ---
  // Click the "Select all" checkbox (first checkbox in the merge section)
  const mergeSection = page.locator('[data-testid="section-merge"]')
  await mergeSection.getByRole('checkbox').first().click()

  // Open the "N selected" dropdown, then capture the download event
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    (async () => {
      await page.getByRole('button', { name: /selected/ }).click()
      await page.getByRole('menuitem', { name: 'Download selected' }).click()
    })(),
  ])

  expect(download.suggestedFilename()).toBe('images.zip')

  const zipPath = await download.path()
  const zip = await JSZip.loadAsync(fs.readFileSync(zipPath!))
  expect(Object.keys(zip.files)).toHaveLength(2)
})
