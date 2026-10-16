import CommitteesPage from '@/features/committees/components/CommitteesPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Committees',
  description:
    'Explore IEEE HITU technical and non-technical committees — AI, Web, Robotics, Embedded, Cyber, PR, Media, Marketing, HR and more.',
  alternates: { canonical: absoluteUrl('/committees') },
}

export default function Page() {
  return <CommitteesPage />
}
