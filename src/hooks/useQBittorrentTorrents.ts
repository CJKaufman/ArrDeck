import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settings.store';
import { getQbtClient } from '../services/qbittorrent.service';
import { QBittorrentTorrent } from '../types/qbittorrent.types';
import { useEffect, useState } from 'react';

export function useQBittorrentTorrents(filter: string = 'all') {
  const { qbittorrent } = useSettingsStore();
  const [isAuthed, setIsAuthed] = useState(false);
  const client = getQbtClient(qbittorrent.baseUrl);

  // Initial Auth
  useEffect(() => {
    if (!qbittorrent.enabled || !client) {
      setIsAuthed(false);
      return;
    }

    const doLogin = async () => {
      const success = await client.login(qbittorrent.username, qbittorrent.password);
      setIsAuthed(success);
    };

    doLogin();
  }, [qbittorrent.enabled, qbittorrent.baseUrl, qbittorrent.username, qbittorrent.password]);

  const query = useQuery<QBittorrentTorrent[]>({
    queryKey: ['qbittorrent', 'torrents', filter],
    queryFn: () => client!.getTorrents(filter),
    enabled: qbittorrent.enabled && !!client && isAuthed,
    refetchInterval: 5000,
  });

  return {
    ...query,
    isAuthed,
    torrents: query.data || [],
  };
}
