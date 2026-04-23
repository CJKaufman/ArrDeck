import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  Calendar,
  Monitor,
  Clock,
  HardDrive,
  Info,
  Settings2,
  ListVideo,
  Search,
  LayoutList,
} from "lucide-react";
import { sonarrService } from "../../services/sonarr.service";
import { radarrService } from "../../services/radarr.service";
import { useSettingsStore } from "../../stores/settings.store";
import { EpisodeList } from "./EpisodeList";
import { ReleaseSearchDialog } from "./ReleaseSearchDialog";
import { toast } from "sonner";

interface MediaDetailSheetProps {
  item: any;
  service: "sonarr" | "radarr";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaDetailSheet({
  item,
  service,
  open,
  onOpenChange,
}: MediaDetailSheetProps) {
  const { sonarr, radarr } = useSettingsStore();
  const config = service === "sonarr" ? sonarr : radarr;
  const queryClient = useQueryClient();

  const [localItem, setLocalItem] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync local state when item changes or sheet opens
  useState(() => {
    if (item) setLocalItem(JSON.parse(JSON.stringify(item)));
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles", service],
    queryFn: () => {
      if (service === "sonarr")
        return sonarrService.getQualityProfiles(sonarr.baseUrl, sonarr.apiKey);
      return radarrService.getQualityProfiles(radarr.baseUrl, radarr.apiKey);
    },
    enabled: open && !!config.enabled,
  });

  const updateMutation = useMutation({
    mutationFn: (updated: any) => {
      if (service === "sonarr")
        return sonarrService.updateSeries(
          sonarr.baseUrl,
          sonarr.apiKey,
          updated,
        );
      return radarrService.updateMovie(radarr.baseUrl, radarr.apiKey, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", service] });
      toast.success("Settings saved successfully");
    },
    onError: (err: any) => {
      toast.error(`Failed to save: ${err.message}`);
    },
  });

  if (!item) return null;

  const poster =
    item.images?.find((i: any) => i.coverType === "poster")?.remoteUrl ||
    item.images?.find((i: any) => i.coverType === "poster")?.url;

  const handleUpdate = (key: string, value: any) => {
    setLocalItem((prev: any) => {
      const next = { ...prev, [key]: value };
      updateMutation.mutate(next);
      return next;
    });
  };

  const handleSearch = async (manual: boolean) => {
    if (manual) {
      setSearchOpen(true);
    } else {
      try {
        const cmdName = service === "sonarr" ? "SeriesSearch" : "MovieSearch";
        const body =
          service === "sonarr" ? { seriesId: item.id } : { movieId: item.id };
        await (
          service === "sonarr" ? sonarrService : radarrService
        ).triggerCommand(config.baseUrl, config.apiKey, cmdName, body);
        toast.success("Automatic search triggered");
      } catch (err: any) {
        toast.error(`Search failed: ${err.message}`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[90vw] lg:max-w-[1050px] max-h-[94vh] overflow-hidden flex flex-col bg-surface border-foreground/10 p-0 shadow-[0_0_100px_rgba(0,0,0,0.7)] rounded-[1.5rem]">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
          {poster && (
            <img
              src={poster}
              alt=""
              className="w-full h-full object-cover scale-150 blur-[120px]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/95" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10">
          <DialogHeader className="text-left space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="w-44 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-surface-3 border border-foreground/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 hover:scale-[1.04] group hover:shadow-accent/30">
                {poster ? (
                  <img
                    src={poster}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm italic">
                    No Poster
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6 pb-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border-none shadow-lg shadow-black/20 ${service === "sonarr" ? "bg-sonarr text-foreground" : "bg-radarr text-foreground"}`}
                    >
                      {service === "sonarr" ? "TV Series" : "Movie"}
                    </Badge>
                    <div className="h-1 w-1 rounded-full bg-foreground/30" />
                    <span className="text-xs font-black text-foreground/50 uppercase tracking-[0.2em]">
                      {item.status}
                    </span>
                  </div>
                  <DialogTitle className="text-4xl lg:text-5xl font-black leading-[1] tracking-tight text-foreground drop-shadow-2xl">
                    {item.title}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-foreground/60 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 opacity-50" /> {item.year}
                    </span>
                    <span className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 opacity-50" />{" "}
                      {item.runtime
                        ? `${item.runtime}m`
                        : item.certification || "NR"}
                    </span>
                    <span className="bg-foreground/10 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-foreground">
                      {item.certification || "NR"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.genres?.map((g: string) => (
                    <Badge
                      key={g}
                      variant="outline"
                      className="px-3 py-1 text-[10px] font-black bg-foreground/5 border-foreground/10 rounded-lg hover:bg-foreground/10 transition-all uppercase tracking-wider"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    size="lg"
                    className={`gap-3 font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-2xl transition-all active:scale-95 px-8 h-12 ${service === "sonarr" ? "bg-sonarr hover:bg-sonarr/80" : "bg-radarr hover:bg-radarr/80"}`}
                    onClick={() => handleSearch(false)}
                  >
                    <Search className="h-5 w-5" /> Scan for Miracles
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-3 border-foreground/10 hover:bg-foreground/10 bg-foreground/5 font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-2xl backdrop-blur-xl px-8 h-12"
                    onClick={() => handleSearch(true)}
                  >
                    <LayoutList className="h-5 w-5" /> Browse Releases
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed text-base max-w-3xl font-semibold antialiased drop-shadow-xl border-l-[4px] border-accent/40 pl-6 py-1">
              {item.overview || "No description available for this title."}
            </p>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-fit bg-foreground/5 backdrop-blur-md border border-foreground/10 h-11 gap-1.5 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="overview"
                className="rounded-xl px-6 data-[active]:bg-accent data-[active]:text-foreground transition-all font-bold gap-2"
              >
                <Info className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="rounded-xl px-6 data-[active]:bg-accent data-[active]:text-foreground transition-all font-bold gap-2"
              >
                <Settings2 className="h-4 w-4" /> Management
              </TabsTrigger>
              {service === "sonarr" && (
                <TabsTrigger
                  value="episodes"
                  className="rounded-xl px-6 data-[active]:bg-accent data-[active]:text-foreground transition-all font-bold gap-2"
                >
                  <ListVideo className="h-4 w-4" /> Episodes
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 opacity-40">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                      Storage Status
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">
                      {service === "sonarr"
                        ? `${item.statistics?.episodeFileCount || 0}/${item.statistics?.episodeCount || 0}`
                        : item.hasFile
                          ? `${(item.sizeOnDisk / 1024 ** 3).toFixed(1)} GB`
                          : "Missing"}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                      Available on Disk
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 opacity-40">
                    <Monitor className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                      Quality Profile
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground truncate">
                      {item.qualityProfileName}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                      Resolution & Codec
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4 opacity-40">
                    <Info className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                      Air Time
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground truncate">
                      {item.network || "Unknown"}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                      {item.airTime || "Released"}
                    </p>
                  </div>
                </div>
              </div>

              {item.ratings && (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-1">
                    Critic Scores
                  </h4>
                  <div className="flex gap-10">
                    {item.ratings.imdb && (
                      <div className="group cursor-default">
                        <span className="text-[10px] text-muted-foreground/50 uppercase font-black tracking-widest group-hover:text-status-warning transition-colors">
                          IMDB
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">
                            {item.ratings.imdb.value.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground font-bold">
                            / 10
                          </span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                          {item.ratings.imdb.votes.toLocaleString()} Votes
                        </p>
                      </div>
                    )}
                    {item.ratings.tmdb && (
                      <div className="group cursor-default">
                        <span className="text-[10px] text-muted-foreground/50 uppercase font-black tracking-widest group-hover:text-sonarr transition-colors">
                          TMDB
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">
                            {(item.ratings.tmdb.value * 10).toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground font-bold">
                            %
                          </span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                          {item.ratings.tmdb.votes.toLocaleString()} Votes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="management" className="mt-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-black text-foreground tracking-tight">
                        Active Monitoring
                      </p>
                      <p className="text-xs text-foreground/50 font-medium">
                        Auto-download new releases
                      </p>
                    </div>
                    <Switch
                      checked={localItem?.monitored}
                      onCheckedChange={(v) => handleUpdate("monitored", v)}
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>

                  <div className="h-px bg-foreground/10 w-full" />

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Target Quality
                    </label>
                    <Select
                      value={localItem?.qualityProfileId?.toString()}
                      onValueChange={(v) =>
                        handleUpdate("qualityProfileId", parseInt(v))
                      }
                    >
                      <SelectTrigger className="w-full bg-foreground/5 h-14 border-foreground/10 focus:ring-accent rounded-xl font-bold text-foreground">
                        <SelectValue placeholder="Select quality profile" />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-foreground/10 rounded-xl">
                        {profiles?.map((p: any) => (
                          <SelectItem
                            key={p.id}
                            value={p.id.toString()}
                            className="font-bold"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Metadata Tags
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.tags?.length > 0 ? (
                        item.tags.map((t: any) => (
                          <Badge
                            key={t}
                            className="bg-accent/20 text-accent border-accent/20 px-3 py-1 font-bold text-[10px] rounded-lg"
                          >
                            {t}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-foreground/30 italic">
                          No tags assigned to this title
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-foreground/10 w-full" />

                  <div className="space-y-1">
                    <p className="text-xs font-black text-foreground/60">
                      Root Folder
                    </p>
                    <p className="text-xs font-mono text-foreground/40 break-all">
                      {item.path || "Auto-generated"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {service === "sonarr" && (
              <TabsContent value="episodes" className="mt-0">
                <EpisodeList seriesId={item.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>

      <ReleaseSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        service={service}
        mediaId={item.id}
        title={item.title}
      />
    </Dialog>
  );
}
