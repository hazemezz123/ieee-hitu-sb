import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PartnershipCarousel from './PartnershipCarousel'

const { fetchPartnersResult } = vi.hoisted(() => ({
  fetchPartnersResult: vi.fn(),
}))

vi.mock('@/features/home/hooks/usePartners', () => ({
  fetchPartnersResult,
}))

describe('PartnershipCarousel (Responsive Partner Grid)', () => {
  beforeEach(() => {
    fetchPartnersResult.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a single responsive grid of equal-height logo cards with prominent sizing', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [
        { _id: 1, name: 'Risk Solutions', logo: '/logos/partners/risk-solutions.svg', logoDark: false },
        { _id: 2, name: 'Text Only Partner', logo: '' },
      ],
      source: 'remote',
    })

    const { container } = render(<PartnershipCarousel />)

    expect(await screen.findByRole('heading', { name: 'Partners we build with' })).toBeTruthy()

    const lists = container.querySelectorAll('ul')
    expect(lists).toHaveLength(1)
    expect(lists[0].className).toContain('flex-wrap')

    const riskTile = screen.getByLabelText('Risk Solutions')
    const img = riskTile.querySelector('img')
    expect(img.className).toContain('object-contain')
    expect(img.parentElement.className).toContain('h-32')
    expect(img.parentElement.getAttribute('data-logo-surface')).toBe('light')

    expect(screen.getByLabelText('Text Only Partner').textContent).toContain('Text Only Partner')
  })

  it('uses dedicated contrasting surfaces and per-logo optical sizing without CSS filters', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [
        { _id: 1, name: 'Make X', logo: '/logos/partners/make-x.svg', logoDark: true },
        { _id: 2, name: 'IEEE HSB', logo: '/logos/originals/ieee-hsb.png', logoDark: false },
        { _id: 3, name: 'GDG Cairo', logo: '/logos/partners/gdg-cairo-light.svg', logoDark: false },
        { _id: 4, name: 'CARERHA', logo: '/logos/partners/carerha.svg', logoDark: true },
      ],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const makeXImg = await screen.findByRole('img', { name: 'Make X' })
    const hsbImg = screen.getByRole('img', { name: 'IEEE HSB' })
    const gdgImg = screen.getByRole('img', { name: 'GDG Cairo' })
    const carerhaImg = screen.getByRole('img', { name: 'CARERHA' })

    expect(makeXImg.getAttribute('src')).toBe('/logos/partners/make-x.svg')
    expect(makeXImg.parentElement.getAttribute('data-logo-surface')).toBe('dark')
    expect(makeXImg.parentElement.className).toContain('bg-[#101820]')
    expect(makeXImg.style.maxWidth).toBe('min(100%, 188px)')
    expect(makeXImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)

    expect(hsbImg.getAttribute('src')).toBe('/logos/originals/ieee-hsb.png')
    expect(hsbImg.parentElement.getAttribute('data-logo-surface')).toBe('light')
    expect(hsbImg.parentElement.className).toContain('bg-white')
    expect(hsbImg.style.maxHeight).toBe('min(100%, 91px)')
    expect(hsbImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)

    expect(gdgImg.getAttribute('src')).toBe('/logos/partners/gdg-cairo-light.svg')
    expect(gdgImg.parentElement.getAttribute('data-logo-surface')).toBe('light')
    expect(gdgImg.parentElement.className).toContain('bg-white')
    expect(gdgImg.style.maxWidth).toBe('min(100%, 192px)')
    expect(gdgImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)

    expect(carerhaImg.getAttribute('src')).toBe('/logos/partners/carerha.svg')
    expect(carerhaImg.parentElement.getAttribute('data-logo-surface')).toBe('dark')
    expect(carerhaImg.parentElement.className).toContain('bg-[#101820]')
    expect(carerhaImg.style.maxWidth).toBe('min(100%, 204px)')
    expect(carerhaImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)
  })

  it('falls back to partner name when a logo fails to load', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ _id: 1, name: 'Broken Logo Co', logo: 'https://cdn.example.com/broken.png' }],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const img = await screen.findByRole('img', { name: 'Broken Logo Co' })
    fireEvent.error(img)

    expect(screen.getByLabelText('Broken Logo Co').querySelector('img')).toBeNull()
    expect(screen.getByLabelText('Broken Logo Co').textContent).toContain('Broken Logo Co')
  })

  it('renders nothing when there are no partners', async () => {
    fetchPartnersResult.mockResolvedValue({ partners: [], source: 'remote' })
    const { container } = render(<PartnershipCarousel />)
    await Promise.resolve()
    expect(container.querySelector('section')).toBeNull()
  })
})
