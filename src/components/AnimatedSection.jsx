'use client'

import { useEffect, useRef, useState } from 'react'

function AnimatedSection({ children, trigger = 'inView', className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(trigger === 'load')

  useEffect(() => {
    if (trigger === 'load' || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { rootMargin: '-100px', threshold: 0.1 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [trigger])

  return (
    <div ref={ref} className={`animate-section ${visible ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  )
}

export default AnimatedSection
