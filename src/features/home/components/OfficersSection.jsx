'use client'

import { useCallback, useState } from 'react'
import { Mail } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { initialsOf } from '@/features/about/components/MemberCard'
import { officers } from '../data/officers'

// The installed lucide-react no longer ships brand icons, so the brand glyphs
// are small inline SVGs (simple-icons path data, CC0). Only Mail comes from lucide.
function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function TwitterIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
    </svg>
  )
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  )
}

const SOCIAL_ICONS = {
  linkedin: LinkedinIcon,
  github: GithubIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  email: Mail,
}

const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter',
  instagram: 'Instagram',
  facebook: 'Facebook',
  email: 'Email',
}

const SOCIAL_ORDER = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'email']

// Icon links for the socials object; renders nothing when no URL is set.
export function SocialLinks({ name, socials, size = 'sm', align = 'justify-start', className = '' }) {
  const links = SOCIAL_ORDER
    .map(key => ({ key, href: socials?.[key] }))
    .filter(({ href }) => typeof href === 'string' && href.trim() !== '')

  if (links.length === 0) return null

  const buttonSize = size === 'lg' ? 'h-9 w-9' : 'h-8 w-8'
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <div className={`${className} ${align} flex flex-wrap items-center gap-2 opacity-90 transition-opacity duration-300 group-hover:opacity-100`}>
      {links.map(({ key, href }) => {
        const Icon = SOCIAL_ICONS[key]
        const isMail = href.startsWith('mailto:')
        return (
          <a
            key={key}
            href={href}
            aria-label={`${SOCIAL_LABELS[key]} - ${name}`}
            {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className={`inline-flex ${buttonSize} items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-primary transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:scale-110 hover:border-primary hover:bg-primary hover:text-on-primary focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <Icon aria-hidden="true" className={iconSize} />
          </a>
        )
      })}
    </div>
  )
}

// Portrait + initials fallback + broken-image handling, shared by every officer card.
// `framed` adds the 45° IEEE corner cut; skip it when the portrait does not sit
// at a card corner, so the blue notch can anchor the card edge instead.
function OfficerPortrait({ officer, framed = true }) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(officer.img) && !failed

  // A missing file 404s before hydration attaches onError, leaving the image
  // already broken (complete=true, naturalWidth=0) when React attaches it.
  const catchBrokenPortrait = useCallback(node => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true)
  }, [])

  if (!showImg) {
    return (
      <span
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center bg-primary-fixed text-4xl font-black text-on-primary-fixed"
      >
        {initialsOf(officer.name)}
      </span>
    )
  }

  return (
    <img
      ref={catchBrokenPortrait}
      src={officer.img}
      alt={officer.alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={framed ? 'wedge-frame h-full w-full object-cover' : 'h-full w-full object-cover'}
    />
  )
}

function OfficerCard({ officer }) {
  return (
    <li data-reveal="officer" className="mx-auto w-full max-w-xs sm:max-w-none">
      <article className="card group h-full overflow-hidden">
        <div className="relative aspect-[4/5]">
          <OfficerPortrait officer={officer} />
          <span aria-hidden="true" className="wedge-notch absolute right-0 top-0 h-6 w-6 bg-primary" />
        </div>
        <div className="p-5 md:p-6">
          <h3 className="text-lg font-bold tracking-tight text-on-surface">{officer.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">{officer.role}</p>
          <SocialLinks name={officer.name} socials={officer.socials} className="mt-3" />
        </div>
      </article>
    </li>
  )
}

// Featured chairwoman card: full-width row, horizontal from md up.
export function ChairwomanCard({ officer }) {
  return (
    <li data-reveal="officer" className="mx-auto w-full max-w-xs sm:col-span-2 sm:max-w-none lg:col-span-4">
      <article className="card group relative h-full overflow-hidden">
        <div className="flex h-full flex-col md:flex-row">
          <div className="mx-auto aspect-[4/5] w-48 shrink-0 md:mx-0 md:w-56 lg:w-64">
            <OfficerPortrait officer={officer} framed={false} />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 text-center md:max-w-md md:px-8 md:py-6 md:text-left">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">{officer.name}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-primary">{officer.role}</p>
            {officer.bio ? <p className="mt-4 text-on-surface-variant">{officer.bio}</p> : null}
            <SocialLinks
              name={officer.name}
              socials={officer.socials}
              size="lg"
              align="justify-center md:justify-start"
              className="mt-4"
            />
          </div>
        </div>
        <span aria-hidden="true" className="wedge-notch absolute right-0 top-0 h-6 w-6 bg-primary" />
      </article>
    </li>
  )
}

export default function OfficersSection() {
  // The roster's first entry is the Chairwoman (see ../data/officers.js).
  const [chairwoman, ...rest] = officers

  return (
    <section aria-labelledby="officers-heading" className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Executive Officers</p>
              <h2 id="officers-heading" className="mt-3 text-3xl font-bold text-on-surface">Meet the officers</h2>
            </div>
            <p className="max-w-sm text-on-surface-variant">The leadership team behind IEEE HITU Student Branch.</p>
          </div>
        </Reveal>
        <Reveal staggerChildren="[data-reveal='officer']">
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            <ChairwomanCard officer={chairwoman} />
            {rest.map(officer => <OfficerCard key={officer.name} officer={officer} />)}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
