import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sonarrService } from '../../services/sonarr.service';
import { useSettingsStore } from '../../stores/settings.store';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { ChevronDown, ChevronRight, Search, LayoutList, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { ReleaseSearchDialog } from './ReleaseSearchDialog';
import { toast } from 'sonner';

interface EpisodeListProps {
  seriesId: number;
}

export function EpisodeList({ seriesId }: EpisodeListProps) {
  const { sonarr } = useSettingsStore();
  const queryClient = useQueryClient();
  const [expandedSeasons, setExpandedSeasons] = useState<Record<number, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<{ id: number; title: string } | null>(null);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ['sonarr', 'episodes', seriesId],
    queryFn: () => sonarrService.getEpisodes(sonarr.baseUrl, sonarr.apiKey, seriesId),
    enabled: !!seriesId && !!sonarr.enabled,
  });

  const mutation = useMutation({
    mutationFn: ({ id, monitored }: { id: number; monitored: boolean }) => 
      sonarrService.updateEpisodeMonitoring(sonarr.baseUrl, sonarr.apiKey, [id], monitored),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sonarr', 'episodes', seriesId] });
      toast.success('Episode tracking updated');
    },
  });

  const seasons = useMemo(() => {
    if (!episodes) return [];
    const grouped: Record<number, any[]> = {};
    episodes.forEach((ep: any) => {
      if (!grouped[ep.seasonNumber]) grouped[ep.seasonNumber] = [];
      grouped[ep.seasonNumber].push(ep);
    });
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map(num => ({ number: num, episodes: grouped[num].sort((a, b) => a.episodeNumber - b.episodeNumber) }));
  }, [episodes]);

  const toggleSeason = (num: number) => {
    setExpandedSeasons(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const handleInteractiveSearch = (ep: any) => {
    setSearchTarget({ id: ep.id, title: `S${ep.seasonNumber}E${ep.episodeNumber} - ${ep.title}` });
    setSearchOpen(true);
  };

  const handleAutomaticSearch = async (ep: any) => {
    try {
      await sonarrService.triggerCommand(sonarr.baseUrl, sonarr.apiKey, 'EpisodeSearch', { episodeIds: [ep.id] });
      toast.success(`Search triggered for ${ep.title}`);
    } catch (err: any) {
      toast.error(`Failed to trigger search: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {seasons.map(season => (
        <div key={season.number} className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden shadow-lg">
          <button 
            onClick={() => toggleSeason(season.number)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/10 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent/20 transition-colors">
                {expandedSeasons[season.number] ? <ChevronDown className="h-5 w-5 text-accent" /> : <ChevronRight className="h-5 w-5 text-accent" />}
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white">
                  {season.number === 0 ? 'Specials' : `Season ${season.number}`}
                </span>
                <p className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em] mt-0.5">
                  {season.episodes.filter((e: any) => e.hasFile).length} OF {season.episodes.length} DOWNLOADED
                </p>
              </div>
            </div>
          </button>

          {expandedSeasons[season.number] && (
            <div className="border-t border-white/10 divide-y divide-white/5 bg-black/20">
              {season.episodes.map((ep: any) => (
                <div key={ep.id} className="px-6 py-4 flex items-center gap-6 text-sm group hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 shrink-0 text-muted-foreground font-black text-xs tracking-widest opacity-40">
                    E{ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white truncate tracking-tight text-base group-hover:text-accent transition-colors drop-shadow-md">{ep.title}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-1 drop-shadow-sm">
                      {ep.airDate || 'TBA'}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      {ep.hasFile ? (
                        <CheckCircle2 className="h-4 w-4 text-status-ok shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                      ) : ep.monitored ? (
                        <Circle className="h-4 w-4 text-accent shadow-[0_0_10px_rgba(0,184,212,0.3)]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-white/60 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                      )}
                      <span className={`text-[10px] uppercase font-black tracking-widest drop-shadow-md ${ep.hasFile ? 'text-status-ok' : ep.monitored ? 'text-accent' : 'text-white/60'}`}>
                        {ep.hasFile ? 'On Disk' : 'Missing'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl text-accent hover:bg-accent/20 border border-white/5"
                        title="Automatic Search"
                        onClick={() => handleAutomaticSearch(ep)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl text-sonarr hover:bg-sonarr/20 border border-white/5"
                        title="Interactive Search"
                        onClick={() => handleInteractiveSearch(ep)}
                      >
                        <LayoutList className="h-4 w-4" />
                      </Button>
                    </div>

                    <Switch 
                      checked={ep.monitored} 
                      onCheckedChange={(v) => mutation.mutate({ id: ep.id, monitored: v })}
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}


      {searchTarget && (
        <ReleaseSearchDialog 
          open={searchOpen}
          onOpenChange={setSearchOpen}
          service="sonarr"
          mediaId={seriesId}
          episodeId={searchTarget.id}
          title={searchTarget.title}
        />
      )}
    </div>
  );
}
