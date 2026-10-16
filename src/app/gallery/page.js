import GalleryPage from '@/features/gallery/components/GalleryPage'
import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Gallery',
  description: 'Event photography and highlights from IEEE HITU Student Branch activities.',
  alternates: { canonical: absoluteUrl('/gallery') },
}

export default function Page() {
  return <GalleryPage />
}
