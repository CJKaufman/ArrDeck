export interface ProwlarrIndexer {
  id: number;
  name: string;
  enable: boolean;
  status: string;
  protocol: 'torrent' | 'usenet';
  priority: number;
  indexerUrls: string[];
  tags: number[];
  healthIssues?: ProwlarrHealth[];
  disabledUntil?: string;
  disabledTill?: string;
}

export interface ProwlarrHealth {
  id?: number;
  indexerId?: number;
  resourceId?: number;
  source: string;
  type?: 'Error' | 'Warning' | 'Ok' | 'Notice';
  level?: 'Error' | 'Warning' | 'Ok' | 'Notice';
  message: string;
  wikiUrl?: string;
}

export interface ProwlarrConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
}
