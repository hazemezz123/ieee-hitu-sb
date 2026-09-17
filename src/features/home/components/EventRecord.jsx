import Link from 'next/link'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

export default function EventRecord({ event, tone = 'light' }) {
  const inverse = tone === 'inverse'
  return (
    <article data-reveal="record" className={`border-t py-5 ${inverse ? 'border-white/20' : 'border-outline-variant/40'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`text-lg font-bold ${inverse ? 'text-[#F0F4F8]' : 'text-on-surface'}`}>{event.title}</h3>
        <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
      </div>
      <p className={`mt-2 text-sm ${inverse ? 'text-[#C7D0D8]' : 'text-on-surface-variant'}`}>{event.excerpt || event.location}</p>
      {event.slug && <Link aria-label={`Read ${event.title} event record`} className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href={`/events/${event.slug}`}>Read event record</Link>}
    </article>
  )
}
