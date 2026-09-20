'use client'

import Reveal from './Reveal'

const resources = [
  ['IEEE.org', "Explore IEEE's global initiatives and impact.", 'https://www.ieee.org/', 'Global network'],
  ['Membership & Benefits', 'Find the communities, programs, and benefits that fit your path.', 'https://www.ieee.org/membership.html', 'Join the network'],
  ['IEEE Xplore', 'Search technical papers, journals, and conference publications.', 'https://ieeexplore.ieee.org/', 'Research library'],
  ['IEEE Standards', 'See the standards shaping the technologies we use every day.', 'https://standards.ieee.org/', 'Technical foundations'],
  ['IEEE Spectrum', 'Follow the people and ideas moving technology forward.', 'https://spectrum.ieee.org/', 'Ideas in motion'],
]

export default function TechnicalResources() {
  return (
    <section className="relative overflow-hidden bg-inverse-surface py-16 sm:py-20 md:py-24" aria-labelledby="technical-resources-title">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full border border-primary/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-12 h-56 w-56 rounded-full border border-primary/15" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 md:px-12">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Global network / local action</p>
              <h2 id="technical-resources-title" className="mt-4 max-w-md text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Take the next idea beyond campus.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              IEEE HITU connects students to a wider technical community. Explore the platforms, standards, and conversations that turn curiosity into useful work.
            </p>
          </div>
        </Reveal>

        <Reveal staggerChildren="[data-reveal='card']">
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {resources.map(([name, description, href, eyebrow], index) => (
              <li data-reveal="card" className={index === 0 ? 'lg:col-span-2' : 'lg:col-span-2'} key={name}>
                <a
                  className="group flex h-full min-h-44 flex-col justify-between border border-white/15 bg-white/[0.04] p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/70 hover:bg-primary/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/45">{eyebrow}</p>
                    <h3 className="mt-6 text-xl font-bold text-white">{name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">{description}</p>
                  </div>
                  <span className="mt-8 flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold text-primary">
                    Explore resource <span aria-hidden="true" className="text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
