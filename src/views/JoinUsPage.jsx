import AnimatedSection from '@/components/ui/AnimatedSection'
import InterestForm from '@/components/ui/InterestForm'
import { committees } from '../data/committees'

export default function JoinUsPage() {
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection><header className="container mx-auto max-w-4xl px-6 py-16 sm:px-8 md:px-12 md:py-24"><h1 className="text-4xl font-black text-on-surface md:text-6xl">Join IEEE HITU Student Branch</h1><p className="mt-6 max-w-2xl text-lg text-on-surface-variant">Express your interest in a committee and record the details needed for a later conversation with the branch.</p><p className="mt-8" aria-label={`${committees.length} committees`}><strong className="text-3xl text-primary">{committees.length}</strong> <span className="text-on-surface-variant">committees</span></p></header></AnimatedSection>
      <AnimatedSection delay={1}>
        <section className="border-t border-outline-variant/30 py-16"><div className="container mx-auto max-w-3xl px-6 sm:px-8 md:px-12"><h2 className="text-3xl font-bold">Participation interest</h2>
          <InterestForm idPrefix="join" note="This form is a local demonstration and does not send an application." submitLabel="Submit interest" successMessage="Your interest was recorded locally in this page only. No application was transmitted." />
        </div></section>
      </AnimatedSection>
    </div>
  )
}
