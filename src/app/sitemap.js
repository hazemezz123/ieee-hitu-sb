import { siteConfig, absoluteUrl } from '@/lib/seo'
import { getAllCommitteesForSitemap, getAllEventsForSitemap } from '@/lib/server/seoData'

/**
 * @returns {Promise<import('next').MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const now = new Date()
  /** @type {import('next').MetadataRoute.Sitemap} */
  const staticRoutes = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/committees'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/events'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/join-us'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/gallery'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: absoluteUrl('/about/founders'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  let events = []
  let committees = []
  try {
    events = await getAllEventsForSitemap()
  } catch {
    events = []
  }
  try {
    committees = await getAllCommitteesForSitemap()
  } catch {
    committees = []
  }

  const eventRoutes = (events || [])
    .filter((e) => e && e.slug)
    .map((e) => ({
      url: absoluteUrl(`/events/${e.slug}`),
      lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const committeeRoutes = (committees || [])
    .filter((c) => c && c.slug)
    .map((c) => ({
      url: absoluteUrl(`/committees/${c.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  // Deduplicate by URL (DB + static overlap)
  const seen = new Set()
  return [...staticRoutes, ...eventRoutes, ...committeeRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}

// Re-export for test stability: ensures siteConfig origin is single source.
export const sitemapSiteUrl = siteConfig.siteUrl
