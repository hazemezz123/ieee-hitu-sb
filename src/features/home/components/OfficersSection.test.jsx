import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import OfficersSection, { ChairwomanCard, SocialLinks } from './OfficersSection'
import { officers } from '../data/officers'

afterEach(cleanup)

describe('officers section', () => {
  it('renders every officer with name, role, and portrait', () => {
    render(<OfficersSection />)

    expect(screen.getByRole('heading', { level: 2, name: 'Meet the officers' })).toBeTruthy()

    for (const officer of officers) {
      expect(screen.getByRole('heading', { level: 3, name: officer.name })).toBeTruthy()
      expect(screen.getByText(officer.role)).toBeTruthy()
      const img = screen.getByRole('img', { name: officer.alt })
      expect(img.getAttribute('src')).toBe(officer.img)
      expect(img.getAttribute('loading')).toBe('lazy')
    }
  })

  it('covers the five published executive roles', () => {
    render(<OfficersSection />)

    expect(officers.map(officer => officer.role).sort()).toEqual(['Chairwoman', 'Secretary', 'Treasurer', 'Vice Chair', 'Webmaster'])
    expect(screen.getAllByRole('img')).toHaveLength(officers.length)
  })

  it('replaces a failed portrait with initials instead of a broken image', () => {
    render(<OfficersSection />)

    fireEvent.error(screen.getByRole('img', { name: /rania elrediny/i }))
    expect(screen.queryByRole('img', { name: /rania elrediny/i })).toBeNull()
    expect(screen.getByText('RE')).toBeTruthy()
  })

  it('shows initials when a portrait failed before React attached its error handler', () => {
    // A missing file 404s as soon as the browser parses the HTML, usually
    // before hydration attaches onError, so the image is already broken on
    // mount: complete=true and naturalWidth=0.
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    const naturalWidth = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0)

    try {
      render(<OfficersSection />)

      expect(screen.queryByRole('img', { name: /mariam/i })).toBeNull()
      expect(screen.getByText('MA')).toBeTruthy()
    } finally {
      complete.mockRestore()
      naturalWidth.mockRestore()
    }
  })

  it('renders the chairwoman bio only when one is set', () => {
    const chairwoman = officers[0]
    const { rerender } = render(<ul><ChairwomanCard officer={{ ...chairwoman, bio: 'Leading the branch.' }} /></ul>)

    const cardWithBio = screen.getByRole('heading', { level: 3, name: chairwoman.name }).closest('li')
    expect(within(cardWithBio).getByText('Leading the branch.')).toBeTruthy()

    rerender(<ul><ChairwomanCard officer={chairwoman} /></ul>)

    const cardWithoutBio = screen.getByRole('heading', { level: 3, name: chairwoman.name }).closest('li')
    expect(within(cardWithoutBio).queryByText('Leading the branch.')).toBeNull()
    // Only the role paragraph: no empty bio <p> and no placeholder when bio is absent.
    expect(within(cardWithoutBio).getAllByRole('paragraph')).toHaveLength(1)
  })

  it('renders only the social links that have a URL', () => {
    render(
      <SocialLinks
        name="Test Officer"
        socials={{ linkedin: 'https://example.com/in/test', github: '', email: 'mailto:test@example.com' }}
      />
    )

    const linkedin = screen.getByRole('link', { name: 'LinkedIn - Test Officer' })
    expect(linkedin.getAttribute('href')).toBe('https://example.com/in/test')
    expect(linkedin.getAttribute('target')).toBe('_blank')
    expect(linkedin.getAttribute('rel')).toBe('noopener noreferrer')

    const email = screen.getByRole('link', { name: 'Email - Test Officer' })
    expect(email.getAttribute('href')).toBe('mailto:test@example.com')
    expect(email.hasAttribute('target')).toBe(false)

    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('renders no icon row when socials are missing or empty', () => {
    const { container, rerender } = render(<SocialLinks name="Test Officer" />)
    expect(container.childElementCount).toBe(0)

    rerender(<SocialLinks name="Test Officer" socials={{}} />)
    expect(container.childElementCount).toBe(0)
  })

  it('shows an officer social icons under the role when links exist', () => {
    render(<OfficersSection />)

    const linkedin = screen.getByRole('link', { name: 'LinkedIn - Rania Elrediny' })
    expect(linkedin.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('link', { name: 'Email - Rania Elrediny' })).toBeTruthy()

    const role = screen.getByText('Treasurer')
    expect(role.compareDocumentPosition(linkedin) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const mariam = screen.getByRole('link', { name: 'LinkedIn - Mariam Almahdi' })
    expect(mariam.getAttribute('href')).toBe('https://www.linkedin.com/in/mariam-mostafa06/')
    expect(mariam.getAttribute('target')).toBe('_blank')
  })

  it('renders no social row when the officer has no links', () => {
    render(<ul><ChairwomanCard officer={{ ...officers[0], socials: {} }} /></ul>)

    const card = screen.getByRole('heading', { level: 3, name: 'Mariam Almahdi' }).closest('li')
    expect(within(card).queryAllByRole('link')).toHaveLength(0)
  })

  it('anchors the blue corner wedge to the right edge of the chairwoman card', () => {
    render(<OfficersSection />)

    const chairCard = screen.getByRole('heading', { level: 3, name: 'Mariam Almahdi' }).closest('li')
    const chairArticle = chairCard.querySelector('article')
    const chairNotch = chairArticle.querySelector('.wedge-notch')
    // Card corner, not the portrait corner (the portrait sits mid-card in the row layout).
    expect(chairNotch.parentElement).toBe(chairArticle)
    expect(chairArticle.querySelector('img').classList.contains('wedge-frame')).toBe(false)

    // Regular cards normalize portraits in a gradient frame flush to the
    // bottom edge instead of the photo-corner cut.
    const regularArticle = screen.getByRole('heading', { level: 3, name: 'Adham Ahmed' }).closest('li').querySelector('article')
    expect(regularArticle.querySelector('img').classList.contains('wedge-frame')).toBe(false)
    expect(regularArticle.querySelector('[data-portrait="frame"]').className).not.toContain('bg-gradient')
    expect(regularArticle.querySelector('.wedge-notch')).toBeNull()
  })
})
