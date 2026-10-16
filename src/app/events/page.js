import EventsPage from '@/features/events/components/EventsPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Events',
  description:
    'Browse IEEE HITU workshops, conferences, competitions, and social events — upcoming dates and past records.',
  alternates: { canonical: absoluteUrl('/events') },
  openGraph: { title: 'Events', url: absoluteUrl('/events'), type: 'website' },
}

export default function Page() {
  return <EventsPage />
}
