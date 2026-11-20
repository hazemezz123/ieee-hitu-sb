// Reusable partner logo configuration & fallback partner roster.
// Each partner entry defines original brand asset source, alt text, dedicated contrasting
// card surface ('light' for dark-ink logos, 'dark' for light-ink logos), and per-logo
// optical sizing overrides so wide wordmarks and compact marks balance cleanly.
export const PARTNER_LOGO_CONFIGS = {
  'risk solutions': {
    src: '/logos/partners/risk-solutions.svg',
    alt: 'Risk Solutions',
    surface: 'light',
    opticalScale: 0.98,
    maxWidth: 164,
    maxHeight: 72,
  },
  'consulting group': {
    src: '/logos/partners/consulting-group.svg',
    alt: 'Consulting Group',
    surface: 'light',
    opticalScale: 1.06,
    maxWidth: 168,
    maxHeight: 80,
  },
  'make x': {
    src: '/logos/partners/make-x.svg',
    alt: 'Make X',
    surface: 'dark',
    opticalScale: 1.02,
    maxWidth: 184,
    maxHeight: 56,
  },
  'ieee hsb': {
    src: '/logos/originals/ieee-hsb.png',
    alt: 'IEEE HSB',
    surface: 'light',
    opticalScale: 1.08,
    maxWidth: 112,
    maxHeight: 84,
  },
  'bridgex 2026': {
    src: '/logos/originals/bridgex-2026.png',
    alt: 'BRIDGEx 2026',
    surface: 'light',
    opticalScale: 1.0,
    maxWidth: 200,
    maxHeight: 72,
  },
  techne: {
    src: '/logos/partners/techne.svg',
    alt: 'techne',
    surface: 'dark',
    opticalScale: 0.96,
    maxWidth: 184,
    maxHeight: 48,
  },
  konnect: {
    src: '/logos/partners/konnect.svg',
    alt: 'Konnect',
    surface: 'dark',
    opticalScale: 1.06,
    maxWidth: 206,
    maxHeight: 60,
  },
  'gdg cairo': {
    src: '/logos/partners/gdg-cairo-light.svg',
    alt: 'GDG Cairo',
    surface: 'light',
    opticalScale: 1.0,
    maxWidth: 192,
    maxHeight: 76,
  },
  carerha: {
    src: '/logos/partners/carerha.svg',
    alt: 'CARERHA',
    surface: 'dark',
    opticalScale: 1.0,
    maxWidth: 204,
    maxHeight: 56,
  },
}

export function resolvePartnerLogoConfig(partner = {}) {
  const key = typeof partner.name === 'string' ? partner.name.trim().toLowerCase() : ''
  const preset = PARTNER_LOGO_CONFIGS[key]
  const fallbackSrc = typeof partner.logo === 'string' ? partner.logo.trim() : ''
  const src = fallbackSrc || preset?.src || ''
  const alt = partner.alt || preset?.alt || partner.name || 'Partner logo'
  const surface = partner.surface || preset?.surface || (partner.logoDark ? 'dark' : 'light')
  const opticalScale = typeof partner.opticalScale === 'number'
    ? partner.opticalScale
    : (preset?.opticalScale ?? 1)
  const maxWidth = partner.maxWidth ?? preset?.maxWidth ?? 184
  const maxHeight = partner.maxHeight ?? preset?.maxHeight ?? 68

  return {
    src,
    alt,
    surface,
    opticalScale,
    maxWidth,
    maxHeight,
    logoDark: surface === 'dark',
  }
}

export const communityPartners = [
  { name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg', logoDark: false },
  { name: 'Consulting Group', logo: '/logos/partners/consulting-group.svg', logoDark: false },
  { name: 'Make X', logo: '/logos/partners/make-x.svg', logoDark: true },
  { name: 'IEEE HSB', logo: '/logos/originals/ieee-hsb.png', logoDark: false },
  { name: 'BRIDGEx 2026', logo: '/logos/originals/bridgex-2026.png', logoDark: false },
  { name: 'techne', logo: '/logos/partners/techne.svg', logoDark: true },
  { name: 'Konnect', logo: '/logos/partners/konnect.svg', logoDark: true },
  { name: 'GDG Cairo', logo: '/logos/partners/gdg-cairo-light.svg', logoDark: false },
  { name: 'CARERHA', logo: '/logos/partners/carerha.svg', logoDark: true },
]
