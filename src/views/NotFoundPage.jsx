import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <div className="container mx-auto max-w-5xl px-6 py-24 text-center md:px-12 md:py-32">
        <p className="section-label">404</p>
        <h1 className="mt-4 text-4xl font-black text-on-surface md:text-6xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-on-surface-variant">The page you are looking for does not exist or has been moved.</p>
        <Link className="btn btn-primary mt-8" href="/">Back to home</Link>
      </div>
    </div>
  )
}
