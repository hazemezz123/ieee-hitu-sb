import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(() => { cleanup() })

describe('Hero', () => {
  it('uses the colored logo treatment and keeps CTA destinations', () => {
    render(<Hero />)

    const logo = document.querySelector('img[src="/logo.png"]')
    expect(logo).toBeTruthy()
    expect(logo.classList.contains('brightness-0')).toBe(false)
    expect(logo.classList.contains('invert')).toBe(false)

    expect(screen.getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
  })

  it('centers the hero content with a screen-reader-only heading', () => {
    const { container } = render(<Hero />)

    const section = container.querySelector('section')
    expect(section.className).toContain('min-h-[100svh]')

    const hero = section.firstElementChild
    expect(hero.classList.contains('text-center')).toBe(true)
    expect(hero.classList.contains('items-center')).toBe(true)

    // The visible title lives in the logo artwork; the h1 stays for assistive tech.
    const heading = screen.getByRole('heading', { name: /ieee hitu student branch/i })
    expect(heading.classList.contains('sr-only')).toBe(true)
  })

  it('shows committee and member statistics above the CTAs', () => {
    render(<Hero />)

    expect(screen.getByText('+9')).toBeTruthy()
    expect(screen.getByText('Committees')).toBeTruthy()
    expect(screen.getByText('+180')).toBeTruthy()
    expect(screen.getByText('Members')).toBeTruthy()

    const stats = screen.getByText('+9').closest('dl')
    const ctas = screen.getByRole('link', { name: /view events/i }).closest('div')
    expect(stats.compareDocumentPosition(ctas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('shows the white slogan artwork unfiltered with aspect ratio preserved', () => {
    render(<Hero />)

    const slogan = screen.getByAltText(/slogan/i)
    expect(slogan.getAttribute('src')).toBe('/slogan/ieeehitu_kit_white.png')
    expect(slogan.classList.contains('object-contain')).toBe(true)
    expect(slogan.classList.contains('h-auto')).toBe(true)
    expect(slogan.classList.contains('brightness-0')).toBe(false)
    expect(slogan.classList.contains('invert')).toBe(false)
    // Transparent PNG: no white badge wrapper around the artwork.
    expect(slogan.closest('.bg-white')).toBeNull()
  })
})
