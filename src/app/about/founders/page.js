import FoundersView from '@/features/about/components/FoundersView'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Founders',
  description: 'Meet the founders of IEEE HITU Student Branch.',
  alternates: { canonical: absoluteUrl('/about/founders') },
}

export default function Page() {
  return <FoundersView />
}
