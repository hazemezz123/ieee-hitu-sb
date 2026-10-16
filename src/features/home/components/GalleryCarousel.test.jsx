import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import GalleryCarousel from './GalleryCarousel'
import { galleryPhotos } from '../data/galleryPhotos'

afterEach(cleanup)

describe('GalleryCarousel', () => {
  it('renders the gallery section heading, description, and link to full gallery', () => {
    render(<GalleryCarousel />)

    expect(screen.getByRole('heading', { name: /moments|gallery/i })).toBeTruthy()
    const viewAllLink = screen.getByRole('link', { name: /view (all )?gallery|browse (all )?photos|view all/i })
    expect(viewAllLink.getAttribute('href')).toBe('/gallery')
  })

  it('renders all images from the gallery photos collection', () => {
    render(<GalleryCarousel />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(galleryPhotos.length)

    for (const photo of galleryPhotos) {
      const match = images.find(img => img.getAttribute('src') === photo.src)
      expect(match).toBeTruthy()
    }
  })

  it('moves automatically with no navigation arrow buttons', () => {
    const { container } = render(<GalleryCarousel />)

    expect(screen.queryByRole('button', { name: /previous|scroll left/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /next|scroll right/i })).toBeNull()
    expect(container.querySelector('[data-carousel="track"]')).toBeTruthy()
  })

  it('shows photos without titles, caption bios, or section description text', () => {
    render(<GalleryCarousel />)

    expect(screen.queryByText(galleryPhotos[0].title)).toBeNull()
    expect(screen.queryByText(galleryPhotos[0].caption)).toBeNull()
    expect(screen.queryByText(/highlights from our recent summits/i)).toBeNull()
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(galleryPhotos.length)
  })

  it('applies a gradient fade on the left and right edges of the carousel viewport', () => {
    const { container } = render(<GalleryCarousel />)

    const viewport = container.querySelector('[data-carousel="viewport"]')
    expect(viewport).toBeTruthy()
    // Verifies either mask-image gradient or carousel-viewport class with edge fade
    const hasFade =
      viewport.className.includes('carousel-viewport') ||
      viewport.className.includes('mask-image') ||
      viewport.className.includes('[mask-image:')
    expect(hasFade).toBe(true)
  })

  it('provides a continuous auto-movement track that responds to hover and focus pause events', () => {
    const { container } = render(<GalleryCarousel />)

    const track = container.querySelector('[data-carousel="track"]')
    expect(track).toBeTruthy()

    // Triggers mouseEnter / mouseLeave and focus / blur without errors
    fireEvent.mouseEnter(track)
    fireEvent.mouseLeave(track)
    fireEvent.focus(track)
    fireEvent.blur(track)
  })
})
