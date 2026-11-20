import CommitteesPage from '@/features/committees/components/CommitteesPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Committees',
  description:
    'Explore IEEE HITU’s 19 technical and non-technical committees — AI, Web, Mobile, Cyber Security, Embedded, IoT, HR, Marketing, Graphic Design, and more.',
  alternates: { canonical: absoluteUrl('/committees') },
}

export default function Page() {
  return <CommitteesPage />
}
