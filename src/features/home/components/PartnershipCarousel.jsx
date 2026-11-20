'use client'

import { useEffect, useState } from 'react'
import BrandLogo from '@/components/ui/BrandLogo'
import { resolvePartnerLogoConfig } from '@/features/home/data/partners'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

function PartnerLogoCard({ partner }) {
  const config = resolvePartnerLogoConfig(partner)

  return (
    <li
      aria-label={partner.name}
      className="w-full sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
    >
      <BrandLogo
        src={config.src}
        lightSrc={partner.lightLogo}
        darkSrc={partner.darkLogo}
        name={partner.name}
        alt={config.alt}
        logoDark={config.logoDark}
        surface={config.surface}
        opticalScale={config.opticalScale}
        maxWidth={config.maxWidth}
        maxHeight={config.maxHeight}
        size="card"
        className="transition-transform duration-300 hover:-translate-y-0.5"
      />
    </li>
  )
}

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

  return (
    <section
      className="border-y border-outline-variant/25 bg-surface-container-low py-14 md:py-20"
      aria-labelledby="partnerships-heading"
    >
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <h2
          id="partnerships-heading"
          className="text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant"
        >
          Partners we build with
        </h2>

        <ul className="mt-8 flex flex-wrap justify-center gap-4 md:mt-10 md:gap-5">
          {result.partners.map(partner => (
            <PartnerLogoCard
              key={partner._id || partner.name}
              partner={partner}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
