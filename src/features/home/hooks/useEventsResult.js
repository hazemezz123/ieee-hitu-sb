'use client'

import { useEffect, useState } from 'react'
import { fetchEventsResult } from '@/features/events/hooks/useEvents'

export function useEventsResult() {
  const [result, setResult] = useState({ events: [], source: null, status: 'loading' })
  useEffect(() => {
    let active = true
    fetchEventsResult().then((data) => { if (active) setResult({ ...data, status: 'ready' }) })
      .catch(() => { if (active) setResult({ events: [], source: null, status: 'error' }) })
    return () => { active = false }
  }, [])
  return result
}
