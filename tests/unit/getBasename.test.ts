import { describe, expect, it } from 'vitest'
import { getBasename } from '~/composables/getBasename'

describe('getBasename', () => {
  it('strips a single extension', () => {
    expect(getBasename('photo.jpg')).toBe('photo')
  })

  it('strips only the last extension when there are multiple dots', () => {
    expect(getBasename('my.photo.tar.gz')).toBe('my.photo.tar')
  })

  it('returns an empty string for a file that is only an extension', () => {
    expect(getBasename('.jpg')).toBe('')
  })

  it('returns an empty string for a name with no extension', () => {
    expect(getBasename('photo')).toBe('')
  })
})
