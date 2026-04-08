import { useState } from 'react';

const membershipTiers = [
  {
    title: 'Student Member',
    price: 'Free',
    description: 'Perfect for undergraduate and graduate students',
    features: [
      'Access to IEEE Xplore',
      'Student scholarships',
      'Student branch membership',
      'Career resources',
      'Industry newsletters',
    ],
    cta: 'Join as Student',
    popular: false,
  },
  {
    title: 'Professional Member',
    price: '$197/year',
    description: 'For working professionals in tech industry',
    features: [
      'Full IEEE Xplore access',
      'Conference discounts (up to 50%)',
      'Professional development',
      'Networking opportunities',
      'Technical societies access',
      'Career advancement tools',
    ],
    cta: 'Join as Professional',
    popular: true,
  },
  {
    title: 'Senior Member',
    price: '$217/year',
    description: 'For professionals with 10+ years experience',
    features: [
      'All Professional benefits',
      'Senior member recognition',
      'IEEE Fellow nomination eligibility',
      'Leadership opportunities',
      'Mentorship programs',
      'Enhanced networking',
    ],
    cta: 'Upgrade to Senior',
    popular: false,
  },
];

const benefits = [
  {
    icon: 'menu_book',
    title: 'Access to IEEE Xplore',
    description: 'Over 5 million documents including journals, conferences, and standards.',
  },
  {
    icon: 'groups',
    title: 'Global Networking',
    description: 'Connect with 420,000+ professionals in 160+ countries.',
  },
  {
    icon: 'event',
    title: 'Conference Discounts',
    description: 'Save up to 50% on attending IEEE conferences worldwide.',
  },
  {
    icon: 'school',
    title: 'Professional Development',
    description: 'Continuing education, certifications, and career resources.',
  },
  {
    icon: 'workspace_premium',
    title: 'Technical Societies',
    description: 'Join 39 specialized societies in your area of expertise.',
  },
  {
    icon: 'payments',
    title: 'Scholarships & Grants',
    description: 'Access to student scholarships and research grants.',
  },
];

const testimonials = [
  {
    quote: "IEEE membership transformed my career. The networking opportunities and technical resources helped me land my dream job at a Fortune 500 company.",
    name: "Sarah Chen",
    title: "Software Engineer, Google",
    tier: "Professional Member"
  },
  {
    quote: "As a student, IEEE gave me access to research papers that were crucial for my thesis. The scholarships helped fund my education.",
    name: "Ahmed Hassan",
    title: "PhD Candidate, MIT",
    tier: "Student Member"
  },
  {
    quote: "The technical societies keep me at the cutting edge of my field. I've presented at multiple IEEE conferences and published in top journals.",
    name: "Dr. Maria Rodriguez",
    title: "Research Scientist, NASA JPL",
    tier: "Senior Member"
  },
];

const faqs = [
  {
    question: "How do I join IEEE?",
    answer: "Simply select your membership tier above and complete the online application. You'll receive instant access to member benefits upon registration."
  },
  {
    question: "Can I upgrade my membership later?",
    answer: "Yes! You can upgrade your membership tier at any time. Simply log into your account and select the upgrade option."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Student members receive free membership."
  },
  {
    question: "Is there a cancellation policy?",
    answer: "You can cancel your membership at any time. Refunds are available within 30 days of payment."
  },
];

export default function MembershipPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent" style={{ transform: 'rotate(0deg) scale(1.5)' }}></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-6">
            Become Part of Something <span className="text-primary">Bigger</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
            Join the world's largest technical professional organization and connect with 
            over 420,000 engineers, researchers, and innovators worldwide.
          </p>
          <div className="flex gap-8 justify-center text-on-surface-variant">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">420K+</div>
              <div className="text-sm uppercase tracking-wider">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">160+</div>
              <div className="text-sm uppercase tracking-wider">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">39</div>
              <div className="text-sm uppercase tracking-wider">Societies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Choose Your Path</span>
            <h2 className="text-4xl font-extrabold tracking-tight">Membership Levels</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`relative bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest ${tier.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest px-4 py-1">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.title}</h3>
                <div className="text-3xl font-black text-primary mb-2">{tier.price}</div>
                <p className="text-sm text-on-surface-variant mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 font-bold tracking-wide uppercase transition-all ${
                  tier.popular 
                    ? 'bg-primary text-on-primary hover:bg-primary-container' 
                    : 'bg-surface-container-lowest text-primary border border-primary hover:bg-primary/5'
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Why Join IEEE</span>
            <h2 className="text-4xl font-extrabold tracking-tight">Member Benefits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-surface-container-low p-8 hover:bg-surface-container-lowest transition-all duration-300">
                <span className="material-symbols-outlined text-primary text-4xl mb-4">{benefit.icon}</span>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-on-surface-variant">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Success Stories</span>
            <h2 className="text-4xl font-extrabold tracking-tight">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface-container-low p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">format_quote</span>
                <p className="text-on-surface-variant mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-on-surface-variant">{testimonial.title}</div>
                  <div className="text-xs text-primary uppercase tracking-wider mt-1">{testimonial.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Questions</span>
            <h2 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-surface-container-low">
                <button 
                  className="w-full p-6 text-left flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold">{faq.question}</span>
                  <span className="material-symbols-outlined text-primary">
                    {openFaq === index ? 'remove' : 'add'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-on-surface-variant">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-on-primary">
        <div className="container mx-auto px-12 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-4">Ready to Join?</h2>
          <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
            Take your career to the next level. Join IEEE today and become part of 
            the global technology community.
          </p>
          <button className="bg-surface-container-lowest text-primary px-10 py-4 font-bold tracking-widest uppercase hover:bg-secondary-fixed transition-all">
            Join IEEE Today
          </button>
        </div>
      </section>
    </div>
  );
}