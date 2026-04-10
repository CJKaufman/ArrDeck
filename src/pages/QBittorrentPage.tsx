import { useState, useMemo } from 'react';

import { useQBittorrentTorrents } from '../hooks/useQBittorrentTorrents';
import { useQBittorrentTransfer } from '../hooks/useQBittorrentTransfer';
import { useSettingsStore } from '../stores/settings.store';
import { getQbtClient } from '../services/qbittorrent.service';
import { TorrentTableRow } from '../components/qbittorrent/TorrentTableRow';
import { AddTorrentDialog } from '../components/qbittorrent/AddTorrentDialog';
import { TorrentDetailDrawer } from '../components/qbittorrent/TorrentDetailDrawer';
import { QbtPreferencesTab } from '../components/qbittorrent/QbtPreferencesTab';
import { QBittorrentTorrent } from '../types/qbittorrent.types';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { TransferCommandBar } from '../components/qbittorrent/TransferCommandBar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Loader2, 
  Activity, 
  Settings as SettingsIcon, 
  AlertCircle,
  Filter,
  ArrowUpDown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../lib/utils';

export function QBittorrentPage() {
  const { qbittorrent } = useSettingsStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedTorrent, setSelectedTorrent] = useState<QBittorrentTorrent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { torrents, isLoading, isAuthed, refetch } = useQBittorrentTorrents(filter);
  const { 
    selectedIds, 
    isSelected, 
    isSelectionMode, 
    toggleId, 
    clearSelection 
  } = useBulkSelection<string>();

  const { transfer } = useQBittorrentTransfer();
  const client = getQbtClient(qbittorrent.baseUrl);

  const filteredTorrents = useMemo(() => {
    if (!torrents) return [];
    return torrents.filter(t => 
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [torrents, debouncedSearch]);

  const handlePause = async (hash: string) => {
    try {
      await client?.pauseTorrents(hash);
      refetch();
    } catch (err: any) {
      toast.error('Failed to pause');
    }
  };

  const handleResume = async (hash: string) => {
    try {
      await client?.resumeTorrents(hash);
      refetch();
    } catch (err: any) {
      toast.error('Failed to resume');
    }
  };

  const handleDelete = async (hash: string, deleteFiles: boolean = false) => {
    try {
      await client?.deleteTorrents(hash, deleteFiles);
      toast.success('Torrent deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete');
    }
  };

  const handleBulkMonitor = async (monitored: boolean) => {
    if (!client) return;
    setIsUpdating(true);
    try {
      const hashes = selectedIds.join('|');
      if (monitored) {
        await client.resumeTorrents(hashes);
      } else {
        await client.pauseTorrents(hashes);
      }
      toast.success(`${monitored ? 'Resumed' : 'Paused'} ${selectedIds.length} transfers`);
      refetch();
    } catch (err) {
      toast.error('Failed to update transfers');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async (deleteFiles: boolean) => {
    if (!client) return;
    setIsUpdating(true);
    try {
      const hashes = selectedIds.join('|');
      await client.deleteTorrents(hashes, deleteFiles);
      toast.success(`Purged ${selectedIds.length} transfers`);
      clearSelection();
      refetch();
    } catch (err) {
      toast.error('Failed to purge swarm');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!qbittorrent.enabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <AlertCircle size={64} className="text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-black italic tracking-tighter uppercase uppercase">qBittorrent Disabled</h2>
        <p className="text-white/40 font-bold text-[11px] uppercase tracking-widest max-w-sm">Enable BitTorrent logistics in the settings terminal to access the swarm.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base">
      {/* High-Density Command Header */}
      <div className="flex flex-col border-b border-white/[0.05] bg-sidebar/30 backdrop-blur-md z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent animate-pulse" />
              <h1 className="text-sm font-black italic uppercase tracking-tighter text-white">Swarm Control</h1>
            </div>
            
            <div className="h-4 w-px bg-white/10" />

            {/* Matrix Filters */}
            <div className="flex items-center gap-1">
              {['all', 'downloading', 'seeding', 'completed', 'paused'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                    filter === f 
                      ? "bg-accent text-white shadow-[0_0_10px_var(--accent-soft)]" 
                      : "text-white/30 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder="Search Swarm..." 
                className="h-8 pl-9 pr-4 bg-white/[0.03] border-white/10 focus:border-accent/30 focus:ring-accent/10 rounded-lg text-[10px] font-bold text-white w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="h-4 w-px bg-white/10" />
            <AddTorrentDialog onSuccess={refetch} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="torrents" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-6 bg-base">
          <TabsList className="bg-transparent h-10 p-0 border-none gap-8">
            <TabsTrigger value="torrents" className="data-[state=active]:bg-transparent data-[state=active]:text-accent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full px-0 font-black uppercase italic tracking-widest text-[10px]">Matrix View</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:text-accent border-b-2 border-transparent data-[state=active]:border-accent rounded-none h-full px-0 font-black uppercase italic tracking-widest text-[10px]">Client Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
             <span>{filteredTorrents.length} Items Loaded</span>
             <span>|</span>
             <span>{transfer?.connection_status || 'Unknown'} Status</span>
          </div>
        </div>

        <TabsContent value="torrents" className="flex-1 min-h-0 m-0 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-none">
            <table className="w-full border-collapse text-left select-none relative">
              <thead className="sticky top-0 bg-base/90 backdrop-blur-md z-20 border-b border-white/[0.05]">
                <tr className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 pl-4 w-[40px]"><Filter className="h-3 w-3" /></th>
                  <th className="py-2 px-2 w-[100px] hover:text-white transition-colors cursor-pointer">Added</th>
                  <th className="py-2 px-3 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                    Name <ArrowUpDown className="h-2 w-2" />
                  </th>
                  <th className="py-2 px-3 text-right w-[80px]">Size</th>
                  <th className="py-2 px-3 w-[150px]">Progress</th>
                  <th className="py-2 px-3 text-center w-[100px]">Status</th>
                  <th className="py-2 px-3 text-right w-[200px]">Traffic Rail</th>
                  <th className="py-2 px-3 text-right w-[60px]">Ratio</th>
                  <th className="py-2 px-3 text-right w-[100px]">Node</th>
                  <th className="py-2 px-4 w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-white/[0.02]">
                       <td colSpan={10} className="py-4 px-4 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : filteredTorrents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-white/10 italic font-black uppercase tracking-widest text-[10px]">
                      Void: No Transfers Registered
                    </td>
                  </tr>
                ) : (
                  filteredTorrents.map((torrent: QBittorrentTorrent) => (
                    <TorrentTableRow 
                      key={torrent.hash}
                      torrent={torrent}
                      isSelected={isSelected(torrent.hash)}
                      onToggleSelection={toggleId}
                      onPause={handlePause}
                      onResume={handleResume}
                      onDelete={(h) => handleDelete(h)}
                      onClick={setSelectedTorrent}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-6">
          <QbtPreferencesTab />
        </TabsContent>
      </Tabs>
      
      <Sheet open={!!selectedTorrent} onOpenChange={(open) => !open && setSelectedTorrent(null)}>
        <TorrentDetailDrawer torrent={selectedTorrent} />
      </Sheet>

      <TransferCommandBar 
        count={selectedIds.length}
        onClear={clearSelection}
        onMonitor={handleBulkMonitor}
        onDelete={handleBulkDelete}
        isUpdating={isUpdating}
      />
    </div>
  );
}
