import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme'
import Navbar from './navbar'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

beforeEach(() => { nav.pathname = '/' })

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  window.localStorage.clear()
})

describe('Navbar', () => {
  it('marks nested routes active and closes the mobile menu after navigation', () => {
    nav.pathname = '/committees/web'
    render(<Navbar />)

    const primary = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(within(primary).getByRole('link', { name: 'Committees' }).getAttribute('aria-current')).toBe('page')

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Mobile navigation' })).getByRole('link', { name: 'Events' }))

    expect(screen.getByRole('button', { name: /open navigation menu/i }).getAttribute('aria-expanded')).toBe('false')
  })

  it('does not mark path-prefix collisions active', () => {
    nav.pathname = '/events-archive'
    render(<Navbar />)

    const primary = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(within(primary).getByRole('link', { name: 'Events' }).getAttribute('aria-current')).toBe(null)
  })

  it('restores the prior body overflow value when the menu closes', () => {
    document.body.style.overflow = 'clip'
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }))
    expect(document.body.style.overflow).toBe('clip')
  })

  it('restores focus to the menu button after link navigation', async () => {
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Mobile navigation' })).getByRole('link', { name: 'Events' }))

    await waitFor(() => expect(document.activeElement).toBe(menu))
    expect(menu.getAttribute('aria-expanded')).toBe('false')
  })

  it('restores focus when the mobile link keeps the current route', () => {
    nav.pathname = '/events'
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Mobile navigation' })).getByRole('link', { name: 'Events' }))

    expect(menu.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menu)
  })

  it('closes and restores overflow when the desktop breakpoint is crossed', async () => {
    let breakpointChange
    window.matchMedia = () => ({
      matches: false,
      addEventListener: (_event, listener) => { breakpointChange = listener },
      removeEventListener: () => {},
    })
    document.body.style.overflow = 'scroll'
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    breakpointChange({ matches: true })

    await waitFor(() => expect(menu.getAttribute('aria-expanded')).toBe('false'))
    expect(document.body.style.overflow).toBe('scroll')
    expect(document.activeElement).toBe(menu)
  })

  it('toggles the theme and persists the choice', () => {
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    render(<ThemeProvider><Navbar /></ThemeProvider>)

    const toDark = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(toDark)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ieee-hitu-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeTruthy()
  })

  it('renders the toggle without a provider (light default)', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeTruthy()
  })

  it('closes with Escape and restores focus to the menu button', () => {
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('button', { name: /open navigation menu/i }).getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menu)
  })
})
