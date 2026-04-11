import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import {
  committeeCategories,
  nonTechnicalCommittees,
  technicalCommittees,
  totalCommittees,
} from '../data/committees';

const renderCommitteeCard = (committee) => (
  <article
    key={committee.slug}
    className="bg-surface-container-low p-5 md:p-6 lg:p-8 transition-all duration-300 hover:bg-surface-container-lowest"
  >
    <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-3 md:mb-4">
      {committee.icon}
    </span>
    <div className="flex items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
      <h3 className="text-lg md:text-xl font-bold">{committee.name}</h3>
      <span className="text-xs font-bold tracking-widest uppercase text-primary whitespace-nowrap">
        {committee.memberCount} Members
      </span>
    </div>
    <p className="text-sm text-on-surface-variant leading-relaxed mb-4 md:mb-6">
      {committee.shortDescription}
    </p>
    <Link
      className="inline-flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase"
      to={`/committees/${committee.slug}`}
    >
      View Committee
      <span className="material-symbols-outlined text-sm">arrow_forward</span>
    </Link>
  </article>
);

export default function CommitteesPage() {
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
        <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-5xl text-center">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-3 md:mb-4">
            Committees
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4 md:mb-6">
            The Teams That Power Our <span className="text-primary">Branch</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed mb-6 md:mb-8">
            Explore the technical and non-technical committees that shape learning,
            operations, and community impact across IEEE HITU SB.
          </p>
          <div className="flex gap-4 md:gap-8 justify-center text-on-surface-variant">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{totalCommittees}</div>
              <div className="text-xs md:text-sm uppercase tracking-wider">Committees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">2</div>
              <div className="text-xs md:text-sm uppercase tracking-wider">Categories</div>
            </div>
          </div>
        </div>
      </section>
      </AnimatedSection>

      <section className="py-20 md:py-24 lg:py-32 bg-surface">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 space-y-12 md:space-y-16 lg:space-y-20">
          <div>
            <div className="flex justify-between items-end mb-6 md:mb-8 lg:mb-10">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-3 md:mb-4">
                  Category
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {committeeCategories.technical}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {technicalCommittees.map(renderCommitteeCard)}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-6 md:mb-8 lg:mb-10">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-3 md:mb-4">
                  Category
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  {committeeCategories.nonTechnical}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {nonTechnicalCommittees.map(renderCommitteeCard)}
            </div>
          </div>
        </div>
      </section>
    </div>
    </PageTransition>
  );
}
