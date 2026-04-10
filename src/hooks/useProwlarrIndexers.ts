import { useQuery } from '@tanstack/react-query';
import { prowlarrService } from '../services/prowlarr.service';
import { useSettingsStore } from '../stores/settings.store';

export function useProwlarrIndexers() {
  const { prowlarr } = useSettingsStore();

  const query = useQuery({
    queryKey: ['prowlarr', 'indexers', 'fleet-health'],
    queryFn: async () => {
      const [indexers, health] = await Promise.all([
        prowlarrService.getIndexers(prowlarr.baseUrl, prowlarr.apiKey),
        prowlarrService.getHealth(prowlarr.baseUrl, prowlarr.apiKey)
      ]);

      return indexers.map(indexer => ({
        ...indexer,
        healthIssues: health.filter(h => {
           // 1. Direct ID Match
           if (h.indexerId === indexer.id || h.resourceId === indexer.id) return true;
           
           // 2. Numeric Message Match (Checking for standalone ID in message/source)
           const idString = indexer.id.toString();
           const message = h.message.toLowerCase();
           const source = h.source.toLowerCase();
           const idRegex = new RegExp(`\\b${idString}\\b`);
           if (idRegex.test(message) || idRegex.test(source)) return true;

           // 3. Fuzzy Name Match
           const name = indexer.name.toLowerCase();
           return source.includes(name) || name.includes(source) || message.includes(name);
        })
      }));
    },
    enabled: prowlarr.enabled && !!prowlarr.baseUrl && !!prowlarr.apiKey,
    refetchInterval: 30000, 
  });

  return {
    indexers: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isAuthed: !!query.data || query.isLoading,
  };
}
