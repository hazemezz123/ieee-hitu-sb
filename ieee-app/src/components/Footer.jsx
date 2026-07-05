import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'facebook' },
  { name: 'TikTok', href: '#', icon: 'tiktok' },
  { name: 'LinkedIn', href: '#', icon: 'linkedin' },
]

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/events' },
  { name: 'Committee', href: '/committees' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
]

const resourceLinks = [
  { name: 'Join IEEE', href: '/membership' },
  { name: 'Membership', href: '/membership' },
  { name: 'FAQs', href: '/membership' },
  { name: 'Privacy Policy', href: '#' },
]

const contactInfo = [
  { icon: 'mail', label: 'Email', value: 'ieee@hitu.edu.eg' },
  { icon: 'school', label: 'University', value: 'Heliopolis International Technological University' },
  { icon: 'location_on', label: 'Location', value: 'Cairo, Egypt' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

function SocialIconSvg({ icon }) {
  switch (icon) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    default:
      return null
  }
}

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <motion.button
        type="button"
        initial={false}
        animate={showScrollTop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary-container hover:shadow-xl hover:-translate-y-0.5 transition-all duration-250 ease-out"
      >
        <span className="material-symbols-outlined text-lg">arrow_upward</span>
      </motion.button>

      <footer className="relative overflow-hidden border-t border-outline-variant/15">
        <div className="relative section-content mx-auto max-w-7xl px-6 sm:px-8 md:px-12 pt-16 pb-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12"
          >
            <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
              <img
                src={logo}
                alt="IEEE HITU Student Branch"
                className="h-10 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-sm leading-relaxed text-on-surface-variant mb-5 max-w-xs">
                IEEE HITU Student Branch at Heliopolis International Technological University — building a community of engineers, innovators, and problem-solvers.
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-label={link.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/25 text-on-surface-variant transition-all duration-250 ease-out hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <SocialIconSvg icon={link.icon} />
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface mb-5">
                Quick Links
              </h4>
              <nav aria-label="Quick links" className="flex flex-col gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="group relative text-sm text-on-surface-variant transition-all duration-200 ease-out w-fit hover:text-primary"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-px left-0 h-px w-0 bg-primary transition-all duration-250 ease-out group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface mb-5">
                Resources
              </h4>
              <nav aria-label="Resources" className="flex flex-col gap-3">
                {resourceLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="group relative text-sm text-on-surface-variant transition-all duration-200 ease-out w-fit hover:text-primary"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-px left-0 h-px w-0 bg-primary transition-all duration-250 ease-out group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface mb-5">
                Contact
              </h4>
              <ul className="flex flex-col gap-3.5">
                {contactInfo.map((item) => (
                  <li key={item.label} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs text-on-surface-variant/60 uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-sm text-on-surface-variant leading-snug">
                        {item.value}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

          </motion.div>
        </div>

        <div className="border-t border-outline-variant/15">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-on-surface-variant/60">
              &copy; 2026 IEEE HITU Student Branch. All Rights Reserved.
            </p>
            <p className="text-[11px] text-on-surface-variant/40">
              Designed &amp; Developed by{' '}
              <span className="text-on-surface-variant/60">IEEE HITU Web Committee</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
