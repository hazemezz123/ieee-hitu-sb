import Link from 'next/link'
import MemberCard from '@/features/about/components/MemberCard'
import { founders } from '@/features/about/data/founders'

export default function FoundersView() {
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
        <header className="max-w-4xl border-b border-outline-variant/40 pb-12">
          <p className="section-label">Origins</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-on-surface md:text-6xl">Meet Our Founders</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">The students who started the IEEE HITU Student Branch at Helwan International Technological University.</p>
        </header>

        {founders.length > 0 ? (
          <section className="py-12">
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {founders.map(founder => <MemberCard key={`${founder.name}-${founder.committee}-${founder.role}`} member={{ ...founder, position: founder.role }} />)}
            </ul>
          </section>
        ) : (
          <section className="py-12">
            <p className="max-w-xl text-on-surface-variant">Founder records are being compiled. For founding-team inquiries, contact the branch at <a className="font-semibold text-primary underline underline-offset-4" href="mailto:ieee.hitu.sb@gmail.com">ieee.hitu.sb@gmail.com</a>.</p>
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-6 py-12">
          <Link className="btn btn-ghost" href="/about">Back to About</Link>
          <Link className="btn btn-primary" href="/join-us">Join the branch</Link>
        </section>
      </div>
    </div>
  )
}
