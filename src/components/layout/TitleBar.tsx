import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Tv, Minus, Maximize2, Minimize2, X } from "lucide-react";

const isTauri =
  typeof window !== "undefined" &&
  (window as any).__TAURI_INTERNALS__ !== undefined;

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/sonarr": "Sonarr",
  "/radarr": "Radarr",
  "/prowlarr": "Prowlarr",
  "/qbittorrent": "qBittorrent",
  "/queue": "Queue",
  "/search": "Search",
  "/settings": "Settings",
};

function getPageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  const match = Object.keys(PAGE_LABELS)
    .filter((k) => k !== "/")
    .find((k) => pathname.startsWith(k));
  return match ? PAGE_LABELS[match] : "ArrDeck";
}

export function TitleBar() {
  const location = useLocation();
  const [isMaximized, setIsMaximized] = useState(false);

  const pageLabel = getPageLabel(location.pathname);

  // Track maximized state so we can swap the icon
  useEffect(() => {
    if (!isTauri) return;

    let unlisten: (() => void) | undefined;

    const setup = async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();

      setIsMaximized(await win.isMaximized());

      const un = await win.onResized(async () => {
        setIsMaximized(await win.isMaximized());
      });
      unlisten = un;
    };

    setup().catch(console.error);
    return () => unlisten?.();
  }, []);

  const minimize = useCallback(async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  }, []);

  const toggleMaximize = useCallback(async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().toggleMaximize();
  }, []);

  const close = useCallback(async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().close();
  }, []);

  return (
    <div
      data-tauri-drag-region
      className="h-8 flex items-center shrink-0 select-none bg-sidebar border-b border-foreground/5 z-200 relative"
    >
      {/* Brand — pointer-events-none so the drag region still works here */}
      <div className="flex items-center gap-2 px-3 pointer-events-none">
        <Tv className="h-3 w-3 text-sonarr shrink-0" />
        <span className="text-[10px] font-black italic uppercase tracking-widest text-foreground/60">
          ArrDeck
        </span>
      </div>

      {/* Spacer / centre label — fills remaining drag region */}
      <div
        data-tauri-drag-region
        className="flex-1 h-full flex items-center justify-center pointer-events-none"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/20">
          {pageLabel}
        </span>
      </div>

      {/* Window controls — these must NOT be pointer-events-none */}
      <div className="flex items-stretch h-full">
        {/* Minimize */}
        <button
          onClick={minimize}
          className="w-11 h-full flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-colors"
          title="Minimize"
        >
          <Minus size={12} strokeWidth={2} />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={toggleMaximize}
          onDoubleClick={(e) => e.stopPropagation()}
          className="w-11 h-full flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Minimize2 size={11} strokeWidth={2} />
          ) : (
            <Maximize2 size={11} strokeWidth={2} />
          )}
        </button>

        {/* Close */}
        <button
          onClick={close}
          className="w-11 h-full flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-destructive transition-colors"
          title="Close"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
