/**
 * schema.org JSON-LD builders. All URLs absolute via siteConfig.
 */
import { siteConfig, absoluteUrl } from './seo.js'

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} name
 * @property {string} path
 */

/**
 * @typedef {Object} EventInput
 * @property {string} title
 * @property {string} slug
 * @property {string} date
 * @property {string} [endDate]
 * @property {string} [location]
 * @property {string} [description]
 * @property {string} [excerpt]
 * @property {string} [coverImage]
 * @property {string} [cardImage]
 */

/**
 * @typedef {Object} CommitteeInput
 * @property {string} name
 * @property {string} slug
 * @property {string} [shortDescription]
 * @property {number} [memberCount]
 */

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: absoluteUrl('/logo.png'),
  }
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.siteUrl}/events?q={query}`,
      'query-input': 'required name=query',
    },
  }
}

/**
 * @param {BreadcrumbItem[]} items
 */
export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/**
 * @param {EventInput} event
 */
export function buildEventJsonLd(event) {
  const image = event.coverImage || event.cardImage
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.date,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    ...(event.location ? { location: { '@type': 'Place', name: event.location } } : {}),
    ...(event.description || event.excerpt
      ? { description: event.description || event.excerpt }
      : {}),
    ...(image ? { image: image.startsWith('http') ? image : absoluteUrl(image) } : {}),
    url: absoluteUrl(`/events/${event.slug}`),
    organizer: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  }
}

/**
 * @param {CommitteeInput} committee
 */
export function buildCommitteeJsonLd(committee) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: committee.name,
    url: absoluteUrl(`/committees/${committee.slug}`),
    ...(committee.shortDescription ? { description: committee.shortDescription } : {}),
  }
}
