import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import EventRecord from './EventRecord'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(cleanup)

describe('EventRecord home images', () => {
  it('renders the card image for a home event record', () => {
    render(<EventRecord event={{ title: 'Later Event', date: '2026-10-01T10:00:00Z', slug: 'later', cardImage: '/later-card.jpg', coverImage: '/later-cover.jpg', excerpt: 'Later' }} />)
    const img = screen.getByRole('img', { name: 'Later Event' })
    expect(img.getAttribute('src')).toBe('/later-card.jpg')
  })

  it('falls back to the cover image when no card image exists', () => {
    render(<EventRecord event={{ title: 'Cover Event', date: '2026-10-01T10:00:00Z', slug: 'cover', coverImage: '/cover.jpg', excerpt: 'Hi' }} />)
    expect(screen.getByRole('img', { name: 'Cover Event' }).getAttribute('src')).toBe('/cover.jpg')
  })

  it('omits media when the event has no images', () => {
    const { container } = render(<EventRecord event={{ title: 'No Image', date: '2026-10-01T10:00:00Z', slug: 'no-image', excerpt: 'Hi' }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('replaces a failed home image with an unavailable placeholder', () => {
    render(<EventRecord event={{ title: 'Broken', date: '2026-10-01T10:00:00Z', slug: 'broken', coverImage: '/broken.jpg' }} />)
    fireEvent.error(screen.getByRole('img', { name: 'Broken' }))
    expect(screen.queryByRole('img', { name: 'Broken' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Broken image unavailable' })).toBeTruthy()
  })
})
