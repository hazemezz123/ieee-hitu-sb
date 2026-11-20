'use client'

import { useEffect, useState } from 'react'
import BrandLogo from '@/components/ui/BrandLogo'
import { resolvePartnerLogoConfig } from '@/features/home/data/partners'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

function PartnerLogoRow({ partners, isClone = false }) {
  return (
    <ul
      aria-hidden={isClone ? 'true' : undefined}
      className={`partners-marquee-row flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16 md:gap-20 md:pr-20${isClone ? ' partners-marquee-clone' : ''}`}
    >
      {partners.map(partner => {
        const config = resolvePartnerLogoConfig(partner)
        return (
          <li
            key={`${isClone ? 'clone-' : ''}${partner._id || partner.name}`}
            aria-label={isClone ? undefined : partner.name}
            className="flex shrink-0 items-center justify-center opacity-85 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100 motion-reduce:transform-none"
          >
            <BrandLogo
              src={config.src}
              lightSrc={config.lightSrc}
              darkSrc={config.darkSrc}
              name={partner.name}
              alt={config.alt}
              decorative={isClone}
              logoDark={config.logoDark}
              surface="none"
              opticalScale={config.opticalScale}
              maxWidth={config.maxWidth}
              maxHeight={config.maxHeight}
              size="showcase"
            />
          </li>
        )
      })}
    </ul>
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
      className="border-y border-outline-variant/25 bg-surface-container-low py-14 md:py-16"
      aria-labelledby="partnerships-heading"
    >
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <h2
          id="partnerships-heading"
          className="text-center text-lg font-bold tracking-tight text-on-surface sm:text-xl"
        >
          Partners we build with
        </h2>

        <div
          tabIndex={0}
          role="region"
          aria-label="Partner logos showcase"
          className="partners-marquee-viewport mt-10 rounded-md py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <div className="partners-marquee-track">
            <PartnerLogoRow partners={result.partners} />
            <PartnerLogoRow partners={result.partners} isClone />
          </div>
        </div>
      </div>
    </section>
  )
}
