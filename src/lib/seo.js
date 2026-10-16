/**
 * Central SEO site configuration.
 * Single source of truth for origin, titles, and descriptions.
 */

/**
 * Normalize a site URL: trim, strip trailing slashes, prepend https:// when
 * the scheme is missing (a one-char .env typo otherwise breaks `new URL()`).
 * @param {string} [raw=''] - Raw URL value.
 * @returns {string} Normalized origin.
 */
export function resolveSiteUrl(raw = '') {
  const trimmed = String(raw).trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function resolveDefaultSiteUrl() {
  return (
    resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || '') || 'https://ieee-hitu.example.com'
  )
}

/**
 * @typedef {Object} SiteConfig
 * @property {string} siteUrl
 * @property {string} name
 * @property {string} shortName
 * @property {string} defaultTitle
 * @property {string} titleTemplate
 * @property {string} description
 * @property {string} locale
 * @property {string} ogImage
 */

/** @type {SiteConfig} */
export const siteConfig = {
  siteUrl: resolveDefaultSiteUrl(),
  name: 'IEEE HITU Student Branch',
  shortName: 'IEEE HITU',
  defaultTitle: 'IEEE HITU Student Branch | Heliopolis International Technological University',
  titleTemplate: '%s | IEEE HITU',
  description:
    'The official IEEE student branch at Heliopolis International Technological University — workshops, technical committees, events, and community.',
  locale: 'en_US',
  ogImage: '/og-cover.png',
}

/**
 * Normalize an OG/Twitter image to an absolute URL for crawlers.
 * Relative paths resolve against the site origin; absolute URLs pass through.
 * @param {string} [image] - Image URL or site-relative path.
 * @returns {string|undefined} Absolute URL, or undefined when empty.
 */
export function resolveOgImage(image) {
  if (!image) return undefined
  if (/^https?:\/\//i.test(image)) return image
  return absoluteUrl(image)
}

/**
 * Build an absolute URL from a site-relative path.
 * @param {string} [path='/'] - Site-relative path (leading slash optional).
 * @returns {string} Absolute URL sharing the single production origin.
 */
export function absoluteUrl(path = '/') {
  const base = siteConfig.siteUrl.replace(/\/+$/, '')
  if (!path || path === '/') return base
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
