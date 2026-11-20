import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(() => { cleanup() })

describe('Hero', () => {
  it('renders a visible semantic H1, branch logo, and open-recruitment CTAs by default', () => {
    render(<Hero />)

    const logo = screen.getByRole('img', { name: /ieee hitu student branch logo/i })
    expect(logo).toBeTruthy()
    expect(logo.querySelector('[data-logo="diamond"]')).toBeTruthy()
    expect(logo.querySelector('[data-logo="arch"]')).toBeTruthy()

    const heading = screen.getByRole('heading', { level: 1, name: /ieee hitu student branch/i })
    expect(heading.classList.contains('sr-only')).toBe(false)

    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
    expect(screen.getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
  })

  it('adapts CTAs cleanly when recruitment is closed', () => {
    render(<Hero recruitmentOpen={false} />)

    expect(screen.queryByRole('link', { name: /join the branch/i })).toBeNull()
    expect(screen.getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
    expect(screen.getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
  })

  it('centers the hero content and moves detailed statistics out of the hero', () => {
    const { container } = render(<Hero />)

    const section = container.querySelector('section')
    expect(section.className).toContain('min-h-')
    expect(section.querySelector('dl')).toBeNull()

    const hero = section.querySelector('[data-hero="content"]')
    expect(hero.classList.contains('text-center')).toBe(true)
    expect(hero.classList.contains('items-center')).toBe(true)
    expect(screen.getByText(/Helwan International Technological University/i)).toBeTruthy()
  })

  it('renders the white slogan artwork cleanly without CSS filter inversions or heavy glow', () => {
    render(<Hero />)

    const slogan = screen.getByAltText(/beyond labels\. beyond limits\./i)
    expect(slogan.getAttribute('src')).toBe('/logos/slogan/ieeehitu-slogan-white.svg')
    expect(slogan.getAttribute('style')).toBeNull()
    expect(slogan.classList.contains('object-contain')).toBe(true)
    expect(slogan.classList.contains('h-auto')).toBe(true)
    expect(slogan.classList.contains('brightness-0')).toBe(false)
    expect(slogan.classList.contains('invert')).toBe(false)
    expect(slogan.closest('.bg-white')).toBeNull()
  })

  it('renders the hero logo with the white treatment', () => {
    render(<Hero />)

    const logo = screen.getByRole('img', { name: /ieee hitu student branch logo/i })
    const diamond = logo.querySelector('[data-logo="diamond"]')
    const arch = logo.querySelector('[data-logo="arch"]')
    expect(diamond.getAttribute('fill')).toBe('#ffffff')
    expect(arch.getAttribute('fill')).toBe('#ffffff')
  })

  it('exposes stable animation hooks without hiding content', () => {
    const { container } = render(<Hero />)
    const section = container.querySelector('section')
    expect(section.querySelector('[data-hero="logo"]')).toBeTruthy()
    expect(section.querySelector('[data-hero="headline"]')).toBeTruthy()
    expect(section.querySelector('[data-hero="slogan"]')).toBeTruthy()
    expect(section.querySelector('[data-hero="copy"]')).toBeTruthy()
    expect(section.querySelector('[data-hero="ctas"]')).toBeTruthy()

    for (const el of section.querySelectorAll('[data-hero]')) {
      const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '')
      expect(cls).not.toMatch(/opacity-0/)
    }
  })

  it('renders modern IEEE navy background, radial accent, canvas and z-index layers', () => {
    const { container } = render(<Hero />)
    const section = container.querySelector('section')
    expect(section.className).toContain('bg-[#070d18]')

    const bgLayer = section.querySelector('[data-hero="bg"]')
    expect(bgLayer.classList.contains('pointer-events-none')).toBe(true)
    expect(bgLayer.classList.contains('z-0')).toBe(true)

    const radialGlow = bgLayer.querySelector('div[style*="radial-gradient"]')
    expect(radialGlow).toBeTruthy()
    expect(radialGlow.getAttribute('style')).toContain('rgba(0, 114, 206, 0.18)')

    const canvas = bgLayer.querySelector('canvas')
    expect(canvas).toBeTruthy()
    expect(canvas.getAttribute('aria-hidden')).toBe('true')

    const content = section.querySelector('[data-hero="content"]')
    expect(content.classList.contains('z-10')).toBe(true)
    expect(content.classList.contains('relative')).toBe(true)
  })
})
