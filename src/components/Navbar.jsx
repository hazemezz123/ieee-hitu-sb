'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '../assets/logo.png'

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
  const pathname = usePathname()
  const menuButtonRef = useRef(null)
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

  const isActive = path => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
  const dismissAfterNavigation = () => {
    setOpenPath(null)
    menuButtonRef.current?.focus()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface-container-lowest">
      <nav className="mx-auto flex h-[var(--navbar-height)] max-w-7xl items-center gap-6 px-5 sm:px-8" aria-label="Primary navigation">
        <Link href="/" className="mr-auto flex items-center" aria-label="IEEE HITU Student Branch home">
          <img src={logo} alt="IEEE HITU Student Branch" className="h-9 w-auto" />
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

        <Link href="/membership" className="btn btn-primary hidden md:inline-flex">Join IEEE</Link>
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

      <div id="mobile-navigation" hidden={!isMenuOpen} className="border-t border-outline-variant bg-surface-container-lowest px-5 py-4 md:hidden">
        <nav className="mx-auto flex max-w-7xl flex-col" aria-label="Mobile navigation">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className="nav-link-mobile"
              onClick={dismissAfterNavigation}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/membership" className="btn btn-primary mt-3" onClick={dismissAfterNavigation}>Join IEEE</Link>
        </nav>
      </div>
    </header>
  )
}
