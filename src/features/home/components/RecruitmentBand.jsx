'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { fetchRecruitmentForm } from '@/lib/recruitment'

export default function RecruitmentBand({ recruitment = null }) {
  const hasExternal = recruitment !== null && recruitment !== undefined
  const [fetched, setFetched] = useState({ status: 'loading', form: null })

  useEffect(() => {
    if (hasExternal) return
    let active = true
    fetchRecruitmentForm('heads')
      .then((f) => {
        if (active) setFetched({ status: 'ready', form: f || null })
      })
      .catch(() => {
        if (active) setFetched({ status: 'error', form: null })
      })
    return () => {
      active = false
    }
  }, [hasExternal])

  const state = hasExternal ? recruitment : fetched
  const isReady = state?.status === 'ready'
  const isError = state?.status === 'error'
  const form = state?.form || null
  const isOpen = isReady && Boolean(form?.isOpen)
  const isClosed = (isReady && !form?.isOpen) || isError

  const statusLabel = isOpen
    ? 'Recruitment open'
    : isClosed
      ? 'Recruitment currently closed'
      : 'Committee recruitment'

  return (
    <section aria-labelledby="recruitment-band-title" className="bg-surface">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="relative border-t border-outline-variant/60 py-12 md:py-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px left-0 h-[2px] w-14 bg-primary"
          />

          <Reveal
            y={14}
            className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10"
          >
            <div>
              <h2
                id="recruitment-band-title"
                className="text-balance text-2xl font-black leading-[1.15] tracking-tight text-on-surface sm:text-3xl md:text-[2rem]"
              >
                Your future starts{' '}
                <span className="block text-primary">
                  beyond the classroom.
                </span>
              </h2>

              <p className="mt-2.5 flex items-center gap-2 text-sm text-on-surface-variant">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isOpen ? 'bg-primary' : 'bg-outline'
                  }`}
                />
                <span>{statusLabel}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:shrink-0">
              {isOpen ? (
                <>
                  <Link
                    href="/join-us"
                    className="btn btn-primary btn-wedge inline-flex items-center gap-2"
                  >
                    <span>Join the Branch</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/committees" className="btn btn-secondary">
                    Explore Committees
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/committees"
                    className="btn btn-primary btn-wedge inline-flex items-center gap-2"
                  >
                    <span>Explore Committees</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/events" className="btn btn-secondary">
                    View Events
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
