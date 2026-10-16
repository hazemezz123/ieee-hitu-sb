import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Footer from './footer'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(cleanup)

describe('Footer', () => {
  it('links the branch Facebook, Instagram, and LinkedIn profiles', () => {
    render(<Footer />)

    const socials = {
      Facebook: 'https://www.facebook.com/ieeehitusb',
      Instagram: 'https://www.instagram.com/ieee.hitu.sb/',
      LinkedIn: 'https://www.linkedin.com/company/hitu-ieee-sb/posts/',
    }

    for (const [name, href] of Object.entries(socials)) {
      const link = screen.getByRole('link', { name })
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })
})
