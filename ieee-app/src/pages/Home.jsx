import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import Hero from '../components/Hero'
import SectionDecorations from '../components/SectionDecorations'
import { boardMembers } from '../data/boardMembers'
import leaderPlaceholder from '../assets/leader-placeholder.svg'

const whyJoinItems = [
 { icon: 'school', title: 'Hands-On Learning', description: 'Workshops, projects, and study camps that build practical skills beyond the classroom.' },
 { icon: 'groups', title: 'Community & Network', description: 'Connect with fellow students, industry professionals, and IEEE members across 160+ countries.' },
 { icon: 'business_center', title: 'Leadership Opportunities', description: 'Run committees, organize events, and build real leadership experience while studying.' },
 { icon: 'workspace_premium', title: 'Career Growth', description: 'Access IEEE Xplore, conference discounts, scholarships, and resources that accelerate your career.' },
]

export default function Home() {
 return (
 <PageLayout variant="home">
 <Hero />

 <AnimatedSection>
 <section className="py-20 md:py-24 lg:py-32 relative">
 <SectionDecorations variant="dots" />
 <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
 <div className="max-w-3xl mx-auto text-center">
 <span className="section-label mb-4">About Us</span>
 <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F0F4F8]">
 What Is <span className="text-primary">IEEE HITU SB</span>?
 </h2>
 <p className="mb-4 text-sm md:text-base leading-relaxed text-[#9BA9B4] md:text-lg">
 IEEE HITU SB is the student branch of IEEE at Heliopolis International
 Technological University, built to give students a structured community for
 learning, collaboration, and professional growth.
 </p>
 <p className="text-sm md:text-base leading-relaxed text-[#9BA9B4] md:text-lg">
 Through committees, events, and shared branch work, students gain technical
 exposure, leadership experience, and a stronger connection to the wider world
 of engineering and technology.
 </p>
 </div>
 </div>
 </section>
 </AnimatedSection>

 <AnimatedSection delay={1}>
 <section className="py-20 md:py-24 lg:py-32 relative">
 <SectionDecorations variant="lines" />
 <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
 <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
 <div>
 <span className="section-label mb-4">Our University</span>
 <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F0F4F8]">
 What Is <span className="text-primary">HITU</span>?
 </h2>
 <p className="mb-4 text-sm md:text-base leading-relaxed text-[#9BA9B4] md:text-lg">
 Heliopolis International Technological University is a modern technological
 university focused on applied learning, innovation, and industry-connected
 education.
 </p>
 <p className="text-sm md:text-base leading-relaxed text-[#9BA9B4] md:text-lg">
 IEEE HITU SB operates within this environment, giving students a platform
 to extend their learning beyond the curriculum through technical committees,
 events, and IEEE&apos;s global network.
 </p>
 </div>
 <div className="grid gap-3 md:gap-4">
 <div className="card px-4 md:px-6 py-4 md:py-5">
 <p className="leading-relaxed text-sm md:text-base text-on-surface">
 A university shaped around innovation, technology, and applied sciences.
 </p>
 </div>
 <div className="card px-4 md:px-6 py-4 md:py-5">
 <p className="leading-relaxed text-sm md:text-base text-on-surface">
 Strong focus on bridging academic knowledge with industry practice.
 </p>
 </div>
 <div className="card px-4 md:px-6 py-4 md:py-5">
 <p className="leading-relaxed text-sm md:text-base text-on-surface">
 Home to IEEE HITU SB — a student branch that brings IEEE&apos;s global mission to campus.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>
 </AnimatedSection>

 <AnimatedSection delay={2}>
 <section className="py-20 md:py-24 lg:py-32 relative">
 <SectionDecorations variant="grid" />
 <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
 <div className="mb-8 md:mb-12 lg:mb-16 max-w-3xl">
 <span className="section-label mb-4">Benefits</span>
 <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F0F4F8]">
 Why Join <span className="text-primary">Us</span>?
 </h2>
 <p className="text-sm md:text-base leading-relaxed text-[#9BA9B4] md:text-lg">
 IEEE HITU SB offers more than membership. It offers a space to learn, lead,
 and connect with a global community of engineers and technologists.
 </p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
 {whyJoinItems.map((item, index) => (
 <div key={index} className="card-hover p-5 md:p-6 lg:p-8">
 <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-4">{item.icon}</span>
 <h3 className="text-lg md:text-xl font-bold mb-2">{item.title}</h3>
 <p className="text-sm text-on-surface-variant">{item.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 </AnimatedSection>

 <AnimatedSection delay={3}>
 <section className="py-20 md:py-24 lg:py-32 relative">
 <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
 <div className="mb-8 md:mb-12 lg:mb-16 text-center">
 <span className="section-label mb-4">Leadership</span>
 <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F0F4F8]">
 Board Members
 </h2>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
 {boardMembers.map((member, i) => (
 <div key={i} className="group text-center">
 <div className="aspect-square overflow-hidden mb-3 md:mb-4 transition-all duration-300 group-hover: ">
 <img
 src={member.img || leaderPlaceholder}
 alt={member.name}
 className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
 />
 </div>
 <h3 className="text-sm md:text-base font-bold text-[#F0F4F8]">{member.name}</h3>
 <p className="text-xs text-[#9BA9B4]">
 {member.position ? `${member.position} — ` : ''}{member.committee}
 </p>
 </div>
 ))}
 </div>
 </div>
 </section>
 </AnimatedSection>

 <AnimatedSection delay={4}>
 <section className="py-20 md:py-24 lg:py-32">
 <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
 <div className="card p-8 md:p-12 lg:p-16">
 <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-on-surface">
 Ready to Become Part of IEEE HITU?
 </h2>
 <p className="text-base md:text-lg lg:text-xl opacity-80 mb-8 max-w-2xl mx-auto text-on-surface-variant">
 Join the student branch and start your journey with a global community
 of engineers, innovators, and problem-solvers.
 </p>
 <Link
 to="/membership"
 className="btn btn-primary"
 >
 Join IEEE Today
 </Link>
 </div>
 </div>
 </section>
 </AnimatedSection>
 </PageLayout>
 )
}
