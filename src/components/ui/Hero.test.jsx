import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'
import { committees } from '@/features/committees/data/committees'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(() => { cleanup() })

describe('Hero', () => {
  it('uses the colored logo treatment and keeps CTA destinations', () => {
    render(<Hero />)

    const logo = screen.getByRole('img', { name: /ieee hitu student branch logo/i })
    expect(logo).toBeTruthy()
    expect(logo.querySelector('[data-logo="diamond"]')).toBeTruthy()
    expect(logo.querySelector('[data-logo="arch"]')).toBeTruthy()

    expect(screen.getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
  })

  it('centers the hero content with a screen-reader-only heading', () => {
    const { container } = render(<Hero />)

    const section = container.querySelector('section')
    expect(section.className).toContain('min-h-[100svh]')

    const hero = section.querySelector('[data-hero="content"]')
    expect(hero.classList.contains('text-center')).toBe(true)
    expect(hero.classList.contains('items-center')).toBe(true)

    // The visible title lives in the logo artwork; the h1 stays for assistive tech.
    const heading = screen.getByRole('heading', { name: /ieee hitu student branch/i })
    expect(heading.classList.contains('sr-only')).toBe(true)
  })

  it('shows committee and member statistics above the CTAs', () => {
    render(<Hero />)

    expect(screen.getByText(`+${committees.length}`)).toBeTruthy()
    expect(screen.getByText('Committees')).toBeTruthy()
    expect(screen.getByText('+180')).toBeTruthy()
    expect(screen.getByText('Members')).toBeTruthy()

    const stats = screen.getByText(`+${committees.length}`).closest('dl')
    const ctas = screen.getByRole('link', { name: /view events/i }).closest('div')
    expect(stats.compareDocumentPosition(ctas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('shows the white slogan artwork with a soft white glow', () => {
    render(<Hero />)

    const slogan = screen.getByAltText(/slogan/i)
    expect(slogan.getAttribute('src')).toBe('https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800,c_limit/v1792178195/ieee-brand/vx9roslnppudt0booekg.png')
    const style = slogan.getAttribute('style') || ''
    expect(style).toContain('drop-shadow')
    expect(style).toContain('255, 255, 255')
    expect(slogan.classList.contains('object-contain')).toBe(true)
    expect(slogan.classList.contains('h-auto')).toBe(true)
    expect(slogan.classList.contains('brightness-0')).toBe(false)
    expect(slogan.classList.contains('invert')).toBe(false)
    // Transparent PNG: no white badge wrapper around the artwork.
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
    expect(section.querySelector('[data-hero="slogan"]')).toBeTruthy()
    expect(section.querySelector('[data-hero="copy"]')).toBeTruthy()
    expect(section.querySelectorAll('[data-hero="stat"]').length).toBe(2)
    expect(section.querySelector('[data-hero="ctas"]')).toBeTruthy()
    // Content visible pre-animation: no opacity-0 utility on hooks
    for (const el of section.querySelectorAll('[data-hero]')) {
      const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '')
      expect(cls).not.toMatch(/opacity-0/)
    }
  })

  it('renders modern IEEE navy background, radial glow, canvas and z-index layers', () => {
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
