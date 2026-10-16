import Link from 'next/link'

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

const socials = [
  { name: 'Facebook', href: 'https://www.facebook.com/ieeehitusb', Icon: FacebookIcon },
  { name: 'Instagram', href: 'https://www.instagram.com/ieee.hitu.sb/', Icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/hitu-ieee-sb/posts/', Icon: LinkedinIcon },
]

const links = [
  { name: 'About', href: '/about' },
  { name: 'Committees', href: '/committees' },
  { name: 'Events', href: '/events' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Join Us', href: '/join-us' },
  { name: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-inverse-surface text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div>
          <img src="https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_400,c_limit/v1792178198/ieee-brand/hxgultwyrc7cq9ae9nny.png" alt="IEEE HITU Student Branch" className="mb-5 h-10 w-auto brightness-0 invert" />
          <p className="max-w-xl text-sm leading-6 text-white/75">
            The IEEE Student Branch at Helwan International Technological University, Cairo, Egypt.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-white/60 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-2">
          {links.map(link => (
            <Link key={link.name} href={link.href} className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/65 sm:px-8 md:flex-row md:justify-between">
          <p>&copy; 2026 IEEE HITU Student Branch</p>
          <p>Helwan International Technological University</p>
        </div>
      </div>
    </footer>
  )
}
