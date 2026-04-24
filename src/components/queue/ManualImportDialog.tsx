import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { sonarrService } from "../../services/sonarr.service";
import { radarrService } from "../../services/radarr.service";
import { useSettingsStore } from "../../stores/settings.store";
import { UnifiedQueueItem } from "../../types/common.types";
import { PackageCheck, AlertTriangle, Loader2, FileX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface ManualImportDialogProps {
  item: UnifiedQueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManualImportDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: ManualImportDialogProps) {
  const { sonarr, radarr } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!open || !item) return;

    const fetchCandidates = async () => {
      setLoading(true);
      setCandidates([]);
      setSelected(new Set());

      try {
        let items: any[];

        if (item.service === "sonarr") {
          items = await sonarrService.getManualImportItems(
            sonarr.baseUrl,
            sonarr.apiKey,
            item.downloadId,
            item.sourceId,
          );
        } else {
          items = await radarrService.getManualImportItems(
            radarr.baseUrl,
            radarr.apiKey,
            item.downloadId,
            item.sourceId,
          );
        }

        setCandidates(items);

        // Pre-select all importable (non-rejected) candidates
        const initialSelected = new Set<number>();
        items.forEach((c, idx) => {
          if (!c.rejections?.length) {
            initialSelected.add(idx);
          }
        });
        setSelected(initialSelected);
      } catch (err: any) {
        toast.error(`Failed to fetch import candidates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [open, item]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (!item || selected.size === 0) return;

    const filesToImport = [...selected].map((idx) => candidates[idx]);
    setImporting(true);

    try {
      if (item.service === "sonarr") {
        await sonarrService.processManualImport(
          sonarr.baseUrl,
          sonarr.apiKey,
          filesToImport,
        );
      } else {
        await radarrService.processManualImport(
          radarr.baseUrl,
          radarr.apiKey,
          filesToImport,
        );
      }

      toast.success(
        `Successfully queued ${filesToImport.length} file(s) for import`,
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // ── helpers ────────────────────────────────────────────────────────────────

  const getFilename = (path: string): string =>
    path?.split(/[\\/]/).pop() ?? path ?? "(unknown)";

  const getMatchedLabel = (candidate: any): string => {
    if (item?.service === "sonarr") {
      const seriesTitle = candidate.series?.title ?? "Unknown Series";
      const epTags =
        candidate.episodes
          ?.map(
            (e: any) =>
              `S${String(e.seasonNumber).padStart(2, "0")}E${String(
                e.episodeNumber,
              ).padStart(2, "0")}`,
          )
          .join(", ") ?? "";
      return epTags ? `${seriesTitle} · ${epTags}` : seriesTitle;
    }
    return candidate.movie?.title ?? "Unknown Movie";
  };

  const getRejections = (candidate: any): string[] => {
    if (!candidate.rejections?.length) return [];
    return candidate.rejections.map((r: any) =>
      typeof r === "string" ? r : (r.reason ?? r.message ?? JSON.stringify(r)),
    );
  };

  const importableCount = selected.size;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl bg-surface border-foreground/10",
          "shadow-2xl rounded-2xl",
        )}
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <PackageCheck className="h-4 w-4 text-status-warning shrink-0" />
            <DialogTitle className="text-sm font-black italic uppercase tracking-tighter text-foreground">
              Manual Import
            </DialogTitle>
          </div>

          {item && (
            <p
              className="text-[10px] text-foreground/40 font-black uppercase tracking-widest truncate mt-0.5"
              title={item.title}
            >
              {item.title}
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-foreground/5 mt-1" />
        </DialogHeader>

        {/* Candidate list */}
        <div className="max-h-96 overflow-y-auto space-y-2 py-1 pr-0.5 -mr-1">
          {loading ? (
            /* ── loading state ── */
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                Scanning import candidates…
              </span>
            </div>
          ) : candidates.length === 0 ? (
            /* ── empty state ── */
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <FileX className="h-8 w-8 text-foreground/10" />
              <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 max-w-xs leading-relaxed">
                No importable files found for this download
              </p>
            </div>
          ) : (
            /* ── candidate rows ── */
            candidates.map((candidate, idx) => {
              const isRejected = (candidate.rejections?.length ?? 0) > 0;
              const rejections = getRejections(candidate);
              const isChecked = selected.has(idx);
              const filename = getFilename(candidate.path);
              const matchedLabel = getMatchedLabel(candidate);
              const quality: string | undefined =
                candidate.quality?.quality?.name;
              const languages: string | undefined = candidate.languages
                ?.map((l: any) => l.name)
                .join(", ");

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/2 transition-colors",
                    isRejected
                      ? "opacity-50"
                      : "hover:bg-foreground/4 cursor-default",
                  )}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    aria-checked={isChecked && !isRejected}
                    role="checkbox"
                    disabled={isRejected || importing}
                    onClick={() => !isRejected && handleToggle(idx)}
                    className={cn(
                      "mt-0.5 shrink-0 h-4 w-4 rounded border transition-all flex items-center justify-center",
                      isRejected || importing
                        ? "border-foreground/10 cursor-not-allowed"
                        : isChecked
                          ? "bg-accent border-accent/50"
                          : "border-foreground/20 hover:border-foreground/50 cursor-pointer",
                    )}
                  >
                    {isChecked && !isRejected && (
                      <svg
                        className="h-2.5 w-2.5"
                        style={{ color: "var(--bg-base)" }}
                        viewBox="0 0 10 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Filename */}
                    <p
                      className="text-[11px] font-bold text-foreground truncate leading-snug"
                      title={candidate.path}
                    >
                      {filename}
                    </p>

                    {/* Matched title */}
                    <p className="text-[10px] text-foreground/50 truncate">
                      {matchedLabel}
                    </p>

                    {/* Quality & languages pills */}
                    {(quality || languages) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {quality && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-foreground/5 text-foreground/50">
                            {quality}
                          </span>
                        )}
                        {languages && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-foreground/5 text-foreground/50">
                            {languages}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejection messages */}
                    {rejections.length > 0 && (
                      <div className="space-y-0.5 pt-0.5">
                        {rejections.map((msg, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <AlertTriangle className="h-2.5 w-2.5 text-status-warning shrink-0 mt-px" />
                            <span className="text-[10px] text-status-error leading-tight">
                              {msg}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={importing}
            className="text-foreground/50 hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing || importableCount === 0 || loading}
            className={cn(
              "gap-1.5 font-black text-[10px] uppercase tracking-wider",
              "bg-accent hover:bg-accent/90",
            )}
            style={{ color: "var(--bg-base)" }}
          >
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PackageCheck className="h-3.5 w-3.5" />
            )}
            {importing
              ? "Importing…"
              : importableCount > 0
                ? `Import Selected (${importableCount})`
                : "Import Selected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
