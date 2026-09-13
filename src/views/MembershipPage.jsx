import Link from 'next/link'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'

export default function MembershipPage() {
  return (
    <PageLayout>
      <AnimatedSection>
        <header className="container mx-auto max-w-5xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <h1 className="max-w-3xl text-4xl font-black text-on-surface md:text-6xl">Membership and participation</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">This site serves HITU students exploring participation in IEEE HITU Student Branch.</p>
          <Link className="btn btn-primary mt-8" href="/join-us">Start with IEEE HITU</Link>
        </header>
      </AnimatedSection>

      <AnimatedSection delay={1}>
        <section className="border-y border-outline-variant/30 py-16">
          <div className="container mx-auto max-w-5xl px-6 sm:px-8 md:px-12">
            <h2 className="text-3xl font-bold text-on-surface">Branch opportunities</h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">The branch connects HITU students with technical learning, committees, events, and the wider IEEE network.</p>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={2}>
        <section className="container mx-auto max-w-5xl px-6 py-16 sm:px-8 md:px-12"><h2 className="text-2xl font-bold text-on-surface">Current process</h2><p className="mt-4 leading-relaxed text-on-surface-variant">Current participation process details are not published on this site.</p></section>
      </AnimatedSection>
    </PageLayout>
  )
}
