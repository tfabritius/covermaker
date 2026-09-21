import { describe, expect, it } from 'vitest'
import { enlargeToAspectRatio, shouldRotateImage } from '~/composables/resizeHelpers'

describe('shouldRotateImage', () => {
  it('returns false when current orientation already matches target', () => {
    // Landscape image, landscape target (3:2 = 1.5)
    expect(shouldRotateImage(300, 200, 1.5)).toBe(false)
  })

  it('returns true when rotating brings the image closer to target aspect ratio', () => {
    // Portrait image (200x300), landscape target (1.5) → rotating makes it 300x200 = 1.5, much closer
    expect(shouldRotateImage(200, 300, 1.5)).toBe(true)
  })

  it('returns false for a square image regardless of target', () => {
    // Rotating a square doesn't change the aspect ratio
    expect(shouldRotateImage(100, 100, 1.5)).toBe(false)
  })
})

describe('enlargeToAspectRatio', () => {
  it('enlarges height when width is the longer side', () => {
    // width=300, height=100 → ratio 3; target ratio 1.5 → height must grow
    const result = enlargeToAspectRatio(100, 300, 1.5)
    expect(result.width).toBe(300)
    expect(result.height).toBe(200)
  })

  it('enlarges width when height is the longer side', () => {
    // width=100, height=300 → ratio 0.33; target ratio 1.5 → width must grow
    const result = enlargeToAspectRatio(300, 100, 1.5)
    expect(result.width).toBe(450)
    expect(result.height).toBe(300)
  })

  it('output dimensions satisfy the target aspect ratio', () => {
    const ratio = 4 / 3
    const result = enlargeToAspectRatio(200, 400, ratio)
    expect(result.width / result.height).toBeCloseTo(ratio, 2)
  })
})
