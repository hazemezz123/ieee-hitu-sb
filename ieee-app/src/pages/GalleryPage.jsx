import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import MasonryGallery from '../components/MasonryGallery'
import { fetchEventsResult } from '../data/eventsSource';

export default function GalleryPage() {
 const [allImages, setAllImages] = useState([]);
 const [status, setStatus] = useState('loading');
 const [source, setSource] = useState(null);

 useEffect(() => {
  let active = true;
  fetchEventsResult().then(({ events, source: resultSource }) => {
  if (!active) return;
 const aggregated = events
 .filter((e) => e.gallery && e.gallery.length > 0)
 .flatMap((e) => e.gallery);
  setAllImages(aggregated.length > 0 ? aggregated : null);
  setSource(resultSource);
  setStatus('ready');
    }).catch(() => active && setStatus('error'));
  return () => { active = false; };
  }, []);

 return (
 <PageLayout>
 <div className="min-h-screen">
 <AnimatedSection>
 <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
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
  <section className="py-20 md:py-24 lg:py-32">
 <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-7xl">
  {status === 'loading' ? <p role="status" className="py-16 text-center text-on-surface-variant">Loading event photos...</p> : status === 'error' ? <div role="alert" className="py-16 text-center text-on-surface-variant">Event photos could not be loaded.</div> : <>
  {source === 'fallback' && <p className="mb-8 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing saved fallback event information while live event data is unavailable.</p>}
  {allImages ? (
 <MasonryGallery images={allImages} />
 ) : (
 <div className="text-center py-16 md:py-20 ">
 <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
 photo_library
 </span>
 <h2 className="text-xl font-bold text-on-surface mb-2">Gallery Coming Soon</h2>
 <p className="text-on-surface-variant">
 Photos from our events and activities will appear here once available.
 </p>
 </div>
  )}</>}
 </div>
 </section>
 </AnimatedSection>
 </div>
 </PageLayout>
 );
}
