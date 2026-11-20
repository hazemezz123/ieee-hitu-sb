'use client'

import { useState } from 'react'

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const icons = {
  // Automation: precision gear + automated loop arrow
  automation: (props) => (
    <svg {...svgProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
      <circle cx="12" cy="12" r="6.75" strokeDasharray="16 6" />
    </svg>
  ),

  // IoT: connected central hub radiating wireless arcs to edge nodes
  iot: (props) => (
    <svg {...svgProps} {...props}>
      <circle cx="12" cy="14" r="2" />
      <path d="M8.5 10.5a5 5 0 0 1 7 0" />
      <path d="M5.7 7.7a9 9 0 0 1 12.6 0" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
      <path d="M10.4 15.2 6.3 18M13.6 15.2 17.7 18" />
    </svg>
  ),

  // Cyber Security (Defensive): armored shield with integrated lock
  'cyber-security-defensive': (props) => (
    <svg {...svgProps} {...props}>
      <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.7 7.5 10 4.3-1.3 7.5-5 7.5-10v-6L12 2.5Z" />
      <rect x="9.25" y="10.75" width="5.5" height="4.5" rx="1" />
      <path d="M10.25 10.75V9.25a1.75 1.75 0 0 1 3.5 0v1.5" />
    </svg>
  ),

  // Embedded: microcontroller IC with pins on all sides and silicon die
  embedded: (props) => (
    <svg {...svgProps} {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.75" />
      <path d="M9 2.5V6M12 2.5V6M15 2.5V6M9 18v3.5M12 18v3.5M15 18v3.5M2.5 9H6M2.5 12H6M2.5 15H6M18 9h3.5M18 12h3.5M18 15h3.5" />
    </svg>
  ),

  // PCB Design: board frame with routed copper traces & plated vias
  'pcb-design': (props) => (
    <svg {...svgProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="7.5" cy="8.5" r="1.5" />
      <circle cx="16.5" cy="8.5" r="1.5" />
      <circle cx="16.5" cy="15.5" r="1.5" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <path d="M9 8.5h2.5l2 3.5H16.5" />
      <path d="M9 15.5h3l1.5-2" />
      <path d="M7.5 10v4" />
    </svg>
  ),

  // SolidWorks: 3D isometric CAD cube with dimension axes
  solidworks: (props) => (
    <svg {...svgProps} {...props}>
      <path d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z" />
      <path d="M4 7l8 4.5L20 7" />
      <path d="M12 11.5v10" />
      <path d="M8 9.25v5.5L12 17" strokeDasharray="2 2" />
    </svg>
  ),

  // Web Development: browser window with angle-bracket code mark
  'web-development': (props) => (
    <svg {...svgProps} {...props}>
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <path d="M2.5 8.5h19" />
      <path d="m9 12.25-2.25 2 2.25 2M15 12.25l2.25 2-2.25 2M12.75 11.5l-1.5 5.5" />
    </svg>
  ),

  // Mobile Application: smartphone frame with app layout tiles
  'mobile-application': (props) => (
    <svg {...svgProps} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 5.25h3" />
      <rect x="8.5" y="8" width="7" height="4.5" rx="1" />
      <path d="M8.5 15.25h3M13.5 15.25h2M11 18.25h2" />
    </svg>
  ),

  // Flutter: layered geometric diagonal wings
  flutter: (props) => (
    <svg {...svgProps} {...props}>
      <path d="M13.5 3 4.5 12l3 3L19.5 3h-6Z" />
      <path d="M13.5 11.5 9 16l4.5 5h6l-4.5-4.5 4.5-5h-6Z" />
    </svg>
  ),

  // Artificial Intelligence: neural network brain circuits
  'artificial-intelligence': (props) => (
    <svg {...svgProps} {...props}>
      <path d="M9.5 4.5a3 3 0 0 0-5 2.2A3.2 3.2 0 0 0 3 9.5a3 3 0 0 0 1.2 2.4A3.2 3.2 0 0 0 5.5 18a3 3 0 0 0 4 1.5V4.5Z" />
      <path d="M14.5 4.5a3 3 0 0 1 5 2.2A3.2 3.2 0 0 1 21 9.5a3 3 0 0 1-1.2 2.4A3.2 3.2 0 0 1 18.5 18a3 3 0 0 1-4 1.5V4.5Z" />
      <circle cx="7" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="7" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="17" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M9.5 10h5M9.5 14h5" />
    </svg>
  ),

  // Cyber Security (Offensive): precision target reticle with breach core
  'cyber-security-offensive': (props) => (
    <svg {...svgProps} {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),

  // Problem Solving: algorithmic puzzle & logic node
  'problem-solving': (props) => (
    <svg {...svgProps} {...props}>
      <path d="M14.5 4.5a2 2 0 1 0-4 0H6a1.5 1.5 0 0 0-1.5 1.5v4.5a2 2 0 1 1 0 4V19A1.5 1.5 0 0 0 6 20.5h4.5a2 2 0 1 1 4 0H18a1.5 1.5 0 0 0 1.5-1.5v-4.5a2 2 0 1 0 0-4V6A1.5 1.5 0 0 0 18 4.5h-3.5Z" />
    </svg>
  ),

  // HR: leadership & member roster profiles
  hr: (props) => (
    <svg {...svgProps} {...props}>
      <circle cx="9.5" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="16.5" cy="9" r="2.25" />
      <path d="M16.5 14.5c2.4 0 4.25 1.4 4.25 4" />
    </svg>
  ),

  // Marketing: upward campaign analytics arrow & megaphone spark
  marketing: (props) => (
    <svg {...svgProps} {...props}>
      <path d="M3 17.5 9.5 11l4 4L21 7.5" />
      <path d="M15.5 7.5H21V13" />
      <path d="M3 20.5h18" />
    </svg>
  ),

  // People & Culture: community heart-in-hands emblem
  'people-culture': (props) => (
    <svg {...svgProps} {...props}>
      <path d="M12 14.5s-5-3.1-5-6.5a2.8 2.8 0 0 1 5-1.7A2.8 2.8 0 0 1 17 8c0 3.4-5 6.5-5 6.5Z" />
      <path d="M3.5 13.5v4.2a2.3 2.3 0 0 0 2.3 2.3h3.7M20.5 13.5v4.2a2.3 2.3 0 0 1-2.3 2.3h-3.7" />
    </svg>
  ),

  // Logistics & Events: event schedule grid with verified check
  'logistics-events': (props) => (
    <svg {...svgProps} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="m9 15.5 2 2 4-4" />
    </svg>
  ),

  // Public Relations & Fundraising: external outreach megaphone & reach waves
  'public-relations-fundraising': (props) => (
    <svg {...svgProps} {...props}>
      <path d="M4 11v3a2 2 0 0 0 2 2h2l7.5 3.5V5.5L8 9H6a2 2 0 0 0-2 2Z" />
      <path d="M8 16v4.5M18.5 9.5a3.5 3.5 0 0 1 0 5M20.75 7.5a6.5 6.5 0 0 1 0 9" />
    </svg>
  ),

  // Graphic Design: precision vector pen nib & anchor handle
  'graphic-design': (props) => (
    <svg {...svgProps} {...props}>
      <path d="m12 3 7 9.5-3.5 5.5h-7L5 12.5 12 3Z" />
      <path d="M12 3v8.5M7 21h10" />
      <circle cx="12" cy="13" r="1.5" />
    </svg>
  ),

  // Content Creation: studio clapperboard & media play frame
  'content-creation': (props) => (
    <svg {...svgProps} {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18M7.5 4.5l2 4.5M13.5 4.5l2 4.5" />
      <path d="m10.25 12 4.25 2.5-4.25 2.5V12Z" />
    </svg>
  ),
}

function DefaultIcon(props) {
  return (
    <svg {...svgProps} {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export default function CommitteeIcon({ slug, icon, className = '' }) {
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

  const CustomSvg = icons[slug] || DefaultIcon
  return <CustomSvg className={className} />
}
