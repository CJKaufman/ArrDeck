import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Loader2 } from "lucide-react";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const SonarrPage = lazy(() =>
  import("./pages/SonarrPage").then((m) => ({ default: m.SonarrPage })),
);
const RadarrPage = lazy(() =>
  import("./pages/RadarrPage").then((m) => ({ default: m.RadarrPage })),
);
const ProwlarrPage = lazy(() =>
  import("./pages/ProwlarrPage").then((m) => ({ default: m.ProwlarrPage })),
);
const QBittorrentPage = lazy(() =>
  import("./pages/QBittorrentPage").then((m) => ({
    default: m.QBittorrentPage,
  })),
);
const QueuePage = lazy(() =>
  import("./pages/QueuePage").then((m) => ({ default: m.QueuePage })),
);
const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

import { useSettings } from "./hooks/useSettings";
import { UpdaterProvider } from "./hooks/useUpdater";

const isTauri =
  typeof window !== "undefined" &&
  (window as any).__TAURI_INTERNALS__ !== undefined;

// Sidebar background colours per theme — used to paint the native Windows title bar.
// COLORREF format is handled on the Rust side; we just send R, G, B separately.
const THEME_TITLEBAR: Record<
  string,
  { r: number; g: number; b: number; lightText: boolean }
> = {
  obsidian: { r: 0x0d, g: 0x0d, b: 0x0d, lightText: false },
  void: { r: 0x0d, g: 0x11, b: 0x17, lightText: false },
  nebula: { r: 0x11, g: 0x0f, b: 0x22, lightText: false },
  glacier: { r: 0x0c, g: 0x15, b: 0x26, lightText: false },
  matrix: { r: 0x09, g: 0x0d, b: 0x13, lightText: false },
  ghost: { r: 0xf1, g: 0xf5, b: 0xf9, lightText: true },
  dark: { r: 0x0d, g: 0x0d, b: 0x0d, lightText: false },
  light: { r: 0xf1, g: 0xf5, b: 0xf9, lightText: true },
  system: { r: 0x0d, g: 0x11, b: 0x17, lightText: false },
};

function App() {
  const { theme } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;

    // Set data-theme attribute for our custom variable engine
    root.setAttribute("data-theme", theme);

    // Handle standard .dark class for Tailwind compatibility
    if (
      ["dark", "obsidian", "matrix", "void", "nebula", "glacier"].includes(
        theme,
      )
    ) {
      root.classList.add("dark");
    } else if (["light", "ghost"].includes(theme)) {
      root.classList.remove("dark");
    } else if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.setAttribute("data-theme", isDark ? "obsidian" : "ghost");
    }

    // Paint the native Windows title bar to match the sidebar colour for this theme
    if (isTauri) {
      const color = THEME_TITLEBAR[theme] ?? THEME_TITLEBAR["matrix"];
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("set_title_bar_color", {
          r: color.r,
          g: color.g,
          b: color.b,
          lightText: color.lightText,
        }).catch(() => {
          /* non-Windows or DWM unavailable — silent */
        });
      });
    }
  }, [theme]);

  return (
    <UpdaterProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-base">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          }
        >
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
    </UpdaterProvider>
  );
}

export default App;
