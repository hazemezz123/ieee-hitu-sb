import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CommitteeVisual from './CommitteeVisual'
import { committees } from '@/features/committees/data/committees'

afterEach(cleanup)

describe('CommitteeVisual', () => {
  it('renders a distinct custom SVG visual for every canonical committee', () => {
    const markups = new Set()
    for (const committee of committees) {
      const { container, unmount } = render(<CommitteeVisual slug={committee.slug} className="h-full w-full" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      markups.add(svg.innerHTML)
      unmount()
    }
    expect(markups.size).toBe(committees.length)
  })

  it('renders the default fallback visual for unknown slugs', () => {
    const { container } = render(<CommitteeVisual slug="unknown-committee" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses custom icon override image when provided and falls back to SVG on error', () => {
    const { container } = render(<CommitteeVisual slug="solidworks" icon="https://cdn.example.com/solidworks.png" className="h-full w-full" />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://cdn.example.com/solidworks.png')

    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
