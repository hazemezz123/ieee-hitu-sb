import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Hero() {
  return (
    <section aria-labelledby="home-title" className="min-h-[calc(100svh-var(--navbar-height))] grid items-end bg-inverse-surface pt-[var(--navbar-height)] md:min-h-[100svh] md:pb-16 md:pt-0">
      <div className="container mx-auto grid max-w-6xl gap-10 px-6 py-12 md:px-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end lg:py-20">
        <div>
          <p className="section-label mb-4">Helwan International Technological University</p>
          <h1 id="home-title" className="max-w-4xl text-4xl font-black leading-none tracking-tight text-[#F0F4F8] sm:text-6xl lg:text-8xl">
            IEEE HITU Student Branch
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#9BA9B4] md:text-xl">
            Technical learning, student-led committees, and IEEE opportunities rooted at HITU.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-primary" to="/events">View events</Link>
            <Link className="btn btn-secondary" to="/join-us">Join the branch</Link>
          </div>
        </div>
        <img src={logo} alt="" className="w-full max-w-xs justify-self-start object-contain brightness-0 invert lg:justify-self-end" />
      </div>
    </section>
  )
}
