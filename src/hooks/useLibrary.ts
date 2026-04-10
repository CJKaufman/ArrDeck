import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useSettingsStore } from '../stores/settings.store';
import { sonarrService } from '../services/sonarr.service';
import { radarrService } from '../services/radarr.service';
import { useDebounce } from './useDebounce';

export type LibraryFilter = 'all' | 'monitored' | 'missing' | 'cutoff';

export function useLibrary(service: 'sonarr' | 'radarr') {
  const { sonarr, radarr } = useSettingsStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const config = service === 'sonarr' ? sonarr : radarr;
  const isEnabled = config.enabled && !!config.baseUrl && !!config.apiKey;

  const { data: rawData, isLoading, isError, refetch } = useQuery({
    queryKey: ['library', service],
    queryFn: () => {
      if (service === 'sonarr') return sonarrService.getSeries(sonarr.baseUrl, sonarr.apiKey);
      return radarrService.getMovies(radarr.baseUrl, radarr.apiKey);
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const filteredItems = useMemo(() => {
    if (!rawData) return [];

    return rawData
      .filter((item: any) => {
        // Search filter
        if (debouncedSearch && !item.title.toLowerCase().includes(debouncedSearch.toLowerCase())) {
          return false;
        }


        // Status filters
        if (filter === 'monitored' && !item.monitored) return false;
        
        if (service === 'sonarr') {
          if (filter === 'missing' && item.statistics?.percentOfEpisodes === 100) return false;
        } else {
          if (filter === 'missing' && item.hasFile) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => a.title.localeCompare(b.title));
  }, [rawData, search, filter, service]);

  return {
    items: filteredItems,
    isLoading,
    isError,
    search,
    setSearch,
    filter,
    setFilter,
    refetch,
    totalCount: rawData?.length || 0,
    filteredCount: filteredItems.length,
  };
}
