import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { boardMembers } from '../data/boardMembers'
import { committees } from '../data/committees'
import { findCommitteeLeaders } from '../data/presentation'
import CommitteesPage from './CommitteesPage'
import CommitteeDetailPage from './CommitteeDetailPage'

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const renderRoute = route => render(
  <MemoryRouter initialEntries={[route]}>
    <Routes>
      <Route path="/committees" element={<CommitteesPage />} />
      <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
    </Routes>
  </MemoryRouter>,
)

afterEach(cleanup)

describe('committee records', () => {
  it('keeps only the repository-backed committee fields', () => {
    expect(committees).toHaveLength(11)
    for (const committee of committees) {
      expect(Object.keys(committee).sort()).toEqual([
        'category',
        'categoryLabel',
        'memberCount',
        'name',
        'shortDescription',
        'slug',
      ])
    }
  })

  it('renders every committee as a numbered record grouped by category', () => {
    const { container } = renderRoute('/committees')

    expect(screen.getByRole('heading', { level: 1, name: 'Committee directory' })).toBeTruthy()
    expect(screen.getByLabelText('11 committee records')).toBeTruthy()
    const technical = screen.getByRole('heading', { level: 2, name: 'Technical committees' }).parentElement
    const nonTechnical = screen.getByRole('heading', { level: 2, name: 'Non-technical committees' }).parentElement
    const lists = screen.getAllByRole('list')

    expect(lists).toHaveLength(2)
    expect(lists[0].tagName).toBe('OL')
    expect(lists[0].getAttribute('start')).toBeNull()
    expect(lists[1].tagName).toBe('OL')
    expect(lists[1].getAttribute('start')).toBe('8')

    committees.forEach((committee, index) => {
      const link = screen.getByRole('link', { name: `View ${committee.name} committee record` })
      expect(link.getAttribute('href')).toBe(`/committees/${committee.slug}`)
      expect(link.classList.contains('min-h-11')).toBe(true)
      expect(link.classList.contains('items-center')).toBe(true)
      expect(within(link.closest('li')).getByText(String(index + 1).padStart(2, '0'))).toBeTruthy()
      expect((committee.category === 'technical' ? technical : nonTechnical).contains(link)).toBe(true)
    })
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('.card-hover')).toBeNull()
    expect(container.querySelector('.material-symbols-outlined')).toBeNull()
  })

  it('shows explicitly aliased leadership without managers or private contacts', () => {
    renderRoute('/committees')

    for (const name of [
      'Omar Raafat Hamed Abdelaziz',
      'Ahmed Hamdy',
      'Menna Allah Mohamed',
      'Adham Ahmad Hosny Mohammad',
      'Mariam Ahmed El-Neblawy',
    ]) expect(screen.getByText(name)).toBeTruthy()

    expect(screen.queryByText('Habiba Hamdy Aly Hassan')).toBeNull()
    expect(screen.queryByText(/Technical Software Manager|Technical Manager/i)).toBeNull()
    expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
    expect(screen.queryByRole('link', { name: /github|linkedin|email/i })).toBeNull()
    expect(screen.queryByText(/placeholder|slogan|turning intelligence|build motion/i)).toBeNull()
  })

  it('renders every detail route with exactly its explicitly supported leadership', () => {
    for (const committee of committees) {
      const expected = findCommitteeLeaders(committee.slug, boardMembers)
      const page = renderRoute(`/committees/${committee.slug}`)

      expect(screen.getByRole('heading', { level: 1, name: committee.name })).toBeTruthy()
      expect(screen.getByRole('heading', { level: 2, name: 'Mandate' })).toBeTruthy()
      expect(screen.getByText(committee.categoryLabel)).toBeTruthy()
      expect(screen.getByText(`${committee.memberCount} members`)).toBeTruthy()
      const backLink = screen.getByRole('link', { name: 'All committees' })
      expect(backLink.classList.contains('inline-flex')).toBe(true)
      expect(backLink.classList.contains('items-center')).toBe(true)
      expect(backLink.classList.contains('min-h-11')).toBe(true)
      expect(backLink.classList.contains('btn')).toBe(false)
      if (expected.length) {
        const leadership = screen.getByRole('heading', { level: 2, name: 'Leadership' }).parentElement
        expect(within(leadership).getAllByRole('listitem')).toHaveLength(expected.length)
        for (const leader of expected) {
          const item = within(leadership).getByText(leader.name).closest('li')
          expect(within(item).getByText(leader.position, { selector: 'p' })).toBeTruthy()
        }
      } else {
        expect(screen.queryByRole('heading', { name: 'Leadership' })).toBeNull()
      }
      expect(screen.queryByText(/Technical Software Manager|Technical Manager/i)).toBeNull()
      expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
      expect(page.container.querySelector('main')).toBeNull()
      page.unmount()
    }
  })

  it('does not infer cyber leadership from CS or DS roster labels', () => {
    for (const slug of ['cyber-defensive', 'cyber-offensive']) {
      const page = renderRoute(`/committees/${slug}`)
      expect(screen.queryByRole('heading', { name: 'Leadership' })).toBeNull()
      for (const member of boardMembers.filter(item => ['CS', 'DS'].includes(item.committee))) {
        expect(screen.queryByText(member.name)).toBeNull()
      }
      page.unmount()
    }
  })

  it('handles unknown committee routes', () => {
    renderRoute('/committees/not-a-committee')
    expect(screen.getByRole('heading', { level: 1, name: 'Committee not found' })).toBeTruthy()
    const backLink = screen.getByRole('link', { name: 'Back to committees' })
    expect(backLink.getAttribute('href')).toBe('/committees')
    expect(backLink.classList.contains('inline-flex')).toBe(true)
    expect(backLink.classList.contains('items-center')).toBe(true)
    expect(backLink.classList.contains('min-h-11')).toBe(true)
    expect(backLink.classList.contains('btn')).toBe(false)
  })
})
