import { Download, X, ArrowUpCircle, Zap, RefreshCw } from 'lucide-react';
import { useUpdater } from '../../hooks/useUpdater';

export function UpdateBanner() {
  const {
    update,
    isChecking,
    isDownloading,
    downloadProgress,
    isInstalling,
    error,
    dismissed,
    installUpdate,
    dismiss,
  } = useUpdater();

  // Nothing to show — not checking and no update and not in progress
  if (dismissed || (!isChecking && !update && !isDownloading && !isInstalling && !error)) return null;

  return (
    <div className="relative z-50 overflow-hidden">
      {/* Glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      <div className="flex items-center gap-4 px-6 py-3 bg-[#0A0C12]/95 backdrop-blur-md border-b border-accent/20">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isInstalling ? (
            <Zap className="h-4 w-4 text-accent animate-pulse" />
          ) : isDownloading ? (
            <Download className="h-4 w-4 text-accent animate-bounce" />
          ) : isChecking ? (
            <RefreshCw className="h-4 w-4 text-accent/50 animate-spin" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-accent" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {isInstalling ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              Installing update — relaunching…
            </p>
          ) : isDownloading ? (
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                Downloading update — {downloadProgress}%
              </p>
              <div className="h-1 w-full max-w-xs bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          ) : isChecking ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Checking for updates…
            </p>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              <span className="text-accent">Update available</span>
              {update?.version && (
                <span className="text-white/40 ml-2">v{update.version}</span>
              )}
              <span className="text-white/30 ml-2">·</span>
              <span className="text-white/40 ml-2">Restart required after install</span>
            </p>
          )}
        </div>

        {/* Actions — only show when update is ready */}
        {update && !isDownloading && !isInstalling && !isChecking && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={installUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/25 transition-colors"
            >
              <Download className="h-3 w-3" />
              Install Now
            </button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Dismiss during checking */}
        {isChecking && (
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-white/20 hover:text-white/40 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 py-1.5 bg-red-500/10 border-b border-red-500/20">
          <p className="text-[10px] text-red-400 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
