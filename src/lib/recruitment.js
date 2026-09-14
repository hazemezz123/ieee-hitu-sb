// src/lib/recruitment.js
import { api } from './apiClient'

export async function fetchRecruitmentForms() {
  const { forms } = await api('/api/recruitment/forms')
  return forms
}

export async function fetchRecruitmentForm(slug) {
  const { form } = await api(`/api/recruitment/forms/${encodeURIComponent(slug)}`)
  return form
}

export async function updateRecruitmentForm(slug, patch) {
  await api(`/api/recruitment/forms/${encodeURIComponent(slug)}`, { method: 'PUT', body: patch })
}

export async function submitApplication(formSlug, data) {
  const { id } = await api('/api/recruitment/applications', { method: 'POST', body: { formSlug, data } })
  return id
}

export async function fetchApplications(form = 'heads', { q = '', pref = '' } = {}) {
  const params = new URLSearchParams({ form, q, pref })
  const { applications } = await api(`/api/recruitment/applications?${params}`)
  return applications
}

export async function fetchApplication(id) {
  const { application } = await api(`/api/recruitment/applications/${id}`)
  return application
}

export async function deleteApplication(id) {
  await api(`/api/recruitment/applications/${id}`, { method: 'DELETE' })
}
