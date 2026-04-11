import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import MembershipPage from './pages/MembershipPage'
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import JoinUsPage from './pages/JoinUsPage'
import AboutPage from './pages/AboutPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'

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
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
    </Router>
  )
}

export default App
