import { format } from 'date-fns';
import { QBittorrentTorrent } from '../../types/qbittorrent.types';
import { ProgressBeam } from './ProgressBeam';
import { cn } from '../../lib/utils';
import prettyBytes from 'pretty-bytes';
import { 
  Pause, 
  Play, 
  Trash2, 
  ChevronRight, 
  ArrowDown, 
  ArrowUp,
  CircleDot
} from 'lucide-react';

interface TorrentTableRowProps {
  torrent: QBittorrentTorrent;
  isSelected?: boolean;
  onToggleSelection?: (hash: string) => void;
  onPause?: (hash: string) => void;
  onResume?: (hash: string) => void;
  onDelete?: (hash: string) => void;
  onClick?: (torrent: QBittorrentTorrent) => void;
}

export function TorrentTableRow({
  torrent,
  isSelected,
  onToggleSelection,
  onPause,
  onResume,
  onDelete,
  onClick
}: TorrentTableRowProps) {
  
  const getStateColor = (state: string) => {
    // Downloading Cluster (Emerald)
    if (state.includes('downloading') || state.includes('forcedDL') || state.includes('metaDL')) {
      return 'spectral-green bg-accent/10 border-accent/30';
    }
    // Seeding Cluster (Indigo)
    if (state.includes('uploading') || state.includes('forcedUP') || state.includes('stalledUP') || (state.includes('checking') && torrent.progress === 1)) {
      return 'spectral-indigo bg-indigo-500/10 border-indigo-500/30';
    }
    // Waiting / Paused Cluster
    if (state.includes('paused')) {
      return 'spectral-amber bg-amber-500/10 border-amber-500/30';
    }
    // Stalled / Queued Cluster
    if (state.includes('stalled') || state.includes('queued')) {
      return 'bg-white/5 text-white/40 border border-white/10';
    }
    // Error Cluster
    if (state.includes('error') || state.includes('missingFiles')) {
      return 'spectral-red bg-red-500/10 border-red-500/30';
    }
    return 'bg-white/5 text-white/40 border border-white/5';
  };

  const getStatusLabel = (state: string) => {
    if (state.includes('downloading') || state.includes('forcedDL') || state.includes('metaDL')) return 'Downloading';
    if (state.includes('uploading') || state.includes('forcedUP') || state.includes('stalledUP')) return 'Seeding';
    if (state.includes('stalled')) return 'Stalled';
    if (state.includes('paused')) return 'Paused';
    if (state.includes('queued')) return 'Queued';
    if (state.includes('checking')) return 'Checking';
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <tr 
      onClick={() => onClick?.(torrent)}
      className={cn(
        "group border-b border-white/3 hover:bg-white/2 cursor-pointer transition-colors duration-150",
        isSelected && "bg-accent/5 border-accent/20"
      )}
    >
      <td className="py-2 pl-4 w-[40px]" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox"
          checked={isSelected} 
          onChange={() => onToggleSelection?.(torrent.hash)}
          className="h-3.5 w-3.5 rounded border border-white/20 bg-white/5 checked:bg-accent checked:border-accent transition-all appearance-none cursor-pointer relative checked:before:content-['✓'] checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[10px] checked:before:text-white"
        />
      </td>
      
      <td className="py-2 px-2 text-[10px] font-bold text-white/30 tabular-nums whitespace-nowrap">
        {format(new Date(torrent.added_on * 1000), 'yyyy-MM-dd')}
      </td>

      <td className="py-2 px-3 max-w-[300px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <CircleDot className={cn("h-2 w-2 shrink-0 animate-pulse", 
            torrent.progress === 1 ? "text-status-ok" : "text-accent"
          )} />
          <span className="text-[11px] font-black tracking-tight text-white/90 truncate group-hover:text-white transition-colors">
            {torrent.name}
          </span>
        </div>
      </td>

      <td className="py-2 px-3 text-[10px] font-bold text-white/50 tabular-nums text-right">
        {prettyBytes(torrent.size)}
      </td>

      <td className="py-2 px-3 w-[150px]">
        <div className="flex items-center gap-3">
          <ProgressBeam progress={torrent.progress} className="h-1" />
          <span className="text-[10px] font-black tabular-nums text-white/40 min-w-[30px]">
            {Math.floor(torrent.progress * 100)}%
          </span>
        </div>
      </td>

      <td className="py-2 px-3 text-center">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
          getStateColor(torrent.state)
        )}>
          {getStatusLabel(torrent.state)}
        </span>
      </td>

      <td className="py-2 px-3">
        <div className="flex items-center gap-4 justify-end font-mono">
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <ArrowDown className="h-2.5 w-2.5 text-accent" />
            <span className="text-[10px] text-white tabular-nums">
              {torrent.dlspeed > 0 ? prettyBytes(torrent.dlspeed) : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <ArrowUp className="h-2.5 w-2.5 text-status-ok" />
            <span className="text-[10px] text-white tabular-nums">
              {torrent.upspeed > 0 ? prettyBytes(torrent.upspeed) : '-'}
            </span>
          </div>
        </div>
      </td>

      <td className="py-2 px-3 text-[10px] font-bold text-white/40 tabular-nums text-right">
        {torrent.ratio.toFixed(2)}
      </td>

      <td className="py-2 px-3 text-right">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic group-hover:text-white/40 transition-colors">
          {torrent.category || 'Default'}
        </span>
      </td>

      <td className="py-2 px-4 w-[60px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {torrent.state.includes('paused') ? (
            <button onClick={() => onResume?.(torrent.hash)} className="h-6 w-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center hover:bg-accent/20 transition-colors">
              <Play className="h-3 w-3 text-accent fill-accent" />
            </button>
          ) : (
            <button onClick={() => onPause?.(torrent.hash)} className="h-6 w-6 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Pause className="h-3 w-3 text-white/40" />
            </button>
          )}
          <button onClick={() => onDelete?.(torrent.hash)} className="h-6 w-6 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
}
