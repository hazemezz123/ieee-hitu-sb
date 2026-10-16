/**
 * Central SEO site configuration.
 * Single source of truth for origin, titles, and descriptions.
 */

function resolveSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
  if (raw) return raw.replace(/\/+$/, '')
  return 'https://ieee-hitu.example.com'
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
  siteUrl: resolveSiteUrl(),
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
