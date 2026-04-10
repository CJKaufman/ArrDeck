import { createApiClient } from './api-client';
import { ProwlarrIndexer, ProwlarrHealth } from '../types/prowlarr.types';

export const prowlarrService = {
  async getIndexers(baseUrl: string, apiKey: string): Promise<ProwlarrIndexer[]> {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v1/indexer');
    return res.data;
  },

  async getHealth(baseUrl: string, apiKey: string): Promise<ProwlarrHealth[]> {
    if (!baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    const res = await client.get('/api/v1/health');
    return res.data;
  },

  async testIndexer(baseUrl: string, apiKey: string, id: number): Promise<void> {
    const client = createApiClient(baseUrl, apiKey);
    await client.post('/api/v1/indexer/test', { id });
  },

  async syncToApps(baseUrl: string, apiKey: string): Promise<void> {
    const client = createApiClient(baseUrl, apiKey);
    await client.post('/api/v1/indexer/syncall');
  },

  async searchIndexers(baseUrl: string, apiKey: string, query: string) {
    if (!query || !baseUrl || !apiKey) return [];
    const client = createApiClient(baseUrl, apiKey);
    // Prowlarr global search across all configured indexers
    const res = await client.get(`/api/v1/search?query=${encodeURIComponent(query)}`);
    return res.data;
  }
};
