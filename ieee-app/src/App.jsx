import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import LenisProvider from './lib/LenisProvider'
import MembershipPage from './pages/MembershipPage'
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import JoinUsPage from './pages/JoinUsPage'
import AboutPage from './pages/AboutPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/join-us" element={<JoinUsPage />} />
        <Route path="/committees" element={<CommitteesPage />} />
        <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <LenisProvider>
        <ScrollToTop />
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </LenisProvider>
    </Router>
  )
}

export default App
