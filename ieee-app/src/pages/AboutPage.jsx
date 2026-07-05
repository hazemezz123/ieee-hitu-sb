import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import SectionDecorations from '../components/SectionDecorations'
import { fetchEvents } from '../data/eventsSource';
import EventCard from '../components/EventCard';
import { totalCommittees, committeeCategories } from '../data/committees';

const ieeeResources = [
  {
    icon: 'menu_book',
    title: 'IEEE Xplore®',
    description: "Access more than 5 million documents from some of the world most highly cited publications in electrical engineering and computer science.",
  },
  {
    icon: 'settings_input_component',
    title: 'Standards',
    description: 'Developing technology standards that provide the basis for new products and services in areas such as smart grid, IoT, and telecommunications.',
  },
  {
    icon: 'groups',
    title: 'Conferences',
    description: 'Bringing together technical professionals from around the world to share the latest research and network with industry leaders.',
  },
];

const ieeeHighlights = [
  {
    title: 'Global Network',
    description:
      'IEEE connects students, academics, and professionals across engineering and technology fields worldwide.',
  },
  {
    title: 'Knowledge And Standards',
    description:
      'It supports learning, technical exchange, and standards that influence modern engineering practice.',
  },
  {
    title: 'Professional Community',
    description:
      'It creates a structured ecosystem where members engage through chapters, branches, events, and initiatives.',
  },
];

export default function AboutPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(data.slice(0, 3));
    });
  }, []);

  return (
    <PageLayout>
    <div className="min-h-screen bg-surface">
      <AnimatedSection>
      <section className="relative overflow-hidden bg-surface-container-lowest py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
          <div
            className="absolute top-0 right-0 h-full w-1/2 bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
          <div
            className="absolute bottom-0 left-0 h-2/3 w-1/3 bg-secondary-container wedge-accent"
            style={{ transform: 'rotate(180deg) scale(1.2)' }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl px-6 md:px-12">
          <div className="max-w-4xl">
            <span className="section-label mb-4">About Us</span>
            <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-on-surface">
              Who Are We at <span className="text-primary">IEEE HITU SB</span>?
            </h1>
            <p className="mb-4 max-w-3xl text-base md:text-lg leading-relaxed text-on-surface-variant md:text-xl">
              IEEE HITU SB is the student branch of IEEE at Heliopolis International
              Technological University, built to give students a structured community for
              learning, collaboration, and professional growth.
            </p>
            <p className="mb-8 md:mb-10 max-w-3xl text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
              Through committees, events, and shared branch work, students gain technical
              exposure, leadership experience, and a stronger connection to the wider world
              of engineering and technology.
            </p>

            <div className="grid gap-4 md:gap-6 md:grid-cols-3">
              <div className="card-hover p-4 md:p-6">
                <div className="mb-2 text-xl md:text-2xl font-black text-primary">Student-Led</div>
                <div className="mb-2 md:mb-3 text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                  Community
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
                  A branch shaped by students who learn, organize, and grow together.
                </p>
              </div>
              <div className="card-hover p-4 md:p-6">
                <div className="mb-2 text-xl md:text-2xl font-black text-primary">Technical</div>
                <div className="mb-2 md:mb-3 text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                  Development
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
                  Workshops, committees, and projects that strengthen practical skills.
                </p>
              </div>
              <div className="card-hover p-4 md:p-6">
                <div className="mb-2 text-xl md:text-2xl font-black text-primary">Professional</div>
                <div className="mb-2 md:mb-3 text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                  Exposure
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-on-surface-variant">
                  A structured environment that connects academic learning with IEEE culture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={1}>
      <section className="bg-surface-container-low relative bg-dot-pattern py-20 md:py-24 lg:py-32">
        <SectionDecorations variant="dots" />
        <div className="container mx-auto max-w-6xl px-6 md:px-12 relative section-content">
          <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <span className="section-label mb-4">Our Structure</span>
              <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
                Committee Introduction
              </h2>
              <p className="mb-4 text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
                The branch operates through {totalCommittees} specialized committees across
                two main tracks: Technical and Non-Technical. Each committee focuses on a
                specific domain, giving members the chance to dive deep into what interests
                them most.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
                Technical committees cover fields like AI, web development, cybersecurity,
                robotics, and embedded systems. Non-technical committees handle PR, media,
                marketing, and people development — all essential to running a strong branch.
              </p>
            </div>

            <div className="grid gap-3 md:gap-4">
              <div className="card px-4 md:px-6 py-4 md:py-5">
                <p className="leading-relaxed text-sm md:text-base text-on-surface">
                  <span className="font-bold text-primary">{totalCommittees}</span> committees across 2 categories
                </p>
              </div>
              <div className="card px-4 md:px-6 py-4 md:py-5">
                <p className="leading-relaxed text-sm md:text-base text-on-surface">
                  <span className="font-bold text-primary">{committeeCategories.technical}</span> — hands-on, technology-focused teams
                </p>
              </div>
              <div className="card px-4 md:px-6 py-4 md:py-5">
                <p className="leading-relaxed text-sm md:text-base text-on-surface">
                  <span className="font-bold text-primary">{committeeCategories.nonTechnical}</span> — operations, media, and growth
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-12 lg:mt-16">
            <Link
              to="/committees"
              className="btn btn-primary"
            >
              Explore All Committees
            </Link>
          </div>
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={2}>
      <section className="bg-surface py-20 md:py-24 lg:py-32 relative">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-8 md:mb-12 lg:mb-16 max-w-3xl">
            <span className="section-label mb-4">Global Organization</span>
            <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              What Is <span className="text-primary">IEEE</span>?
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
              IEEE is a global professional organization that supports the advancement of
              technology, engineering knowledge, technical communities, and professional
              development. It brings together students and professionals through a shared
              framework of learning, collaboration, publications, standards, and events.
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-12 md:mb-16">
            {ieeeHighlights.map((item) => (
              <div key={item.title} className="card-hover px-4 md:px-6 py-5 md:py-7">
                <h3 className="mb-2 md:mb-3 text-base md:text-xl font-bold tracking-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-sm md:text-base text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {ieeeResources.map((item, index) => (
              <div key={index} className="card-hover p-6 sm:p-8 md:p-10 group relative overflow-hidden">
                <div className="mb-6 sm:mb-8 text-primary">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4 sm:mb-6">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={3}>
      <section className="bg-surface-container-low relative bg-line-pattern py-20 md:py-24 lg:py-32">
        <SectionDecorations variant="grid" />
        <div className="container mx-auto max-w-6xl px-6 md:px-12 relative section-content">
          <div className="mb-8 md:mb-12 lg:mb-16 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <span className="section-label mb-4">Activities</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
                Our Events
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase hover:gap-3 transition-all"
            >
              View All Events
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 md:py-16 bg-surface-container-low">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-on-surface-variant mb-4">
                event_busy
              </span>
              <h3 className="text-lg md:text-xl font-bold text-on-surface mb-2">No events available yet</h3>
              <p className="text-on-surface-variant">Events will appear here once they are organized.</p>
            </div>
          )}
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={4}>
      <section className="bg-surface py-20 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="card-hover border border-outline-variant/20 px-5 py-6 md:px-8 md:py-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="section-label mb-4">Next Step</span>
              <h2 className="mb-2 md:mb-3 text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
                Explore Your Place In The Branch
              </h2>
              <p className="leading-relaxed text-sm md:text-base text-on-surface-variant">
                If you want to become part of IEEE HITU SB, continue to the joining and
                membership pages to learn how to get involved.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link
                className="btn btn-primary"
                to="/membership"
              >
                Join IEEE
              </Link>
              <Link
                className="btn btn-secondary"
                to="/contact"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>
    </div>
    </PageLayout>
  );
}
