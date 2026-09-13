'use client'

import { useEffect, useState } from 'react'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

export default function PartnershipCarousel() {
  const [result, setResult] = useState({ partners: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchPartnersResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ partners: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  if (result.status !== 'ready' || result.partners.length === 0) return null

  const row = isClone => (
    <ul className="partners-row" aria-hidden={isClone}>
      {result.partners.map(partner => (
        <li key={partner._id ? partner._id : partner.name} className={`partner-tile${partner.logoDark ? ' partner-tile--dark' : ''}`} aria-label={partner.name}>
          {partner.logo ? <img src={partner.logo} alt={partner.name} /> : <span>{partner.name}</span>}
        </li>
      ))}
    </ul>
  )
  return (
    <section className="border-b border-outline-variant/30 bg-surface-container-low py-16" aria-labelledby="partnerships-heading">
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <p className="section-label">Community partnerships</p>
        <h2 id="partnerships-heading" className="mt-3 text-3xl font-bold text-on-surface">Partners we build with</h2>
      </div>
      <div className="carousel-viewport mt-10">
        <div className="carousel-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}
