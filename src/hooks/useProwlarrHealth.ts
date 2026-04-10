import { useQuery } from '@tanstack/react-query';
import { prowlarrService } from '../services/prowlarr.service';
import { useSettingsStore } from '../stores/settings.store';
import { ProwlarrHealth } from '../types/prowlarr.types';

export function useProwlarrHealth() {
  const { prowlarr } = useSettingsStore();

  const query = useQuery<ProwlarrHealth[]>({
    queryKey: ['prowlarr', 'health'],
    queryFn: () => prowlarrService.getHealth(prowlarr.baseUrl, prowlarr.apiKey),
    enabled: prowlarr.enabled && !!prowlarr.baseUrl && !!prowlarr.apiKey,
    refetchInterval: 60000, // Check system health every minute
  });

  return {
    healthIssues: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasIssues: (query.data?.length || 0) > 0,
  };
}
