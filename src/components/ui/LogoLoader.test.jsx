import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LogoLoader from './LogoLoader'

beforeEach(() => {
  // jsdom path elements do not share SVGPathElement in their prototype chain,
  // so stub measurability at the Element root instead.
  window.Element.prototype.getTotalLength = () => 120
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  delete window.Element.prototype.getTotalLength
  delete window.matchMedia
  vi.restoreAllMocks()
})

describe('LogoLoader', () => {
  it('draws the mark then unmounts', async () => {
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.getByRole('img', { name: /logo animation/i })).toBeTruthy()
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
    }, { timeout: 4000 })
  })
  it('skips when the session already saw it', () => {
    window.sessionStorage.setItem('ieee-hitu-loader-seen', '1')
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
  })
  it('skips on reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
  })
})
