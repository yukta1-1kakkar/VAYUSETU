import { useEffect, useState, type ReactElement } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Braces, FileBarChart, Play, Settings } from 'lucide-react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { VayuSetuLogo } from './components/common/VayuSetuLogo';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LiveDataGate } from './components/LiveDataGate';
import { VayuSetuIntro } from './components/intro/VayuSetuIntro';
import type { Permission } from './constants/auth';
import { AuthProvider } from './context/AuthContext';
import { ApixPage } from './pages/ApixPage';
import { CpiPage } from './pages/CpiPage';
import { DashboardPage } from './pages/DashboardPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { LeadTimePage } from './pages/LeadTimePage';
import { Login } from './pages/Login';
import { ModulePage } from './pages/ModulePage';
import { RouteBasketPage } from './pages/RouteBasketPage';
import { RoutesPage } from './pages/RoutesPage';
import { ScraperControlPage } from './pages/ScraperControlPage';
import { Unauthorized } from './pages/Unauthorized';
import { UserManagementPage } from './pages/UserManagementPage';
import { UserGuidePage } from './pages/UserGuidePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function Guarded({ permission, children }: { permission: Permission; children: ReactElement }) {
  return <ProtectedRoute permission={permission}>{children}</ProtectedRoute>;
}

function PortalLayout({ onReplayIntro }: { onReplayIntro: () => void }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F8FB] font-sans text-[#172033] antialiased selection:bg-[#1769AA]/15 selection:text-[#1769AA]">
        <Navbar key={pathname} />
        <div className="pt-[65px]" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 sm:px-6 lg:px-8"><Outlet /></main>
        <footer className="mt-16 w-full border-t border-[#E2E8F0] bg-white py-8 text-xs text-[#64748B]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><VayuSetuLogo variant="horizontal" size="sm" showTagline={false} /><span className="text-[#CBD5E1]">|</span><span>Sovereign Airfare Intelligence & Price Indexing</span></div>
            <div className="flex items-center gap-4 text-[11px] text-[#94A3B8]">
              <button onClick={onReplayIntro} className="flex cursor-pointer items-center gap-1 transition-colors hover:text-[#1769AA]" title="Replay cinematic intro animation"><Play className="h-3 w-3" /> Replay Intro</button>
              <span>•</span><span>VAYUSETU APIx Research Prototype • 08/2026</span>
            </div>
          </div>
        </footer>
    </div>
  );
}

const modulePage = (permission: Permission, element: ReactElement) => <Guarded permission={permission}>{element}</Guarded>;

function PortalRoutes({ onReplayIntro }: { onReplayIntro: () => void }) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<ProtectedRoute><LiveDataGate><PortalLayout onReplayIntro={onReplayIntro} /></LiveDataGate></ProtectedRoute>}>
        <Route index element={modulePage('dashboard', <DashboardPage />)} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="index" element={modulePage('airfare-index', <ApixPage />)} />
        <Route path="reports" element={modulePage('reports', <ModulePage icon={FileBarChart} eyebrow="Official outputs" title="Reports" description="Prepare and review institutional airfare price index reports for policy stakeholders." />)} />
        <Route path="downloads" element={modulePage('downloads', <DownloadsPage />)} />
        <Route path="cpi" element={modulePage('price-trends', <CpiPage />)} />
        <Route path="price-trends" element={modulePage('price-trends', <Navigate to="/cpi" replace />)} />
        <Route path="routes" element={modulePage('route-comparison', <RoutesPage />)} />
        <Route path="route-comparison" element={modulePage('route-comparison', <Navigate to="/routes" replace />)} />
        <Route path="lead-time-elasticity" element={modulePage('lead-time-elasticity', <LeadTimePage />)} />
        <Route path="api-explorer" element={modulePage('api-explorer', <ModulePage icon={Braces} eyebrow="Developer services" title="API Explorer" description="Inspect documented airfare index endpoints and prepare authorized data queries." />)} />
        <Route path="user-management" element={modulePage('user-management', <UserManagementPage />)} />
        <Route path="scraper-control" element={modulePage('scraping-scheduler', <ScraperControlPage />)} />
        <Route path="scraping-scheduler" element={modulePage('scraping-scheduler', <Navigate to="/scraper-control" replace />)} />
        <Route path="route-basket" element={modulePage('route-basket', <RouteBasketPage />)} />
        <Route path="system-settings" element={modulePage('system-settings', <ModulePage icon={Settings} eyebrow="Platform administration" title="System Settings" description="Review platform-level configuration for the VAYUSETU analytical environment." />)} />
        <Route path="user-guide" element={<UserGuidePage />} />
        <Route path="analytics" element={modulePage('price-trends', <Navigate to="/cpi" replace />)} />
        <Route path="data-quality" element={modulePage('airfare-index', <Navigate to="/index" replace />)} />
        <Route path="data-sources" element={modulePage('airfare-index', <Navigate to="/index" replace />)} />
        <Route path="methodology" element={modulePage('airfare-index', <Navigate to="/index" replace />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('vayusetu_intro_played'));

  const handleIntroComplete = () => {
    sessionStorage.setItem('vayusetu_intro_played', 'true');
    setShowIntro(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AnimatePresence>
          {showIntro && <VayuSetuIntro onComplete={handleIntroComplete} />}
        </AnimatePresence>
        <PortalRoutes onReplayIntro={() => setShowIntro(true)} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
