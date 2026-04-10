import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MembershipPage from './pages/MembershipPage'
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import JoinUsPage from './pages/JoinUsPage'
import AboutPage from './pages/AboutPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/committees" element={<CommitteesPage />} />
          <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
