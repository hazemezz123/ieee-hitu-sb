# Hero Section — Immersive Canvas Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace existing Hero background (DotField + decorative shapes + wedge overlays) with a single Canvas-based immersive engineering background.

**Architecture:** Single `HeroBackground.jsx` component renders everything on one `<canvas>` using `requestAnimationFrame`. Seven render layers (fill → grid → shapes → nodes → connections → particles → cursor glow) with parallax offset driven by mouse position. `Hero.jsx` updated to use it and add description text.

**Tech Stack:** React 19, Vite, Canvas 2D API, no additional dependencies.

---

### Task 1: Create HeroBackground.jsx

**Files:**
- Create: `src/components/HeroBackground.jsx`

This is the full canvas background component. It renders a dark (#05070B) engineering blueprint scene with grid lines, wireframe shapes, connected nodes, floating particles, and soft cursor glow. All layers shift with mouse parallax.

- [ ] **Step 1: Create the component with canvas setup, constants, and data structures**

```jsx
import { useRef, useEffect } from 'react'

const GRID_SPACING = 40
const NODE_COUNT = 30
const PARTICLE_COUNT = 100
const CONNECTION_DISTANCE = 180
const PARALLAX_STRENGTH = 12
const CURSOR_GLOW_RADIUS = 200
const BG_COLOR = '#05070B'
const GRID_COLOR = 'rgba(74, 139, 175, 0.04)'
const NODE_COLOR_BASE = 'rgba(74, 139, 175, 0.15)'
const LINE_COLOR_BASE = 'rgba(74, 139, 175, 0.06)'
const PARTICLE_COLOR_BASE = 'rgba(200, 220, 240, '
const SHAPE_COLOR = 'rgba(74, 139, 175, 0.08)'
const GLOW_COLOR = 'rgba(74, 139, 175, 0.06)'

const SHAPE_TYPES = ['hexagon', 'circle', 'triangle']

function createShape(w, h) {
  const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)]
  const size = 20 + Math.random() * 30
  return {
    type,
    x: Math.random() * w,
    y: Math.random() * h,
    size,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.005,
    driftX: (Math.random() - 0.5) * 0.2,
    driftY: (Math.random() - 0.5) * 0.2,
  }
}

function createNode(w, h, i) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    phase: i * 0.5 + Math.random(),
    pulseSpeed: 0.3 + Math.random() * 0.4,
    baseSize: 1.5 + Math.random() * 1.5,
  }
}

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 0.5 + Math.random() * 1,
    opacity: 0.2 + Math.random() * 0.4,
  }
}

function drawGrid(ctx, w, h, ox, oy) {
  ctx.strokeStyle = GRID_COLOR
  ctx.lineWidth = 0.5
  for (let x = ox % GRID_SPACING; x < w; x += GRID_SPACING) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = oy % GRID_SPACING; y < h; y += GRID_SPACING) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

function drawShape(ctx, s, ox, oy) {
  ctx.save()
  ctx.translate(s.x + ox, s.y + oy)
  ctx.rotate(s.rotation)
  ctx.strokeStyle = SHAPE_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  if (s.type === 'circle') {
    ctx.arc(0, 0, s.size, 0, Math.PI * 2)
  } else if (s.type === 'triangle') {
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 - Math.PI / 2
      i === 0 ? ctx.moveTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
              : ctx.lineTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
    }
    ctx.closePath()
  } else if (s.type === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6 - Math.PI / 2
      i === 0 ? ctx.moveTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
              : ctx.lineTo(Math.cos(a) * s.size, Math.sin(a) * s.size)
    }
    ctx.closePath()
  }
  ctx.stroke()
  ctx.restore()
}

function drawNodes(ctx, nodes, time, ox, oy, mx, my) {
  for (const n of nodes) {
    const pulse = 0.6 + 0.4 * Math.sin(time * n.pulseSpeed + n.phase)
    const size = n.baseSize * pulse
    const nx = n.x + ox
    const ny = n.y + oy
    let glow = 1
    if (mx > -10000) {
      const dx = nx - mx
      const dy = ny - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CURSOR_GLOW_RADIUS) {
        glow = 1 + (1 - dist / CURSOR_GLOW_RADIUS)
      }
    }
    ctx.fillStyle = `rgba(74, 139, 175, ${0.15 * glow})`
    ctx.beginPath()
    ctx.arc(nx, ny, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawConnections(ctx, nodes, time, ox, oy, mx, my) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const ax = nodes[i].x + ox
      const ay = nodes[i].y + oy
      const bx = nodes[j].x + ox
      const by = nodes[j].y + oy
      const dx = ax - bx
      const dy = ay - by
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.06
        const shimmer = 0.5 + 0.5 * Math.sin(time * 0.3 + i * 0.5 + j * 0.7)
        ctx.strokeStyle = `rgba(74, 139, 175, ${alpha * shimmer})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }
    }
  }
}

function drawParticles(ctx, particles, ox, oy, time) {
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    const w = ctx.canvas.width / (window.devicePixelRatio || 1)
    const h = ctx.canvas.height / (window.devicePixelRatio || 1)
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0
    ctx.fillStyle = PARTICLE_COLOR_BASE + p.opacity + ')'
    ctx.beginPath()
    ctx.arc(p.x + ox, p.y + oy, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCursorGlow(ctx, mx, my, w, h) {
  if (mx <= -10000) return
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_GLOW_RADIUS)
  g.addColorStop(0, GLOW_COLOR)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

export default function HeroBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId = null
    let shapes = []
    let nodes = []
    let particles = []
    let w = 0
    let h = 0
    let dpr = 1
    let mouseX = -10000
    let mouseY = -10000
    let targetOX = 0
    let targetOY = 0
    let currentOX = 0
    let currentOY = 0
    let isMobile = false
    let reducedMotion = false

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      const newW = rect.width
      const newH = rect.height
      if (newW === w && newH === h) return
      w = newW
      h = newH
      dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      isMobile = w < 768
      setupScene()
    }

    function setupScene() {
      shapes = []
      nodes = []
      particles = []
      const shapeCount = isMobile ? 2 : 5
      for (let i = 0; i < shapeCount; i++) shapes.push(createShape(w, h))
      for (let i = 0; i < NODE_COUNT; i++) nodes.push(createNode(w, h, i))
      const particleCount = isMobile ? 40 : PARTICLE_COUNT
      for (let i = 0; i < particleCount; i++) particles.push(createParticle(w, h))
    }

    function draw(time) {
      const ww = w
      const hh = h
      const t = time / 1000

      currentOX += (targetOX - currentOX) * 0.05
      currentOY += (targetOY - currentOY) * 0.05
      const ox = currentOX
      const oy = currentOY

      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, ww, hh)

      drawGrid(ctx, ww, hh, ox, oy)

      for (const s of shapes) {
        s.rotation += s.rotationSpeed
        s.x += s.driftX
        s.y += s.driftY
        if (s.x < -50) s.x = ww + 50
        if (s.x > ww + 50) s.x = -50
        if (s.y < -50) s.y = hh + 50
        if (s.y > hh + 50) s.y = -50
        drawShape(ctx, s, ox, oy)
      }

      if (!isMobile) {
        drawConnections(ctx, nodes, t, ox, oy, mouseX, mouseY)
      }
      drawNodes(ctx, nodes, t, ox, oy, mouseX, mouseY)
      drawParticles(ctx, particles, ox, oy, t)

      if (!isMobile) {
        drawCursorGlow(ctx, mouseX, mouseY, ww, hh)
      }
    }

    function loop(ts) {
      draw(ts)
      if (!reducedMotion) {
        animId = requestAnimationFrame(loop)
      }
    }

    function onMouseMove(e) {
      const rect = canvas.parentElement.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      const cx = w / 2
      const cy = h / 2
      targetOX = ((mouseX - cx) / cx) * PARALLAX_STRENGTH
      targetOY = ((mouseY - cy) / cy) * PARALLAX_STRENGTH
    }

    function onMouseLeave() {
      mouseX = -10000
      mouseY = -10000
      targetOX = 0
      targetOY = 0
    }

    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = rmq.matches
    rmq.addEventListener('change', (e) => {
      reducedMotion = e.matches
      if (reducedMotion && animId) {
        cancelAnimationFrame(animId)
        animId = null
      } else if (!reducedMotion && !animId) {
        animId = requestAnimationFrame(loop)
      }
    })

    resize()
    animId = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)
    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
      canvas.parentElement.addEventListener('mouseleave', onMouseLeave)
    }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.parentElement.removeEventListener('mouseleave', onMouseLeave)
      rmq.removeEventListener('change', () => {})
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd ieee-app && npx vite build 2>&1`

Expected: Build succeeds with no errors.

---

### Task 2: Update Hero.jsx

**Files:**
- Modify: `src/components/Hero.jsx`

Replace DotField + DecorativeShapes + wedge overlays with HeroBackground. Add description paragraph. Hardcode text colors for dark bg.

- [ ] **Step 1: Write the updated Hero.jsx**

```jsx
import logo from "../assets/logo.png";
import HeroBackground from "./HeroBackground";
import ScrollIndicator from "./ScrollIndicator";
import { motion, useScroll, useTransform } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export default function Hero() {
  const { scrollY } = useScroll()
  const Motion = motion

  const contentY = useTransform(scrollY, [0, 600], [0, 30])
  const fadeOut = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#05070B]">
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-16" style={{ y: contentY, opacity: fadeOut }}>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 max-w-4xl text-center">
          <Motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-8 lg:space-y-10"
          >
            <Motion.div variants={fadeUp} className="flex justify-center">
              <div className="px-4 py-3 md:px-6 md:py-4">
                <img
                  src={logo}
                  alt="IEEE HITU Student Branch logo"
                  className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto animate-[logo-float_8s_ease-in-out_infinite] brightness-0 invert"
                />
              </div>
            </Motion.div>

            <Motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#F0F4F8] leading-[1.05]"
            >
              Beyond Labels. <br />
              <span className="text-[#7BAED4]">Beyond Limits.</span>
            </Motion.h1>

            <Motion.p
              variants={fadeUp}
              className="text-sm sm:text-base md:text-lg text-[#9BA9B4] max-w-2xl mx-auto leading-relaxed"
            >
              The official student branch of IEEE at Heliopolis International Technological University — connecting students to a global community of engineers, innovators, and problem-solvers.
            </Motion.p>

            <Motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center"
            >
              <button className="inline-flex items-center justify-center h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[#7BAED4] text-[#05070B] transition-all duration-250 hover:bg-[#98CBFF] cursor-pointer select-none whitespace-nowrap border-none no-underline leading-none animate-[button-float_10s_ease-in-out_infinite]">
                Explore Standards
              </button>
              <button className="inline-flex items-center justify-center h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-transparent text-[#7BAED4] border border-[#7BAED4]/30 transition-all duration-250 hover:border-[#7BAED4] cursor-pointer select-none whitespace-nowrap no-underline leading-none animate-[button-float_12s_ease-in-out_infinite_1s]">
                Learn More
              </button>
            </Motion.div>

          </Motion.div>
        </div>
      </div>

      <Motion.div style={{ opacity: fadeOut }}>
        <ScrollIndicator />
      </Motion.div>

      <div data-next-section />
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd ieee-app && npx vite build 2>&1`

Expected: Build succeeds with no errors.

---

### Task 3: Visual Verification

- [ ] **Step 1: Start dev server and check**

Run: `cd ieee-app && npx vite --host`

Expected: Dev server starts. Open browser to see the Hero with:
- Dark background (#05070B)
- Subtle grid lines
- Drifting wireframe shapes
- Connected pulsing nodes
- Floating particles
- Cursor glow on mouse move
- Parallax shift on mouse move
- Description text visible below tagline
- Scroll down → content fades, parallax works
- Reduce motion preference → static scene

- [ ] **Step 2: Check mobile**

Open browser dev tools, toggle mobile viewport (375px width). Hero should:
- Render with reduced particles
- No cursor glow
- No connection lines
- No mouse tracking
- Full viewport height
- All text readable
- Description wraps properly
