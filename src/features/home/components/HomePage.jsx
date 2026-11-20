'use client'

import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '@/components/ui/Hero'
import { committees as staticCommittees } from '@/features/committees/data/committees'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import { fetchRecruitmentForm } from '@/lib/recruitment'
import { communityPartners as staticPartners } from '../data/partners'
import { useEventsResult } from '../hooks/useEventsResult'
import { fetchPartnersResult } from '../hooks/usePartners'
import WhoWeAreSection from './WhoWeAreSection'
import MissionVisionSection from './MissionVisionSection'
import ImpactSection from './ImpactSection'
import CommitteeDirectory from './CommitteeDirectory'
import EventsSection from './EventsSection'
import WhyJoinSection from './WhyJoinSection'
import GalleryCarousel from './GalleryCarousel'
import PartnershipCarousel from './PartnershipCarousel'
import OfficersSection from './OfficersSection'
import FaqSection from './FaqSection'
import RecruitmentBand from './RecruitmentBand'

export default function Home() {
  const eventsResult = useEventsResult()
  const [committeesList, setCommitteesList] = useState(staticCommittees)
  const [partnersState, setPartnersState] = useState({
    status: 'loading',
    partners: staticPartners,
  })
  const [recruitment, setRecruitment] = useState({ status: 'loading', form: null })

  useEffect(() => {
    let active = true
    fetchCommitteesResult()
      .then((res) => {
        if (active && Array.isArray(res?.committees) && res.committees.length > 0) {
          setCommitteesList(res.committees)
        }
      })
      .catch(() => {})

    fetchPartnersResult()
      .then((res) => {
        if (active) {
          setPartnersState({
            status: 'ready',
            partners: Array.isArray(res?.partners) ? res.partners : [],
          })
        }
      })
      .catch(() => {
        if (active) {
          setPartnersState({ status: 'ready', partners: staticPartners })
        }
      })

    fetchRecruitmentForm('heads')
      .then((form) => {
        if (active) setRecruitment({ status: 'ready', form: form || null })
      })
      .catch(() => {
        if (active) setRecruitment({ status: 'error', form: null })
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (eventsResult.status !== 'ready' && partnersState.status !== 'ready') return
    const frame = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh()
      } catch {
        /* trigger may be unmounted */
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [eventsResult.status, eventsResult.events.length, partnersState.status, partnersState.partners.length, recruitment.status])

  const recruitmentOpen =
    recruitment.status === 'ready' ? Boolean(recruitment.form?.isOpen) : true

  return (
    <>
      <Hero recruitmentOpen={recruitmentOpen} />
      <div className="page-enter">
        <WhoWeAreSection />
        <MissionVisionSection />
        <ImpactSection
          committeeCount={committeesList.length}
          partnerCount={partnersState.partners.length}
        />
        <CommitteeDirectory initialCommittees={committeesList} />
        <EventsSection result={eventsResult} />
        <WhyJoinSection />
        <GalleryCarousel />
        <PartnershipCarousel
          initialPartners={partnersState.partners}
          fetchOnMount={false}
        />
        <OfficersSection />
        <FaqSection
          recruitment={recruitment}
          committeeCount={committeesList.length}
        />
        <RecruitmentBand
          recruitment={recruitment}
          committeeCount={committeesList.length}
        />
      </div>
    </>
  )
}
