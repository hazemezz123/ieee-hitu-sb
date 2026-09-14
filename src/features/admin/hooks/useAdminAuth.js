'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/apiClient'

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    let active = true
    api('/api/auth/me').then(({ authed }) => { if (active) setAuthed(authed) })
      .catch(() => { if (active) setAuthed(false) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])
  async function login(password) { await api('/api/auth/login', { method: 'POST', body: { password } }); setAuthed(true) }
  async function logout() { try { await api('/api/auth/logout', { method: 'POST', body: {} }) } catch { /* cookie may already be expired; still log out locally */ } setAuthed(false) }
  return { authed, checking, login, logout }
}
