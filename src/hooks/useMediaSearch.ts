import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settings.store';
import { sonarrService } from '../services/sonarr.service';
import { radarrService } from '../services/radarr.service';

export interface SearchResult {
  id: number;
  title: string;
  year: number;
  remotePoster: string;
  overview: string;
  service: 'sonarr' | 'radarr';
  raw: any;
  added: boolean;
}

export function useMediaSearch(query: string) {
  const { sonarr, radarr } = useSettingsStore();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const [sonarrRes, radarrRes] = await Promise.all([
          sonarr.enabled ? sonarrService.lookup(sonarr.baseUrl, sonarr.apiKey, query) : Promise.resolve([]),
          radarr.enabled ? radarrService.lookup(radarr.baseUrl, radarr.apiKey, query) : Promise.resolve([]),
        ]);

        const formattedResults: SearchResult[] = [
          ...(sonarrRes || []).map((item: any) => ({
            id: item.tvdbId || item.id,
            title: item.title,
            year: item.year,
            remotePoster: item.remotePoster || (item.images?.find((i: any) => i.coverType === 'poster')?.remoteUrl),
            overview: item.overview,
            service: 'sonarr',
            raw: item,
            added: !!item.id && item.id > 0 && !item.tvdbId, // if id exists and it's not a fresh lookup match
          })),
          ...(radarrRes || []).map((item: any) => ({
            id: item.tmdbId || item.id,
            title: item.title,
            year: item.year,
            remotePoster: item.remotePoster || (item.images?.find((i: any) => i.coverType === 'poster')?.remoteUrl),
            overview: item.overview,
            service: 'radarr',
            raw: item,
            added: !!item.id && item.id > 0 && !item.tmdbId,
          })),
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, sonarr, radarr]);

  return { results, isLoading };
}
