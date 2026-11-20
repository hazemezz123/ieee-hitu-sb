'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ArrowUp } from 'lucide-react'
import BrandLogo from '@/components/ui/BrandLogo'

// Brand glyphs are small inline SVGs (simple-icons path data, CC0) because
// the installed lucide-react no longer ships brand icons.
function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://www.facebook.com/ieeehitusb', Icon: FacebookIcon },
  { name: 'Instagram', href: 'https://www.instagram.com/ieee.hitu.sb/', Icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/hitu-ieee-sb/posts/', Icon: LinkedinIcon },
]

const NAV_GROUPS = [
  {
    title: 'Explore',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Committees', href: '/committees' },
      { name: 'Events', href: '/events' },
      { name: 'Gallery', href: '/gallery' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { name: 'Become a Member', href: '/join-us' },
      { name: 'Partner With Us', href: '/contact' },
      { name: 'Contact Us', href: '/contact' },
    ],
  },
]

const FOOTER_LINK_CLASSES =
  'inline-flex min-h-8 items-center text-sm text-on-surface-variant transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export default function Footer() {
  const pathname = usePathname()
  const showCompactCta = pathname !== '/'
  const year = new Date().getFullYear()

  function scrollToTop() {
    if (typeof window === 'undefined') return
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden border-t border-outline-variant bg-surface-container-lowest text-on-surface">
      {/* Subtle IEEE-blue top datum rule & faint masked engineering grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-primary/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-primary opacity-[0.045] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 85% 15%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 85% 15%, black 20%, transparent 80%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* 1. Compact Call-to-Action Area (shown on inner pages; Home has its own full-width RecruitmentBand) */}
        {showCompactCta && (
          <div className="flex flex-col gap-4 border-b border-outline-variant/60 py-7 sm:flex-row sm:items-center sm:justify-between md:py-9">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
                Build. Connect. Innovate.
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Be part of the next generation of engineers.
              </p>
            </div>
            <Link
              href="/join-us"
              className="btn btn-primary group inline-flex shrink-0 items-center gap-2 self-start sm:self-auto"
            >
              <span>Join IEEE</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </Link>
          </div>
        )}

        {/* 2. Main Footer Content */}
        <div className="grid gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:gap-10 md:py-11 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
          <div className="max-w-md">
            <Link
              href="/"
              aria-label="IEEE HITU Student Branch home"
              className="inline-flex items-center gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <BrandLogo
                lightSrc="/logos/brand/ieee-hitu-color.svg"
                darkSrc="/logos/brand/ieee-hitu-white.svg"
                alt="IEEE HITU Student Branch"
                size="footer"
                surface="none"
              />
              <div>
                <p className="text-base font-bold tracking-tight text-on-surface">
                  IEEE HITU Student Branch
                </p>
                <p className="text-xs font-medium text-on-surface-variant">
                  Cairo, Egypt
                </p>
              </div>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              A student-led engineering community advancing hands-on workshops, technical innovation, and collaborative growth at HITU.
            </p>

            <div className="-ml-2.5 mt-4 flex items-center gap-1">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-on-surface-variant transition-colors duration-150 hover:bg-surface-container hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <social.Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-8 sm:gap-10"
          >
            {NAV_GROUPS.map(group => (
              <div key={group.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {group.links.map(link => (
                    <li key={link.name}>
                      <Link href={link.href} className={FOOTER_LINK_CLASSES}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* 3. Bottom Utility Bar */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/60 py-5 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p>&copy; {year} IEEE HITU Student Branch</p>
            <span aria-hidden="true" className="hidden text-outline-variant sm:inline">
              &middot;
            </span>
            <p>Helwan International Technological University</p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group inline-flex min-h-8 cursor-pointer items-center gap-1.5 self-start font-semibold text-on-surface-variant transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
          >
            <span>Back to top</span>
            <ArrowUp
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </footer>
  )
}
