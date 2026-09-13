export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => undefined)
  if (!res.ok || data === undefined) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}

export function apiAuthed(path, body) {
  return api(path, { method: 'POST', body })
}
