import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settings.store';
import { sonarrService } from '../services/sonarr.service';
import { radarrService } from '../services/radarr.service';
import { UnifiedQueueItem } from '../types/common.types';

export function useUnifiedQueue() {
  const { sonarr, radarr, queueRefreshMs } = useSettingsStore();

  const sonarrQuery = useQuery({
    queryKey: ['queue', 'sonarr'],
    queryFn: () => sonarrService.getQueue(sonarr.baseUrl, sonarr.apiKey),
    enabled: sonarr.enabled && !!sonarr.baseUrl && !!sonarr.apiKey,
    refetchInterval: queueRefreshMs,
  });

  const radarrQuery = useQuery({
    queryKey: ['queue', 'radarr'],
    queryFn: () => radarrService.getQueue(radarr.baseUrl, radarr.apiKey),
    enabled: radarr.enabled && !!radarr.baseUrl && !!radarr.apiKey,
    refetchInterval: queueRefreshMs,
  });

  const combinedItems: UnifiedQueueItem[] = [
    ...(sonarrQuery.data || []),
    ...(radarrQuery.data || []),
  ].sort((a, b) => {
    // Sort by status (active first) then by title
    if (a.status === 'downloading' && b.status !== 'downloading') return -1;
    if (a.status !== 'downloading' && b.status === 'downloading') return 1;
    return a.title.localeCompare(b.title);
  });

  return {
    items: combinedItems,
    isLoading: sonarrQuery.isLoading || radarrQuery.isLoading,
    isError: sonarrQuery.isError || radarrQuery.isError,
    refetch: () => {
      sonarrQuery.refetch();
      radarrQuery.refetch();
    },
    count: combinedItems.length,
  };
}
