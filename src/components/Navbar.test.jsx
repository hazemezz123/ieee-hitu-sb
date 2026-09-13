import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from './Navbar'

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

  it('closes with Escape and restores focus to the menu button', () => {
    render(<Navbar />)

    const menu = screen.getByRole('button', { name: /open navigation menu/i })
    fireEvent.click(menu)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('button', { name: /open navigation menu/i }).getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menu)
  })
})
