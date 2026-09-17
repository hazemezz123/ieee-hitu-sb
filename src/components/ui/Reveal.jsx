'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  y = 24,
  staggerChildren = null,
  triggerStart = 'top 80%',
  className = '',
  children,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const scope = ref.current
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = staggerChildren ? scope.querySelectorAll(staggerChildren) : [scope]
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.6,
          ease: 'power2.out',
          delay,
          stagger: staggerChildren ? 0.08 : 0,
          scrollTrigger: { trigger: scope, start: triggerStart, once: true },
        })
      })
    }, scope)
    return () => { ctx.revert() }
  }, [delay, y, staggerChildren, triggerStart])

  return <Tag ref={ref} className={className}>{children}</Tag>
}
