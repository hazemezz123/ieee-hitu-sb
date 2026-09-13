const resources = [
  ['IEEE Xplore', 'IEEE terminology for its digital library of technical literature.'],
  ['IEEE Standards', 'IEEE terminology for standards and standards development.'],
  ['IEEE conferences', 'IEEE terminology for conferences and technical events.'],
]

export default function TechnicalResources() {
  return (
    <section className="border-y border-outline-variant/30 py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-6 sm:px-8 md:px-12">
        <h2 className="text-3xl font-bold text-on-surface md:text-4xl">Technical resources</h2>
        <ul className="mt-8 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
          {resources.map(([name, description]) => <li className="grid gap-3 py-6 md:grid-cols-[14rem_1fr] md:items-center" key={name}><h3 className="font-bold text-on-surface">{name}</h3><p className="text-sm leading-relaxed text-on-surface-variant">{description}</p></li>)}
        </ul>
      </div>
    </section>
  )
}
