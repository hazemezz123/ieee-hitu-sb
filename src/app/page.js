import HomePage from '@/features/home/components/HomePage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Home',
  description:
    'IEEE HITU Student Branch at Heliopolis International Technological University — workshops, technical committees, events, and community.',
  alternates: { canonical: absoluteUrl('/') },
}

export default function Page() {
  return <HomePage />
}
