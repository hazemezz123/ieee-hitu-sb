import { Link, useParams } from 'react-router-dom';
import { committees } from '../data/committees';

const leaderLinks = [
  { key: 'githubUrl', label: 'GitHub', icon: 'code' },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: 'work' },
];

function LeaderCard({ leader }) {
  return (
    <article className="bg-surface-container-low p-8">
      <img
        src={leader.image}
        alt={leader.name}
        className="w-full h-72 object-cover mb-6 bg-surface-container"
      />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
        {leader.role}
      </p>
      <h3 className="text-2xl font-bold mb-3">{leader.name}</h3>
      <p className="text-on-surface-variant mb-6 leading-relaxed">{leader.bio}</p>
      <div className="flex items-center gap-4">
        {leaderLinks.map((link) => (
          <a
            key={link.key}
            href={leader[link.key]}
            aria-label={`${leader.name} ${link.label}`}
            className="text-primary"
          >
            <span className="material-symbols-outlined">{link.icon}</span>
          </a>
        ))}
        <a
          href={`mailto:${leader.email}`}
          aria-label={`${leader.name} email`}
          className="text-primary"
        >
          <span className="material-symbols-outlined">mail</span>
        </a>
      </div>
    </article>
  );
}

function SectionList({ title, items }) {
  return (
    <div className="bg-surface-container-low p-8 lg:col-span-1">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
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
      <div className="min-h-screen bg-surface flex items-center justify-center px-8">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-black tracking-tight mb-4">Committee not found</h1>
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
    <div className="min-h-screen bg-surface">
      <section className="relative py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-5xl">
          <Link
            to="/committees"
            className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-8"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Committees
          </Link>
          <div className="max-w-3xl">
            <span className="material-symbols-outlined text-primary text-5xl mb-6">
              {committee.icon}
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4">
              {committee.name}
            </h1>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">
              {committee.slogan}
            </p>
            <p className="text-xl text-on-surface-variant leading-relaxed">
              {committee.shortDescription}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Category
              </div>
              <div className="text-2xl font-bold text-primary">{committee.categoryLabel}</div>
            </div>
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Members
              </div>
              <div className="text-2xl font-bold text-primary">{committee.memberCount}</div>
            </div>
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Focus
              </div>
              <div className="text-2xl font-bold text-primary">Core Team</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12 grid gap-8 lg:grid-cols-3">
          <SectionList title="Committee Goals" items={committee.goals} />
          <SectionList title="Roles & Responsibilities" items={committee.roles} />
          <SectionList title="Key Activities" items={committee.activities} />
        </div>
      </section>

      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">
              Leadership
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight">Committee Leads</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LeaderCard leader={committee.head} />
            <LeaderCard leader={committee.viceHead} />
          </div>
        </div>
      </section>
    </div>
  );
}
