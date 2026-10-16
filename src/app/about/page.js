import AboutPage from '@/features/about/components/AboutPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'About',
  description:
    'About IEEE HITU Student Branch — mission, board, and connection to the global IEEE engineering community.',
  alternates: { canonical: absoluteUrl('/about') },
}

export default function Page() {
  return <AboutPage />
}
