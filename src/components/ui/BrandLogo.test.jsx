import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import BrandLogo, { getLogoOpticalScale } from './BrandLogo'

describe('BrandLogo', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders official light and dark variants without CSS filters', () => {
    render(
      <BrandLogo
        lightSrc="/logos/brand/ieee-hitu-color.svg"
        darkSrc="/logos/brand/ieee-hitu-white.svg"
        alt="IEEE HITU Student Branch"
        size="nav"
        surface="none"
      />,
    )

    const imgs = screen.getAllByAltText('IEEE HITU Student Branch')
    expect(imgs).toHaveLength(2)
    expect(imgs[0].getAttribute('src')).toBe('/logos/brand/ieee-hitu-color.svg')
    expect(imgs[0].className).toContain('dark:hidden')
    expect(imgs[1].getAttribute('src')).toBe('/logos/brand/ieee-hitu-white.svg')
    expect(imgs[1].className).toContain('dark:block')

    for (const img of imgs) {
      expect(img.className).toContain('object-contain')
      expect(img.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)
    }
  })

  it('pairs light and dark logos with dedicated contrasting surfaces and optical sizing overrides', () => {
    const { rerender } = render(
      <BrandLogo
        src="/logos/partners/techne.svg"
        name="techne"
        logoDark
        surface="dark"
        size="card"
        opticalScale={0.96}
        maxWidth={184}
        maxHeight={48}
      />,
    )

    const darkImg = screen.getByAltText('techne')
    const darkWrapper = darkImg.parentElement
    expect(darkWrapper.getAttribute('data-logo-surface')).toBe('dark')
    expect(darkWrapper.className).toContain('bg-[#101820]')
    expect(darkWrapper.className).toContain('h-32')
    expect(darkImg.style.maxWidth).toBe('min(100%, 177px)')
    expect(darkImg.style.maxHeight).toBe('min(100%, 46px)')
    expect(darkImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)

    rerender(
      <BrandLogo
        src="/logos/partners/risk-solutions.svg"
        name="Risk Solutions"
        logoDark={false}
        surface="light"
        size="card"
        opticalScale={0.98}
        maxWidth={164}
        maxHeight={72}
      />,
    )

    const lightImg = screen.getByAltText('Risk Solutions')
    const lightWrapper = lightImg.parentElement
    expect(lightWrapper.getAttribute('data-logo-surface')).toBe('light')
    expect(lightWrapper.className).toContain('bg-white')
    expect(lightImg.style.maxWidth).toBe('min(100%, 161px)')
    expect(lightImg.style.maxHeight).toBe('min(100%, 71px)')
    expect(lightImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)
  })

  it('falls back to text label if the image fails to load', () => {
    render(<BrandLogo src="/logos/partners/missing.svg" name="Partner X" />)
    const img = screen.getByAltText('Partner X')
    fireEvent.error(img)
    expect(screen.queryByAltText('Partner X')).toBeNull()
    expect(screen.getByText('Partner X')).toBeTruthy()
  })

  it('returns optical scale factors for known logos and 1 by default', () => {
    expect(getLogoOpticalScale('techne')).toBe(0.96)
    expect(getLogoOpticalScale('IEEE HSB')).toBe(1.08)
    expect(getLogoOpticalScale('Unknown Partner')).toBe(1)
  })
})
