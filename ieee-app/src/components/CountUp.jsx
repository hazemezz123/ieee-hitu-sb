import { useState, useEffect, useRef } from 'react'

export default function CountUp({ end, suffix = '', label, duration = 2000, delay = 0 }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const timeout = setTimeout(() => {
      let startTime = null
      let rafId

      function animate(timestamp) {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))
        if (progress < 1) rafId = requestAnimationFrame(animate)
      }

      rafId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(rafId)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [hasAnimated, end, duration, delay])

  return (
    <div ref={ref} className="text-center">
      <span className="block text-3xl md:text-4xl font-black text-primary tabular-nums">
        {count}{suffix}
      </span>
      {label && (
        <span className="block text-xs md:text-sm text-on-surface-variant font-medium mt-1">
          {label}
        </span>
      )}
    </div>
  )
}
