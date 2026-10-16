import { describe, it, expect } from 'vitest'
import { metadata } from './layout.js'

describe('admin layout metadata', () => {
  it('blocks indexing of the admin surface', () => {
    expect(metadata.robots?.index).toBe(false)
    expect(metadata.robots?.follow).toBe(false)
  })
})
