import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CommitteeDirectory from './CommitteeDirectory'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

const REAL_SLUGS = ['cs', 'ai', 'embedded', 'cyber-defensive', 'web', 'cyber-offensive', 'robotics', 'automations', 'ds', 'pr-oc', 'multi-media', 'marketing', 'hr-td']
const committees = REAL_SLUGS.map((slug, i) => ({
  slug,
  name: `Committee ${i}`,
  category: i < 9 ? 'technical' : 'non-technical',
  categoryLabel: i < 9 ? 'Technical' : 'Non-Technical',
  shortDescription: `About committee ${i}.`,
}))

const { fetchCommitteesResult } = vi.hoisted(() => ({ fetchCommitteesResult: vi.fn() }))

vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult }))

beforeEach(() => {
  fetchCommitteesResult.mockReset()
  fetchCommitteesResult.mockResolvedValue({ committees, source: 'remote' })
})

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('CommitteeDirectory constellation', () => {
  it('renders 13 wired nodes as accessible links with hub count and directory entry', async () => {
    const { container } = render(<CommitteeDirectory />)

    expect(await screen.findByRole('heading', { name: /committee directory/i })).toBeTruthy()
    for (const committee of committees) {
      const link = screen.getByRole('link', { name: `${committee.name} committee` })
      expect(link.getAttribute('href')).toBe(`/committees/${committee.slug}`)
      expect(link.querySelector('svg')).toBeTruthy()
    }
    expect(screen.getByText('13')).toBeTruthy()
    expect(screen.getByRole('link', { name: /open directory/i }).getAttribute('href')).toBe('/committees')
    // 13 hub spokes + 14 mesh edges
    expect(container.querySelectorAll('[data-edge]').length).toBe(27)
  })

  it('shows the committee description in a tooltip per node', async () => {
    const { container } = render(<CommitteeDirectory />)
    await screen.findByTestId('committee-constellation')

    const tips = container.querySelectorAll('.const-tooltip')
    expect(tips.length).toBe(13)
    expect(tips[0].textContent).toMatch(/About committee 0/)
  })

  it('highlights only the hovered node edges', async () => {
    const { container } = render(<CommitteeDirectory />)
    await screen.findByTestId('committee-constellation')

    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Committee 0 committee' }))
    const active = container.querySelectorAll('.const-edge-active')
    expect(active.length).toBeGreaterThan(0)
    for (const edge of active) {
      // Committee 0 has slug 'cs'; every active edge must touch it
      expect(edge.getAttribute('data-edge')).toMatch(/(^|\s)cs(\s|$)/)
    }
    fireEvent.mouseLeave(screen.getByRole('link', { name: 'Committee 0 committee' }))
    expect(container.querySelectorAll('.const-edge-active').length).toBe(0)
  })

  it('renders the final layout statically under reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    render(<CommitteeDirectory />)

    expect(await screen.findByTestId('committee-constellation')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Committee 0 committee' })).toBeTruthy()
  })

  it('reports load failure without the panel', async () => {
    fetchCommitteesResult.mockRejectedValueOnce(new Error('offline'))
    render(<CommitteeDirectory />)

    await waitFor(() => expect(screen.getByText(/could not be loaded/i)).toBeTruthy())
    expect(screen.queryByTestId('committee-constellation')).toBeNull()
  })
})
