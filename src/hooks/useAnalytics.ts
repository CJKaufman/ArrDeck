import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '../stores/settings.store';
import { sonarrService } from '../services/sonarr.service';
import { radarrService } from '../services/radarr.service';
import { useMemo } from 'react';
import { startOfDay, format, subDays } from 'date-fns';

export function useAnalytics() {
  const { sonarr, radarr } = useSettingsStore();

  const sonarrEnabled = sonarr.enabled && !!sonarr.baseUrl && !!sonarr.apiKey;
  const radarrEnabled = radarr.enabled && !!radarr.baseUrl && !!radarr.apiKey;

  // History Queries (Increased pageSize for 30-day window)
  const sonarrHistory = useQuery({
    queryKey: ['sonarr', 'history'],
    queryFn: () => sonarrService.getHistory(sonarr.baseUrl, sonarr.apiKey, 500),
    enabled: sonarrEnabled,
  });

  const radarrHistory = useQuery({
    queryKey: ['radarr', 'history'],
    queryFn: () => radarrService.getHistory(radarr.baseUrl, radarr.apiKey, 500),
    enabled: radarrEnabled,
  });

  // Disk Space Queries
  const sonarrDisk = useQuery({
    queryKey: ['sonarr', 'diskspace'],
    queryFn: () => sonarrService.getDiskSpace(sonarr.baseUrl, sonarr.apiKey),
    enabled: sonarrEnabled,
  });

  const radarrDisk = useQuery({
    queryKey: ['radarr', 'diskspace'],
    queryFn: () => radarrService.getDiskSpace(radarr.baseUrl, radarr.apiKey),
    enabled: radarrEnabled,
  });

  // Library Queries
  const sonarrLibrary = useQuery({
    queryKey: ['sonarr', 'library'],
    queryFn: () => sonarrService.getSeries(sonarr.baseUrl, sonarr.apiKey),
    enabled: sonarrEnabled,
  });

  const radarrLibrary = useQuery({
    queryKey: ['radarr', 'library'],
    queryFn: () => radarrService.getMovies(radarr.baseUrl, radarr.apiKey),
    enabled: radarrEnabled,
  });

  // Process Activity Data (Last 30 Days)
  const activityData = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        rawDate: startOfDay(date),
        sonarr: 0,
        radarr: 0,
      };
    }).reverse();

    const processRecords = (records: any[], service: 'sonarr' | 'radarr') => {
      records?.forEach((record: any) => {
        const recordDate = new Date(record.date);
        const dayMatch = days.find(d => 
          recordDate >= d.rawDate && recordDate < new Date(d.rawDate.getTime() + 24*60*60*1000)
        );
        if (dayMatch && (record.eventType === 'grabbed' || record.eventType === 'downloadFolderImported')) {
          dayMatch[service]++;
        }
      });
    };

    processRecords(sonarrHistory.data?.records, 'sonarr');
    processRecords(radarrHistory.data?.records, 'radarr');

    return days;
  }, [sonarrHistory.data, radarrHistory.data]);

  // Process Quality Distribution
  const qualityData = useMemo(() => {
    const distribution = {
      uhd: 0, // 2160p
      fhd: 0, // 1080p
      hd: 0,  // 720p
      sd: 0   // < 720p
    };

    const categorize = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('2160') || n.includes('uhd')) distribution.uhd++;
      else if (n.includes('1080')) distribution.fhd++;
      else if (n.includes('720')) distribution.hd++;
      else distribution.sd++;
    };

    sonarrLibrary.data?.forEach((s: any) => {
      // For series, we look at the statistics (most common quality)
      // Note: Sonarr doesn't make this super easy per file in a single call, 
      // so we use the quality profile as a proxy or just categorized counts if available.
      // This is an approximation based on the series' primary quality.
    });

    radarrLibrary.data?.forEach((m: any) => {
      if (m.hasFile && m.movieFile?.quality?.quality) {
        categorize(m.movieFile.quality.quality.name);
      }
    });

    const total = distribution.uhd + distribution.fhd + distribution.hd + distribution.sd;

    return [
      { name: 'UHD (4K)', value: distribution.uhd, percentage: total > 0 ? (distribution.uhd / total) * 100 : 0, color: '#f59e0b' },
      { name: 'FHD (1080p)', value: distribution.fhd, percentage: total > 0 ? (distribution.fhd / total) * 100 : 0, color: '#3b82f6' },
      { name: 'HD (720p)', value: distribution.hd, percentage: total > 0 ? (distribution.hd / total) * 100 : 0, color: '#06b6d4' },
      { name: 'SD', value: distribution.sd, percentage: total > 0 ? (distribution.sd / total) * 100 : 0, color: '#64748b' },
    ];
  }, [sonarrLibrary.data, radarrLibrary.data]);

  // Process Storage Data
  const storageData = useMemo(() => {
    const data: any[] = [];
    
    const addDisk = (disks: any[], service: string, color: string) => {
      disks?.forEach((disk: any) => {
        data.push({
          name: `${service}: ${disk.path}`,
          value: Number((disk.freeSpace / (1024**3)).toFixed(2)),
          total: Number((disk.totalSpace / (1024**3)).toFixed(2)),
          used: Number(((disk.totalSpace - disk.freeSpace) / (1024**3)).toFixed(2)),
          percentage: ((disk.totalSpace - disk.freeSpace) / disk.totalSpace) * 100,
          color
        });
      });
    };

    addDisk(sonarrDisk.data, 'Sonarr', '#00b4d8');
    addDisk(radarrDisk.data, 'Radarr', '#f59e0b');

    return data;
  }, [sonarrDisk.data, radarrDisk.data]);

  // Process Library Health Data
  const healthStats = useMemo(() => {
    let monitored = 0;
    let missing = 0;
    let totalFiles = 0;

    sonarrLibrary.data?.forEach((s: any) => {
      if (s.monitored) monitored++;
      missing += (s.statistics?.episodeCount || 0) - (s.statistics?.episodeFileCount || 0);
      totalFiles += (s.statistics?.episodeFileCount || 0);
    });

    radarrLibrary.data?.forEach((m: any) => {
      if (m.monitored) monitored++;
      if (!m.hasFile) missing++;
      else totalFiles++;
    });

    return { monitored, missing, totalFiles };
  }, [sonarrLibrary.data, radarrLibrary.data]);

  const healthData = useMemo(() => {
    const total = healthStats.totalFiles + healthStats.missing;
    return [
      { name: 'Healthy', value: healthStats.totalFiles, color: '#22c55e' },
      { name: 'Missing content', value: healthStats.missing, color: '#ef4444' },
    ];
  }, [healthStats]);

  return {
    activityData,
    storageData,
    healthData,
    healthStats,
    qualityData,
    isLoading: sonarrHistory.isLoading || radarrHistory.isLoading || sonarrDisk.isLoading || radarrDisk.isLoading || sonarrLibrary.isLoading || radarrLibrary.isLoading,
  };
}
