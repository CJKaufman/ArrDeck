import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useSettingsStore } from '../../stores/settings.store';
import { useEffect } from 'react';
import { Toaster } from '../ui/sonner';
import { TransferStatsBar } from '../qbittorrent/TransferStatsBar';
import { NotificationManager } from '../system/NotificationManager';
import { useShortcuts } from '../../hooks/useShortcuts';
import { useWindowState } from '../../hooks/useWindowState';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function AppShell() {
  const { theme } = useSettingsStore();
  const location = useLocation();
  useShortcuts();
  useWindowState();




  // Handle dynamic window title with Tauri safety guard
  useEffect(() => {
    let appWindow: any;
    try {
      appWindow = getCurrentWindow();
    } catch (e) {
      return; // Browser mode
    }

    if (!appWindow) return;

    try {
      const path = location.pathname.substring(1);
      const title = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';
      appWindow.setTitle(`ArrDeck — ${title}`);
    } catch (e) {
      // Title management failed
    }
  }, [location]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 overflow-y-auto bg-base relative transition-all duration-300 ease-in-out pb-12">
          <Outlet />
        </main>
        <TransferStatsBar />
        <NotificationManager />
      </div>
      <Toaster theme={theme as any} />
    </div>
  );
}
