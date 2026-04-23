import { useQBittorrentTransfer } from "../../hooks/useQBittorrentTransfer";
import { useSettingsStore } from "../../stores/settings.store";
import { Download, Upload, Rabbit, Turtle, Loader2 } from "lucide-react";
import prettyBytes from "pretty-bytes";
import { getQbtClient } from "../../services/qbittorrent.service";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUIStore } from "../../stores/ui.store";

export function TransferStatsBar() {
  const { qbittorrent } = useSettingsStore();
  const { transfer } = useQBittorrentTransfer();
  const { isSidebarCollapsed } = useUIStore();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  if (!qbittorrent.enabled) return null;

  const handleToggleSpeed = async () => {
    if (!transfer) return;
    try {
      setIsToggling(true);
      const client = getQbtClient();
      if (client) {
        await client.toggleAltSpeedLimits();
        await new Promise((r) => setTimeout(r, 1200));
        await queryClient.invalidateQueries({
          queryKey: ["qbittorrent", "transfer"],
        });
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 right-0 bg-surface/80 backdrop-blur-md border-t border-border px-6 py-2.5 flex items-center justify-between z-100 transition-all duration-300 ease-in-out select-none ${
        isSidebarCollapsed ? "left-20" : "left-64"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/30 to-transparent" />
      <div className="flex items-center gap-6">
        {/* QUI Style Toggle Container */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleSpeed}
            disabled={isToggling || !transfer}
            className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
              isToggling || !transfer
                ? "opacity-50 grayscale"
                : "hover:bg-surface/10"
            }`}
            title="Toggle Alternative Speed Limits"
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
            ) : transfer?.use_alt_speed_limits ? (
              <Turtle className="h-4 w-4 text-status-error drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
            ) : (
              <Rabbit className="h-4 w-4 text-status-ok drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            )}
            <span
              className={`text-[10px] tracking-tight ${
                !transfer
                  ? "text-muted-foreground/20"
                  : transfer.use_alt_speed_limits
                    ? "text-status-error"
                    : "text-status-ok"
              }`}
            >
              {!transfer
                ? "Connecting..."
                : transfer.use_alt_speed_limits
                  ? "Alt Speed"
                  : "Full Speed"}
            </span>
          </button>

          <div className="h-4 w-px bg-border/40" />

          {/* Clean QUI Speed Grouping */}
          <div className="flex items-center gap-5 font-mono">
            <div className="flex items-center gap-2 group">
              <Download className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              <span className="text-foreground drop-shadow-sm min-w-[70px]">
                {prettyBytes(transfer?.dl_info_speed || 0)}/s
              </span>
            </div>
            <div className="flex items-center gap-2 group">
              <Upload className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              <span className="text-foreground drop-shadow-sm min-w-[70px]">
                {prettyBytes(transfer?.up_info_speed || 0)}/s
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 border-l border-border/40 pl-6 ml-2">
          <span className="text-muted-foreground/30 text-[9px] uppercase tracking-[0.2em] font-black">
            Session
          </span>
          <div className="flex items-center gap-4 text-muted-foreground/60 text-[10px]">
            <span>↓ {prettyBytes(transfer?.dl_info_data || 0)}</span>
            <span>↑ {prettyBytes(transfer?.up_info_data || 0)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Minimalist Status Grouping */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-px bg-border/40" />
          <div className="flex items-center gap-2.5 px-3 py-1 rounded bg-surface border border-border">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                transfer?.connection_status === "connected"
                  ? "bg-status-ok shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-ok)_50%,transparent)]"
                  : "bg-status-error shadow-[0_0_8px_color-mix(in_srgb,var(--color-status-error)_50%,transparent)]"
              }`}
            />
            <span className="text-[10px] text-foreground/70 uppercase tracking-wider">
              qBittorrent
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              |
            </span>
            <span
              className={`text-[10px] uppercase tracking-tighter font-black ${
                transfer?.connection_status === "connected"
                  ? "text-status-ok"
                  : "text-status-error"
              }`}
            >
              {transfer?.connection_status || "Offline"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
