import { Link, useParams } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
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
    <div className="bg-surface-container-low p-6">
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
  const event = getEventBySlug(slug);

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
            className="btn-wedge inline-block bg-primary text-on-primary px-6 py-3 font-bold tracking-wide uppercase"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Header */}
      <section className="relative bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-5xl">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-8 pt-32"
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
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary block mb-3">
              {event.categoryLabel}
            </span>
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

      {/* Key Info Cards */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-12 max-w-5xl">
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

      {/* Description */}
      {event.description && (
        <section className="py-24 bg-surface-container-lowest">
          <div className="container mx-auto px-12 max-w-4xl">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-6">
              About the Event
            </span>
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
      )}

      {/* Masonry Gallery */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">
              Gallery
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Event Photos
            </h2>
          </div>
          <MasonryGallery images={event.gallery} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12 text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Want to Join Our Next Event?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Be part of the workshops, competitions, and conferences that make our branch thrive.
          </p>
          <a
            href="/join-us"
            className="btn-wedge inline-block bg-primary text-on-primary px-8 py-3 font-bold tracking-wide uppercase"
          >
            Join Us
          </a>
        </div>
      </section>
    </div>
  );
}
