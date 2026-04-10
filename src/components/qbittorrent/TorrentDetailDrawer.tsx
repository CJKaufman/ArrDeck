import { useQuery } from '@tanstack/react-query';
import { SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { QBittorrentTorrent, QBTorrentProperties, QBTorrentFile, QBTorrentTracker } from '../../types/qbittorrent.types';
import { getQbtClient } from '../../services/qbittorrent.service';
import { Progress } from '../ui/progress';
import { FileText, Link2, Info, Loader2, HardDrive, Share2, Activity, Clock, Database, CheckCircle2, XCircle } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { format } from 'date-fns';

interface Props {
  torrent: QBittorrentTorrent | null;
}

export function TorrentDetailDrawer({ torrent }: Props) {
  const client = getQbtClient(); // Use global authenticated client

  const { data: props } = useQuery<QBTorrentProperties>({
    queryKey: ['qbittorrent', 'properties', torrent?.hash],
    queryFn: () => client!.getTorrentProperties(torrent!.hash),
    enabled: !!torrent && !!client,
    refetchInterval: 5000,
  });

  const { data: files, isLoading: filesLoading } = useQuery<QBTorrentFile[]>({
    queryKey: ['qbittorrent', 'files', torrent?.hash],
    queryFn: () => client!.getTorrentFiles(torrent!.hash),
    enabled: !!torrent && !!client,
    refetchInterval: 2000, // Faster polling for files to see progress move
  });

  const { data: trackers, isLoading: trackersLoading } = useQuery<QBTorrentTracker[]>({
    queryKey: ['qbittorrent', 'trackers', torrent?.hash],
    queryFn: () => client!.getTorrentTrackers(torrent!.hash),
    enabled: !!torrent && !!client,
    refetchInterval: 10000,
  });

  if (!torrent) return null;

  return (
    <SheetContent className="sm:max-w-2xl bg-[#0B0C0E]/95 border-l border-white/5 p-0 flex flex-col backdrop-blur-3xl shadow-2xl">
      <SheetHeader className="p-8 pb-4 relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
            torrent.state.includes('downloading') ? 'bg-accent/10 text-accent border-accent/20' :
            torrent.state.includes('uploading') || torrent.state.includes('seeding') ? 'bg-status-ok/10 text-status-ok border-status-ok/20' :
            'bg-white/5 text-white/40 border-white/10'
          }`}>
            {torrent.state.replace('DL', '').replace('UP', '')}
          </div>
          <span className="text-[10px] font-mono text-white/20 select-all uppercase tracking-tighter">
            {torrent.hash}
          </span>
        </div>
        <SheetTitle className="text-2xl font-black text-white tracking-tight leading-tight pr-12 line-clamp-2">
          {torrent.name}
        </SheetTitle>
      </SheetHeader>

      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <div className="px-8 border-b border-white/5">
          <TabsList className="bg-transparent h-12 p-0 gap-8 justify-start w-full">
            <TabsTrigger value="info" className="relative h-12 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-white text-white/40 font-bold transition-all px-0">
              <Info className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="files" className="relative h-12 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-white text-white/40 font-bold transition-all px-0">
              <FileText className="h-4 w-4 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="trackers" className="relative h-12 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-white text-white/40 font-bold transition-all px-0">
              <Link2 className="h-4 w-4 mr-2" /> Indexers
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <TabsContent value="info" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Share2 className="h-4 w-4 text-status-ok" />} label="Ratio" value={torrent.ratio.toFixed(2)} />
              <StatCard icon={<Activity className="h-4 w-4 text-accent" />} label="Seeds" value={`${torrent.num_seeds}`} />
              <StatCard icon={<Clock className="h-4 w-4 text-status-warn" />} label="ETA" value={torrent.eta === 8640000 ? '∞' : format(new Date(Date.now() + torrent.eta * 1000), 'HH:mm')} />
              <StatCard icon={<Database className="h-4 w-4 text-purple-400" />} label="Total" value={prettyBytes(torrent.size)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <DetailItem label="Management Status" value={torrent.state} isStatus />
                <DetailItem label="Added On" value={format(new Date(torrent.added_on * 1000), 'MMMM d, yyyy HH:mm')} />
                <DetailItem label="Save Path" value={torrent.save_path} isPath />
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Transfer Health</h4>
                <div className="space-y-4">
                  <HealthBar label="Downloaded" value={torrent.downloaded} total={torrent.size} color="bg-accent" />
                  <HealthBar label="Uploaded" value={torrent.uploaded} total={torrent.size} color="bg-status-ok" />
                </div>
              </div>
            </div>
            
            {props && (
              <div className="space-y-4 border-t border-white/5 pt-8">
                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Client Metadata</h4>
                <div className="grid grid-cols-2 gap-6">
                   <DetailItem label="Wasted Data" value={prettyBytes(props.total_wasted)} color="text-status-error" />
                   <DetailItem label="Active Time" value={`${(props.time_elapsed / 3600).toFixed(1)} hours`} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="m-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {filesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <span className="text-xs text-white/20 uppercase tracking-widest font-black">Scanning File Tree</span>
              </div>
            ) : (
              <div className="space-y-3">
                {files?.map((file) => (
                  <div key={file.index} className="bg-white/5 border border-white/5 rounded-xl p-4 transition-colors hover:bg-white/10 group">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <FileText className="h-4 w-4 text-white/40" />
                        </div>
                        <span className="text-sm font-bold text-white line-clamp-1 break-all pr-4">{file.name}</span>
                      </div>
                      <span className="text-xs font-mono text-white/40 whitespace-nowrap">{prettyBytes(file.size)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 px-1">
                          <span className="text-white/20 font-black">Progress</span>
                          <span className={`${file.progress === 1 ? 'text-status-ok' : 'text-accent'} font-black`}>{(file.progress * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={file.progress * 100} className={`h-1 cursor-default ${file.progress === 1 ? 'bg-status-ok/20' : ''}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trackers" className="m-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {trackersLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-accent" />
                 <span className="text-xs text-white/20 uppercase tracking-widest font-black">Communicating with Cluster</span>
               </div>
            ) : (
              <div className="space-y-3">
                {trackers?.map((tracker) => (
                  <div key={tracker.url} className="bg-[#0B0C0E] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-mono text-white/60 truncate tracking-tight">{tracker.url}</span>
                      <div className="flex items-center gap-2">
                         <span className={`text-[9px] uppercase font-black tracking-widest flex items-center gap-1.5 ${
                           tracker.status === 2 ? 'text-status-ok' : 
                           tracker.status === 0 || tracker.status === 1 ? 'text-status-warn' : 'text-status-error'
                         }`}>
                           {tracker.status === 2 ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                           {tracker.msg || 'Awaiting Response'}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/40">
                       <div className="text-center">
                         <p className="text-[10px] font-black">{tracker.num_seeds}</p>
                         <p className="text-[8px] uppercase tracking-tighter">Seeds</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </SheetContent>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
      {icon}
      <div>
        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/20 leading-none mb-1.5">{label}</p>
        <p className="text-lg font-black text-white tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isStatus, isPath, color = "text-white" }: { label: string, value: string, isStatus?: boolean, isPath?: boolean, color?: string }) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/10">{label}</span>
      {isPath ? (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
           <HardDrive className="h-3.5 w-3.5 text-white/20" />
           <span className="text-xs font-mono text-white/60 truncate">{value}</span>
        </div>
      ) : (
        <p className={`text-sm font-bold tracking-tight ${color} ${isStatus ? 'uppercase tracking-widest' : ''}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function HealthBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = Math.min((value / total) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase font-black">
        <span className="text-white/20">{label}</span>
        <span className="text-white/60 font-mono">{prettyBytes(value)}</span>
      </div>
      <Progress value={percentage} className={`h-1 bg-white/5 ${color}/20`} />
    </div>
  );
}
