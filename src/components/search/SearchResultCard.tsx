import { SearchResult } from '../../hooks/useMediaSearch';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { sonarrService } from '../../services/sonarr.service';
import { radarrService } from '../../services/radarr.service';
import { useSettingsStore } from '../../stores/settings.store';
import { toast } from 'sonner';

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(result.added);
  const { sonarr, radarr } = useSettingsStore();

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      if (result.service === 'sonarr') {
        // Fetch defaults for Sonarr
        const folders = await sonarrService.getRootFolders(sonarr.baseUrl, sonarr.apiKey);
        const profiles = await sonarrService.getQualityProfiles(sonarr.baseUrl, sonarr.apiKey);
        
        if (folders.length === 0 || profiles.length === 0) {
          throw new Error('No root folders or quality profiles configured in Sonarr');
        }

        await sonarrService.addSeries(sonarr.baseUrl, sonarr.apiKey, {
          ...result.raw,
          rootFolderPath: folders[0].path,
          qualityProfileId: profiles[0].id,
          monitored: true,
          addOptions: {
            searchForMissingEpisodes: true
          }
        });
      } else {
        // Fetch defaults for Radarr
        const folders = await radarrService.getRootFolders(radarr.baseUrl, radarr.apiKey);
        const profiles = await radarrService.getQualityProfiles(radarr.baseUrl, radarr.apiKey);

        if (folders.length === 0 || profiles.length === 0) {
          throw new Error('No root folders or quality profiles configured in Radarr');
        }

        await radarrService.addMovie(radarr.baseUrl, radarr.apiKey, {
          ...result.raw,
          rootFolderPath: folders[0].path,
          qualityProfileId: profiles[0].id,
          monitored: true,
          addOptions: {
            searchForMovie: true
          }
        });
      }
      toast.success(`Added ${result.title} to ${result.service}`);
      setAdded(true);
    } catch (err: any) {
      toast.error(`Failed to add: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-surface-2 border-border hover:border-accent/50 transition-all group">
      <div className="flex flex-col h-full">
        <div className="relative aspect-[2/3] overflow-hidden bg-surface-3">
          {result.remotePoster ? (
            <img 
              src={result.remotePoster} 
              alt={result.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-4">
              No Poster Available
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              result.service === 'sonarr' ? 'bg-sonarr/20 text-sonarr border-sonarr/30' : 'bg-radarr/20 text-radarr border-radarr/30'
            }`}>
              {result.service}
            </span>
          </div>
        </div>
        <CardContent className="p-3 flex flex-col flex-1 gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-1" title={result.title}>
              {result.title}
            </h3>
            <p className="text-[10px] text-muted-foreground mb-1">{result.year}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-tight">
              {result.overview}
            </p>
          </div>
          
          <Button 
            className="w-full h-8 text-xs gap-2" 
            variant={added ? "secondary" : "default"}
            disabled={added || isAdding}
            onClick={handleAdd}
          >
            {isAdding ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : added ? (
              <>
                <Check className="h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Add to {result.service}
              </>
            )}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
