import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/common/Navbar';
import { TelemetryTicker } from './components/common/TelemetryTicker';
import { VayuSetuLogo } from './components/common/VayuSetuLogo';
import { VayuSetuIntro } from './components/intro/VayuSetuIntro';
import { DashboardPage } from './pages/DashboardPage';
import { ApixPage } from './pages/ApixPage';
import { RoutesPage } from './pages/RoutesPage';
import { CpiPage } from './pages/CpiPage';
import { Play } from 'lucide-react';

// Scroll to top automatically upon route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

export function App() {
  // Show intro animation on initial page load; allow manual replay
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !sessionStorage.getItem('vayusetu_intro_played');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('vayusetu_intro_played', 'true');
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Cinematic Intro Animation Overlay */}
      <AnimatePresence>
        {showIntro && (
          <VayuSetuIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#F6F8FB] text-[#172033] font-sans antialiased flex flex-col selection:bg-[#1769AA]/15 selection:text-[#1769AA]">
        {/* Sticky Professional Light Navbar (4 Core Tabs) */}
        <Navbar />

        {/* Live Marquee Ticker below header */}
        <div className="pt-[65px]">
          <TelemetryTicker />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/index" element={<ApixPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/cpi" element={<CpiPage />} />
            <Route path="/analytics" element={<Navigate to="/cpi" replace />} />
            <Route path="/data-quality" element={<Navigate to="/index" replace />} />
            <Route path="/data-sources" element={<Navigate to="/index" replace />} />
            <Route path="/methodology" element={<Navigate to="/index" replace />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Professional Light Footer */}
        <footer className="w-full bg-white border-t border-[#E2E8F0] py-8 mt-16 text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <VayuSetuLogo variant="horizontal" size="sm" showTagline={false} />
              <span className="text-[#CBD5E1]">|</span>
              <span>Sovereign Airfare Intelligence & Price Indexing</span>
            </div>
            
            <div className="flex items-center gap-4 text-[11px] text-[#94A3B8]">
              <button
                onClick={handleReplayIntro}
                className="hover:text-[#1769AA] flex items-center gap-1 cursor-pointer transition-colors"
                title="Replay cinematic intro animation"
              >
                <Play className="w-3 h-3" />
                <span>Replay Intro</span>
              </button>
              <span>•</span>
              <span>APIx Engine v2.4 • Ministry of Civil Aviation Standards (08/2026)</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;