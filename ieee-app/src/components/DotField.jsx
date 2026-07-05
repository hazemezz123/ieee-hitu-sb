import { useRef, useEffect } from 'react'
import { useTheme } from '../theme/useTheme'

export default function DotField({
  dotRadius = 1.3,
  dotSpacing = 18,
  cursorRadius = 320,
  bulgeStrength = 45,
  glowRadius = 120,
  waveAmplitude = 0.3,
  gradientFrom = 'rgba(0,98,155,.22)',
  gradientTo = 'rgba(0,98,155,.10)',
  glowColor = 'rgba(0,98,155,.18)',
}) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -10000, y: -10000 })
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let dots = []
    let animationId = null

    const isMobile = window.innerWidth < 768
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      generateDots(w, h)
    }

    function generateDots(w, h) {
      dots = []
      const spacing = isMobile ? dotSpacing * 1.5 : dotSpacing
      const cols = Math.ceil(w / spacing) + 1
      const rows = Math.ceil(h / spacing) + 1
      const offset = spacing / 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            baseX: c * spacing + (r % 2) * offset,
            baseY: r * spacing,
            phase1: Math.sin(r * 0.5 + c * 0.3) * 4,
            phase2: Math.cos(r * 0.2 - c * 0.4) * 3,
            phase3: Math.sin(r * 0.7 + c * 0.1) * 2,
            driftX: (Math.random() - 0.5) * 2,
            driftY: (Math.random() - 0.5) * 2,
          })
        }
      }
    }

    function draw() {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const time = Date.now() / 1000
      const isDark = theme === 'dark'

      ctx.clearRect(0, 0, w, h)

      const pulse = Math.sin(time * 0.15) * 0.15 + 0.85

      const bgGrad = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, Math.max(w, h) * 0.7
      )
      bgGrad.addColorStop(0, isDark
        ? `rgba(123,174,212,${(0.14 * pulse).toFixed(3)})`
        : gradientFrom.replace(/[\d.]+\)$/, (m) => `${(parseFloat(m) * pulse).toFixed(2)})`)
      )
      bgGrad.addColorStop(1, isDark ? 'rgba(123,174,212,0.04)' : gradientTo)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      if (!isMobile && mx >= -glowRadius && mx <= w + glowRadius && my >= -glowRadius && my <= h + glowRadius) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, glowRadius)
        g.addColorStop(0, isDark ? 'rgba(123,174,212,0.10)' : glowColor)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      const dotColor = isDark
        ? 'rgba(123,174,212,0.35)'
        : 'rgba(0,73,118,0.22)'
      ctx.fillStyle = dotColor

      const spacing = isMobile ? dotSpacing * 1.5 : dotSpacing

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        let dx = 0
        let dy = 0

        if (!isMobile) {
          const dxRaw = dot.baseX - mx
          const dyRaw = dot.baseY - my
          const dist = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw)

          if (dist < cursorRadius && dist > 0) {
            const t = 1 - dist / cursorRadius
            const s = t * t * (bulgeStrength / 100) * spacing * 0.4
            dx = (dxRaw / dist) * s
            dy = (dyRaw / dist) * s
          }
        }

        const autonomousX =
          Math.sin(time * 0.12 + dot.phase1) * waveAmplitude * 0.8 +
          Math.cos(time * 0.08 + dot.phase2) * waveAmplitude * 0.5 +
          Math.sin(time * 0.18 + dot.phase3) * waveAmplitude * 0.3 +
          Math.sin(time * 0.04 + dot.driftX) * waveAmplitude * 0.6

        const autonomousY =
          Math.cos(time * 0.10 + dot.phase1 * 0.7) * waveAmplitude * 0.8 +
          Math.sin(time * 0.06 + dot.phase2 * 0.8) * waveAmplitude * 0.5 +
          Math.cos(time * 0.15 + dot.phase3 * 1.2) * waveAmplitude * 0.3 +
          Math.cos(time * 0.035 + dot.driftY) * waveAmplitude * 0.6

        ctx.beginPath()
        ctx.arc(dot.baseX + dx + autonomousX, dot.baseY + dy + autonomousY, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    function onMouseMove(e) {
      const rect = canvas.parentElement.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    function onMouseLeave() {
      mouseRef.current = { x: -10000, y: -10000 }
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      canvas.parentElement.addEventListener('mouseleave', onMouseLeave)
    }

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      if (!isMobile) {
        window.removeEventListener('mousemove', onMouseMove)
        canvas.parentElement.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, glowRadius, waveAmplitude, gradientFrom, gradientTo, glowColor, theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  )
}
