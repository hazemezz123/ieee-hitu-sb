'use client'

import { useState } from 'react'
import { committees } from '../data/committees'

const initialForm = { name: '', email: '', phone: '', committee: '', message: '' }

export default function InterestForm({ idPrefix, note, submitLabel, successMessage, messageRequired = false }) {
  const [formData, setFormData] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const change = event => {
    setSubmitted(false)
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }))
  }
  const id = name => `${idPrefix}-${name}`

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={event => { event.preventDefault(); setSubmitted(true) }}>
      <label className="form-label" htmlFor={id('name')}>Full name<input className="form-input mt-2" id={id('name')} name="name" onChange={change} required type="text" value={formData.name} /></label>
      <label className="form-label" htmlFor={id('email')}>Email address<input className="form-input mt-2" id={id('email')} name="email" onChange={change} required type="email" value={formData.email} /></label>
      <label className="form-label" htmlFor={id('phone')}>Phone number<input className="form-input mt-2" id={id('phone')} name="phone" onChange={change} type="tel" value={formData.phone} /></label>
      <label className="form-label" htmlFor={id('committee')}>Committee<select className="form-select mt-2" id={id('committee')} name="committee" onChange={change} required value={formData.committee}><option value="">Select a committee</option>{committees.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="form-label" htmlFor={id('message')}>Message<textarea className="form-textarea mt-2" id={id('message')} name="message" onChange={change} required={messageRequired} rows="5" value={formData.message} /></label>
      <p className="form-note text-sm text-on-surface-variant" role="note">{note}</p>
      <button className="btn btn-primary self-start" type="submit">{submitLabel}</button>
      {submitted && <p className="text-sm text-on-surface-variant" role="status">{successMessage}</p>}
    </form>
  )
}
