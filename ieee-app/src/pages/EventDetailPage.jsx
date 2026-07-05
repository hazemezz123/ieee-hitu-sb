import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import { fetchEventBySlug } from '../data/eventsSource';
import MasonryGallery from '../components/MasonryGallery';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <span className="text-xs uppercase tracking-wider text-on-surface-variant">{label}</span>
      </div>
      <div className="text-lg font-bold text-on-surface">{value}</div>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventBySlug(slug).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4 block">
            progress_activity
          </span>
          <p className="text-on-surface-variant">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-8">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-black tracking-tight mb-4">Event not found</h1>
          <p className="text-on-surface-variant mb-6">
            The event page you are looking for does not exist.
          </p>
          <Link
            to="/events"
            className="btn btn-primary"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-surface">
      {/* Hero Header */}
      <AnimatedSection>
      <section className="relative bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-5xl">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-5 md:mb-8 pt-8"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Events
          </Link>

          {/* Cover Image */}
          <div className="relative w-full aspect-[21/9] overflow-hidden rounded-xl mb-10">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="max-w-3xl pb-16">
            <span className="section-label mb-4">{event.categoryLabel}</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-6">
              {event.excerpt}
            </p>
            {event.organizerCommittee && (
              <p className="text-sm text-on-surface-variant">
                Organized by <span className="font-semibold text-on-surface">{event.organizerCommittee} Committee</span>
              </p>
            )}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* Key Info Cards */}
      <AnimatedSection delay={1}>
      <section className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon="calendar_today"
              label="Date"
              value={formatDate(event.date)}
            />
            <StatCard
              icon="location_on"
              label="Location"
              value={event.location}
            />
            <StatCard
              icon="category"
              label="Category"
              value={event.categoryLabel}
            />
            <StatCard
              icon={event.endDate ? 'event_repeat' : 'event'}
              label="Type"
              value={event.endDate ? 'Multi-day' : 'Single day'}
            />
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* Description */}
      {event.description && (
        <AnimatedSection delay={2}>
        <section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-4xl">
            <span className="section-label mb-4">About the Event</span>
            <div className="prose prose-lg max-w-none">
              {event.description.split('\n').map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="text-on-surface-variant leading-relaxed mb-4 last:mb-0">
                    {paragraph.trim()}
                  </p>
                ) : null,
              )}
            </div>
          </div>
        </section>
        </AnimatedSection>
      )}

      {/* Masonry Gallery */}
      <AnimatedSection delay={3}>
      <section className="py-20 md:py-24 lg:py-32 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-6xl">
          <div className="text-center mb-16">
            <span className="section-label mb-4">Gallery</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Event Photos
            </h2>
          </div>
          <MasonryGallery images={event.gallery} />
        </div>
      </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={4}>
      <section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Want to Join Our Next Event?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Be part of the workshops, competitions, and conferences that make our branch thrive.
          </p>
          <a
            href="/join-us"
            className="btn btn-primary"
          >
            Join Us
          </a>
        </div>
      </section>
      </AnimatedSection>
    </div>
    </PageTransition>
  );
}
