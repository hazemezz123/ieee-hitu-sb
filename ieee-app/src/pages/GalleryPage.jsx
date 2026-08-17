import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import MasonryGallery from '../components/MasonryGallery'
import PageLayout from '../components/PageLayout'
import { aggregateGallery } from '../data/presentation'
import { fetchEventsResult } from '../data/eventsSource'
import { fetchGalleryPhotosResult } from '../data/gallerySource'

const eventsLink = <Link className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-primary" to="/events">Browse events<span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span></Link>

export default function GalleryPage() {
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('loading')
  const [source, setSource] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchEventsResult(), fetchGalleryPhotosResult()]).then(([eventsResult, photosResult]) => {
      if (!active) return
      setImages([...photosResult.photos, ...aggregateGallery(eventsResult.events)])
      setSource(eventsResult.source === 'remote' && photosResult.source === 'remote' ? 'remote' : 'fallback')
      setStatus('ready')
    }).catch(() => active && setStatus('error'))
    return () => { active = false }
  }, [])

  return (
    <PageLayout>
      <div className="min-h-screen">
        <AnimatedSection>
          <header className="py-16 md:py-24 lg:py-32">
            <div className="container mx-auto max-w-5xl px-6 sm:px-8 md:px-12">
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-on-surface sm:text-5xl lg:text-6xl">Branch photo archive</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">Documented moments from IEEE HITU Student Branch events, workshops, and activities.</p>
            </div>
          </header>
        </AnimatedSection>

        <section className="pb-20 md:pb-24 lg:pb-32" aria-label="Event photography archive">
          <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-12">
            {status === 'loading' && <div role="status" className="py-16 text-center text-on-surface-variant"><p>Loading event photos...</p>{eventsLink}</div>}
            {status === 'error' && <div role="alert" className="py-16 text-center text-on-surface-variant"><p>Event photos could not be loaded.</p>{eventsLink}</div>}
            {status === 'ready' && <>
              {source === 'fallback' && <p className="mb-8 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing saved fallback event information while live event data is unavailable.</p>}
              {images.length
                ? <MasonryGallery images={images} headingLevel={2} />
                : <div className="py-16 text-center"><span className="material-symbols-outlined mb-4 text-5xl text-on-surface-variant" aria-hidden="true">photo_library</span><h2 className="text-xl font-bold text-on-surface">No event photography available</h2><p className="mt-2 text-on-surface-variant">Published event photography will appear in this archive.</p>{eventsLink}</div>}
            </>}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
