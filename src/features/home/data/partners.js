// Reusable partner logo configuration & fallback partner roster.
// Each known partner maps to tightly trimmed light-mode and dark-mode transparent assets
// with per-logo optical sizing bounds so marks and wordmarks feel visually balanced
// on a unified borderless section background without card containers or CSS filters.
export const PARTNER_LOGO_CONFIGS = {
  'risk solutions': {
    src: '/logos/partners/risk-solutions.svg',
    lightSrc: '/logos/partners/risk-solutions.svg',
    darkSrc: '/logos/partners/risk-solutions-dark.svg',
    alt: 'Risk Solutions',
    surface: 'none',
    opticalScale: 1.0,
    maxWidth: 126,
    maxHeight: 58,
  },
  'consulting group': {
    src: '/logos/partners/consulting-group.svg',
    lightSrc: '/logos/partners/consulting-group.svg',
    darkSrc: '/logos/partners/consulting-group-dark.svg',
    alt: 'Consulting Group',
    surface: 'none',
    opticalScale: 1.02,
    maxWidth: 118,
    maxHeight: 62,
  },
  'make x': {
    src: '/logos/partners/make-x-light.svg',
    lightSrc: '/logos/partners/make-x-light.svg',
    darkSrc: '/logos/partners/make-x.svg',
    alt: 'Make X',
    surface: 'none',
    opticalScale: 1.0,
    maxWidth: 162,
    maxHeight: 44,
  },
  'ieee hsb': {
    src: '/logos/partners/ieee-hsb-light.png',
    lightSrc: '/logos/partners/ieee-hsb-light.png',
    darkSrc: '/logos/partners/ieee-hsb-dark.png',
    alt: 'IEEE HSB',
    surface: 'none',
    opticalScale: 1.0,
    maxWidth: 74,
    maxHeight: 66,
  },
  'bridgex 2026': {
    src: '/logos/partners/bridgex-2026-light.png',
    lightSrc: '/logos/partners/bridgex-2026-light.png',
    darkSrc: '/logos/partners/bridgex-2026-dark.png',
    alt: 'BRIDGEx 2026',
    surface: 'none',
    opticalScale: 1.0,
    maxWidth: 166,
    maxHeight: 52,
  },
  techne: {
    src: '/logos/partners/techne-light.svg',
    lightSrc: '/logos/partners/techne-light.svg',
    darkSrc: '/logos/partners/techne.svg',
    alt: 'techne',
    surface: 'none',
    opticalScale: 0.98,
    maxWidth: 158,
    maxHeight: 40,
  },
  konnect: {
    src: '/logos/partners/konnect-light.svg',
    lightSrc: '/logos/partners/konnect-light.svg',
    darkSrc: '/logos/partners/konnect.svg',
    alt: 'Konnect',
    surface: 'none',
    opticalScale: 1.02,
    maxWidth: 174,
    maxHeight: 48,
  },
  'gdg cairo': {
    src: '/logos/partners/gdg-cairo-light.svg',
    lightSrc: '/logos/partners/gdg-cairo-light.svg',
    darkSrc: '/logos/partners/gdg-cairo-dark.svg',
    alt: 'GDG Cairo',
    surface: 'none',
    opticalScale: 1.02,
    maxWidth: 168,
    maxHeight: 60,
  },
  carerha: {
    src: '/logos/partners/carerha-light.svg',
    lightSrc: '/logos/partners/carerha-light.svg',
    darkSrc: '/logos/partners/carerha.svg',
    alt: 'CARERHA',
    surface: 'none',
    opticalScale: 1.0,
    maxWidth: 176,
    maxHeight: 30,
  },
}

export function resolvePartnerLogoConfig(partner = {}) {
  const key = typeof partner.name === 'string' ? partner.name.trim().toLowerCase() : ''
  const preset = PARTNER_LOGO_CONFIGS[key]
  const fallbackSrc = typeof partner.logo === 'string' ? partner.logo.trim() : ''
  const src = preset?.src || fallbackSrc
  const lightSrc = partner.lightLogo || preset?.lightSrc || (partner.logoDark ? '' : fallbackSrc)
  const darkSrc = partner.darkLogo || preset?.darkSrc || (partner.logoDark ? fallbackSrc : '')
  const alt = partner.alt || preset?.alt || partner.name || 'Partner logo'
  const surface = partner.surface || preset?.surface || 'none'
  const opticalScale = typeof partner.opticalScale === 'number'
    ? partner.opticalScale
    : (preset?.opticalScale ?? 1)
  const maxWidth = partner.maxWidth ?? preset?.maxWidth ?? 164
  const maxHeight = partner.maxHeight ?? preset?.maxHeight ?? 52

  return {
    src,
    lightSrc,
    darkSrc,
    alt,
    surface,
    opticalScale,
    maxWidth,
    maxHeight,
    logoDark: Boolean(partner.logoDark),
  }
}

export const communityPartners = [
  { name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg', logoDark: false },
  { name: 'Consulting Group', logo: '/logos/partners/consulting-group.svg', logoDark: false },
  { name: 'Make X', logo: '/logos/partners/make-x.svg', logoDark: true },
  { name: 'IEEE HSB', logo: '/logos/partners/ieee-hsb-light.png', logoDark: false },
  { name: 'BRIDGEx 2026', logo: '/logos/partners/bridgex-2026-light.png', logoDark: false },
  { name: 'techne', logo: '/logos/partners/techne.svg', logoDark: true },
  { name: 'Konnect', logo: '/logos/partners/konnect.svg', logoDark: true },
  { name: 'GDG Cairo', logo: '/logos/partners/gdg-cairo-light.svg', logoDark: false },
  { name: 'CARERHA', logo: '/logos/partners/carerha.svg', logoDark: true },
]
