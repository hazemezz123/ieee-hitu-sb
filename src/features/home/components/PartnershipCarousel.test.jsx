import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import gsap from 'gsap'
import PartnershipCarousel from './PartnershipCarousel'

const { fetchPartnersResult } = vi.hoisted(() => ({
  fetchPartnersResult: vi.fn(),
}))

vi.mock('@/features/home/hooks/usePartners', () => ({
  fetchPartnersResult,
}))

describe('PartnershipCarousel (Borderless Partner Marquee)', () => {
  beforeEach(() => {
    fetchPartnersResult.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a borderless seamless marquee with an aria-hidden clone row and focusable pause region', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [
        { _id: 1, name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg', logoDark: false },
        { _id: 2, name: 'Text Only Partner', logo: '' },
      ],
      source: 'remote',
    })

    const { container } = render(<PartnershipCarousel />)

    expect(await screen.findByRole('heading', { name: 'Partners we build with' })).toBeTruthy()

    const region = screen.getByRole('region', { name: 'Partner logos showcase' })
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(region.className).toContain('partners-marquee-viewport')

    const allLists = container.querySelectorAll('ul')
    expect(allLists).toHaveLength(2)
    expect(allLists[0].getAttribute('aria-hidden')).toBeNull()
    expect(allLists[1].getAttribute('aria-hidden')).toBe('true')
    expect(allLists[1].className).toContain('partners-marquee-clone')

    const riskTile = screen.getByLabelText('Risk Solutions')
    const riskImgs = riskTile.querySelectorAll('img')
    expect(riskImgs).toHaveLength(2)
    expect(riskImgs[0].parentElement.getAttribute('data-logo-surface')).toBe('none')
    expect(riskImgs[0].parentElement.className).not.toMatch(/bg-white|bg-\[#101820\]|rounded-2xl/)

    expect(screen.getByLabelText('Text Only Partner').textContent).toContain('Text Only Partner')
  })

  it('renders dual light and dark transparent variants with optical sizing and zero CSS filters', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [
        { _id: 1, name: 'Make X', logo: '/logos/partners/make-x.svg', logoDark: true },
        { _id: 2, name: 'IEEE HSB', logo: '/logos/partners/ieee-hsb-light.png', logoDark: false },
        { _id: 3, name: 'GDG Cairo', logo: '/logos/partners/gdg-cairo-light.svg', logoDark: false },
        { _id: 4, name: 'CARERHA', logo: '/logos/partners/carerha.svg', logoDark: true },
      ],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const makeXTile = await screen.findByLabelText('Make X')
    const [makeXLight, makeXDark] = makeXTile.querySelectorAll('img')
    expect(makeXLight.getAttribute('src')).toBe('/logos/partners/make-x-light.svg')
    expect(makeXLight.className).toContain('dark:hidden')
    expect(makeXDark.getAttribute('src')).toBe('/logos/partners/make-x.svg')
    expect(makeXDark.className).toContain('dark:block')
    expect(makeXLight.style.maxWidth).toBe('min(100%, 162px)')
    expect(makeXLight.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)

    const hsbTile = screen.getByLabelText('IEEE HSB')
    const [hsbLight, hsbDark] = hsbTile.querySelectorAll('img')
    expect(hsbLight.getAttribute('src')).toBe('/logos/partners/ieee-hsb-light.png')
    expect(hsbDark.getAttribute('src')).toBe('/logos/partners/ieee-hsb-dark.png')
    expect(hsbLight.style.maxHeight).toBe('min(100%, 66px)')

    const gdgTile = screen.getByLabelText('GDG Cairo')
    const [gdgLight, gdgDark] = gdgTile.querySelectorAll('img')
    expect(gdgLight.getAttribute('src')).toBe('/logos/partners/gdg-cairo-light.svg')
    expect(gdgDark.getAttribute('src')).toBe('/logos/partners/gdg-cairo-dark.svg')
    expect(gdgLight.style.maxWidth).toBe('min(100%, 171px)')

    const carerhaTile = screen.getByLabelText('CARERHA')
    const [carerhaLight, carerhaDark] = carerhaTile.querySelectorAll('img')
    expect(carerhaLight.getAttribute('src')).toBe('/logos/partners/carerha-light.svg')
    expect(carerhaDark.getAttribute('src')).toBe('/logos/partners/carerha.svg')
    expect(carerhaLight.style.maxWidth).toBe('min(100%, 176px)')
    expect(carerhaLight.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)
  })

  it('falls back to partner name when a logo fails to load', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ _id: 1, name: 'Broken Logo Co', logo: 'https://cdn.example.com/broken.png' }],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const tile = await screen.findByLabelText('Broken Logo Co')
    const img = tile.querySelector('img')
    fireEvent.error(img)

    expect(screen.getByLabelText('Broken Logo Co').querySelector('img')).toBeNull()
    expect(screen.getByLabelText('Broken Logo Co').textContent).toContain('Broken Logo Co')
  })

  it('smoothly decelerates and resumes marquee velocity via GSAP timeScale on hover and focus', async () => {
    const originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({ matches: false })),
    })

    const fakeTween = { timeScale: 1, kill: vi.fn() }
    const toSpy = vi.spyOn(gsap, 'to').mockImplementation((target, vars) => {
      if (target === fakeTween && typeof vars?.timeScale === 'number') {
        target.timeScale = vars.timeScale
      }
      return fakeTween
    })
    const killSpy = vi.spyOn(gsap, 'killTweensOf').mockImplementation(() => {})

    try {
      fetchPartnersResult.mockResolvedValue({
        partners: [{ _id: 1, name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg' }],
        source: 'remote',
      })

      render(<PartnershipCarousel />)
      const region = await screen.findByRole('region', { name: 'Partner logos showcase' })

      fireEvent.mouseEnter(region)
      expect(killSpy).toHaveBeenCalledWith(fakeTween)
      expect(toSpy).toHaveBeenCalledWith(
        fakeTween,
        expect.objectContaining({ timeScale: 0, duration: 0.55, ease: 'power2.out' }),
      )

      fireEvent.mouseLeave(region)
      expect(toSpy).toHaveBeenCalledWith(
        fakeTween,
        expect.objectContaining({ timeScale: 1, duration: 0.65, ease: 'power2.inOut' }),
      )

      fireEvent.focus(region)
      expect(toSpy).toHaveBeenLastCalledWith(
        fakeTween,
        expect.objectContaining({ timeScale: 0 }),
      )
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      })
    }
  })

  it('toggles manual pause and resume state with the accessible button', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ _id: 1, name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg' }],
      source: 'remote',
    })
    render(<PartnershipCarousel />)

    const pauseBtn = await screen.findByRole('button', { name: /pause partner logos scrolling/i })
    expect(pauseBtn.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(pauseBtn)

    const resumeBtn = screen.getByRole('button', { name: /resume partner logos scrolling/i })
    expect(resumeBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders nothing when there are no partners', async () => {
    fetchPartnersResult.mockResolvedValue({ partners: [], source: 'remote' })
    const { container } = render(<PartnershipCarousel />)
    await Promise.resolve()
    expect(container.querySelector('section')).toBeNull()
  })
})
