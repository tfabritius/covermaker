import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { zipImages } from '~/composables/zipImages'

function makeBlob(content: string, type: string): Blob {
  return new Blob([content], { type })
}

describe('zipImages', () => {
  it('produces a non-empty Blob', async () => {
    const result = await zipImages([{ blob: makeBlob('hello', 'image/jpeg'), basename: 'img1' }])
    expect(result.size).toBeGreaterThan(0)
  })

  it('includes all files in the ZIP with correct names', async () => {
    const images = [
      { blob: makeBlob('a', 'image/jpeg'), basename: 'first' },
      { blob: makeBlob('b', 'image/png'), basename: 'second' },
    ]
    const result = await zipImages(images)
    const zip = await JSZip.loadAsync(result)
    expect(Object.keys(zip.files)).toContain('first.jpeg')
    expect(Object.keys(zip.files)).toContain('second.png')
  })

  it('derives extension from blob MIME type', async () => {
    const result = await zipImages([{ blob: makeBlob('x', 'image/webp'), basename: 'photo' }])
    const zip = await JSZip.loadAsync(result)
    expect(Object.keys(zip.files)).toContain('photo.webp')
  })
})
