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

const gsapMock = vi.hoisted(() => {
  const showAnim = { progress: vi.fn(() => showAnim), play: vi.fn(), reverse: vi.fn(), kill: vi.fn() }
  const tween = () => ({ kill: vi.fn() })
  return {
    showAnim,
    from: vi.fn(() => showAnim),
    registerPlugin: vi.fn(),
    create: vi.fn(() => ({ kill: vi.fn() })),
    to: vi.fn(() => tween()),
    fromTo: vi.fn(() => tween()),
    set: vi.fn(),
  }
})
vi.mock('gsap', () => ({
  default: {
    from: gsapMock.from,
    registerPlugin: gsapMock.registerPlugin,
    to: gsapMock.to,
    fromTo: gsapMock.fromTo,
    set: gsapMock.set,
  },
}))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: gsapMock.create } }))

beforeEach(() => {
  nav.pathname = '/'
  gsapMock.from.mockClear()
  gsapMock.registerPlugin.mockClear()
  gsapMock.create.mockClear()
  gsapMock.to.mockClear()
  gsapMock.fromTo.mockClear()
  gsapMock.set.mockClear()
  gsapMock.showAnim.play.mockClear()
  gsapMock.showAnim.reverse.mockClear()
})

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

  it('hides the header on scroll down and reveals it on scroll up', () => {
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    render(<Navbar />)

    expect(gsapMock.from).toHaveBeenCalledTimes(1)
    const [target, config] = gsapMock.from.mock.calls[0]
    expect(target.tagName).toBe('HEADER')
    expect(config).toMatchObject({ yPercent: -100, paused: true, duration: 0.2 })
    expect(gsapMock.showAnim.progress).toHaveBeenCalledWith(1)
    expect(gsapMock.create).toHaveBeenCalledTimes(1)

    const { onUpdate } = gsapMock.create.mock.calls[0][0]
    onUpdate({ direction: 1 })
    expect(gsapMock.showAnim.reverse).toHaveBeenCalledTimes(1)
    expect(gsapMock.showAnim.play).not.toHaveBeenCalled()
    onUpdate({ direction: -1 })
    expect(gsapMock.showAnim.play).toHaveBeenCalledTimes(1)
  })

  it('skips the scroll animation when reduced motion is preferred', () => {
    window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
    render(<Navbar />)

    expect(gsapMock.from).not.toHaveBeenCalled()
    expect(gsapMock.create).not.toHaveBeenCalled()
  })

  it('staggers the mobile menu open and marks it interactive', () => {
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    render(<Navbar />)

    const wrapper = document.getElementById('mobile-navigation')
    expect(wrapper.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper.hasAttribute('inert')).toBe(true)
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull()

    gsapMock.fromTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(wrapper.getAttribute('aria-hidden')).toBe(null)
    expect(wrapper.hasAttribute('inert')).toBe(false)
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeTruthy()
    expect(gsapMock.to).toHaveBeenCalledWith(wrapper, expect.objectContaining({ height: 'auto' }))
    expect(gsapMock.fromTo).toHaveBeenCalledTimes(1)
    expect(gsapMock.fromTo.mock.calls[0][0]).toHaveLength(7)
    expect(gsapMock.fromTo.mock.calls[0][2]).toMatchObject({ autoAlpha: 1, y: 0, stagger: 0.04 })
  })

  it('collapses the mobile menu and hides it from assistive tech when closed', () => {
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    render(<Navbar />)

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    gsapMock.to.mockClear()
    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }))

    const wrapper = document.getElementById('mobile-navigation')
    expect(wrapper.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper.hasAttribute('inert')).toBe(true)
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull()
    expect(gsapMock.to).toHaveBeenCalledWith(wrapper, expect.objectContaining({ height: 0 }))
  })

  it('switches the mobile menu without animation when reduced motion is preferred', () => {
    window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
    render(<Navbar />)

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(gsapMock.to).not.toHaveBeenCalled()
    expect(gsapMock.fromTo).not.toHaveBeenCalled()
    expect(gsapMock.set).toHaveBeenCalledWith(document.getElementById('mobile-navigation'), { height: 'auto' })
  })
})
