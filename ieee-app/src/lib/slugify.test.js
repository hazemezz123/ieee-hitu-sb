import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases, strips non-alphanumerics, and joins with dashes', () => {
    expect(slugify('AI & Robotics 101')).toBe('ai-robotics-101')
    expect(slugify('Web')).toBe('web')
    expect(slugify('  Multi   Media  ')).toBe('multi-media')
    expect(slugify('')).toBe('')
  })
})