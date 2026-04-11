import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import Hero from '../components/Hero'
import TechnicalResources from '../components/TechnicalResources'
import Membership from '../components/Membership'

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <TechnicalResources />
      <Membership />
    </PageTransition>
  )
}