import { useState } from "react";
import { useUnifiedQueue } from "../hooks/useUnifiedQueue";
import { ProgressBar } from "../components/common/ProgressBar";
import { ServiceBadge } from "../components/common/ServiceBadge";
import { ManualImportDialog } from "../components/queue/ManualImportDialog";
import {
  Trash2,
  RefreshCw,
  ListTree,
  AlertTriangle,
  PackageCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { sonarrService } from "../services/sonarr.service";
import { radarrService } from "../services/radarr.service";
import { useSettingsStore } from "../stores/settings.store";
import { UnifiedQueueItem } from "../types/common.types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";

export function QueuePage() {
  const { items, isLoading, refetch } = useUnifiedQueue();
  const { sonarr, radarr } = useSettingsStore();
  const [importTarget, setImportTarget] = useState<UnifiedQueueItem | null>(
    null,
  );

  // ── existing logic ─────────────────────────────────────────────────────────

  const handleRemove = async (item: UnifiedQueueItem) => {
    try {
      if (item.service === "sonarr") {
        await sonarrService.deleteFromQueue(
          sonarr.baseUrl,
          sonarr.apiKey,
          item.id,
        );
      } else {
        await radarrService.deleteFromQueue(
          radarr.baseUrl,
          radarr.apiKey,
          item.id,
        );
      }
      toast.success("Removed from queue");
      refetch();
    } catch (err: any) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  };

  const formatEta = (eta?: string) => {
    if (!eta) return "—";
    try {
      return formatDistanceToNow(new Date(eta), { addSuffix: true });
    } catch {
      return eta;
    }
  };

  const importCount = items.filter((i) => i.needsImport).length;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/5 bg-sidebar/30 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <ListTree className="h-4 w-4 text-accent" />
          <h1 className="text-sm font-black italic uppercase tracking-tighter text-foreground">
            Unified Queue
          </h1>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/40">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-foreground/40 hover:text-foreground transition-colors"
          title="Refresh queue"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
          />
        </Button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {/* Import Required banner */}
        {importCount > 0 && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-status-warning/10 border border-status-warning/20 text-status-warning text-[11px] font-black uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {importCount} item{importCount !== 1 ? "s" : ""} require manual
              import — files could not be automatically processed.
            </span>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="mx-6 mt-4 mb-6 rounded-2xl border border-foreground/5 overflow-hidden">
          <table className="w-full border-collapse text-left">
            {/* Sticky thead */}
            <thead className="sticky top-0 bg-base/90 backdrop-blur-md z-10">
              <tr className="text-[9px] uppercase font-black tracking-widest text-foreground/30 border-b border-foreground/5">
                <th className="py-3 pl-4 pr-2 w-24">Service</th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3 w-28">Quality</th>
                <th className="py-3 px-3 w-48">Progress</th>
                <th className="py-3 px-3 w-44">Status</th>
                <th className="py-3 px-3 w-28">ETA</th>
                <th className="py-3 pr-4 pl-2 w-24 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && items.length === 0 ? (
                /* ── Loading skeleton ── */
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-foreground/3 animate-pulse"
                  >
                    <td className="py-4 pl-4 pr-2">
                      <div className="h-4 w-14 rounded-md bg-foreground/5" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 rounded-md bg-foreground/5 max-w-65" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 w-16 rounded-md bg-foreground/5" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-2 rounded-full bg-foreground/5" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 w-20 rounded-md bg-foreground/5" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 w-16 rounded-md bg-foreground/5" />
                    </td>
                    <td className="py-4 pr-4 pl-2" />
                  </tr>
                ))
              ) : items.length === 0 ? (
                /* ── Empty state ── */
                <tr>
                  <td
                    colSpan={7}
                    className="py-20 text-center text-foreground/10 italic font-black uppercase tracking-widest text-[10px]"
                  >
                    No active downloads found
                  </td>
                </tr>
              ) : (
                /* ── Data rows ── */
                items.map((item) => {
                  const hasMessages = (item.statusMessages?.length ?? 0) > 0;

                  return (
                    <tr
                      key={`${item.service}-${item.id}`}
                      className={cn(
                        "border-b border-foreground/4 hover:bg-foreground/2 transition-colors",
                        item.needsImport && "bg-status-warning/3",
                      )}
                    >
                      {/* Service */}
                      <td
                        className={cn(
                          "py-3 pl-4 pr-2",
                          item.needsImport &&
                            "border-l-2 border-status-warning/40",
                        )}
                      >
                        <ServiceBadge service={item.service} />
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 max-w-0">
                        <p
                          className="text-[11px] font-bold text-foreground truncate"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        {item.downloadClient && (
                          <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest truncate mt-0.5">
                            {item.downloadClient}
                          </p>
                        )}
                      </td>

                      {/* Quality */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-foreground/50 font-bold">
                          {item.quality}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          <ProgressBar
                            progress={item.progress}
                            colorClass={
                              item.service === "sonarr"
                                ? "bg-sonarr"
                                : "bg-radarr"
                            }
                          />
                          <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                            {Math.round(item.progress)}%
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          {item.needsImport ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-status-warning">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Import Required
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/50 w-fit">
                              {item.status}
                            </span>
                          )}
                          {hasMessages &&
                            item.statusMessages
                              .flatMap((m) => m.messages)
                              .map((msg, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] text-foreground/40 font-medium leading-snug truncate max-w-45"
                                  title={msg}
                                >
                                  {msg}
                                </span>
                              ))}
                        </div>
                      </td>

                      {/* ETA */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-foreground/40 font-bold">
                          {formatEta(item.estimatedCompletionTime)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-4 pl-2">
                        <div className="flex items-center gap-1 justify-end">
                          {item.needsImport && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setImportTarget(item)}
                              className="text-status-warning hover:bg-status-warning/10 transition-colors"
                              title="Manual import"
                            >
                              <PackageCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemove(item)}
                            className="text-muted-foreground hover:text-status-error hover:bg-status-error/10 transition-colors"
                            title="Remove from queue"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Manual Import Dialog ─────────────────────────────────────────── */}
      <ManualImportDialog
        item={importTarget}
        open={!!importTarget}
        onOpenChange={(o) => !o && setImportTarget(null)}
        onSuccess={() => {
          setImportTarget(null);
          refetch();
        }}
      />
    </div>
  );
}
