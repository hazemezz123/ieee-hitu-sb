import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import MasonryGallery from '../components/MasonryGallery'
import { fetchEvents } from '../data/eventsSource';

export default function GalleryPage() {
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    fetchEvents().then((events) => {
      const aggregated = events
        .filter((e) => e.gallery && e.gallery.length > 0)
        .flatMap((e) => e.gallery);
      setAllImages(aggregated.length > 0 ? aggregated : null);
    });
  }, []);

  return (
    <PageTransition>
    <div className="min-h-screen bg-surface">
      <AnimatedSection>
      <section className="relative py-16 md:py-24 lg:py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-5xl">
          <div className="max-w-3xl">
            <span className="section-label mb-4">Gallery</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4 md:mb-6">
              Moments From Our <span className="text-primary">Branch</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed">
              Photos from our events, workshops, and activities across IEEE HITU SB.
            </p>
          </div>
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={1}>
      <section className="py-20 md:py-24 lg:py-32 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-7xl">
          {allImages ? (
            <MasonryGallery images={allImages} />
          ) : (
            <div className="text-center py-16 md:py-20 bg-surface-container-low">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
                photo_library
              </span>
              <h3 className="text-xl font-bold text-on-surface mb-2">Gallery Coming Soon</h3>
              <p className="text-on-surface-variant">
                Photos from our events and activities will appear here once available.
              </p>
            </div>
          )}
        </div>
      </section>
      </AnimatedSection>
    </div>
    </PageTransition>
  );
}
