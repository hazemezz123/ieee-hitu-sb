// src/lib/recruitmentClient.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
const ok = payload => ({ ok: true, json: async () => payload })

describe('recruitment client', () => {
  it('fetches a form and submits an application', async () => {
    const { fetchRecruitmentForm, submitApplication } = await import('./recruitment.js')
    fetchMock.mockResolvedValueOnce(ok({ form: { slug: 'heads' } }))
    expect((await fetchRecruitmentForm('heads')).slug).toBe('heads')
    fetchMock.mockResolvedValueOnce(ok({ id: 7 }))
    expect(await submitApplication('heads', { name: 'A' })).toBe(7)
  })
})
