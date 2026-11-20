import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CommitteeIcon from './CommitteeIcon'
import { committees } from '@/features/committees/data/committees'

afterEach(cleanup)

describe('CommitteeIcon', () => {
  it('renders a distinct custom SVG icon for every canonical committee', () => {
    const markups = new Set()
    for (const committee of committees) {
      const { container, unmount } = render(<CommitteeIcon slug={committee.slug} className="h-6 w-6" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      markups.add(svg.innerHTML)
      unmount()
    }
    expect(markups.size).toBe(committees.length)
  })

  it('renders the default fallback SVG for unknown slugs', () => {
    const { container } = render(<CommitteeIcon slug="unknown-committee" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses the custom icon image when provided and falls back to SVG on error', () => {
    const { container } = render(<CommitteeIcon slug="flutter" icon="https://cdn.example.com/flutter.svg" className="h-6 w-6" />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://cdn.example.com/flutter.svg')
    expect(img.className).toContain('object-contain')

    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
