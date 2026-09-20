import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Reveal from './Reveal'

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    from: vi.fn(),
    matchMedia: vi.fn(() => ({ add: vi.fn() })),
  },
}))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Reveal', () => {
  it('renders children visibly with no hidden CSS', () => {
    const { container } = render(<Reveal><span>Visible copy</span></Reveal>)
    expect(screen.getByText('Visible copy')).toBeTruthy()
    expect(container.firstElementChild.className).not.toMatch(/opacity-0/)
  })

  it('skips gsap.from under reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const gsap = (await import('gsap')).default
    render(<Reveal><span>Calm copy</span></Reveal>)
    expect(gsap.from).not.toHaveBeenCalled()
    expect(screen.getByText('Calm copy')).toBeTruthy()
  })
})
