import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import NotFoundPage from './NotFoundPage'

afterEach(cleanup)

describe('not found page', () => {
  it('shows a 404 message and a link back home', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)

    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    const home = screen.getByRole('link', { name: 'Back to home' })
    expect(home.getAttribute('href')).toBe('/')
  })

  it('is reached through the catch-all route', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
  })
})