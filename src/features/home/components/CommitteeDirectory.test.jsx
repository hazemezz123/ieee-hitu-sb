import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react'
import CommitteeDirectory from './CommitteeDirectory'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import { committees as staticCommittees } from '@/features/committees/data/committees'

vi.mock('@/features/committees/hooks/useCommittees', () => ({
  fetchCommitteesResult: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

describe('CommitteeDirectory interactive directory', () => {
  beforeEach(() => {
    fetchCommitteesResult.mockResolvedValue({
      committees: staticCommittees,
      source: 'remote',
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section heading, category tabs with counts, and theme-aware surfaces', () => {
    const { container } = render(<CommitteeDirectory />)

    const section = container.querySelector('section')
    expect(section.className).toContain('bg-surface')
    expect(section.className).not.toContain('bg-[#070d18]')

    expect(screen.getByRole('heading', { level: 2, name: /find where you belong\./i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /technical committees \(12\)/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /non-technical committees \(7\)/i })).toBeTruthy()

    const exploreAll = screen.getByRole('link', { name: /explore all 19 committees/i })
    expect(exploreAll.getAttribute('href')).toBe('/committees')
  })

  it('updates the spotlight panel when selecting another committee', async () => {
    const { container } = render(<CommitteeDirectory />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /web development/i })).toBeTruthy()
    })

    const webBtn = screen.getByRole('button', { name: /web development/i })
    fireEvent.click(webBtn)

    expect(webBtn.getAttribute('aria-pressed')).toBe('true')
    const spotlight = container.querySelector('[data-committee="spotlight"]')
    expect(within(spotlight).getByRole('heading', { level: 3, name: 'Web Development' })).toBeTruthy()
    const detailLink = within(spotlight).getByRole('link', { name: /view web development/i })
    expect(detailLink.getAttribute('href')).toBe('/committees/web-development')
  })

  it('filters between technical and non-technical categories via click and keyboard arrows', async () => {
    const { container } = render(<CommitteeDirectory />)

    const techTab = screen.getByRole('tab', { name: /^technical committees/i })
    const nonTechTab = screen.getByRole('tab', { name: /^non-technical committees/i })

    expect(techTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /automation/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /logistics & events/i })).toBeNull()

    fireEvent.keyDown(techTab, { key: 'ArrowRight' })
    expect(nonTechTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /^hr$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /logistics & events/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /automation/i })).toBeNull()

    const spotlight = container.querySelector('[data-committee="spotlight"]')
    expect(within(spotlight).getByRole('heading', { level: 3, name: 'HR' })).toBeTruthy()

    fireEvent.click(techTab)
    expect(techTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /artificial intelligence/i })).toBeTruthy()
  })

  it('applies custom icon overrides returned from remote committees', async () => {
    fetchCommitteesResult.mockResolvedValue({
      committees: [
        {
          slug: 'flutter',
          name: 'Flutter',
          category: 'technical',
          categoryLabel: 'Technical',
          shortDescription: 'Cross-platform mobile apps.',
          icon: 'https://cdn.example.com/flutter.png',
        },
      ],
      source: 'remote',
    })
    const { container } = render(<CommitteeDirectory />)
    await waitFor(() => {
      const img = container.querySelector('img[src="https://cdn.example.com/flutter.png"]')
      expect(img).toBeTruthy()
    })
  })
})
