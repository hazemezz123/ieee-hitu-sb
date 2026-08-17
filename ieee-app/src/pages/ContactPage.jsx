import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { committees } from '../data/committees'

const initialForm = { name: '', email: '', phone: '', committee: '', message: '' }

export default function ContactPage() {
  const [formData, setFormData] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const change = event => {
    setSubmitted(false)
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <PageLayout>
      <AnimatedSection><header className="container mx-auto max-w-4xl px-6 py-16 sm:px-8 md:px-12 md:py-24"><h1 className="text-4xl font-black text-on-surface md:text-6xl">Contact IEEE HITU Student Branch</h1><p className="mt-6 max-w-2xl text-lg text-on-surface-variant">There is currently no verified public contact channel published on this site.</p><p className="mt-8" aria-label={`${committees.length} committees`}><strong className="text-3xl text-primary">{committees.length}</strong> <span className="text-on-surface-variant">committees</span></p></header></AnimatedSection>
      <AnimatedSection delay={1}>
        <section className="border-t border-outline-variant/30 py-16"><div className="container mx-auto max-w-3xl px-6 sm:px-8 md:px-12"><h2 className="text-3xl font-bold">Contact details</h2>
          <form className="mt-8 flex flex-col gap-5" onSubmit={event => { event.preventDefault(); setSubmitted(true) }}>
            <label className="form-label" htmlFor="contact-name">Full name<input className="form-input mt-2" id="contact-name" name="name" onChange={change} required type="text" value={formData.name} /></label>
            <label className="form-label" htmlFor="contact-email">Email address<input className="form-input mt-2" id="contact-email" name="email" onChange={change} required type="email" value={formData.email} /></label>
            <label className="form-label" htmlFor="contact-phone">Phone number<input className="form-input mt-2" id="contact-phone" name="phone" onChange={change} type="tel" value={formData.phone} /></label>
            <label className="form-label" htmlFor="contact-committee">Committee<select className="form-select mt-2" id="contact-committee" name="committee" onChange={change} required value={formData.committee}><option value="">Select a committee</option>{committees.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label className="form-label" htmlFor="contact-message">Message<textarea className="form-textarea mt-2" id="contact-message" name="message" onChange={change} required rows="5" value={formData.message} /></label>
            <p className="form-note text-sm text-on-surface-variant" role="note">This form is a local demonstration and transmits nothing. No message is sent.</p>
            <button className="btn btn-primary self-start" type="submit">Record message</button>
            {submitted && <p className="text-sm text-on-surface-variant" role="status">Your message was recorded locally in this page only. It was not transmitted.</p>}
          </form>
        </div></section>
      </AnimatedSection>
    </PageLayout>
  )
}
