import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import CommitteeDirectory from './CommitteeDirectory'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

vi.mock('@/features/committees/hooks/useCommittees', () => ({
  fetchCommitteesResult: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

describe('CommitteeDirectory Bento Grid', () => {
  beforeEach(() => {
    fetchCommitteesResult.mockResolvedValue({
      committees: [
        { slug: 'ai', name: 'AI', category: 'technical' },
        { slug: 'web', name: 'Web', category: 'technical' },
        { slug: 'cs', name: 'CS', category: 'technical' },
        { slug: 'ds', name: 'DS', category: 'technical' },
        { slug: 'cyber-defensive', name: 'Cyber Defensive', category: 'technical' },
        { slug: 'cyber-offensive', name: 'Cyber Offensive', category: 'technical' },
        { slug: 'embedded', name: 'Embedded', category: 'technical' },
        { slug: 'robotics', name: 'Robotics', category: 'technical' },
        { slug: 'automations', name: 'Automations', category: 'technical' },
        { slug: 'pr-oc', name: 'PR & OC', category: 'non-technical' },
        { slug: 'multi-media', name: 'Multi Media', category: 'non-technical' },
        { slug: 'marketing', name: 'Marketing', category: 'non-technical' },
        { slug: 'hr-td', name: 'HR - T&D', category: 'non-technical' },
      ],
      source: 'remote',
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section title, subtitle, and tabs', async () => {
    render(<CommitteeDirectory />)
    expect(screen.getByRole('heading', { level: 2, name: /committee directory/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /all committees/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /technical tracks/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /operations & media/i })).toBeTruthy()
  })

  it('renders responsive bento grid structure and dark mode styling', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeTruthy()
    })
    const panel = screen.getByRole('tabpanel')
    expect(panel.className).toContain('grid-cols-1')
    expect(panel.className).toContain('md:grid-cols-3')
    expect(panel.className).toContain('lg:grid-cols-4')

    const aiArticle = screen.getByText('AI').closest('article')
    expect(aiArticle.className).toContain('md:col-span-2')
    expect(aiArticle.className).toContain('rounded-2xl')
    expect(aiArticle.className).toContain('bg-[#0b1324]')
  })

  it('renders all 13 committees by default', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeTruthy()
      expect(screen.getByText('Web')).toBeTruthy()
      expect(screen.getByText('PR & OC')).toBeTruthy()
    })
    const links = screen.getAllByRole('link', { name: /view|learn more/i })
    expect(links.length).toBeGreaterThanOrEqual(13)
  })

  it('renders featured cards with tech tags and learn more action', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('PyTorch')).toBeTruthy()
      expect(screen.getByText('Next.js')).toBeTruthy()
    })
    const aiLearnMore = screen.getByRole('link', { name: /learn more about ai/i })
    expect(aiLearnMore.getAttribute('href')).toBe('/committees/ai')

    const webLearnMore = screen.getByRole('link', { name: /learn more about web/i })
    expect(webLearnMore.getAttribute('href')).toBe('/committees/web')
  })

  it('filters to technical committees when Technical Tracks tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeTruthy()
    })
    const techTab = screen.getByRole('tab', { name: /technical tracks/i })
    fireEvent.click(techTab)

    expect(screen.getByText('AI')).toBeTruthy()
    expect(screen.getByText('Web')).toBeTruthy()
    expect(screen.getByText('CS')).toBeTruthy()
    expect(screen.queryByText('PR & OC')).toBeNull()
    expect(screen.queryByText('Marketing')).toBeNull()
  })

  it('filters to operations & media committees when Operations & Media tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('PR & OC')).toBeTruthy()
    })
    const opsTab = screen.getByRole('tab', { name: /operations & media/i })
    fireEvent.click(opsTab)

    expect(screen.getByText('PR & OC')).toBeTruthy()
    expect(screen.getByText('Multi Media')).toBeTruthy()
    expect(screen.getByText('Marketing')).toBeTruthy()
    expect(screen.getByText('HR - T&D')).toBeTruthy()
    expect(screen.queryByText('AI')).toBeNull()
    expect(screen.queryByText('Web')).toBeNull()
  })
})
