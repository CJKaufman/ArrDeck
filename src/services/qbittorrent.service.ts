import { fetch } from '@tauri-apps/plugin-http';

import { 
  QBTorrentProperties, 
  QBTorrentFile, 
  QBTorrentTracker 
} from '../types/qbittorrent.types';

export class QBittorrentService {
  private baseUrl: string;
  private sid: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request(path: string, options: any = {}): Promise<any> {
    const url = `${this.baseUrl}/api/v2/${path}`;
    
    // Merge headers with SID cookie and security bypasses
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      'Referer': this.baseUrl + '/',
      'Origin': this.baseUrl,
    };

    if (this.sid) {
      headers['Cookie'] = `SID=${this.sid}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        connectTimeout: 10000,
      });

      if (response.status === 401) {
        throw new Error('Authentication Failed: Invalid username or password.');
      }

      if (response.status === 403) {
        throw new Error('CSRF/Forbidden: The Referer/Origin headers might be rejected. Ensure "Web UI CSRF protection" and "Host header validation" are configured or disabled in qBittorrent if this continues.');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Return raw data or parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (err: any) {
      throw err;
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    const params = new URLSearchParams({ username, password });
    
    try {
      const url = `${this.baseUrl}/api/v2/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': this.baseUrl + '/',
          'Origin': this.baseUrl,
        },
      });

      if (response.status === 403) {
        throw new Error('CSRF/Forbidden: qBittorrent rejected the security headers. Ensure "Web UI CSRF protection" and "Host header validation" are correct.');
      }

      if (response.status === 200) {
        const text = await response.text();
        if (text === 'Ok.') {
          // Extract SID from Set-Cookie header
          const setCookie = response.headers.get('set-cookie');
          if (setCookie) {
            const match = setCookie.match(/SID=([^;]+)/);
            if (match) {
              this.sid = match[1];
              return true;
            }
          }
          // If no SID but returned Ok, maybe auth is disabled
          return true;
        }
      }
      return false;
    } catch (err: any) {
      if (err.message?.includes('403')) {
        throw new Error('CSRF/Forbidden: Disable Web UI CSRF protection in qBittorrent settings.');
      }
      throw err;
    }
  }

  async logout(): Promise<void> {
    await this.request('auth/logout', { method: 'POST' });
    this.sid = null;
  }

  async getVersion(): Promise<string> {
    return await this.request('app/version');
  }

  async getTorrents(filter: string = 'all'): Promise<any[]> {
    return await this.request(`torrents/info?filter=${filter}`);
  }

  async getTransferInfo(): Promise<any> {
    const data = await this.request('sync/maindata?rid=0');
    return data?.server_state || {};
  }

  async toggleAltSpeedLimits(): Promise<void> {
    await this.request('transfer/toggleSpeedLimitsMode', { method: 'POST' });
  }

  async pauseTorrents(hashes: string | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes });
    await this.request('torrents/pause', {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async resumeTorrents(hashes: string | 'all'): Promise<void> {
    const body = new URLSearchParams({ hashes });
    await this.request('torrents/resume', {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async deleteTorrents(hashes: string, deleteFiles: boolean = false): Promise<void> {
    const body = new URLSearchParams({ hashes, deleteFiles: String(deleteFiles) });
    await this.request('torrents/delete', {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async getTorrentProperties(hash: string): Promise<QBTorrentProperties> {
    return await this.request(`torrents/properties?hash=${hash}`);
  }

  async getTorrentFiles(hash: string): Promise<QBTorrentFile[]> {
    return await this.request(`torrents/files?hash=${hash}`);
  }

  async getTorrentTrackers(hash: string): Promise<QBTorrentTracker[]> {
    return await this.request(`torrents/trackers?hash=${hash}`);
  }
  async addTorrent(urls?: string, file?: File | Blob, options: any = {}): Promise<void> {
    const formData = new FormData();
    if (urls) formData.append('urls', urls);
    if (file) formData.append('torrents', file);
    
    // Add options
    if (options.savepath) formData.append('savepath', options.savepath);
    if (options.category) formData.append('category', options.category);
    if (options.paused !== undefined) formData.append('paused', String(options.paused));
    if (options.sequentialDownload !== undefined) formData.append('sequentialDownload', String(options.sequentialDownload));
    
    await this.request('torrents/add', {
      method: 'POST',
      body: formData,
    });
  }

  async getPreferences(): Promise<any> {
    return await this.request('app/preferences');
  }

  async setPreferences(prefs: Record<string, any>): Promise<void> {
    const body = new URLSearchParams();
    body.append('json', JSON.stringify(prefs));
    
    await this.request('app/setPreferences', {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}

const clients: Record<string, QBittorrentService> = {};
let lastUsedBaseUrl: string | null = null;

export const getQbtClient = (baseUrl?: string) => {
  const url = baseUrl || lastUsedBaseUrl;
  if (!url) return null;
  
  // Normalize the key to prevent duplicates with/without trailing slashes
  const normalizedUrl = url.replace(/\/$/, '');
  
  if (!clients[normalizedUrl]) {
    clients[normalizedUrl] = new QBittorrentService(normalizedUrl);
  }
  
  lastUsedBaseUrl = normalizedUrl;
  return clients[normalizedUrl];
};
