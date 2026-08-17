import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AnimatedSection from './AnimatedSection'

let observerInstance
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    observerInstance = this
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

const withObserver = fn => {
  const original = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = MockIntersectionObserver
  try { return fn() } finally { globalThis.IntersectionObserver = original }
}

describe('AnimatedSection', () => {
  it('is hidden until the observer reports it entering the viewport', () => {
    withObserver(() => {
      const { container } = render(
        <AnimatedSection>
          <span>Committee content</span>
        </AnimatedSection>,
      )
      const wrapper = container.firstElementChild
      expect(wrapper?.className).not.toContain('is-visible')

      act(() => observerInstance.callback([{ isIntersecting: true }]))
      expect(wrapper?.className).toContain('is-visible')
    })
  })

  it('renders immediately when trigger is load', () => {
    const { container } = render(
      <AnimatedSection trigger="load">
        <span>Critical content</span>
      </AnimatedSection>,
    )
    expect(container.firstElementChild?.className).toContain('is-visible')
  })

  it('renders children without extra landmarks', () => {
    withObserver(() => {
      const { container } = render(
        <AnimatedSection>
          <span>Content</span>
        </AnimatedSection>,
      )
      expect(container.querySelector('main, .section-label')).toBeNull()
    })
  })
})
