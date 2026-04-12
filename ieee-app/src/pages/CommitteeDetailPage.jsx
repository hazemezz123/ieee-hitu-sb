import { Link, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import { committees } from '../data/committees';

const leaderLinks = [
  { key: 'githubUrl', label: 'GitHub', Icon: GitHubIcon },
  { key: 'linkedinUrl', label: 'LinkedIn', Icon: LinkedInIcon },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function LeaderCard({ leader }) {
  return (
    <article className="bg-surface-container-low overflow-hidden md:grid md:grid-cols-[260px_minmax(0,1fr)] md:items-stretch">
      <div className="md:h-full">
        <img
          src={leader.image}
          alt={leader.name}
          className="h-full sm:h-56 md:h-72 w-full object-contain bg-surface-container md:h-full md:min-h-[320px]"
        />
      </div>
      <div className="p-5 md:px-8 md:py-10 flex flex-col justify-center md:border-l md:border-outline-variant/20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
          {leader.role}
        </p>
        <h3 className="text-xl md:text-2xl font-bold mb-3">{leader.name}</h3>
        <p className="text-on-surface-variant mb-6 leading-relaxed">{leader.bio}</p>
        <div className="flex items-center gap-4">
          {leaderLinks.map((link) => (
            <a
              key={link.key}
              href={leader[link.key]}
              aria-label={`${leader.name} ${link.label}`}
              className="text-primary hover:text-primary-container transition-colors"
            >
              <link.Icon />
            </a>
          ))}
          <a
            href={`mailto:${leader.email}`}
            aria-label={`${leader.name} email`}
            className="text-primary hover:text-primary-container transition-colors"
          >
            <EmailIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

function SectionList({ title, items }) {
  return (
    <div className="bg-surface-container-low p-5 md:p-6 lg:p-8 lg:col-span-1">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
      <ul className="space-y-3 text-on-surface-variant">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">
              arrow_right_alt
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommitteeDetailPage() {
  const { slug } = useParams();
  const committee = committees.find((item) => item.slug === slug);

  if (!committee) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 md:px-8">
        <div className="text-center max-w-xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-4">Committee not found</h1>
          <p className="text-on-surface-variant mb-6">
            The committee page you are looking for does not exist.
          </p>
          <Link
            to="/committees"
            className="btn-wedge inline-block bg-primary text-on-primary px-6 py-3 font-bold tracking-wide uppercase"
          >
            Back to Committees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-surface">
      <AnimatedSection trigger="load">
      <section className="relative py-16 md:py-24 lg:py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-5xl">
          <Link
            to="/committees"
            className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-5 md:mb-8"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Committees
          </Link>
          <div className="max-w-3xl">
            <span className="material-symbols-outlined text-primary text-4xl md:text-5xl mb-6">
              {committee.icon}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4">
              {committee.name}
            </h1>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">
              {committee.slogan}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed">
              {committee.shortDescription}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-4 md:p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Category
              </div>
              <div className="text-2xl font-bold text-primary">{committee.categoryLabel}</div>
            </div>
            <div className="bg-surface-container-low p-4 md:p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Members
              </div>
              <div className="text-2xl font-bold text-primary">{committee.memberCount}</div>
            </div>
            <div className="bg-surface-container-low p-4 md:p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Focus
              </div>
              <div className="text-2xl font-bold text-primary">Core Team</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 lg:py-32 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 grid gap-8 lg:grid-cols-3">
          <SectionList title="Committee Goals" items={committee.goals} />
          <SectionList title="Roles & Responsibilities" items={committee.roles} />
          <SectionList title="Key Activities" items={committee.activities} />
        </div>
      </section>

      <section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest">
        <div className="container mx-auto px-6 sm:px-8 md:px-12">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">
              Leadership
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight">Committee Leadership</h2>
          </div>

          <div className={`grid grid-cols-1 ${committee.viceHead ? 'gap-8' : 'max-w-4xl mx-auto'}`}>
            <LeaderCard leader={committee.head} />
            {committee.viceHead ? <LeaderCard leader={committee.viceHead} /> : null}
          </div>
        </div>
      </section>
      </AnimatedSection>
    </div>
    </PageTransition>
  );
}
