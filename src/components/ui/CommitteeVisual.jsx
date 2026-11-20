'use client'

import { useState } from 'react'

const visuals = {
  automation: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="16" y="18" width="88" height="84" rx="10" className="fill-primary/8 stroke-primary/25" strokeWidth="1.5" />
      <path d="M26 78h22l12-18h34" className="stroke-primary/40" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
      <circle cx="48" cy="54" r="21" className="fill-primary/12 stroke-primary" strokeWidth="2.5" />
      <circle cx="48" cy="54" r="8" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <path d="M48 27v6M48 75v6M21 54h6M69 54h6M29 35l4 4M63 69l4 4M29 73l4-4M63 39l4-4" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="40" r="13" className="fill-secondary/15 stroke-secondary" strokeWidth="2.2" />
      <circle cx="80" cy="40" r="4.5" className="fill-secondary" />
      <rect x="64" y="68" width="30" height="20" rx="5" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <path d="m72 78 5 4 9-8" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  iot: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="58" r="38" className="stroke-primary/15" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M42 40a25 25 0 0 1 36 0" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M49 47a15 15 0 0 1 22 0" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="60" r="10" className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="4" className="fill-[#00b5e2]" />
      <path d="M51 66 32 82M69 66 88 82M60 70v18" className="stroke-primary/70" strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="78" width="22" height="18" rx="4" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <rect x="78" y="78" width="22" height="18" rx="4" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <rect x="49" y="86" width="22" height="16" rx="4" className="fill-primary/15 stroke-[#00b5e2]" strokeWidth="2" />
      <circle cx="31" cy="87" r="2.5" className="fill-[#00b5e2]" />
      <circle cx="89" cy="87" r="2.5" className="fill-[#00b5e2]" />
    </svg>
  ),

  'cyber-security-defensive': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="60" r="42" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
      <path d="M60 18 26 32v26c0 22 14.5 39 34 45 19.5-6 34-23 34-45V32L60 18Z" className="fill-primary/15 stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M60 27 34 38v20c0 17 11 30.5 26 35.5 15-5 26-18.5 26-35.5V38L60 27Z" className="fill-surface-container-lowest stroke-[#00b5e2]/60" strokeWidth="1.5" />
      <rect x="46" y="55" width="28" height="22" rx="4" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
      <path d="M51 55v-7a9 9 0 0 1 18 0v7" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="65" r="3" className="fill-[#00b5e2]" />
      <path d="M60 68v4" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),

  embedded: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <path d="M44 18v14M60 18v14M76 18v14M44 88v14M60 88v14M76 88v14M18 44h14M18 60h14M18 76h14M88 44h14M88 60h14M88 76h14" className="stroke-[#00b5e2]" strokeWidth="3" strokeLinecap="round" />
      <rect x="32" y="32" width="56" height="56" rx="8" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
      <rect x="44" y="44" width="32" height="32" rx="4" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <rect x="52" y="52" width="16" height="16" rx="2" className="fill-[#00b5e2]/25 stroke-[#00b5e2]" strokeWidth="2" />
      <circle cx="39" cy="39" r="2" className="fill-primary" />
    </svg>
  ),

  'pcb-design': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="18" y="24" width="84" height="72" rx="8" className="fill-primary/12 stroke-primary" strokeWidth="2.5" />
      <path d="M32 42h18l10 14h28M32 78h24l8-12h24M32 58h14" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="50" y="48" width="20" height="24" rx="3" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <circle cx="30" cy="42" r="4.5" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <circle cx="30" cy="58" r="4.5" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2.5" />
      <circle cx="30" cy="78" r="4.5" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <circle cx="90" cy="56" r="4.5" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2.5" />
      <circle cx="90" cy="66" r="4.5" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <circle cx="88" cy="36" r="3" className="fill-primary/40" />
      <circle cx="88" cy="84" r="3" className="fill-primary/40" />
    </svg>
  ),

  solidworks: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <path d="M60 18 96 38v44L60 102 24 82V38l36-20Z" className="fill-primary/12 stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 38 60 58 96 38M60 58v44" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M60 30 78 40v20L60 70 42 60V40l18-10Z" className="fill-[#00b5e2]/20 stroke-[#00b5e2]" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 90h18M16 90V72" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="18" r="3" className="fill-[#00b5e2]" />
      <circle cx="96" cy="38" r="3" className="fill-primary" />
      <circle cx="24" cy="38" r="3" className="fill-primary" />
    </svg>
  ),

  'web-development': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="16" y="24" width="88" height="72" rx="8" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <path d="M16 40h88" className="stroke-primary/40" strokeWidth="2" />
      <circle cx="27" cy="32" r="2.5" className="fill-primary/50" />
      <circle cx="35" cy="32" r="2.5" className="fill-[#00b5e2]" />
      <circle cx="43" cy="32" r="2.5" className="fill-secondary/60" />
      <rect x="26" y="49" width="26" height="36" rx="4" className="fill-primary/12 stroke-primary/40" strokeWidth="1.5" />
      <rect x="58" y="49" width="36" height="14" rx="3" className="fill-[#00b5e2]/18 stroke-[#00b5e2]" strokeWidth="1.5" />
      <path d="m66 72-6 5 6 5M86 72l6 5-6 5M78 70l-4 14" className="stroke-primary" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'mobile-application': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="34" y="16" width="52" height="88" rx="10" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <path d="M52 24h16" className="stroke-primary/50" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="42" y="34" width="36" height="22" rx="4" className="fill-primary/15 stroke-[#00b5e2]" strokeWidth="2" />
      <rect x="42" y="62" width="16" height="16" rx="3" className="fill-primary/20 stroke-primary/60" strokeWidth="1.5" />
      <rect x="62" y="62" width="16" height="16" rx="3" className="fill-secondary/20 stroke-secondary/60" strokeWidth="1.5" />
      <path d="M44 88h32" className="stroke-primary/40" strokeWidth="3" strokeLinecap="round" />
      <circle cx="88" cy="40" r="10" className="fill-[#00b5e2]/20 stroke-[#00b5e2]" strokeWidth="2" />
      <path d="m84 40 3 3 5-5" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  flutter: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="18" y="20" width="84" height="80" rx="12" className="fill-primary/6 stroke-primary/20" strokeWidth="1.5" />
      <path d="M66 24 30 60l11 11L88 24H66Z" className="fill-[#00b5e2]/25 stroke-[#00b5e2]" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 56 47 75l19 21h22L69 75l19-19H66Z" className="fill-primary/20 stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M47 75 58 64l11 11-11 11-11-11Z" className="fill-[#00b5e2]/45" />
    </svg>
  ),

  'artificial-intelligence': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="60" r="40" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d="M52 28a14 14 0 0 0-22 10 14 14 0 0 0-6 13 13 13 0 0 0 5 11 14 14 0 0 0 7 25 13 13 0 0 0 16 5V28Z" className="fill-primary/15 stroke-primary" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M68 28a14 14 0 0 1 22 10 14 14 0 0 1 6 13 13 13 0 0 1-5 11 14 14 0 0 1-7 25 13 13 0 0 1-16 5V28Z" className="fill-[#00b5e2]/15 stroke-[#00b5e2]" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="40" cy="48" r="3.5" className="fill-primary" />
      <circle cx="40" cy="70" r="3.5" className="fill-[#00b5e2]" />
      <circle cx="80" cy="48" r="3.5" className="fill-[#00b5e2]" />
      <circle cx="80" cy="70" r="3.5" className="fill-primary" />
      <path d="M43.5 48h33M43.5 70h33M52 59h16" className="stroke-primary/70" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  'cyber-security-offensive': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="60" r="34" className="fill-primary/10 stroke-primary" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="19" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2.2" />
      <path d="M60 16v18M60 86v18M16 60h18M86 60h18" className="stroke-primary" strokeWidth="2.8" strokeLinecap="round" />
      <path d="m52 55 6 5-6 5M61 65h8" className="stroke-primary" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="34" r="5" className="fill-[#00b5e2]/30 stroke-[#00b5e2]" strokeWidth="2" />
    </svg>
  ),

  'problem-solving': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <path d="M60 30 34 56M60 30l26 26M34 56l-10 26M34 56l14 26M86 56 72 82M86 56l10 26" className="stroke-primary/55" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="30" r="10" className="fill-[#00b5e2]/25 stroke-[#00b5e2]" strokeWidth="2.5" />
      <circle cx="34" cy="56" r="9" className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
      <circle cx="86" cy="56" r="9" className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
      <rect x="17" y="76" width="14" height="14" rx="3" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
      <rect x="41" y="76" width="14" height="14" rx="3" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2" />
      <rect x="65" y="76" width="14" height="14" rx="3" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2" />
      <rect x="89" y="76" width="14" height="14" rx="3" className="fill-surface-container-lowest stroke-primary" strokeWidth="2" />
    </svg>
  ),

  hr: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="20" y="24" width="54" height="72" rx="8" className="fill-surface-container-lowest stroke-secondary" strokeWidth="2.5" />
      <circle cx="47" cy="46" r="10" className="fill-secondary/20 stroke-secondary" strokeWidth="2.5" />
      <path d="M32 72c0-7 6.5-12 15-12s15 5 15 12" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 84h30" className="stroke-secondary/40" strokeWidth="3" strokeLinecap="round" />
      <rect x="64" y="42" width="38" height="44" rx="7" className="fill-secondary/15 stroke-primary" strokeWidth="2" />
      <path d="m74 58 4 4 9-9M74 72h18" className="stroke-primary" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  marketing: () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="18" y="24" width="84" height="72" rx="10" className="fill-secondary/10 stroke-secondary/30" strokeWidth="2" />
      <rect x="30" y="64" width="12" height="22" rx="2" className="fill-secondary/35 stroke-secondary" strokeWidth="2" />
      <rect x="50" y="52" width="12" height="34" rx="2" className="fill-primary/30 stroke-primary" strokeWidth="2" />
      <rect x="70" y="38" width="12" height="48" rx="2" className="fill-[#00b5e2]/30 stroke-[#00b5e2]" strokeWidth="2" />
      <path d="m28 54 22-16 14 8 24-20" className="stroke-primary" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M77 26h11v11" className="stroke-primary" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'people-culture': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="60" r="38" className="fill-secondary/10 stroke-secondary/30" strokeWidth="2" />
      <path d="M60 72s-20-12.5-20-25a11 11 0 0 1 20-6.5A11 11 0 0 1 80 47c0 12.5-20 25-20 25Z" className="fill-secondary/25 stroke-secondary" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="34" cy="84" r="6" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.2" />
      <circle cx="60" cy="88" r="7" className="fill-surface-container-lowest stroke-[#00b5e2]" strokeWidth="2.2" />
      <circle cx="86" cy="84" r="6" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.2" />
    </svg>
  ),

  'logistics-events': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="20" y="28" width="66" height="66" rx="8" className="fill-surface-container-lowest stroke-secondary" strokeWidth="2.5" />
      <path d="M38 20v14M68 20v14M20 46h66" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m36 66 8 8 16-16" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="86" cy="76" r="18" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
      <path d="M86 67v9l6 4" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'public-relations-fundraising': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <circle cx="60" cy="60" r="38" className="fill-secondary/8 stroke-secondary/25" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M22 52v14a6 6 0 0 0 6 6h10l30 14V32L38 46H28a6 6 0 0 0-6 6Z" className="fill-secondary/20 stroke-secondary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M38 72v18" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 46a14 14 0 0 1 0 26M88 38a24 24 0 0 1 0 42" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="88" cy="28" r="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <path d="M88 24v8M85 27h6" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  'graphic-design': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="20" y="22" width="80" height="76" rx="8" className="fill-surface-container-lowest stroke-secondary/50" strokeWidth="2" />
      <path d="M60 28 84 62 72 84H48L36 62 60 28Z" className="fill-secondary/20 stroke-secondary" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M60 28v32" className="stroke-secondary" strokeWidth="2" />
      <circle cx="60" cy="63" r="5" className="fill-surface-container-lowest stroke-primary" strokeWidth="2.5" />
      <path d="M32 36h10M78 36h10" className="stroke-[#00b5e2]" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="36" r="3" className="fill-[#00b5e2]" />
      <circle cx="90" cy="36" r="3" className="fill-[#00b5e2]" />
    </svg>
  ),

  'content-creation': () => (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="18" y="28" width="84" height="64" rx="9" className="fill-surface-container-lowest stroke-secondary" strokeWidth="2.5" />
      <path d="M18 44h84M36 28l8 16M56 28l8 16M76 28l8 16" className="stroke-secondary" strokeWidth="2.2" />
      <circle cx="60" cy="67" r="14" className="fill-secondary/20 stroke-primary" strokeWidth="2.2" />
      <path d="m56 61 11 6-11 6V61Z" className="fill-primary stroke-primary" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 60v14M34 55v24M86 55v24M92 60v14" className="stroke-[#00b5e2]" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
}

function DefaultVisual() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="h-full w-full">
      <rect x="24" y="24" width="32" height="32" rx="6" className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
      <rect x="64" y="24" width="32" height="32" rx="6" className="fill-[#00b5e2]/20 stroke-[#00b5e2]" strokeWidth="2.5" />
      <rect x="24" y="64" width="32" height="32" rx="6" className="fill-secondary/20 stroke-secondary" strokeWidth="2.5" />
      <rect x="64" y="64" width="32" height="32" rx="6" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
    </svg>
  )
}

export default function CommitteeVisual({ slug, icon, className = '' }) {
  const [failedIcon, setFailedIcon] = useState(null)
  const trimmedIcon = typeof icon === 'string' ? icon.trim() : ''

  if (trimmedIcon && failedIcon !== trimmedIcon) {
    return (
      <img
        src={trimmedIcon}
        alt=""
        aria-hidden="true"
        onError={() => setFailedIcon(trimmedIcon)}
        className={`${className} object-contain`.trim()}
      />
    )
  }

  const RenderVisual = visuals[slug] || DefaultVisual
  return (
    <div className={className}>
      <RenderVisual />
    </div>
  )
}
