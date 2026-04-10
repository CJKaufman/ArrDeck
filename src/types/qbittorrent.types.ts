export interface QBittorrentTorrent {
  hash: string;
  name: string;
  size: number;               // bytes, total size
  progress: number;           // 0.0 to 1.0
  dlspeed: number;            // bytes/s
  upspeed: number;            // bytes/s
  num_seeds: number;
  num_leechs: number;
  ratio: number;              // share ratio
  eta: number;                // seconds, 8640000 = infinite
  state: QBTorrentState;
  category: string;
  tags: string;               // comma-separated
  save_path: string;
  added_on: number;           // unix timestamp
  completion_on: number;      // unix timestamp, -1 if not complete
  downloaded: number;         // bytes downloaded this session
  uploaded: number;           // bytes uploaded total
  dl_limit: number;           // bytes/s, -1 = global, 0 = unlimited
  up_limit: number;
  priority: number;           // queue priority, 0 = not queued
  amount_left: number;        // bytes remaining
  time_active: number;        // seconds active
  seeding_time: number;       // seconds seeding
}

export type QBTorrentState =
  | 'downloading'
  | 'uploading'
  | 'stalledDL'
  | 'stalledUP'
  | 'pausedDL'
  | 'pausedUP'
  | 'queuedDL'
  | 'queuedUP'
  | 'checkingDL'
  | 'checkingUP'
  | 'checkingResumeData'
  | 'moving'
  | 'error'
  | 'unknown'
  | 'missingFiles'
  | 'forcedDL'
  | 'forcedUP';

export interface QBTransferInfo {
  dl_info_speed: number;      // bytes/s current download
  dl_info_data: number;       // bytes total downloaded this session
  up_info_speed: number;      // bytes/s current upload
  up_info_data: number;       // bytes total uploaded this session
  dl_rate_limit: number;      // global download limit (bytes/s)
  up_rate_limit: number;      // global upload limit (bytes/s)
  connection_status: 'connected' | 'firewalled' | 'disconnected';
  use_alt_speed_limits: boolean;
}

export interface QBTorrentProperties {
  save_path: string;
  creation_date: number;
  comment: string;
  total_wasted: number;
  total_uploaded: number;
  total_downloaded: number;
  up_limit: number;
  dl_limit: number;
  time_elapsed: number;
  seeding_time: number;
  nb_connections: number;
  nb_connections_limit: number;
  share_ratio: number;
  dl_speed_avg: number;
  up_speed_avg: number;
  eta: number;
  last_seen: number;
  pieces_num: number;
  piece_size: number;
  pieces_have: number;
  reannounce: number;
  total_size: number;
}

export interface QBTorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;           // 0.0 to 1.0
  priority: 0 | 1 | 6 | 7;  // 0=skip, 1=normal, 6=high, 7=max
  is_seed: boolean;
}

export interface QBTorrentTracker {
  url: string;
  status: number;             // 0=Not contacted, 1=Working, 2=Updating, 3=Not working, 4=Disabled
  msg: string;
  num_seeds: number;
  num_peers: number;
  num_downloaded: number;
  tier: number;
}

export interface QBPreferences {
  save_path: string;
  dl_limit: number;
  up_limit: number;
  alt_dl_limit: number;
  alt_up_limit: number;
  scheduler_enabled: boolean;
  dht: boolean;
  pex: boolean;
  lsd: boolean;
  encryption: 0 | 1 | 2;   // 0=prefer, 1=force, 2=disable
  max_connec: number;
  max_connec_per_torrent: number;
  max_uploads: number;
  max_uploads_per_torrent: number;
  max_ratio: number;
  max_ratio_act: 0 | 1;     // 0=pause, 1=remove
  web_ui_username: string;
  [key: string]: unknown;
}

export interface QBittorrentConfig {
  enabled: boolean;
  baseUrl: string;
  username: string;
  password: string;
}
