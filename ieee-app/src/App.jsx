import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MembershipPage from './pages/MembershipPage'
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import JoinUsPage from './pages/JoinUsPage'

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/committees" element={<CommitteesPage />} />
          <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
