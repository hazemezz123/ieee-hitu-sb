import JoinUsPage from '@/features/join-us/components/JoinUsPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Join Us',
  description:
    'Join IEEE HITU Student Branch — apply to a technical or non-technical committee and start building.',
  alternates: { canonical: absoluteUrl('/join-us') },
}

export default function Page() {
  return <JoinUsPage />
}
