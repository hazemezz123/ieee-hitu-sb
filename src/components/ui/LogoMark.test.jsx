import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LogoMark from './LogoMark'

describe('LogoMark', () => {
  it('renders the two brand paths', () => {
    const { container } = render(<LogoMark />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].getAttribute('fill')).toBe('#0e487f')
    expect(paths[1].getAttribute('fill')).toBe('#dcb656')
    expect(container.querySelector('svg').getAttribute('viewBox')).toBe('0 0 1095 1095')
  })
})
