import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import AdminPage from './pages/AdminPage'
import EventFormPage from './pages/EventFormPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/events/new" element={<EventFormPage />} />
        <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
      </Routes>
    </div>
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
