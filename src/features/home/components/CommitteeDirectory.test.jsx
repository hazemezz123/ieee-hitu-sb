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
        { slug: 'automation', name: 'Automation', category: 'technical' },
        { slug: 'iot', name: 'IoT', category: 'technical' },
        { slug: 'cyber-security-defensive', name: 'Cyber Security (Defensive)', category: 'technical' },
        { slug: 'embedded', name: 'Embedded', category: 'technical' },
        { slug: 'pcb-design', name: 'PCB Design', category: 'technical' },
        { slug: 'solidworks', name: 'SolidWorks', category: 'technical' },
        { slug: 'web-development', name: 'Web Development', category: 'technical' },
        { slug: 'mobile-application', name: 'Mobile Application', category: 'technical' },
        { slug: 'flutter', name: 'Flutter', category: 'technical' },
        { slug: 'artificial-intelligence', name: 'Artificial Intelligence', category: 'technical' },
        { slug: 'cyber-security-offensive', name: 'Cyber Security (Offensive)', category: 'technical' },
        { slug: 'problem-solving', name: 'Problem Solving', category: 'technical' },
        { slug: 'hr', name: 'HR', category: 'non-technical' },
        { slug: 'marketing', name: 'Marketing', category: 'non-technical' },
        { slug: 'people-culture', name: 'People & Culture', category: 'non-technical' },
        { slug: 'logistics-events', name: 'Logistics & Events', category: 'non-technical' },
        { slug: 'public-relations-fundraising', name: 'Public Relations & Fundraising', category: 'non-technical' },
        { slug: 'graphic-design', name: 'Graphic Design', category: 'non-technical' },
        { slug: 'content-creation', name: 'Content Creation', category: 'non-technical' },
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
    expect(screen.getByRole('tab', { name: /^technical committees$/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /^non-technical committees$/i })).toBeTruthy()
  })

  it('renders responsive bento grid structure and dark mode styling', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('Artificial Intelligence')).toBeTruthy()
    })
    const panel = screen.getByRole('tabpanel')
    expect(panel.className).toContain('grid-cols-1')
    expect(panel.className).toContain('md:grid-cols-3')
    expect(panel.className).toContain('lg:grid-cols-4')

    const aiArticle = screen.getByText('Artificial Intelligence').closest('article')
    expect(aiArticle.className).toContain('md:col-span-2')
    expect(aiArticle.className).toContain('rounded-2xl')
    expect(aiArticle.className).toContain('bg-[#0b1324]')
  })

  it('renders all 19 committees by default', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('Artificial Intelligence')).toBeTruthy()
      expect(screen.getByText('Web Development')).toBeTruthy()
      expect(screen.getByText('Logistics & Events')).toBeTruthy()
    })
    const links = screen.getAllByRole('link', { name: /view|learn more/i })
    expect(links.length).toBeGreaterThanOrEqual(19)
  })

  it('renders featured cards with tech tags and learn more action', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('PyTorch')).toBeTruthy()
      expect(screen.getByText('Next.js')).toBeTruthy()
    })
    const aiLearnMore = screen.getByRole('link', { name: /learn more about artificial intelligence/i })
    expect(aiLearnMore.getAttribute('href')).toBe('/committees/artificial-intelligence')

    const webLearnMore = screen.getByRole('link', { name: /learn more about web development/i })
    expect(webLearnMore.getAttribute('href')).toBe('/committees/web-development')
  })

  it('filters to technical committees when Technical Committees tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('Artificial Intelligence')).toBeTruthy()
    })
    const techTab = screen.getByRole('tab', { name: /^technical committees$/i })
    fireEvent.click(techTab)

    expect(screen.getByText('Artificial Intelligence')).toBeTruthy()
    expect(screen.getByText('Web Development')).toBeTruthy()
    expect(screen.getByText('Automation')).toBeTruthy()
    expect(screen.getByText('IoT')).toBeTruthy()
    expect(screen.getByText('Cyber Security (Defensive)')).toBeTruthy()
    expect(screen.getByText('Problem Solving')).toBeTruthy()
    expect(screen.queryByText('Logistics & Events')).toBeNull()
    expect(screen.queryByText('Marketing')).toBeNull()
  })

  it('filters to non-technical committees when Non-Technical Committees tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('Logistics & Events')).toBeTruthy()
    })
    const nonTechTab = screen.getByRole('tab', { name: /^non-technical committees$/i })
    fireEvent.click(nonTechTab)

    expect(screen.getByText('HR')).toBeTruthy()
    expect(screen.getByText('Marketing')).toBeTruthy()
    expect(screen.getByText('People & Culture')).toBeTruthy()
    expect(screen.getByText('Logistics & Events')).toBeTruthy()
    expect(screen.getByText('Public Relations & Fundraising')).toBeTruthy()
    expect(screen.getByText('Graphic Design')).toBeTruthy()
    expect(screen.getByText('Content Creation')).toBeTruthy()
    expect(screen.queryByText('Artificial Intelligence')).toBeNull()
    expect(screen.queryByText('Web Development')).toBeNull()
  })

  it('applies custom icon overrides returned from remote committees', async () => {
    fetchCommitteesResult.mockResolvedValue({
      committees: [
        { slug: 'flutter', name: 'Flutter', category: 'technical', icon: 'https://cdn.example.com/flutter.png' },
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
