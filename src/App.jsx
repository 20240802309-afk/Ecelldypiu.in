import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import SocialSidebar from './components/SocialSidebar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Team from './pages/Team';
import Blogs from './pages/Blogs';
import Contact from './pages/Contact';
import Sponsors from './pages/Sponsors';
import Inceptio from './pages/Inceptio';
import Elevate from './pages/Elevate';
import SIH from './pages/SIH';
import FinBiz from './pages/FinBiz';
import InnovateForImpact from './pages/InnovateForImpact';
import BlogDetail1 from './pages/BlogDetail1';
import BlogDetail2 from './pages/BlogDetail2';
import BlogDetail3 from './pages/BlogDetail3';
import Linktree from './pages/Linktree';
import ApplyNow from './pages/ApplyNow';
import './App.css';
// import { useEffect } from 'react';
// import Lenis from 'lenis';

function App() {
  // Lenis initialized in ScrollToTop component


  return (
    <Router>
      <ScrollToTop />
      <div className="App font-sans selection:bg-brand-yellow selection:text-black">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/inceptio" element={<Inceptio />} />
            <Route path="/events/elevate" element={<Elevate />} />
            <Route path="/events/sih" element={<SIH />} />
            <Route path="/events/finbiz" element={<FinBiz />} />
            <Route path="/events/innovate-for-impact" element={<InnovateForImpact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/where-ideas-meet-impact" element={<BlogDetail1 />} />
            <Route path="/blogs/ceo-pune-meetup" element={<BlogDetail2 />} />
            <Route path="/blogs/entrepreneurship-awareness-drive" element={<BlogDetail3 />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ourlinks" element={<Linktree />} />
            <Route path="/apply" element={<ApplyNow />} />
            {/* Backward compatibility: redirect old path */}
            <Route path="/linktree" element={<Navigate to="/ourlinks" replace />} />
          </Routes>
        </main>
        <SocialSidebar />
        <Footer />
      </div>
    </Router>
  );
}

export default App;