import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import PartnershipCarousel, { isImageBackgroundOpaque } from './PartnershipCarousel'

const { fetchPartnersResult } = vi.hoisted(() => ({
  fetchPartnersResult: vi.fn(),
}))

vi.mock('@/features/home/hooks/usePartners', () => ({
  fetchPartnersResult,
}))

describe('PartnershipCarousel', () => {
  beforeEach(() => {
    fetchPartnersResult.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders partners in protective pill containers with uniform sizing and crossOrigin', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [
        { name: 'Alpha Tech', logo: 'https://cdn.example.com/alpha.svg' },
        { name: 'Text Only Partner', logo: '' },
      ],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const tiles = await screen.findAllByLabelText('Alpha Tech')
    expect(tiles.length).toBeGreaterThan(0)
    const tile = tiles[0]

    // Requirement 2: Protective pill container classes
    expect(tile.className).toContain('group')
    expect(tile.className).toContain('flex')
    expect(tile.className).toContain('items-center')
    expect(tile.className).toContain('justify-center')
    expect(tile.className).toContain('h-24')
    expect(tile.className).toContain('px-6')
    expect(tile.className).toContain('py-4')
    expect(tile.className).toContain('bg-slate-50/80')
    expect(tile.className).toContain('hover:bg-slate-100')
    expect(tile.className).toContain('border')
    expect(tile.className).toContain('border-slate-200/80')
    expect(tile.className).toContain('rounded-xl')
    expect(tile.className).toContain('transition-colors')

    // Requirement 4: Uniform sizing & aspect ratio normalization on img
    const img = tile.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('crossOrigin')).toBe('anonymous')
    expect(img.className).toContain('max-h-12')
    expect(img.className).toContain('max-w-[140px]')
    expect(img.className).toContain('w-auto')
    expect(img.className).toContain('object-contain')
    expect(img.className).toContain('select-none')

    // Partner without logo renders name
    const textTiles = screen.getAllByLabelText('Text Only Partner')
    expect(textTiles[0].textContent).toContain('Text Only Partner')
  })

  it('applies smart contrast filters for transparent logos by default and hover state', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ name: 'White Brand', logo: 'https://cdn.example.com/brand.png' }],
      source: 'remote',
    })

    render(<PartnershipCarousel />)

    const img = (await screen.findAllByRole('img', { name: 'White Brand' }))[0]

    // Requirement 1: Default state monochrome dark gray
    expect(img.className).toContain('brightness-0')
    expect(img.className).toContain('opacity-55')
    expect(img.className).toContain('transition-all')
    expect(img.className).toContain('duration-300')
    expect(img.className).toContain('ease-in-out')

    // Requirement 1: Hover state brand colors + sharp double drop-shadow
    expect(img.className).toContain('group-hover:brightness-100')
    expect(img.className).toContain('group-hover:opacity-100')
    expect(img.className).toContain('group-hover:scale-105')
    expect(img.className).toContain(
      'group-hover:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))]'
    )

    // Requirement 5: Mobile touch support (hover:none)
    expect(img.className).toContain('[@media(hover:none)]:brightness-100')
    expect(img.className).toContain('[@media(hover:none)]:opacity-100')
    expect(img.className).toContain(
      '[@media(hover:none)]:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))]'
    )
  })

  it('isImageBackgroundOpaque returns true when four corner pixels are solid opaque', () => {
    const mockCtx = {
      getImageData: vi.fn().mockImplementation(() => ({
        data: [255, 255, 255, 255],
      })),
    }

    expect(isImageBackgroundOpaque(mockCtx, 100, 50)).toBe(true)
    expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 1, 1)
    expect(mockCtx.getImageData).toHaveBeenCalledWith(99, 0, 1, 1)
    expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 49, 1, 1)
    expect(mockCtx.getImageData).toHaveBeenCalledWith(99, 49, 1, 1)
  })

  it('isImageBackgroundOpaque returns false when any corner pixel is transparent', () => {
    const mockCtx = {
      getImageData: vi.fn().mockImplementation((x, y) => {
        if (x === 0 && y === 0) return { data: [0, 0, 0, 0] } // transparent top-left
        return { data: [255, 255, 255, 255] }
      }),
    }

    expect(isImageBackgroundOpaque(mockCtx, 100, 50)).toBe(false)
  })

  it('isImageBackgroundOpaque catches errors gracefully and returns false', () => {
    const mockCtx = {
      getImageData: vi.fn().mockImplementation(() => {
        throw new Error('SecurityError: The operation is insecure (CORS tainted canvas)')
      }),
    }

    expect(isImageBackgroundOpaque(mockCtx, 100, 50)).toBe(false)
  })

  it('bypasses brightness-0 and applies mix-blend-multiply when image background is solid opaque', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ name: 'Solid JPG Co', logo: 'https://cdn.example.com/solid.jpg' }],
      source: 'remote',
    })

    // Stub canvas getContext to return all opaque corners
    const mockGetContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: [255, 255, 255, 255] }),
    })
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = mockGetContext

    try {
      render(<PartnershipCarousel />)

      const img = (await screen.findAllByRole('img', { name: 'Solid JPG Co' }))[0]

      Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true })
      Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true })

      fireEvent.load(img)

      await waitFor(() => {
        // Requirement 3: Bypasses brightness-0 and applies mix-blend-multiply and drop-shadow
        expect(img.className).not.toContain('brightness-0')
        expect(img.className).toContain('mix-blend-multiply')
        expect(img.className).toContain(
          '[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))]'
        )
      })
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext
    }
  })

  it('handles CORS tainted canvas errors gracefully without crashing or breaking logo', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ name: 'CORS Restrict Co', logo: 'https://cdn.example.com/cors.jpg' }],
      source: 'remote',
    })

    const mockGetContext = vi.fn().mockReturnValue({
      drawImage: vi.fn().mockImplementation(() => {
        throw new Error('CORS tainted canvas')
      }),
    })
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = mockGetContext

    try {
      render(<PartnershipCarousel />)

      const img = (await screen.findAllByRole('img', { name: 'CORS Restrict Co' }))[0]
      Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true })
      Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true })

      fireEvent.load(img)

      // Graceful fallback keeps the safe default monochromatic filter
      expect(img.className).toContain('brightness-0')
      expect(img.className).not.toContain('mix-blend-multiply')
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext
    }
  })
})
