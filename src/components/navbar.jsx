'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Committees', href: '/committees' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [openPath, setOpenPath] = useState(null)
  const { theme, toggle } = useTheme()
  // Gate theme-dependent labels on mount: the server always renders light, so
  // rendering the resolved icon immediately would hydrate stale on dark-system
  // first visits (suppressHydrationWarning would freeze the wrong label).
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag so first paint matches SSR
  useEffect(() => { setMounted(true) }, [])
  const dark = mounted && theme === 'dark'
  const toggleLabel = !mounted ? 'Toggle color theme' : (dark ? 'Switch to light mode' : 'Switch to dark mode')
  const pathname = usePathname()
  const menuButtonRef = useRef(null)
  const headerRef = useRef(null)
  const menuRef = useRef(null)
  const isMenuOpen = openPath === pathname

  useEffect(() => {
    const desktop = window.matchMedia?.('(min-width: 768px)')
    function closeAtDesktop(event) {
      if (event.matches) {
        setOpenPath(null)
        menuButtonRef.current?.focus()
      }
    }
    desktop?.addEventListener('change', closeAtDesktop)
    return () => desktop?.removeEventListener('change', closeAtDesktop)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        setOpenPath(null)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isMenuOpen])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return
    // Directionally aware header (GSAP demo): slide the fixed header away when
    // scrolling down, bring it back on the first upward scroll.
    gsap.registerPlugin(ScrollTrigger)
    const showAnim = gsap.from(header, { yPercent: -100, paused: true, duration: 0.2 }).progress(1)
    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === -1) showAnim.play()
        else showAnim.reverse()
      },
    })
    return () => { trigger.kill(); showAnim.kill() }
  }, [])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const items = menu.querySelectorAll('[data-menu-item]')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) {
      gsap.set(menu, { height: isMenuOpen ? 'auto' : 0 })
      gsap.set(items, { clearProps: 'opacity,visibility,transform' })
      return
    }
    // Staggered reveal: the panel expands while its items fade/slide in.
    if (isMenuOpen) {
      const heightTween = gsap.to(menu, { height: 'auto', duration: 0.3, ease: 'power2.out' })
      const itemTween = gsap.fromTo(items, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, delay: 0.06, stagger: 0.04 })
      return () => { heightTween.kill(); itemTween.kill() }
    }
    const heightTween = gsap.to(menu, { height: 0, duration: 0.22, ease: 'power2.in' })
    const itemTween = gsap.fromTo(items, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -4, duration: 0.15 })
    return () => { heightTween.kill(); itemTween.kill() }
  }, [isMenuOpen])

  const isActive = path => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
  const dismissAfterNavigation = () => {
    setOpenPath(null)
    menuButtonRef.current?.focus()
  }

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface-container-lowest">
      <nav className="mx-auto flex h-[var(--navbar-height)] max-w-7xl items-center gap-6 px-5 sm:px-8" aria-label="Primary navigation">
        <Link href="/" className="mr-auto flex items-center" aria-label="IEEE HITU Student Branch home">
          <img src="/logo.png" alt="IEEE HITU Student Branch" className="navbar-logo h-9 w-auto" />
        </Link>

        <div className="hidden items-stretch self-stretch md:flex">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className="nav-link"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-pressed={dark}
          className="nav-menu-button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">{!mounted ? 'contrast' : (dark ? 'light_mode' : 'dark_mode')}</span>
        </button>
        <div className="hidden md:block">
          <Link href="/join-us" className="btn btn-primary">Join IEEE</Link>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="nav-menu-button md:hidden"
          onClick={() => setOpenPath(isMenuOpen ? null : pathname)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{isMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      <div
        id="mobile-navigation"
        ref={menuRef}
        aria-hidden={isMenuOpen ? undefined : true}
        inert={isMenuOpen ? undefined : true}
        style={{ height: 0 }}
        className="overflow-hidden bg-surface-container-lowest md:hidden"
      >
        <nav className="mx-auto flex max-w-7xl flex-col border-t border-outline-variant px-5 py-4" aria-label="Mobile navigation">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className="nav-link-mobile"
              data-menu-item
              onClick={dismissAfterNavigation}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/join-us" data-menu-item className="btn btn-primary mt-3" onClick={dismissAfterNavigation}>Join IEEE</Link>
        </nav>
      </div>
    </header>
  )
}
