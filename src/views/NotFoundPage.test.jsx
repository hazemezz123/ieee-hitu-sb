import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NotFoundPage from './NotFoundPage'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

afterEach(cleanup)

describe('not found page', () => {
  it('shows a 404 message and a link back home', () => {
    render(<NotFoundPage />)

    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    const home = screen.getByRole('link', { name: 'Back to home' })
    expect(home.getAttribute('href')).toBe('/')
  })

  it('renders the not-found content for unknown routes', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
  })
})