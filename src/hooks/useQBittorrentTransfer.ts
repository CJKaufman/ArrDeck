import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settings.store';
import { getQbtClient } from '../services/qbittorrent.service';
import { QBTransferInfo } from '../types/qbittorrent.types';

export function useQBittorrentTransfer() {
  const { qbittorrent } = useSettingsStore();
  const client = getQbtClient();

  const query = useQuery<QBTransferInfo>({
    queryKey: ['qbittorrent', 'transfer'],
    queryFn: () => client!.getTransferInfo(),
    enabled: qbittorrent.enabled && !!client,
    refetchInterval: 5000,
    staleTime: 0, // Force fresh data on every refetch for the speed toggle
  });

  return {
    ...query,
    transfer: query.data,
  };
}
