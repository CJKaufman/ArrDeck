import { createApiClient } from './api-client';
import { UnifiedQueueItem } from '../types/common.types';

export const sonarrService = {
  async getQueue(baseUrl: string, apiKey: string): Promise<UnifiedQueueItem[]> {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/queue?includeUnknownSeriesItems=true');
    
    // Sonarr queue endpoint usually returns data.records
    const items = res.data.records || res.data || [];
    
    return items.map((item: any): UnifiedQueueItem => {
      const seriesTitle = item.series?.title || item.title || 'Unknown Series';
      const episodeTitle = item.episode?.title ? ` - ${item.episode.title}` : '';
      
      return {
        id: item.id,
        sourceId: item.seriesId || item.series?.id,
        service: 'sonarr',
        title: `${seriesTitle}${episodeTitle}`,
        quality: item.quality?.quality?.name || 'Unknown',
        size: item.size || 0,
        sizeleft: item.sizeleft || 0,
        progress: item.size > 0 ? ((item.size - item.sizeleft) / item.size) * 100 : 0,
        estimatedCompletionTime: item.estimatedCompletionTime,
        status: item.status,
        trackedDownloadState: item.trackedDownloadState,
        downloadClient: item.downloadClient,
        downloadId: item.downloadId,
      };
    });
  },

  async deleteFromQueue(baseUrl: string, apiKey: string, id: number, removeFromClient: boolean = true) {
    const client = createApiClient(baseUrl, apiKey);
    await client.delete(`/api/v3/queue/${id}?removeFromClient=${removeFromClient}&blocklist=false`);
  },

  async lookup(baseUrl: string, apiKey: string, query: string) {
    if (!query) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get(`/api/v3/series/lookup?term=${encodeURIComponent(query)}`);
    return res.data;
  },

  async getRootFolders(baseUrl: string, apiKey: string) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/rootfolder');
    return res.data;
  },

  async getQualityProfiles(baseUrl: string, apiKey: string) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/qualityprofile');
    return res.data;
  },

  async addSeries(baseUrl: string, apiKey: string, series: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.post('/api/v3/series', series);
    return res.data;
  },

  async getSeries(baseUrl: string, apiKey: string) {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/series');
    return res.data;
  },

  async getHistory(baseUrl: string, apiKey: string, pageSize: number = 100) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get(`/api/v3/history?pageSize=${pageSize}&sortKey=date&sortDir=desc`);
    return res.data;
  },

  async getDiskSpace(baseUrl: string, apiKey: string) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/diskspace');
    return res.data;
  },

  async getEpisodes(baseUrl: string, apiKey: string, seriesId: number) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get(`/api/v3/episode?seriesId=${seriesId}`);
    return res.data;
  },

  async updateSeries(baseUrl: string, apiKey: string, series: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.put('/api/v3/series', series);
    return res.data;
  },

  async updateEpisodeMonitoring(baseUrl: string, apiKey: string, episodeIds: number[], monitored: boolean) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.put('/api/v3/episode/monitor', {
      episodeIds,
      monitored
    });
    return res.data;
  },

  async getReleases(baseUrl: string, apiKey: string, seriesId?: number, episodeId?: number) {
    const client = createApiClient(baseUrl, apiKey);
    let url = '/api/v3/release';
    if (episodeId) url += `?episodeId=${episodeId}`;
    else if (seriesId) url += `?seriesId=${seriesId}`;
    const res = await client.get(url);
    return res.data;
  },

  async downloadRelease(baseUrl: string, apiKey: string, guid: string, indexerId: number) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.post('/api/v3/release/push', { guid, indexerId });
    return res.data;
  },

  async triggerCommand(baseUrl: string, apiKey: string, name: string, body: any = {}) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.post('/api/v3/command', { name, ...body });
    return res.data;
  },

  async bulkUpdateSeries(baseUrl: string, apiKey: string, seriesIds: number[], changes: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.put('/api/v3/series/editor', {
      seriesIds,
      ...changes
    });
    return res.data;
  },

  async bulkDeleteSeries(baseUrl: string, apiKey: string, seriesIds: number[], deleteFiles: boolean = true) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.delete('/api/v3/series/editor', {
      data: {
        seriesIds,
        deleteFiles,
        addImportListExclusion: false
      }
    });
    return res.data;
  }
};

