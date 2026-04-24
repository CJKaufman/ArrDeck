import { useState } from "react";
import { ProwlarrIndexer } from "../../types/prowlarr.types";
import { prowlarrService } from "../../services/prowlarr.service";
import { useSettingsStore } from "../../stores/settings.store";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface Props {
  indexer: ProwlarrIndexer;
  onRefresh?: () => void;
}

export function IndexerCard({ indexer, onRefresh }: Props) {
  const { prowlarr } = useSettingsStore();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await prowlarrService.testIndexer(
        prowlarr.baseUrl,
        prowlarr.apiKey,
        indexer.id,
      );
      toast.success(`${indexer.name} is healthy`);
      onRefresh?.();
    } catch (err: any) {
      toast.error(`${indexer.name} failed health check`);
    } finally {
      setTesting(false);
    }
  };

  const isBackingOff =
    (indexer.disabledUntil && new Date(indexer.disabledUntil) > new Date()) ||
    (indexer.disabledTill && new Date(indexer.disabledTill) > new Date());

  const statusLower = indexer.status?.toLowerCase();
  const healthIssues = indexer.healthIssues || [];

  const hasErrors =
    isBackingOff ||
    statusLower === "unhealthy" ||
    statusLower === "disabled" ||
    statusLower === "failing" ||
    healthIssues.some(
      (h) =>
        h.type?.toLowerCase() === "error" || h.level?.toLowerCase() === "error",
    );

  const hasWarnings =
    statusLower === "warning" ||
    statusLower === "unknown" ||
    healthIssues.some(
      (h) =>
        h.type?.toLowerCase() === "warning" ||
        h.level?.toLowerCase() === "warning",
    ) ||
    (healthIssues.length > 0 && !hasErrors); // Fallback: If has issues but unrecognized type, it's a warning

  const isHealthy =
    indexer.enable && !isBackingOff && !hasErrors && !hasWarnings;

  const statusColorClass = hasErrors
    ? "text-status-error"
    : hasWarnings
      ? "text-status-warning"
      : isHealthy
        ? "text-status-ok"
        : "text-foreground/40";

  const spectralClass = hasErrors
    ? "spectral-red"
    : hasWarnings
      ? "spectral-orange"
      : isHealthy
        ? "spectral-green"
        : "text-foreground/5";

  return (
    <div className="group relative bg-card/50 border border-foreground/5 rounded-2xl p-5 transition-all hover:bg-foreground/5 hover:border-foreground/10 backdrop-blur-sm overflow-hidden">
      {/* Status Glow Background - Enhanced Radiance */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110 ${
          hasErrors
            ? "bg-status-error/40"
            : hasWarnings
              ? "bg-status-warning/40"
              : isHealthy
                ? "bg-status-ok/40"
                : "bg-foreground/5"
        }`}
      />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`relative p-3 rounded-xl border transition-all duration-500 ${spectralClass} ${
              hasErrors
                ? "bg-status-error/10 border-status-error/30"
                : hasWarnings
                  ? "bg-status-warning/10 border-status-warning/30"
                  : isHealthy
                    ? "bg-status-ok/10 border-status-ok/30"
                    : "bg-foreground/5 border-foreground/10 text-foreground/20"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {/* Animated Status Pulse - High Fidelity Bloom */}
            {isHealthy && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-status-ok shadow-[0_0_8px_var(--status-ok)]"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-foreground tracking-tight leading-none mb-2">
              {indexer.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[9px] uppercase font-black tracking-widest px-1.5 h-4 border-foreground/20 text-foreground/60`}
              >
                {indexer.protocol}
              </Badge>
              <span className="text-[9px] font-mono text-foreground/40 uppercase">
                ID: {indexer.id}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/40"
          onClick={handleTest}
          disabled={testing}
        >
          <RefreshCw
            className={`h-4 w-4 ${testing ? "animate-spin text-accent" : ""}`}
          />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-foreground/5 rounded-xl p-4 border border-foreground/5 flex flex-col items-center gap-1 shadow-inner group-hover:bg-foreground/[0.02] transition-colors overflow-hidden">
          <span className="text-[9px] uppercase font-black tracking-widest text-foreground/30">
            Priority
          </span>
          <span className="text-lg font-black text-foreground tracking-tighter">
            {indexer.priority}
          </span>
        </div>
        <div className="bg-foreground/5 rounded-xl p-4 border border-foreground/5 flex flex-col items-center gap-1 shadow-inner group-hover:bg-foreground/[0.02] transition-colors overflow-hidden">
          <span className="text-[9px] uppercase font-black tracking-widest text-foreground/30">
            System State
          </span>
          <span
            className={`text-xs font-black uppercase italic drop-shadow-sm text-center leading-tight ${statusColorClass}`}
          >
            {isBackingOff
              ? "Backoff / Disabled"
              : statusLower === "disabled"
                ? "Disabled / Failing"
                : hasErrors
                  ? "Unhealthy / Error"
                  : hasWarnings
                    ? "Warning / Unknown"
                    : isHealthy
                      ? "Operational"
                      : "Disabled"}
          </span>
        </div>
      </div>

      {/* Cinematic Spectral Flow Status Rail */}
      {indexer.enable && (
        <div className="mt-6 pt-4 border-t border-foreground/5">
          <div
            className={`h-1.5 w-full spectral-rail rounded-full overflow-hidden`}
          >
            <div
              className={`spectral-beam ${
                hasErrors
                  ? "spectral-beam-red"
                  : hasWarnings
                    ? "spectral-beam-amber"
                    : "spectral-beam-green"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
