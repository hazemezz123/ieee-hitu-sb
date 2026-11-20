import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import GalleryCarousel from './GalleryCarousel'
import { galleryPhotos } from '../data/galleryPhotos'

afterEach(cleanup)

describe('GalleryCarousel', () => {
  it('renders the gallery section heading, pause control, and link to full gallery', () => {
    render(<GalleryCarousel />)

    expect(screen.getByRole('heading', { name: /moments that inspire/i })).toBeTruthy()
    const pauseBtn = screen.getByRole('button', { name: /pause gallery scrolling/i })
    expect(pauseBtn.getAttribute('aria-pressed')).toBe('false')

    const viewAllLink = screen.getByRole('link', { name: /view all gallery photos/i })
    expect(viewAllLink.getAttribute('href')).toBe('/gallery')
  })

  it('renders all images with natural aspect ratios and hides clone row from assistive tech', () => {
    const { container } = render(<GalleryCarousel />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(galleryPhotos.length)

    for (const photo of galleryPhotos) {
      const match = images.find((img) => img.getAttribute('src') === photo.src)
      expect(match).toBeTruthy()
      const figure = match.closest('figure')
      expect(figure.style.aspectRatio).toBe(`${photo.width} / ${photo.height}`)
    }

    const cloneRow = container.querySelector('.gallery-marquee-clone')
    expect(cloneRow).toBeTruthy()
    expect(cloneRow.getAttribute('aria-hidden')).toBe('true')
  })

  it('falls back to the local image asset when Cloudinary fails to load', () => {
    render(<GalleryCarousel />)

    const firstPhoto = galleryPhotos[0]
    const img = screen.getAllByRole('img')[0]
    fireEvent.error(img)
    expect(img.getAttribute('src')).toBe(firstPhoto.fallbackSrc)
  })

  it('moves automatically with no navigation arrow buttons and no card captions', () => {
    const { container } = render(<GalleryCarousel />)

    expect(screen.queryByRole('button', { name: /previous|scroll left/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /next|scroll right/i })).toBeNull()
    expect(container.querySelector('[data-carousel="track"]')).toBeTruthy()
    expect(screen.queryByText(galleryPhotos[0].title)).toBeNull()
    expect(screen.queryByText(galleryPhotos[0].caption)).toBeNull()
  })

  it('applies edge fade via gallery-marquee-viewport and toggles pause control state', () => {
    const { container } = render(<GalleryCarousel />)

    const viewport = container.querySelector('[data-carousel="viewport"]')
    expect(viewport.className).toContain('gallery-marquee-viewport')

    const toggleBtn = screen.getByRole('button', { name: /pause gallery scrolling/i })
    fireEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /resume gallery scrolling/i }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /resume gallery scrolling/i }))
    expect(screen.getByRole('button', { name: /pause gallery scrolling/i }).getAttribute('aria-pressed')).toBe('false')
  })

  it('responds to hover and focus pause events on the track', () => {
    const { container } = render(<GalleryCarousel />)

    const track = container.querySelector('[data-carousel="track"]')
    fireEvent.mouseEnter(track)
    fireEvent.mouseLeave(track)
    fireEvent.focus(track)
    fireEvent.blur(track)
  })
})
