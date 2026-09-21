import { describe, expect, it } from 'vitest'
import { dataURLToBlob } from '~/composables/dataURLToBlob'

const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('dataURLToBlob', () => {
  it('returns a Blob with the correct MIME type', () => {
    const blob = dataURLToBlob(PNG_1x1)
    expect(blob.type).toBe('image/png')
  })

  it('returns a Blob with non-zero size', () => {
    const blob = dataURLToBlob(PNG_1x1)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('throws on an invalid data URL', () => {
    expect(() => dataURLToBlob('not-a-data-url')).toThrow()
  })
})
