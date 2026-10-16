import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LogoMark from './LogoMark'

describe('LogoMark', () => {
  it('renders an accessible SVG with diamond and arch paths', () => {
    const { container } = render(<LogoMark className="custom-class" />)

    const svg = screen.getByRole('img', { name: /ieee hitu student branch logo/i })
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('viewBox')).toBe('0 0 1095 1095')
    expect(svg.classList.contains('custom-class')).toBe(true)

    const diamond = container.querySelector('[data-logo="diamond"]')
    expect(diamond).toBeTruthy()
    expect(diamond.getAttribute('fill-rule')).toBe('evenodd')

    const arch = container.querySelector('[data-logo="arch"]')
    expect(arch).toBeTruthy()
    expect(arch.getAttribute('fill-rule')).toBe('evenodd')
  })

  it('keeps the default colored treatment', () => {
    const { container } = render(<LogoMark />)

    const diamond = container.querySelector('[data-logo="diamond"]')
    expect(diamond.getAttribute('fill')).toBe('#0e487f')
    expect(diamond.getAttribute('stroke')).toBe('#0e487f')

    const arch = container.querySelector('[data-logo="arch"]')
    expect(arch.getAttribute('fill')).toBe('#dcb656')
    expect(arch.getAttribute('stroke')).toBe('#dcb656')
  })

  it('renders the white treatment with white diamond and arch', () => {
    const { container } = render(<LogoMark variant="white" />)

    const diamond = container.querySelector('[data-logo="diamond"]')
    expect(diamond.getAttribute('fill')).toBe('#ffffff')
    expect(diamond.getAttribute('stroke')).toBe('#ffffff')

    const arch = container.querySelector('[data-logo="arch"]')
    expect(arch.getAttribute('fill')).toBe('#ffffff')
    expect(arch.getAttribute('stroke')).toBe('#ffffff')
  })
})
