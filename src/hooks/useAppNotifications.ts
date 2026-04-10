import { useEffect, useRef } from 'react';
import { useQBittorrentTorrents } from './useQBittorrentTorrents';
import { notificationService } from '../services/notification.service';
import { QBTorrentState } from '../types/qbittorrent.types';

const NOTIFIED_HASHES_KEY = 'arrdeck_notified_hashes';

export function useAppNotifications() {
  const { torrents } = useQBittorrentTorrents();
  const prevTorrentsRef = useRef<Record<string, QBTorrentState>>({});
  const isInitialLoadRef = useRef(true);
  
  useEffect(() => {
    if (!torrents || torrents.length === 0) return;

    // Load seen hashes ONCE
    const getSeenHashes = (): Set<string> => {
      try {
        const data = localStorage.getItem(NOTIFIED_HASHES_KEY);
        return data ? new Set(JSON.parse(data)) : new Set();
      } catch {
        return new Set();
      }
    };

    const seenHashesSet = getSeenHashes();
    let cacheChanged = false;
    const currentStatusMap: Record<string, QBTorrentState> = {};

    torrents.forEach(torrent => {
      const prevStatus = prevTorrentsRef.current[torrent.hash];
      const currentStatus = torrent.state;
      currentStatusMap[torrent.hash] = currentStatus;

      // Detection logic:
      const isFinished = currentStatus === 'uploading' || currentStatus === 'stalledUP' || currentStatus === 'forcedUP' || torrent.progress === 1;
      const wasFinished = prevStatus === 'uploading' || prevStatus === 'stalledUP' || prevStatus === 'forcedUP';
      
      const shouldNotify = isFinished && !wasFinished && !seenHashesSet.has(torrent.hash);

      // On initial load, silently seed the cache
      if (isFinished && isInitialLoadRef.current) {
        if (!seenHashesSet.has(torrent.hash)) {
          seenHashesSet.add(torrent.hash);
          cacheChanged = true;
        }
      } else if (shouldNotify) {
        let serviceName = 'Client';
        if (torrent.category.toLowerCase().includes('sonarr')) serviceName = 'Sonarr';
        if (torrent.category.toLowerCase().includes('radarr')) serviceName = 'Radarr';
        
        notificationService.notify({
          title: 'Download Complete',
          body: `${torrent.name} has finished downloading.`,
          service: serviceName
        });

        seenHashesSet.add(torrent.hash);
        cacheChanged = true;
      }
    });

    // Batch update localStorage ONCE if changes occurred
    if (cacheChanged) {
      localStorage.setItem(NOTIFIED_HASHES_KEY, JSON.stringify(Array.from(seenHashesSet)));
    }

    prevTorrentsRef.current = currentStatusMap;
    
    // Mark initial load as complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [torrents]);
}
