import { describe, expect, it } from 'vitest'
import { groupItems } from '~/composables/groupItems'

describe('groupItems', () => {
  it('splits evenly into chunks', () => {
    expect(groupItems([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
  })

  it('puts the remainder in the last chunk', () => {
    expect(groupItems([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('returns a single chunk when size exceeds the array length', () => {
    expect(groupItems([1, 2], 10)).toEqual([[1, 2]])
  })

  it('returns each element as its own chunk when size is 1', () => {
    expect(groupItems(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']])
  })

  it('returns an empty array for an empty input', () => {
    expect(groupItems([], 4)).toEqual([])
  })
})
