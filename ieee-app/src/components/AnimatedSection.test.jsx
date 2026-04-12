import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AnimatedSection from './AnimatedSection'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, whileInView, viewport, ...props }) => (
      <div
        data-animate={animate ?? ''}
        data-initial={initial ?? ''}
        data-viewport={viewport ? JSON.stringify(viewport) : ''}
        data-while-in-view={whileInView ?? ''}
        {...props}
      >
        {children}
      </div>
    ),
  },
}))

describe('AnimatedSection', () => {
  it('reveals content when it enters the viewport by default', () => {
    const { container } = render(
      <AnimatedSection>
        <span>Committee content</span>
      </AnimatedSection>,
    )

    const wrapper = container.firstElementChild

    expect(wrapper?.getAttribute('data-initial')).toBe('hidden')
    expect(wrapper?.getAttribute('data-while-in-view')).toBe('visible')
    expect(wrapper?.getAttribute('data-animate')).toBe('')
  })

  it('can reveal critical content immediately on mount', () => {
    const { container } = render(
      <AnimatedSection trigger="load">
        <span>Committee content</span>
      </AnimatedSection>,
    )

    const wrapper = container.firstElementChild

    expect(wrapper?.getAttribute('data-initial')).toBe('hidden')
    expect(wrapper?.getAttribute('data-animate')).toBe('visible')
    expect(wrapper?.getAttribute('data-while-in-view')).toBe('')
  })
})
