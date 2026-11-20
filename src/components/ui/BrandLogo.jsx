'use client'

import { useState } from 'react'

/**
 * Optical scale factors normalize perceived visual weight across wide wordmarks,
 * compact ovals, and square badges without stretching or distorting aspect ratios.
 */
const OPTICAL_SCALES = {
  'risk solutions': 0.98,
  'consulting group': 1.06,
  'make x': 1.02,
  'ieee hsb': 1.08,
  'bridgex 2026': 1.0,
  techne: 0.96,
  konnect: 1.06,
  'gdg cairo': 0.98,
  carerha: 1.0,
  'ieee hitu student branch': 1.0,
}

export function getLogoOpticalScale(name) {
  if (typeof name !== 'string') return 1
  const normalized = name.trim().toLowerCase()
  return OPTICAL_SCALES[normalized] ?? 1
}

const SIZE_CLASSES = {
  sm: 'h-9 min-w-[84px] max-w-[136px] px-2.5 py-1',
  md: 'h-12 min-w-[116px] max-w-[180px] px-3.5 py-2',
  lg: 'h-16 min-w-[140px] max-w-[216px] px-4 py-2.5',
  card: 'h-32 sm:h-36 w-full px-6 py-5',
  nav: 'h-9 w-auto px-0 py-0',
  footer: 'h-14 sm:h-16 w-auto px-0 py-0',
}

const SURFACE_CLASSES = {
  light: 'rounded-2xl bg-white border border-outline-variant/40 shadow-xs dark:bg-[#f8fafc] dark:border-white/20',
  dark: 'rounded-2xl bg-[#101820] border border-[#1e2c3d] shadow-xs dark:bg-[#141f30] dark:border-[#2c3e5e]',
  none: '',
}

/**
 * Reusable, filter-free brand & partner logo display component.
 * Preserves authentic brand colors on dedicated contrasting surfaces ('light' | 'dark')
 * or renders official dual light/dark SVG variants without CSS filters or distortion.
 */
export default function BrandLogo({
  src,
  lightSrc,
  darkSrc,
  alt,
  name,
  logoDark = false,
  surface = 'auto',
  size = 'md',
  opticalScale,
  maxWidth,
  maxHeight,
  loading = 'eager',
  className = '',
  imgClassName = '',
  'data-testid': dataTestId,
}) {
  const [failedSrcs, setFailedSrcs] = useState({})
  const label = alt || name || 'Brand logo'
  const resolvedLight = (lightSrc || src || '').trim()
  const resolvedDark = (darkSrc || '').trim()
  const hasDualVariants = Boolean(resolvedLight && resolvedDark && resolvedLight !== resolvedDark)

  const scale = typeof opticalScale === 'number' ? opticalScale : getLogoOpticalScale(name || alt)
  const scaledMaxWidth = typeof maxWidth === 'number' ? Math.round(maxWidth * scale) : null
  const scaledMaxHeight = typeof maxHeight === 'number' ? Math.round(maxHeight * scale) : null

  const imgStyle = (scaledMaxWidth || scaledMaxHeight)
    ? {
        width: '100%',
        height: '100%',
        maxWidth: scaledMaxWidth ? `min(100%, ${scaledMaxWidth}px)` : '100%',
        maxHeight: scaledMaxHeight ? `min(100%, ${scaledMaxHeight}px)` : '100%',
      }
    : scale !== 1
      ? { transform: `scale(${scale})` }
      : undefined

  const handleError = brokenSrc => {
    if (!brokenSrc) return
    setFailedSrcs(prev => (prev[brokenSrc] ? prev : { ...prev, [brokenSrc]: true }))
  }

  const resolvedSurface = surface === 'auto'
    ? (hasDualVariants ? 'none' : (logoDark ? 'dark' : 'light'))
    : surface
  const surfaceClasses = SURFACE_CLASSES[resolvedSurface] ?? ''

  const boxClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const baseImgClasses = `max-h-full max-w-full w-auto h-full object-contain select-none ${imgClassName}`.trim()

  const lightAvailable = Boolean(resolvedLight) && !failedSrcs[resolvedLight]
  const darkAvailable = Boolean(resolvedDark) && !failedSrcs[resolvedDark]

  if (hasDualVariants && (lightAvailable || darkAvailable)) {
    return (
      <span
        className={`inline-flex items-center justify-center ${boxClasses} ${surfaceClasses} ${className}`.trim()}
        data-testid={dataTestId}
      >
        {lightAvailable && (
          <img
            src={resolvedLight}
            alt={label}
            loading={loading}
            decoding="async"
            style={imgStyle}
            onError={() => handleError(resolvedLight)}
            className={`${baseImgClasses} block dark:hidden`.trim()}
          />
        )}
        {darkAvailable && (
          <img
            src={resolvedDark}
            alt={label}
            loading={loading}
            decoding="async"
            style={imgStyle}
            onError={() => handleError(resolvedDark)}
            className={`${baseImgClasses} ${lightAvailable ? 'hidden dark:block' : 'block'}`.trim()}
          />
        )}
      </span>
    )
  }

  const singleSrc = lightAvailable ? resolvedLight : darkAvailable ? resolvedDark : ''
  const fallbackTextClass = resolvedSurface === 'dark'
    ? 'text-white/90'
    : resolvedSurface === 'light'
      ? 'text-[#17212b]'
      : 'text-on-surface-variant'

  return (
    <span
      className={`inline-flex items-center justify-center transition-colors duration-200 ${boxClasses} ${surfaceClasses} ${className}`.trim()}
      data-logo-dark={logoDark ? 'true' : 'false'}
      data-logo-surface={resolvedSurface}
      data-testid={dataTestId}
    >
      {singleSrc ? (
        <img
          src={singleSrc}
          alt={label}
          loading={loading}
          decoding="async"
          style={imgStyle}
          data-logo-dark={logoDark ? 'true' : 'false'}
          onError={() => handleError(singleSrc)}
          className={baseImgClasses}
        />
      ) : (
        <span className={`text-sm font-bold tracking-wide whitespace-nowrap ${fallbackTextClass}`}>
          {label}
        </span>
      )}
    </span>
  )
}
