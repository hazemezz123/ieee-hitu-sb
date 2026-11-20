import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Footer from './footer'

const nav = vi.hoisted(() => ({ pathname: '/about' }))
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(() => {
  nav.pathname = '/about'
  cleanup()
  vi.restoreAllMocks()
})

describe('Footer', () => {
  it('renders the compact CTA linking to Join IEEE', () => {
    render(<Footer />)

    expect(screen.getByRole('heading', { name: 'Build. Connect. Innovate.' })).toBeTruthy()
    expect(screen.getByText('Be part of the next generation of engineers.')).toBeTruthy()

    const cta = screen.getByRole('link', { name: 'Join IEEE' })
    expect(cta.getAttribute('href')).toBe('/join-us')
  })

  it('omits the compact CTA on the landing page because RecruitmentBand concludes the page', () => {
    nav.pathname = '/'
    render(<Footer />)

    expect(screen.queryByRole('heading', { name: 'Build. Connect. Innovate.' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Join IEEE' })).toBeNull()
    expect(screen.getByText('IEEE HITU Student Branch')).toBeTruthy()
  })

  it('uses dual light and dark official brand logos without CSS filters', () => {
    render(<Footer />)

    const imgs = screen.getAllByAltText('IEEE HITU Student Branch')
    expect(imgs).toHaveLength(2)
    expect(imgs[0].getAttribute('src')).toBe('/logos/brand/ieee-hitu-color.svg')
    expect(imgs[1].getAttribute('src')).toBe('/logos/brand/ieee-hitu-white.svg')
    for (const img of imgs) {
      expect(img.className).not.toMatch(/invert|grayscale|brightness-0/)
    }
  })

  it('organizes links into Explore and Get Involved navigation groups', () => {
    render(<Footer />)

    expect(screen.getByRole('heading', { name: 'Explore' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Get Involved' })).toBeTruthy()

    const expectedRoutes = {
      'About Us': '/about',
      Committees: '/committees',
      Events: '/events',
      Gallery: '/gallery',
      'Become a Member': '/join-us',
      'Partner With Us': '/contact',
      'Contact Us': '/contact',
    }

    for (const [label, href] of Object.entries(expectedRoutes)) {
      const link = screen.getByRole('link', { name: label })
      expect(link.getAttribute('href')).toBe(href)
    }
  })

  it('links the branch Facebook, Instagram, and LinkedIn profiles', () => {
    render(<Footer />)

    const socials = {
      Facebook: 'https://www.facebook.com/ieeehitusb',
      Instagram: 'https://www.instagram.com/ieee.hitu.sb/',
      LinkedIn: 'https://www.linkedin.com/company/hitu-ieee-sb/posts/',
    }

    for (const [name, href] of Object.entries(socials)) {
      const link = screen.getByRole('link', { name })
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('renders the dynamic copyright year and Back to top control respecting reduced motion', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const originalMatchMedia = window.matchMedia
    const matchMedia = vi.fn(() => ({ matches: false }))
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMedia,
    })

    try {
      render(<Footer />)

      const year = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`${year} IEEE HITU Student Branch`))).toBeTruthy()
      expect(screen.getByText('Helwan International Technological University')).toBeTruthy()

      const topBtn = screen.getByRole('button', { name: 'Back to top' })
      fireEvent.click(topBtn)
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

      matchMedia.mockImplementation(() => ({ matches: true }))
      fireEvent.click(topBtn)
      expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      })
    }
  })
})
