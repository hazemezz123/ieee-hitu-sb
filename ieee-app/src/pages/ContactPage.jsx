import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { totalCommittees } from '../data/committees';

const initialForm = {
 name: '',
 email: '',
 phone: '',
 interest: '',
 message: '',
};

export default function ContactPage() {
 const [formData, setFormData] = useState(initialForm);
 const [isSubmitted, setIsSubmitted] = useState(false);

 function handleChange(event) {
 const { name, value } = event.target;
 setFormData((current) => ({ ...current, [name]: value }));
 }

 function handleSubmit(event) {
 event.preventDefault();
 setIsSubmitted(true);
 setFormData(initialForm);
 }

 return (
 <PageLayout>
 <div className="min-h-screen">
 <AnimatedSection>
 <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
 <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
 <div
 className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
 style={{ transform: 'rotate(0deg) scale(1.5)' }}
 ></div>
 <div
 className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-secondary-container wedge-accent"
 style={{ transform: 'rotate(180deg) scale(1.2)' }}
 ></div>
 </div>

 <div className="container mx-auto px-6 sm:px-8 md:px-12 relative z-10 max-w-6xl">
 <div className="max-w-4xl">
 <span className="section-label mb-4">Contact</span>
 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4 md:mb-6">
 Get In Touch With <span className="text-primary">IEEE HITU SB</span>
 </h1>
 <p className="text-base md:text-lg lg:text-xl text-on-surface-variant leading-relaxed mb-6 md:mb-8 max-w-2xl">
 Have a question? Want to join? Reach out and we&apos;ll get back to you.
 </p>

 <div className="grid gap-3 md:gap-6 sm:grid-cols-3">
 <div className="card p-4 md:p-6">
 <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">{totalCommittees}</div>
 <div className="text-xs md:text-sm uppercase tracking-wider text-on-surface-variant">
 Committees
 </div>
 </div>
 <div className="card p-4 md:p-6">
 <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">2</div>
 <div className="text-xs md:text-sm uppercase tracking-wider text-on-surface-variant">
 Main Tracks
 </div>
 </div>
 <div className="card p-4 md:p-6">
 <Link
 to="/membership"
 className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2 block hover:underline"
 >
 Join
 </Link>
 <div className="text-xs md:text-sm uppercase tracking-wider text-on-surface-variant">
 Start Your Journey
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 </AnimatedSection>

 <AnimatedSection delay={1}>
  <section className="py-20 md:py-24 lg:py-32">
 <div className="container mx-auto px-6 sm:px-8 md:px-12">
 <div className="max-w-3xl mx-auto p-5 md:p-8 lg:p-10 shadow-sm border border-outline-variant/20">
 <div className="mb-6 md:mb-8">
 <span className="section-label mb-4">Contact Form</span>
 <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 md:mb-3">Send Us a Message</h2>
 <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
 Fill in your details and we&apos;ll reach out with the next steps.
 </p>
 </div>

 {isSubmitted ? (
 <div className="bg-primary/5 border border-primary/20 p-4 md:p-6 mb-6 md:mb-8">
 <h3 className="text-base md:text-lg font-bold text-primary mb-2">Message sent</h3>
 <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
 Thank you for reaching out. We&apos;ll get back to you as soon as possible.
 </p>
 </div>
 ) : null}

 <form className="space-y-5 flex flex-col" onSubmit={handleSubmit}>
 <div>
 <label className="form-label" htmlFor="name">
 Full Name
 </label>
 <input
 id="name"
 name="name"
 type="text"
 value={formData.name}
 onChange={handleChange}
 required
 className="form-input"
 placeholder="Enter your full name"
 />
 </div>

 <div>
 <label className="form-label" htmlFor="email">
 Email Address
 </label>
 <input
 id="email"
 name="email"
 type="email"
 value={formData.email}
 onChange={handleChange}
 required
 className="form-input"
 placeholder="Enter your email"
 />
 </div>

 <div>
 <label className="form-label" htmlFor="phone">
 Phone Number
 </label>
 <input
 id="phone"
 name="phone"
 type="tel"
 value={formData.phone}
 onChange={handleChange}
 className="form-input"
 placeholder="Enter your phone number"
 />
 </div>

 <div>
 <label className="form-label" htmlFor="interest">
 Area of Interest
 </label>
 <select
 id="interest"
 name="interest"
 value={formData.interest}
 onChange={handleChange}
 required
 className="form-select"
 >
 <option value="">Select an option</option>
 <option value="technical">Technical Committees</option>
 <option value="non-technical">Non-Technical Committees</option>
 <option value="membership">General Membership</option>
 <option value="volunteering">Volunteering</option>
 </select>
 </div>

 <div>
 <label className="form-label" htmlFor="message">
 Message
 </label>
 <textarea
 id="message"
 name="message"
 rows="5"
 value={formData.message}
 onChange={handleChange}
 className="form-textarea"
 placeholder="Tell us what you want to join or learn more about"
 ></textarea>
 </div>

 <button
 type="submit"
 className="btn btn-primary self-start"
 >
 Send Message
 </button>
 </form>
 </div>
 </div>
 </section>
 </AnimatedSection>
 </div>
 </PageLayout>
 );
}
