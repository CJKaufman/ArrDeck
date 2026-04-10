export interface UnifiedQueueItem {
  id: number;
  sourceId: number; // e.g., seriesId or movieId
  service: 'sonarr' | 'radarr';
  title: string;
  quality: string;
  size: number;
  sizeleft: number;
  progress: number;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadState: string;
  downloadClient: string;
  downloadId: string;
}
