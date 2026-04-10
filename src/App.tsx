import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Loader2 } from 'lucide-react';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SonarrPage = lazy(() => import('./pages/SonarrPage').then(m => ({ default: m.SonarrPage })));
const RadarrPage = lazy(() => import('./pages/RadarrPage').then(m => ({ default: m.RadarrPage })));
const ProwlarrPage = lazy(() => import('./pages/ProwlarrPage').then(m => ({ default: m.ProwlarrPage })));
const QBittorrentPage = lazy(() => import('./pages/QBittorrentPage').then(m => ({ default: m.QBittorrentPage })));
const QueuePage = lazy(() => import('./pages/QueuePage').then(m => ({ default: m.QueuePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

import { useSettings } from './hooks/useSettings';
import { useEffect } from 'react';

function App() {
  const { theme } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Set data-theme attribute for our custom variable engine
    root.setAttribute('data-theme', theme);
    
    // Handle standard .dark class for Tailwind compatibility
    if (['dark', 'minimal', 'swizzin', 'autobrr', 'kyle', 'nightwalker'].includes(theme)) {
      root.classList.add('dark');
    } else if (['light', 'napster'].includes(theme)) {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.setAttribute('data-theme', isDark ? 'minimal' : 'napster');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-base">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="sonarr/*" element={<SonarrPage />} />
            <Route path="radarr/*" element={<RadarrPage />} />
            <Route path="prowlarr/*" element={<ProwlarrPage />} />
            <Route path="qbittorrent/*" element={<QBittorrentPage />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
