import { createApiClient } from './api-client';
import { UnifiedQueueItem } from '../types/common.types';

export const radarrService = {
  async getQueue(baseUrl: string, apiKey: string): Promise<UnifiedQueueItem[]> {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/queue?includeUnknownMovieItems=true');
    
    // Radarr queue endpoint usually returns data.records
    const items = res.data.records || res.data || [];
    
    return items.map((item: any): UnifiedQueueItem => {
      return {
        id: item.id,
        sourceId: item.movieId || item.movie?.id,
        service: 'radarr',
        title: item.movie?.title || item.title || 'Unknown Movie',
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
    const res = await client.get(`/api/v3/movie/lookup?term=${encodeURIComponent(query)}`);
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

  async addMovie(baseUrl: string, apiKey: string, movie: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.post('/api/v3/movie', movie);
    return res.data;
  },

  async getMovies(baseUrl: string, apiKey: string) {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v3/movie');
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

  async updateMovie(baseUrl: string, apiKey: string, movie: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.put('/api/v3/movie', movie);
    return res.data;
  },

  async getReleases(baseUrl: string, apiKey: string, movieId: number) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get(`/api/v3/release?movieId=${movieId}`);
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

  async bulkUpdateMovies(baseUrl: string, apiKey: string, movieIds: number[], changes: any) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.put('/api/v3/movie/editor', {
      movieIds,
      ...changes
    });
    return res.data;
  },

  async bulkDeleteMovies(baseUrl: string, apiKey: string, movieIds: number[], deleteFiles: boolean = true) {
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.delete('/api/v3/movie/editor', {
      data: {
        movieIds,
        deleteFiles,
        addImportExclusion: false
      }
    });
    return res.data;
  }
};

