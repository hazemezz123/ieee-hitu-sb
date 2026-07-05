import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { fetchEvents } from '../data/eventsSource';
import EventCard from '../components/EventCard';

const ALL_CATEGORY = 'all';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const filteredEvents =
    activeCategory === ALL_CATEGORY
      ? events
      : events.filter((e) => e.category === activeCategory);

  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;

  const eventCategories = [...new Set(events.map((e) => e.category))];

  if (loading) {
    return (
      <PageLayout>
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4 block">
            progress_activity
          </span>
          <p className="text-on-surface-variant">Loading events...</p>
        </div>
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <AnimatedSection>
      <section className="relative py-16 md:py-24 lg:py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-5xl text-center">
          <span className="section-label mb-4">Events</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-tight mb-6">
            Where Ideas Come <span className="text-primary">Alive</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed mb-8">
            Workshops, conferences, competitions, and more — explore everything our branch
            has organized for its members.
          </p>
          <div className="flex gap-4 md:gap-6 lg:gap-8 justify-center text-on-surface-variant">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{events.length}</div>
              <div className="text-sm uppercase tracking-wider">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{eventCategories.length}</div>
              <div className="text-sm uppercase tracking-wider">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{upcomingCount}</div>
              <div className="text-sm uppercase tracking-wider">Upcoming</div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* Filter Bar + Events Grid */}
      <AnimatedSection delay={1}>
      <section className="py-20 md:py-24 lg:py-32 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-6xl">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 mb-6 md:mb-8 lg:mb-12 justify-center">
            <button
              type="button"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${
                activeCategory === ALL_CATEGORY
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}
              onClick={() => setActiveCategory(ALL_CATEGORY)}
            >
              All
            </button>
            {eventCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 md:py-16 lg:py-20">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-on-surface-variant mb-4">
                event_busy
              </span>
              <h3 className="text-lg md:text-xl font-bold text-on-surface mb-2">No events in this category yet</h3>
              <p className="text-on-surface-variant">More events are coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={2}>
      <section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Want to Join Our Next Event?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Become a member and be part of the workshops, competitions, and conferences
            that make our branch thrive.
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
    </PageLayout>
  );
}
