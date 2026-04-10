import { useQuery } from '@tanstack/react-query';
import { useSettingsStore, ServiceConfig } from '../stores/settings.store';
import { createApiClient } from '../services/api-client';
import { getQbtClient } from '../services/qbittorrent.service';

export interface SystemStatus {
  version: string;
  osName: string;
  isLinux: boolean;
  isMacOs: boolean;
  isWindows: boolean;
  branch: string;
}

export interface HealthIssue {
  source: string;
  type: 'ok' | 'notice' | 'warning' | 'error';
  message: string;
  wikiUrl?: string;
}

const fetchStatus = async (service: 'sonarr' | 'radarr' | 'prowlarr', config: ServiceConfig) => {
  const client = createApiClient(config.baseUrl, config.apiKey);
  const statusEndpoint = service === 'prowlarr' ? '/api/v1/system/status' : '/api/v3/system/status';
  const healthEndpoint = service === 'prowlarr' ? '/api/v1/health' : '/api/v3/health';
  
  const [statusRes, healthRes] = await Promise.all([
    client.get<SystemStatus>(statusEndpoint),
    client.get<HealthIssue[]>(healthEndpoint).catch(() => ({ data: [] })) // Fallback if health fails
  ]);
  
  return {
    status: statusRes.data,
    health: healthRes.data,
  };
};

export function useServiceStatus() {
  const { sonarr, radarr, prowlarr, qbittorrent, dashboardRefreshMs } = useSettingsStore();

  const sonarrQuery = useQuery({
    queryKey: ['system', 'status', 'sonarr'],
    queryFn: () => fetchStatus('sonarr', sonarr),
    enabled: sonarr.enabled && !!sonarr.baseUrl && !!sonarr.apiKey,
    refetchInterval: dashboardRefreshMs > 0 ? dashboardRefreshMs : false,
  });

  const radarrQuery = useQuery({
    queryKey: ['system', 'status', 'radarr'],
    queryFn: () => fetchStatus('radarr', radarr),
    enabled: radarr.enabled && !!radarr.baseUrl && !!radarr.apiKey,
    refetchInterval: dashboardRefreshMs > 0 ? dashboardRefreshMs : false,
  });

  const prowlarrQuery = useQuery({
    queryKey: ['system', 'status', 'prowlarr'],
    queryFn: () => fetchStatus('prowlarr', prowlarr),
    enabled: prowlarr.enabled && !!prowlarr.baseUrl && !!prowlarr.apiKey,
    refetchInterval: dashboardRefreshMs > 0 ? dashboardRefreshMs : false,
  });

  const qbtQuery = useQuery({
    queryKey: ['system', 'status', 'qbittorrent'],
    queryFn: async () => {
      const client = getQbtClient(qbittorrent.baseUrl);
      if (!client) throw new Error('Client not configured');
      const version = await client.getVersion();
      return {
        status: { version },
        health: [], // qbt doesn't have health endpoint like *arrs
      };
    },
    enabled: qbittorrent.enabled && !!qbittorrent.baseUrl,
    refetchInterval: dashboardRefreshMs > 0 ? dashboardRefreshMs : false,
  });

  return {
    sonarr: sonarrQuery,
    radarr: radarrQuery,
    prowlarr: prowlarrQuery,
    qbittorrent: qbtQuery,
  };
}
