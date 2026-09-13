import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Lightbox from './Lightbox'
import MasonryGallery from './MasonryGallery'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

const images = [
  { src: '/one.jpg', caption: 'Opening remarks', eventTitle: 'Robotics Day', eventDate: '2026-09-01T23:30:00Z' },
  { src: '/two.jpg', caption: 'Robot demonstration', eventTitle: 'Robotics Day', eventDate: '2026-09-01T23:30:00Z' },
]

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

describe('Lightbox', () => {
  it('presents descriptive image metadata and focuses close', () => {
    render(<Lightbox images={images} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Robotics Day photo' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Opening remarks' })).toBeTruthy()
    expect(screen.getByText('Opening remarks')).toBeTruthy()
    expect(screen.getByText('Robotics Day')).toBeTruthy()
    expect(screen.getByText('September 1, 2026')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/i }))
  })

  it('delegates keyboard and visible control navigation', () => {
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(<Lightbox images={images} currentIndex={0} onClose={onClose} onNavigate={onNavigate} />)

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onNavigate.mock.calls).toEqual([[-1], [1], [-1], [1]])
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('contains forward and reverse tab focus among visible controls', () => {
    render(<Lightbox images={images} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    const close = screen.getByRole('button', { name: /close/i })
    const previous = screen.getByRole('button', { name: /previous/i })
    const next = screen.getByRole('button', { name: /next/i })

    next.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    close.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(next)
    previous.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(previous)
  })

  it('returns outside focus to the focus trap boundary', () => {
    render(<Lightbox images={images} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/i }))
    outside.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /next/i }))
    outside.remove()
  })

  it('omits navigation for one image and keeps focus on close', () => {
    const onNavigate = vi.fn()
    render(<Lightbox images={images.slice(0, 1)} currentIndex={0} onClose={vi.fn()} onNavigate={onNavigate} />)

    expect(screen.queryByRole('button', { name: /previous|next/i })).toBeNull()
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(onNavigate).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/i }))
  })

  it('restores the exact overflow and trigger focus on unmount', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'clip'

    const { unmount } = render(<Lightbox images={images} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()

    expect(document.body.style.overflow).toBe('clip')
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('closes from the backdrop but not dialog content', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} currentIndex={0} onClose={onClose} onNavigate={vi.fn()} />)

    fireEvent.click(screen.getByRole('img', { name: 'Opening remarks' }))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders safely when images or the current index change', () => {
    const props = { onClose: vi.fn(), onNavigate: vi.fn() }
    document.body.style.overflow = 'clip'
    const { rerender } = render(<Lightbox images={images} currentIndex={1} {...props} />)
    expect(screen.getByRole('img', { name: 'Robot demonstration' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Lightbox images={images.slice(0, 1)} currentIndex={1} {...props} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('clip')
    rerender(<Lightbox images={images.slice(0, 1)} currentIndex={0} {...props} />)
    expect(screen.getByRole('img', { name: 'Opening remarks' })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('uses a neutral fallback for broken media and resets it for another image', () => {
    const props = { onClose: vi.fn(), onNavigate: vi.fn() }
    const { rerender } = render(<Lightbox images={images} currentIndex={0} {...props} />)
    fireEvent.error(screen.getByRole('img', { name: 'Opening remarks' }))

    expect(screen.queryByRole('img', { name: 'Opening remarks' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Opening remarks image unavailable' })).toBeTruthy()
    rerender(<Lightbox images={images} currentIndex={1} {...props} />)
    expect(screen.getByRole('img', { name: 'Robot demonstration' })).toBeTruthy()
    expect(screen.queryByRole('img', { name: /image unavailable/i })).toBeNull()
  })

  it('keeps broken media within a narrow viewport', () => {
    const { container } = render(<Lightbox images={images} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    fireEvent.error(screen.getByRole('img', { name: 'Opening remarks' }))

    expect(container.querySelector('figure').classList).toContain('px-4')
    const fallback = screen.getByRole('img', { name: 'Opening remarks image unavailable' })
    expect(fallback.classList).toContain('w-64')
    expect(fallback.classList).toContain('max-w-full')
    expect(fallback.classList).not.toContain('min-w-64')
  })

  it('resets broken media when the source changes at the same index', () => {
    const props = { currentIndex: 0, onClose: vi.fn(), onNavigate: vi.fn() }
    const { rerender } = render(<Lightbox images={images.slice(0, 1)} {...props} />)
    fireEvent.error(screen.getByRole('img', { name: 'Opening remarks' }))

    rerender(<Lightbox images={[{ ...images[0], src: '/replacement.jpg', caption: 'Replacement photo' }]} {...props} />)
    expect(screen.getByRole('img', { name: 'Replacement photo' }).getAttribute('src')).toBe('/replacement.jpg')
  })

  it('handles undefined images without locking the page', () => {
    document.body.style.overflow = 'clip'
    render(<Lightbox images={undefined} currentIndex={0} onClose={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('clip')
  })
})

describe('MasonryGallery integration', () => {
  const renderGallery = (galleryImages, props = {}) => render(<MasonryGallery images={galleryImages} {...props} />)

  it('keeps repeated image sources independently actionable and uses stable headings', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const repeated = [
      { ...images[0], src: '/same.jpg', eventSlug: 'robotics-day' },
      { ...images[1], src: '/same.jpg', eventSlug: 'robotics-day' },
    ]
    renderGallery(repeated)
    const thumbnails = screen.getAllByRole('img')
    fireEvent.error(thumbnails[0])

    expect(screen.getByRole('img', { name: 'Opening remarks image unavailable' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Robot demonstration' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Open Opening remarks' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open Robot demonstration' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i)
    consoleError.mockRestore()
  })

  it('keeps exact duplicate occurrences independently keyed', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const duplicate = { ...images[0], src: '/same.jpg', eventSlug: 'robotics-day' }
    renderGallery([duplicate, { ...duplicate }])
    fireEvent.error(screen.getAllByRole('img', { name: 'Opening remarks' })[0])

    expect(screen.getAllByRole('img', { name: 'Opening remarks' })).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Opening remarks image unavailable' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Open Opening remarks' })).toHaveLength(1)
    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i)
    consoleError.mockRestore()
  })

  it('supports an explicit archive heading level', () => {
    renderGallery(images.slice(0, 1), { headingLevel: 2 })
    expect(screen.getByRole('heading', { level: 2, name: 'Robotics Day' })).toBeTruthy()
  })

  it.each([
    ['Escape', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['backdrop', dialog => fireEvent.click(dialog)],
  ])('restores trigger focus and overflow after %s close', (_, close) => {
    document.body.style.overflow = 'clip'
    renderGallery(images.slice(0, 1))
    const trigger = screen.getByRole('button', { name: 'Open Opening remarks' })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')

    close(dialog)

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('clip')
  })
})
