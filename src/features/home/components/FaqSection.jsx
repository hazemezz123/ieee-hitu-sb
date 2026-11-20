'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { buildFaqItems } from '../data/landingContent'

export default function FaqSection({ recruitment = null, committeeCount = 19 }) {
  const [openIndex, setOpenIndex] = useState(0)
  const triggerRefs = useRef([])

  const form = recruitment?.status === 'ready' ? recruitment.form : null
  const items = buildFaqItems({
    isOpen: form ? Boolean(form.isOpen) : undefined,
    closedMessage: form?.closedMessage || '',
    committeeCount,
  })

  function handleKeyDown(e, index) {
    let targetIndex = null
    if (e.key === 'ArrowDown') targetIndex = (index + 1) % items.length
    else if (e.key === 'ArrowUp') targetIndex = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') targetIndex = 0
    else if (e.key === 'End') targetIndex = items.length - 1

    if (targetIndex !== null) {
      e.preventDefault()
      triggerRefs.current[targetIndex]?.focus()
    }
  }

  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t border-outline-variant/30 bg-surface py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <h2
              id="faq-heading"
              className="text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
            >
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
              Clear answers about joining committees, branch roles, recruitment waves, and getting involved at HITU.
            </p>
            <Link
              href="/contact"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
            >
              <span>Still have questions? Contact us</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </Link>
          </Reveal>

          <div className="lg:col-span-8">
            <div className="divide-y divide-outline-variant/60 border-y border-outline-variant/60">
              {items.map((item, index) => {
                const isExpanded = openIndex === index
                const triggerId = `faq-trigger-${item.id}`
                const panelId = `faq-panel-${item.id}`

                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        ref={(el) => {
                          triggerRefs.current[index] = el
                        }}
                        type="button"
                        id={triggerId}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isExpanded ? null : index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-bold text-on-surface transition-colors hover:text-primary sm:text-lg"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 motion-reduce:transition-none ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      data-open={isExpanded ? 'true' : 'false'}
                      aria-hidden={!isExpanded}
                      inert={!isExpanded ? true : undefined}
                      className="faq-panel"
                    >
                      <div className="faq-panel-inner">
                        <p className="pb-5 pr-8 text-sm leading-relaxed text-on-surface-variant sm:text-base">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
