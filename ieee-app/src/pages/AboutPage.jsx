import { Link } from 'react-router-dom';

const branchHighlights = [
  {
    value: 'Student-Led',
    label: 'Community',
    description: 'A branch shaped by students who learn, organize, and grow together.',
  },
  {
    value: 'Technical',
    label: 'Development',
    description: 'Workshops, committees, and projects that strengthen practical skills.',
  },
  {
    value: 'Professional',
    label: 'Exposure',
    description: 'A structured environment that connects academic learning with IEEE culture.',
  },
];

const practiceHighlights = [
  'Organizing workshops and technical activities for students.',
  'Collaborating through committees that support both operations and learning.',
  'Building leadership, teamwork, and communication through branch work.',
  'Creating a campus community connected to the wider IEEE network.',
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
  return (
    <div className="min-h-screen bg-surface">
      <section className="relative overflow-hidden bg-surface-container-lowest py-32">
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
            <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">
              About Us
            </span>
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-on-surface md:text-6xl">
              Who Are We at <span className="text-primary">IEEE HITU SB</span>?
            </h1>
            <p className="mb-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              IEEE HITU SB is the student branch of IEEE at Heliopolis International
              Technological University, built to give students a structured community for
              learning, collaboration, and professional growth.
            </p>
            <p className="mb-10 max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Through committees, events, and shared branch work, students gain technical
              exposure, leadership experience, and a stronger connection to the wider world
              of engineering and technology.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {branchHighlights.map((item) => (
                <div key={item.label} className="bg-surface-container-low p-6">
                  <div className="mb-2 text-2xl font-black text-primary">{item.value}</div>
                  <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-on-surface">
                    {item.label}
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">
                Branch Activity
              </span>
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                Who We Are in Practice
              </h2>
              <p className="mb-5 text-base leading-relaxed text-on-surface-variant md:text-lg">
                The branch is not only an identity on campus. It is an active student space
                where members contribute to events, support committee work, and grow through
                practical involvement.
              </p>
              <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
                Its purpose is to help students move beyond passive participation and become
                part of a structured environment shaped by teamwork, learning, and continuity.
              </p>
            </div>

            <div className="grid gap-4">
              {practiceHighlights.map((item) => (
                <div
                  key={item}
                  className="border border-outline-variant/25 bg-surface-container-lowest px-6 py-5"
                >
                  <p className="leading-relaxed text-on-surface">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 max-w-3xl">
            <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">
              Global Organization
            </span>
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
              What Is IEEE?
            </h2>
            <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
              IEEE is a global professional organization that supports the advancement of
              technology, engineering knowledge, technical communities, and professional
              development. It brings together students and professionals through a shared
              framework of learning, collaboration, publications, standards, and events.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ieeeHighlights.map((item) => (
              <div key={item.title} className="bg-surface px-6 py-7">
                <h3 className="mb-3 text-xl font-bold tracking-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-on-surface-variant">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="container mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="bg-primary px-8 py-10 text-on-primary">
              <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-on-primary/80">
                Regional Network
              </span>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                IEEE Egypt Section
              </h2>
              <p className="leading-relaxed text-on-primary/85">
                IEEE HITU SB exists within the broader IEEE structure in Egypt, giving the
                branch a regional context that connects student activity to a larger
                professional network.
              </p>
            </div>

            <div>
              <p className="mb-5 text-base leading-relaxed text-on-surface-variant md:text-lg">
                This connection helps place local branch work within the wider IEEE presence
                across the country. It reinforces that student branch activity is part of a
                broader organizational ecosystem rather than an isolated campus effort.
              </p>
              <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
                For visitors, this makes the branch easier to understand: local in daily
                activity, global in identity, and regionally connected through IEEE Egypt
                Section.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest py-20">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="flex flex-col gap-6 border border-outline-variant/20 bg-surface px-8 py-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="mb-4 block text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">
                Next Step
              </span>
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
                Explore Your Place In The Branch
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                If you want to become part of IEEE HITU SB, continue to the joining and
                membership pages to learn how to get involved.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                className="btn-wedge bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-on-primary transition-all hover:bg-primary-container"
                to="/join-us"
              >
                Join Us
              </Link>
              <Link
                className="border border-outline-variant/40 px-8 py-4 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-primary hover:text-primary"
                to="/membership"
              >
                Membership
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
