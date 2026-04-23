import { useState, useMemo, useRef, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

// Robust initialization for WidthProvider in react-grid-layout v2 context
const ResponsiveGridLayout = WidthProvider(Responsive);

import { useServiceStatus } from "../hooks/useServiceStatus";
import { useQBittorrentTransfer } from "../hooks/useQBittorrentTransfer";
import { HealthAlertBanner } from "../components/dashboard/HealthAlertBanner";
import {
  DownloadCloud,
  Link as LinkIcon,
  Tv,
  Film,
  Download,
  Upload,
  Plus,
  RotateCcw,
  X,
  Gauge,
  Activity as ActivityIcon,
  Database,
  Layers,
  HeartPulse,
  Lock,
  Boxes,
  Unlock,
  Zap,
  ShieldCheck,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import { useAnalytics } from "../hooks/useAnalytics";
import { StatCard } from "../components/dashboard/StatCard";
import { ServiceStatusCard } from "../components/dashboard/ServiceStatusCard";
import { ActivityChart } from "../components/dashboard/ActivityChart";
import { QualityDistribution } from "../components/dashboard/QualityDistribution";
import { StorageChart } from "../components/dashboard/StorageChart";
import { HealthDistribution } from "../components/dashboard/HealthDistribution";
import { EfficiencyCard } from "../components/dashboard/EfficiencyCard";
import { SecurityCard } from "../components/dashboard/SecurityCard";

import { useDashboardStore } from "../stores/useDashboardStore";
import { useSettingsStore } from "../stores/settings.store";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";

export function DashboardPage() {
  const { sonarr, radarr, prowlarr, qbittorrent } = useServiceStatus();
  const qbtTransfer = useQBittorrentTransfer();
  const { activityData, storageData, healthData, healthStats, qualityData } =
    useAnalytics();

  const {
    layouts,
    visibleWidgets,
    isEditMode,
    setLayouts,
    toggleWidget,
    setEditMode,
    resetLayout,
  } = useDashboardStore();

  const {
    sonarr: sonarrConfig,
    radarr: radarrConfig,
    prowlarr: prowlarrConfig,
    qbittorrent: qbtConfig,
  } = useSettingsStore();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Long-press detection logic
  const timerRef = useRef<number | null>(null);
  const [holdingId, setHoldingId] = useState<string | null>(null);

  const startLongPress = useCallback(
    (id: string) => {
      if (isEditMode) return;
      setHoldingId(id);
      timerRef.current = window.setTimeout(() => {
        setEditMode(true);
        setHoldingId(null);
      }, 1500);
    },
    [isEditMode, setEditMode],
  );

  const cancelLongPress = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHoldingId(null);
  }, []);

  // Unified health status
  const services = [sonarr, radarr, prowlarr, qbittorrent];
  const allOperational = services.every((s) => !s.isError);
  const someError = services.some((s) => s.isError);
  const statusText = allOperational
    ? "SYSTEM NOMINAL"
    : someError
      ? "CRITICAL ALERT"
      : "SYSTEM WARNING";
  const statusColor = allOperational
    ? "bg-status-ok"
    : someError
      ? "bg-status-error"
      : "bg-status-warning";

  const alerts = useMemo(() => {
    const list: any[] = [];
    const pushAlerts = (service: any, name: string) => {
      if (service.data?.status?.health) {
        service.data.status.health.forEach((h: any) => {
          list.push({
            id: `${name}-${h.message}`,
            service: name,
            message: h.message,
            type: h.type || "warning",
          });
        });
      }
    };
    pushAlerts(sonarr, "SONARR");
    pushAlerts(radarr, "RADARR");
    pushAlerts(prowlarr, "PROWLARR");
    return list;
  }, [sonarr.data, radarr.data, prowlarr.data]);

  const renderWidget = (id: string) => {
    const widgetProps = {
      downlink: {
        title: "Downlink Speed",
        value: prettyBytes(qbtTransfer.data?.dl_info_speed || 0) + "/s",
        subtitle: `Session Total: ${prettyBytes(qbtTransfer.data?.dl_info_data || 0)}`,
        icon: Download,
        iconColorClass: "text-accent",
      },
      uplink: {
        title: "Uplink Speed",
        value: prettyBytes(qbtTransfer.data?.up_info_speed || 0) + "/s",
        subtitle: `Session Total: ${prettyBytes(qbtTransfer.data?.up_info_data || 0)}`,
        icon: Upload,
        iconColorClass: "text-prowlarr",
      },
      storage: {
        title: "Storage Status",
        value: healthStats?.totalFiles || "-",
        subtitle: `${healthStats?.missing || 0} Files Missing`,
        icon: Tv,
        iconColorClass: "text-sonarr",
      },
      fleet: {
        title: "Fleet Monitor",
        value: healthStats?.monitored || "-",
        subtitle: "Monitored Entities Active",
        icon: Film,
        iconColorClass: "text-status-warning",
      },
    };

    const isStatCard = ["downlink", "uplink", "storage", "fleet"].includes(id);

    return (
      <div
        key={id}
        onMouseDown={() => startLongPress(id)}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={() => startLongPress(id)}
        onTouchEnd={cancelLongPress}
        className={cn(
          "group relative h-full transition-all duration-500",
          isEditMode
            ? "cursor-grab active:cursor-grabbing scale-[0.98]"
            : "cursor-default",
          holdingId === id &&
            "scale-[0.96] opacity-70 border-accent shadow-[0_0_20px_rgba(0,180,216,0.2)]",
        )}
      >
        {isStatCard ? (
          <StatCard {...(widgetProps as any)[id]} />
        ) : id === "activity" ? (
          <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl h-full flex flex-col group/tile">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground italic">
                30-Day Grabbing Heartbeat
              </span>
              <ActivityIcon
                size={14}
                className="text-muted-foreground/20 group-hover/tile:text-accent transition-colors"
              />
            </div>
            <div className="flex-1 min-h-0">
              <ActivityChart data={activityData} />
            </div>
          </div>
        ) : id === "efficiency" ? (
          <EfficiencyCard />
        ) : id === "security" ? (
          <SecurityCard />
        ) : id === "storage_dist" ? (
          <StorageChart data={storageData} />
        ) : id === "quality_dist" ? (
          <QualityDistribution data={qualityData} />
        ) : id === "health_dist" ? (
          <HealthDistribution data={healthData} />
        ) : null}

        {isEditMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWidget(id);
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-destructive rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-all z-60 shadow-xl hover:scale-110 active:scale-95 border-2 border-base"
          >
            <X size={12} />
          </button>
        )}
      </div>
    );
  };

  const allPossibleWidgets = [
    {
      id: "downlink",
      label: "Downlink Speed",
      icon: Download,
      color: "text-accent",
    },
    {
      id: "uplink",
      label: "Uplink Speed",
      icon: Upload,
      color: "text-prowlarr",
    },
    { id: "storage", label: "Storage Status", icon: Tv, color: "text-sonarr" },
    { id: "fleet", label: "Fleet Monitor", icon: Film, color: "text-radarr" },
    {
      id: "activity",
      label: "Operational Pulse",
      icon: ActivityIcon,
      color: "text-foreground",
    },
    {
      id: "efficiency",
      label: "System Efficiency",
      icon: Zap,
      color: "text-accent",
    },
    {
      id: "security",
      label: "Security Status",
      icon: ShieldCheck,
      color: "text-status-ok",
    },
    {
      id: "storage_dist",
      label: "Storage Array",
      icon: Database,
      color: "text-foreground",
    },
    {
      id: "quality_dist",
      label: "Quality Layout",
      icon: Layers,
      color: "text-foreground",
    },
    {
      id: "health_dist",
      label: "Health Distribution",
      icon: HeartPulse,
      color: "text-status-error",
    },
  ];

  const availableWidgets = allPossibleWidgets.filter(
    (w) => !visibleWidgets.includes(w.id),
  );

  return (
    <div className="space-y-12 pt-8 md:pt-12 pb-24 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 md:px-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic">
              Mission <span className="text-muted-foreground/30">Control</span>
            </h1>
            <div
              className={`h-2.5 w-2.5 rounded-full ${statusColor} animate-pulse shadow-[0_0_15px] ${allOperational ? "shadow-status-ok" : "shadow-status-error"}`}
            />
            <span className="text-[10px] md:text-[12px] font-black text-muted-foreground tracking-[0.3em] uppercase italic">
              {statusText}
            </span>
          </div>
          <p className="text-muted-foreground font-medium tracking-tight italic uppercase text-[10px] md:text-[11px]">
            System state analytics and global fleet coordination bridge
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isEditMode && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
                <DialogTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-base border-border text-foreground max-w-2xl sm:rounded-3xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                      <Gauge className="text-accent h-6 w-6" />
                      Intelligence{" "}
                      <span className="text-muted-foreground/20">Catalog</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                      Select a module to commission into the operational grid
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-8">
                    {availableWidgets.map((widget) => (
                      <button
                        key={widget.id}
                        type="button"
                        onClick={() => {
                          toggleWidget(widget.id);
                          setIsCatalogOpen(false);
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 hover:border-accent/30 transition-all group gap-4 text-center"
                      >
                        <div
                          className={cn(
                            "p-3 rounded-xl bg-surface/20 group-hover:scale-110 transition-transform",
                            widget.color,
                          )}
                        >
                          <widget.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] font-black uppercase italic tracking-tighter text-muted-foreground group-hover:text-foreground">
                          {widget.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetLayout}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!isEditMode)}
            className={cn(
              "transition-all duration-300 shrink-0",
              isEditMode
                ? "bg-accent text-foreground shadow-[0_0_15px_rgba(0,188,255,0.4)]"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors",
            )}
          >
            {isEditMode ? (
              <Lock className="h-4 w-4 mr-2" />
            ) : (
              <Unlock className="h-4 w-4 mr-2" />
            )}
            <span className="hidden md:inline">
              {isEditMode ? "Lock Deck" : "Configure Deck"}
            </span>
          </Button>
        </div>
      </div>

      <HealthAlertBanner alerts={alerts} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="col-span-1 md:col-span-12 lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter italic">
              Service <span className="text-accent/60">Bridge</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">
              Telemetry Recovered
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {sonarrConfig.enabled && (
              <ServiceStatusCard
                name="Sonarr"
                query={sonarr}
                colorClass="border-sonarr"
              />
            )}
            {radarrConfig.enabled && (
              <ServiceStatusCard
                name="Radarr"
                query={radarr}
                colorClass="border-radarr"
              />
            )}
            {prowlarrConfig.enabled && (
              <ServiceStatusCard
                name="Prowlarr"
                query={prowlarr}
                colorClass="border-prowlarr"
              />
            )}
            {qbtConfig.enabled && (
              <ServiceStatusCard
                name="qBittorrent"
                query={qbittorrent}
                colorClass="border-accent"
              />
            )}
            {!sonarrConfig.enabled &&
              !radarrConfig.enabled &&
              !prowlarrConfig.enabled &&
              !qbtConfig.enabled && (
                <div className="col-span-full py-12 text-center text-muted-foreground/30 italic font-black uppercase tracking-widest text-xs border border-dashed border-border rounded-2xl">
                  No services active. Commission nodes in Terminal Settings.
                </div>
              )}
          </div>
        </div>
        <div className="col-span-1 md:col-span-12 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tighter italic text-foreground/40">
              Logistics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col justify-center gap-1 group cursor-pointer hover:border-border/60 transition-colors shadow-xl">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors uppercase italic tracking-tighter">
                Transfer Queue
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-foreground group-hover:text-foreground transition-colors uppercase italic tracking-tighter">
                  View Tasks
                </span>
                <DownloadCloud className="h-5 w-5 text-muted-foreground/20 group-hover:text-accent transition-colors" />
              </div>
            </div>
            <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col justify-center gap-1 group cursor-pointer hover:border-border/60 transition-colors shadow-xl">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground group-hover:text-prowlarr transition-colors uppercase italic tracking-tighter">
                Global Search
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-foreground group-hover:text-foreground transition-colors uppercase italic tracking-tighter">
                  Aggregated
                </span>
                <LinkIcon className="h-5 w-5 text-muted-foreground/20 group-hover:text-prowlarr transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative transition-all duration-500 min-h-[500px] rounded-3xl",
          isEditMode &&
            "bg-surface/30 bg-grid-dots ring-1 ring-border p-6 shadow-2xl deck-edit-active",
        )}
      >
        {isEditMode && (
          <div className="absolute top-6 left-6 z-50 animate-in fade-in slide-in-from-top-2 duration-500 flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent bg-accent/10 px-4 py-2 rounded-full border border-accent/20 shadow-[0_0_15px_rgba(0,188,255,0.2)]">
              Operational Deck Unlocked
            </span>
            <Boxes className="text-accent animate-pulse h-4 w-4" />
          </div>
        )}
        {layouts &&
        typeof layouts === "object" &&
        !Array.isArray(layouts) &&
        (layouts as any).lg ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts as any}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={(_current: any, allLayouts: any) =>
              setLayouts(allLayouts)
            }
            margin={[24, 24]}
            useCSSTransforms={true}
          >
            {visibleWidgets.map((id) => (
              <div key={id}>{renderWidget(id)}</div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="h-full w-full flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-muted-foreground/30 animate-pulse">
              <Boxes className="h-12 w-12" />
              <span className="text-[10px] uppercase font-black tracking-[0.3em]">
                Grid Handshake in Progress...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
