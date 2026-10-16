import { notFound } from 'next/navigation'
import CommitteeDetailPage from '@/features/committees/components/CommitteeDetailPage'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl } from '@/lib/seo'
import { buildBreadcrumbJsonLd, buildCommitteeJsonLd } from '@/lib/structuredData'
import { getCommitteeForSeo, getCommitteeMembersForSeo } from '@/lib/server/seoData'

/**
 * @param {{ params: Promise<{ slug: string }> | { slug: string } }} props
 */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const committee = await getCommitteeForSeo(slug)
  if (!committee) {
    return {
      title: 'Committee Not Found',
      description: 'The requested committee does not exist.',
      robots: { index: false, follow: false },
    }
  }
  const title = committee.name || 'Committee'
  const description = (committee.shortDescription || '').slice(0, 160) || undefined
  const canonical = absoluteUrl(`/committees/${committee.slug}`)
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: { title, ...(description ? { description } : {}), type: 'article', url: canonical },
    twitter: { card: 'summary_large_image', title, ...(description ? { description } : {}) },
  }
}

/**
 * @param {{ params: Promise<{ slug: string }> | { slug: string } }} props
 */
export default async function Page({ params }) {
  const { slug } = await params
  const committee = await getCommitteeForSeo(slug)
  if (!committee) notFound()
  const members = committee._id ? await getCommitteeMembersForSeo(committee._id) : []
  const detail = { committee, members, source: 'server' }
  return (
    <>
      <JsonLd
        data={[
          buildCommitteeJsonLd(committee),
          buildBreadcrumbJsonLd([
            { name: 'Committees', path: '/committees' },
            { name: committee.name, path: `/committees/${committee.slug}` },
          ]),
        ]}
      />
      <CommitteeDetailPage initialDetail={detail} slug={committee.slug} />
    </>
  )
}
