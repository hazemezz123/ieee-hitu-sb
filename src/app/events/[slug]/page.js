import { notFound } from 'next/navigation'
import EventDetailPage from '@/features/events/components/EventDetailPage'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, resolveOgImage } from '@/lib/seo'
import { buildBreadcrumbJsonLd, buildEventJsonLd } from '@/lib/structuredData'
import { getEventForSeo } from '@/lib/server/seoData'

/**
 * @param {{ params: Promise<{ slug: string }> | { slug: string } }} props
 */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = await getEventForSeo(slug)
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event does not exist.',
      robots: { index: false, follow: false },
    }
  }
  const title = event.title || 'Event'
  const description = (event.excerpt || event.description || '').slice(0, 160) || undefined
  const canonical = absoluteUrl(`/events/${event.slug}`)
  const image = resolveOgImage(event.coverImage || event.cardImage)
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      type: 'article',
      url: canonical,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
  }
}

/**
 * @param {{ params: Promise<{ slug: string }> | { slug: string } }} props
 */
export default async function Page({ params }) {
  const { slug } = await params
  const event = await getEventForSeo(slug)
  if (!event) notFound()
  return (
    <>
      <JsonLd
        data={[
          buildEventJsonLd(event),
          buildBreadcrumbJsonLd([
            { name: 'Events', path: '/events' },
            { name: event.title, path: `/events/${event.slug}` },
          ]),
        ]}
      />
      <EventDetailPage initialEvent={event} slug={event.slug} />
    </>
  )
}
