'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchRecruitmentForm } from '@/lib/recruitment'
import { committees } from '@/features/committees/data/committees'

export default function RecruitmentBand() {
  const [form, setForm] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetchRecruitmentForm('heads')
      .then(f => { if (active && f?.isOpen) { setForm(f); setOpen(true) } })
      .catch(() => { /* band stays hidden when status cannot load */ })
    return () => { active = false }
  }, [])

  if (!open) return null

  return (
    <section aria-labelledby="recruitment-band-title" className="wedge-bg" style={{ background: 'linear-gradient(135deg, #004976, #00629b)' }}>
      <div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
        <p><span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Heads Recruitment — Open</span></p>
        <h2 id="recruitment-band-title" className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-[#F0F4F8] md:text-5xl">Lead an IEEE HITU Committee</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C7D3DC] md:text-lg">{form?.description || 'Apply to lead a committee as Head or Vice-Head.'}</p>
        <p className="mt-6" aria-label={`${committees.length} committees`}><strong className="text-2xl text-white">{committees.length}</strong> <span className="text-[#C7D3DC]">committees</span></p>
        <Link className="btn mt-8 bg-white font-bold text-[#004976] hover:bg-[#D7E9F3]" href="/join-us">Start your application</Link>
      </div>
    </section>
  )
}
