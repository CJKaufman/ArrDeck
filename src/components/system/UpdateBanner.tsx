import { useEffect } from "react";
import {
  Download,
  X,
  ArrowUpCircle,
  Zap,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useUpdater } from "../../hooks/useUpdater";

import { cn } from "../../lib/utils";

export function UpdateBanner() {
  const {
    update,
    isChecking,
    hasChecked,
    isDownloading,
    downloadProgress,
    isInstalling,
    error,
    dismissed,
    installUpdate,
    dismiss,
  } = useUpdater();

  // Auto-dismiss the "You're up to date" banner after a few seconds
  useEffect(() => {
    if (
      hasChecked &&
      !update &&
      !isChecking &&
      !isDownloading &&
      !isInstalling &&
      !error &&
      !dismissed
    ) {
      const timer = setTimeout(() => {
        dismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [
    hasChecked,
    update,
    isChecking,
    isDownloading,
    isInstalling,
    error,
    dismissed,
    dismiss,
  ]);

  const isVisible = !(
    dismissed ||
    (!isChecking &&
      !hasChecked &&
      !update &&
      !isDownloading &&
      !isInstalling &&
      !error)
  );

  return (
    <div
      className={cn(
        "relative z-50 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top",
        isVisible
          ? "max-h-[100px] opacity-100 translate-y-0 translate-z-0"
          : "max-h-0 opacity-0 -translate-y-[100%] translate-z-0 pointer-events-none",
      )}
    >
      {/* Glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent to-transparent opacity-60" />

      <div className="flex items-center gap-4 px-6 py-3 bg-surface/95 backdrop-blur-md border-b border-accent/20">
        {/* Icon */}
        <div className="shrink-0">
          {isInstalling ? (
            <Zap className="h-4 w-4 text-accent animate-pulse" />
          ) : isDownloading ? (
            <Download className="h-4 w-4 text-accent animate-bounce" />
          ) : isChecking ? (
            <RefreshCw className="h-4 w-4 text-accent/50 animate-spin" />
          ) : update ? (
            <ArrowUpCircle className="h-4 w-4 text-accent" />
          ) : hasChecked ? (
            <CheckCircle2 className="h-4 w-4 text-foreground/50" />
          ) : null}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {isInstalling ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              Installing update — relaunching…
            </p>
          ) : isDownloading ? (
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
                Downloading update — {downloadProgress}%
              </p>
              <div className="h-1 w-full max-w-xs bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          ) : isChecking ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              CHECKING FOR UPDATES...
            </p>
          ) : update ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              <span className="text-accent">Update available</span>
              {update?.version && (
                <span className="text-muted-foreground ml-2">
                  v{update.version}
                </span>
              )}
              <span className="text-muted-foreground/60 ml-2">·</span>
              <span className="text-muted-foreground ml-2">
                Restart required after install
              </span>
            </p>
          ) : hasChecked ? (
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
              YOU'RE UP TO DATE
            </p>
          ) : null}
        </div>

        {/* Actions — only show when update is ready */}
        {update && !isDownloading && !isInstalling && !isChecking && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={installUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/25 transition-colors"
            >
              <Download className="h-3 w-3" />
              Install Now
            </button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/80 hover:bg-foreground/5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Dismiss during checking or up to date */}
        {(isChecking || hasChecked) && (
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-foreground/20 hover:text-foreground/40 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="px-6 py-1.5 bg-status-error/10 border-b border-status-error/20">
          <p className="text-[10px] text-status-error font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
