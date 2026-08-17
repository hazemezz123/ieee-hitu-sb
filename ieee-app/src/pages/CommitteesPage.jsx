import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { boardMembers } from '../data/boardMembers'
import {
  committeeCategories,
  nonTechnicalCommittees,
  technicalCommittees,
  totalCommittees,
} from '../data/committees'
import { findCommitteeLeaders } from '../data/presentation'

const CommitteeGroup = ({ title, committees, offset = 0 }) => (
  <section>
    <h2 className="text-2xl font-bold text-on-surface md:text-3xl">{title}</h2>
    <ol className="mt-8 divide-y divide-outline-variant/30 border-t border-outline-variant/30" start={offset ? offset + 1 : undefined}>
      {committees.map((committee, index) => {
        const leaders = findCommitteeLeaders(committee.slug, boardMembers)
        return (
          <li key={committee.slug} className="grid gap-4 py-8 md:grid-cols-[3rem_minmax(0,1fr)_10rem] md:gap-8">
            <span className="font-mono text-sm text-primary">{String(offset + index + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-xl font-bold text-on-surface">{committee.name}</h3>
              <p className="mt-2 max-w-3xl leading-relaxed text-on-surface-variant">{committee.shortDescription}</p>
              {leaders.length > 0 && <p className="mt-3 flex flex-wrap gap-x-2 text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">Leadership:</span> {leaders.map(leader => <span key={`${leader.name}-${leader.position}`}>{leader.name}</span>)}</p>}
            </div>
            <div className="md:text-right">
              <p className="text-sm text-on-surface-variant">{committee.categoryLabel}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{committee.memberCount} members</p>
              <Link aria-label={`View ${committee.name} committee record`} className="mt-4 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-widest text-primary" to={`/committees/${committee.slug}`}>View record</Link>
            </div>
          </li>
        )
      })}
    </ol>
  </section>
)

export default function CommitteesPage() {
  return (
    <PageLayout>
      <AnimatedSection>
        <header className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <h1 className="text-4xl font-black text-on-surface md:text-6xl">Committee directory</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">Technical and non-technical committee records published by IEEE HITU Student Branch.</p>
          <p className="mt-8 text-on-surface-variant" aria-label={`${totalCommittees} committee records`}><strong className="text-3xl text-primary">{totalCommittees}</strong> committee records</p>
        </header>
      </AnimatedSection>
      <div className="border-y border-outline-variant/30 bg-surface-container-low py-16">
        <div className="container mx-auto max-w-6xl space-y-16 px-6 sm:px-8 md:px-12">
          <CommitteeGroup title={committeeCategories.technical} committees={technicalCommittees} />
          <CommitteeGroup title={committeeCategories.nonTechnical} committees={nonTechnicalCommittees} offset={technicalCommittees.length} />
        </div>
      </div>
    </PageLayout>
  )
}
