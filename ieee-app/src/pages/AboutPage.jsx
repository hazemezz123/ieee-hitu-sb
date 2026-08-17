import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { boardMembers } from '../data/boardMembers'

export default function AboutPage() {
  const leadership = boardMembers.filter(member => /^(Head|Vice Head)$/.test(member.position))

  return (
    <PageLayout>
      <div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
        <header className="max-w-4xl border-b border-outline-variant/40 pb-12">
          <p className="section-label">Branch profile</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-on-surface md:text-6xl">About IEEE HITU Student Branch</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">IEEE HITU Student Branch is the student branch of IEEE at Helwan International Technological University. It is a structured student community connecting HITU students with technical learning, committees, events, and the wider IEEE network.</p>
        </header>

        <section className="grid gap-10 border-b border-outline-variant/40 py-12 md:grid-cols-[1fr_1.4fr]">
          <div><p className="section-label">The branch at a glance</p><h2 className="mt-3 text-3xl font-bold text-on-surface">A campus bridge to IEEE</h2></div>
          <div>
            <div className="grid grid-cols-2 gap-4"><p aria-label="more than 60 sessions"><strong className="block text-3xl text-primary">60+</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Sessions across all committees</span></p><p aria-label="5 community partnerships"><strong className="block text-3xl text-primary">5</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Community partnerships</span></p></div>
          </div>
        </section>

        <section className="grid gap-10 border-b border-outline-variant/40 py-12 md:grid-cols-[0.8fr_1.2fr]">
          <div><p className="section-label">Leadership records</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Board members</h2></div>
          <ul className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">{leadership.map(member => <li key={`${member.name}-${member.committee}-${member.position}`} className="flex flex-wrap justify-between gap-2 py-3"><span className="font-medium text-on-surface">{member.name}</span><span className="text-sm text-on-surface-variant">{member.position}, {member.committee}</span></li>)}</ul>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-6 py-12"><p className="max-w-xl text-on-surface-variant">The public site provides access to branch information, committees, events, gallery content, resources, and contact paths.</p><Link className="btn btn-primary" to="/join-us">Join the branch</Link></section>
      </div>
    </PageLayout>
  )
}
