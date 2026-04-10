import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sonarrService } from '../../services/sonarr.service';
import { radarrService } from '../../services/radarr.service';
import { useSettingsStore } from '../../stores/settings.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Download, AlertTriangle, LayoutList, Info, HardDrive, Clock } from 'lucide-react';
import { toast } from 'sonner';
import prettyBytes from 'pretty-bytes';

interface ReleaseSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: 'sonarr' | 'radarr';
  mediaId: number;
  episodeId?: number;
  title: string;
}

export function ReleaseSearchDialog({ 
  open, onOpenChange, service, mediaId, episodeId, title 
}: ReleaseSearchDialogProps) {
  const { sonarr, radarr } = useSettingsStore();
  const config = service === 'sonarr' ? sonarr : radarr;
  const [downloadingGuid, setDownloadingGuid] = useState<string | null>(null);

  const { data: releases, isLoading, isError, refetch } = useQuery({
    queryKey: ['releases', service, mediaId, episodeId],
    queryFn: () => {
      if (service === 'sonarr') return sonarrService.getReleases(sonarr.baseUrl, sonarr.apiKey, mediaId, episodeId);
      return radarrService.getReleases(radarr.baseUrl, radarr.apiKey, mediaId);
    },
    enabled: open && !!config.enabled,
  });

  const handleDownload = async (release: any) => {
    setDownloadingGuid(release.guid);
    try {
      if (service === 'sonarr') {
        await sonarrService.downloadRelease(sonarr.baseUrl, sonarr.apiKey, release.guid, release.indexerId);
      } else {
        await radarrService.downloadRelease(radarr.baseUrl, radarr.apiKey, release.guid, release.indexerId);
      }
      toast.success('Release pushed to download client');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Failed to download: ${err.message}`);
    } finally {
      setDownloadingGuid(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1250px] max-h-[90vh] overflow-hidden flex flex-col p-10 bg-surface border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] rounded-3xl">
        {/* Decorative Backdrop */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

        <DialogHeader className="mb-8 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent/20 text-accent font-black text-[10px] uppercase tracking-widest px-2 py-0 border-none">Interactive Search</Badge>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Scanning all indexers</span>
              </div>
              <DialogTitle className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                Releases for <span className="text-accent drop-shadow-[0_0_15px_rgba(0,184,212,0.4)]">{title}</span>
              </DialogTitle>
            </div>
            
            {!isLoading && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                className="rounded-xl border-white/10 hover:bg-white/5 font-bold h-10 px-4"
              >
                 Refresh Results
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-accent" />
              <div className="absolute inset-0 rounded-full blur-xl bg-accent/20" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black text-white uppercase tracking-widest">Querying Indexers</p>
              <p className="text-sm text-muted-foreground animate-pulse">Consulting your providers for the best available files...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-destructive">
            <AlertTriangle className="h-16 w-16" />
            <div className="text-center space-y-2">
              <p className="text-xl font-black uppercase tracking-widest">Connection Error</p>
              <p className="text-sm opacity-70">Failed to fetch release results. Please check your service configuration.</p>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl border-white/10 font-bold">Try Global Scan Again</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
            <div className="space-y-4">
              {releases?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground space-y-4">
                  <LayoutList className="h-12 w-12 opacity-20" />
                  <p className="text-lg font-bold opacity-30">No matching releases found across your indexed trackers.</p>
                </div>
              ) : (
                releases?.map((release: any) => {
                  const isRejected = release.rejections && release.rejections.length > 0;
                  const scoreColor = release.score > 0 ? 'text-status-ok border-status-ok/30 bg-status-ok/10' : 
                                   release.score < 0 ? 'text-red-400 border-red-400/30 bg-red-400/10' : 
                                   'text-white/40 border-white/10 bg-white/5';
                  
                  return (
                    <div 
                      key={release.guid} 
                      className={`p-5 rounded-2xl border transition-all duration-300 group ${
                        isRejected 
                          ? 'bg-white/[0.02] border-white/5 opacity-50' 
                          : 'bg-white/[0.04] border-white/10 hover:border-accent/40 hover:bg-white/[0.06] shadow-xl'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        {/* Score Badge */}
                        <div className={`shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center transition-transform group-hover:scale-105 ${scoreColor}`}>
                           <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Score</span>
                           <span className="text-2xl font-black">{release.score}</span>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-lg font-black truncate tracking-tight transition-colors drop-shadow-sm ${!isRejected ? 'text-white group-hover:text-accent' : 'text-white/60'}`}>
                              {release.title}
                            </h4>
                            {release.infoUrl && (
                              <a href={release.infoUrl} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
                                <Info className="h-4 w-4" />
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-bold uppercase tracking-wider text-white/70">
                            <div className="flex items-center gap-2">
                              <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-md border border-accent/20 drop-shadow-sm">{release.indexer}</span>
                            </div>
                            <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 opacity-70" /> {prettyBytes(release.size)}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-70" /> {release.age || 'Current'}</span>
                            <span className={`px-2 py-0.5 rounded border border-white/20 drop-shadow-sm ${!isRejected ? 'text-white/90 bg-white/10' : 'opacity-60'}`}>
                              {release.quality?.quality?.name}
                            </span>
                            <div className="flex items-center gap-4">
                               <span className="flex items-center gap-1.5 text-status-ok drop-shadow-sm">
                                 <span className="h-1.5 w-1.5 rounded-full bg-status-ok shadow-[0_0_100px_rgba(34,197,94,0.8)]" />
                                 {release.seeders} SEEDERS
                               </span>
                               {release.leechers > 0 && <span className="text-white/50">{release.leechers} LEECHERS</span>}
                            </div>
                          </div>

                          {isRejected && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {release.rejections.map((rej: string, idx: number) => (
                                <Badge key={idx} variant="ghost" className="text-[10px] text-red-500 bg-red-500/10 hover:bg-red-500/20 border-red-500/20 px-2 py-1 flex items-center gap-1.5 rounded-lg font-black uppercase tracking-wider shadow-sm">
                                  <AlertTriangle className="h-3 w-3" /> {rej}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Section */}
                        <div className="shrink-0 pl-4 border-l border-white/5 h-16 flex items-center">
                          <Button 
                            className={`h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                              isRejected 
                                ? 'bg-white/5 hover:bg-white/10 text-white/40 border-white/5' 
                                : 'bg-status-ok hover:bg-status-ok/80 text-white shadow-status-ok/20'
                            }`}
                            onClick={() => handleDownload(release)}
                            disabled={downloadingGuid === release.guid}
                          >
                            {downloadingGuid === release.guid ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            {isRejected ? 'Manual Force' : 'Grab Release'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

