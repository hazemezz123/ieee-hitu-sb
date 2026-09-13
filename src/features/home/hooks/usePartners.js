import { communityPartners as staticPartners } from '../data/partners'
import { fetchPartners as tursoFetchPartners } from '@/lib/turso'

export { createPartner, updatePartner, deletePartner } from '@/lib/turso'

export async function fetchPartnersResult() {
  try {
    return { partners: await tursoFetchPartners(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { partners: structuredClone(staticPartners), source: 'fallback' }
  }
}

export async function fetchPartners() {
  return (await fetchPartnersResult()).partners
}