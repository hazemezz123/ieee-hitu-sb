export default function RecruitmentClosed({ form }) {
  return (
    <section className="card p-8 md:p-12" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Heads Recruitment — Closed</p>
      <h2 className="mt-3 text-3xl font-black">{form?.closedTitle || 'Recruitment is Closed'}</h2>
      <p className="mt-4 text-on-surface-variant">{form?.closedMessage || 'Heads recruitment is closed right now. Check back for the next wave.'}</p>
      <div className="mt-6 flex gap-3">
        <a className="btn btn-secondary" href="/events">View events</a>
        <a className="btn btn-ghost" href="/committees">Explore committees</a>
      </div>
    </section>
  )
}
