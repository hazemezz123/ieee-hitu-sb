'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import LogoMark from './LogoMark'

const LOADER_SEEN_KEY = 'ieee-hitu-loader-seen'
const DRAW_SECONDS = 1.2
const FILL_SECONDS = 0.6
const HOLD_SECONDS = 0.3
const EXIT_SECONDS = 0.5
const FAILSAFE_MS = 5000
const STROKES = ['#0e487f', '#dcb656']

function measure(path) {
  try {
    if (path && typeof path.getTotalLength === 'function') {
      const len = path.getTotalLength()
      if (Number.isFinite(len) && len > 0) return len
    }
  } catch { /* non-rendering environments have no measurable geometry */ }
  return 0
}

function shouldSkip() {
  try {
    if (window.sessionStorage.getItem(LOADER_SEEN_KEY)) return true
  } catch { /* private mode: play the loader every visit */ }
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function LogoLoader({ durationScale = 1 }) {
  const [done, setDone] = useState(() => shouldSkip())
  const rootRef = useRef(null)
  const diamondRef = useRef(null)
  const archRef = useRef(null)

  useLayoutEffect(() => {
    if (done) return
    const root = rootRef.current
    const paths = [diamondRef.current, archRef.current].filter(Boolean)
    const lengths = paths.map(measure)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- unmeasurable geometry means nothing to animate; dismiss once
    if (lengths.some(len => len === 0)) { setDone(true); return }
    const ctx = gsap.context(() => {
      paths.forEach((path, i) => {
        gsap.set(path, {
          stroke: STROKES[i],
          strokeWidth: 6,
          strokeDasharray: lengths[i],
          strokeDashoffset: lengths[i],
          fillOpacity: 0,
        })
      })
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => setDone(true) })
      tl.to(paths[0], { strokeDashoffset: 0, duration: DRAW_SECONDS * durationScale })
        .to(paths[1], { strokeDashoffset: 0, duration: DRAW_SECONDS * durationScale }, '-=0.3')
        .to(paths, { fillOpacity: 1, duration: FILL_SECONDS * durationScale })
        .to(root, { duration: HOLD_SECONDS * durationScale })
        .to(root, { autoAlpha: 0, duration: EXIT_SECONDS * durationScale })
    }, root)
    const failsafe = setTimeout(() => setDone(true), Math.max(FAILSAFE_MS * durationScale, 100))
    try { window.sessionStorage.setItem(LOADER_SEEN_KEY, '1') } catch { /* private mode: replay next visit */ }
    return () => { clearTimeout(failsafe); ctx.revert() }
  }, [done, durationScale])

  if (done) return null
  return (
    <div ref={rootRef} role="img" aria-label="IEEE HITU Student Branch logo animation" className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface">
      <LogoMark className="h-auto w-[min(70vw,320px)]" diamondRef={diamondRef} archRef={archRef} />
    </div>
  )
}
