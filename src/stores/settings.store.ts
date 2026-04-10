import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ServiceConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
}

export interface SettingsState {
  sonarr: ServiceConfig;
  radarr: ServiceConfig;
  prowlarr: ServiceConfig;
  qbittorrent: {
    enabled: boolean;
    baseUrl: string;
    username: string;
    password: string;
  };
  theme: 'dark' | 'light' | 'system' | 'minimal' | 'autobrr' | 'swizzin' | 'kyle' | 'nightwalker' | 'napster';
  startupPage: string;
  dashboardRefreshMs: number;
  queueRefreshMs: number;
  posterSize: 'small' | 'medium' | 'large';
  defaultView: 'grid' | 'list';
  // Actions
  updateSonarr: (config: Partial<ServiceConfig>) => void;
  updateRadarr: (config: Partial<ServiceConfig>) => void;
  updateProwlarr: (config: Partial<ServiceConfig>) => void;
  updateQBittorrent: (config: { enabled?: boolean; baseUrl?: string; username?: string; password?: string }) => void;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

const defaultServiceConfig: ServiceConfig = {
  enabled: false,
  baseUrl: 'http://localhost:8989',
  apiKey: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sonarr: { ...defaultServiceConfig, baseUrl: 'http://localhost:8989' },
      radarr: { ...defaultServiceConfig, baseUrl: 'http://localhost:7878' },
      prowlarr: { ...defaultServiceConfig, baseUrl: 'http://localhost:9696' },
      qbittorrent: {
        enabled: false,
        baseUrl: 'http://localhost:8080',
        username: '',
        password: '',
      },
      theme: 'dark',
      startupPage: '/',
      dashboardRefreshMs: 60000,
      queueRefreshMs: 15000,
      posterSize: 'medium',
      defaultView: 'grid',

      updateSonarr: (config) =>
        set((state) => ({ sonarr: { ...state.sonarr, ...config } })),
      updateRadarr: (config) =>
        set((state) => ({ radarr: { ...state.radarr, ...config } })),
      updateProwlarr: (config) =>
        set((state) => ({ prowlarr: { ...state.prowlarr, ...config } })),
      updateQBittorrent: (config) =>
        set((state) => ({ qbittorrent: { ...state.qbittorrent, ...config } })),
      updateSetting: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'arrdeck-settings',
      // skip hydrated persistence normally handled by the Tauri store plugin wrapper later
    }
  )
);
