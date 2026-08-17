import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const links = [
  { name: 'About', href: '/about' },
  { name: 'Committees', href: '/committees' },
  { name: 'Events', href: '/events' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Membership', href: '/membership' },
  { name: 'Join Us', href: '/join-us' },
  { name: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-inverse-surface text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div>
          <img src={logo} alt="IEEE HITU Student Branch" className="mb-5 h-10 w-auto brightness-0 invert" />
          <p className="max-w-xl text-sm leading-6 text-white/75">
            The IEEE Student Branch at Heliopolis International Technological University, Cairo, Egypt.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-2">
          {links.map(link => (
            <Link key={link.name} to={link.href} className="text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-white/65 sm:px-8 md:flex-row md:justify-between">
          <p>&copy; 2026 IEEE HITU Student Branch</p>
          <p>Heliopolis International Technological University</p>
        </div>
      </div>
    </footer>
  )
}
