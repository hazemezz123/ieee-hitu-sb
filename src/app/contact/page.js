import ContactPage from '@/features/contact/components/ContactPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Contact',
  description: 'Contact IEEE HITU Student Branch — reach the team for joining, partnerships, and events.',
  alternates: { canonical: absoluteUrl('/contact') },
}

export default function Page() {
  return <ContactPage />
}
