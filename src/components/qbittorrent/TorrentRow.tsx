import { QBittorrentTorrent } from '../../types/qbittorrent.types';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Pause, Play, Trash2, ArrowDown, ArrowUp, Clock, Target } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import React from 'react';

interface TorrentRowProps {
  torrent: QBittorrentTorrent;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string) => void;
  // Selection
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: (hash: string) => void;
}

const STATE_COLORS: any = {
  downloading: 'text-accent border-accent/30 bg-accent/10',
  uploading: 'text-status-ok border-status-ok/30 bg-status-ok/10',
  stalledDL: 'text-status-warn border-status-warn/30 bg-status-warn/10',
  pausedDL: 'text-white/20 border-white/5 bg-white/[0.02]',
  pausedUP: 'text-white/20 border-white/5 bg-white/[0.02]',
  error: 'text-status-error border-status-error/30 bg-status-error/10',
};

export function TorrentRow({ 
  torrent, 
  onPause, 
  onResume, 
  onDelete,
  isSelected,
  isSelectionMode,
  onToggleSelection
}: TorrentRowProps) {
  const isPaused = torrent.state.includes('paused');

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelection?.(torrent.hash);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden bg-[#0B0C0E]/50 backdrop-blur-sm border-white/5 p-3 hover:border-white/10 transition-all duration-300 group",
      isSelected ? "ring-1 ring-accent border-accent/30 bg-accent/[0.02]" : "",
      isSelectionMode && !isSelected ? "opacity-30 grayscale-[0.8] scale-[0.99]" : "opacity-100"
    )} onClick={handleClick}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
               {/* Selection Indicator */}
              {isSelectionMode && (
                <div className={cn(
                  "w-4 h-4 rounded border transition-all duration-200",
                  isSelected 
                    ? "bg-accent border-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,188,255,0.5)]" 
                    : "bg-black/50 border-white/20"
                )}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full animate-in zoom-in-50 duration-300" />}
                </div>
              )}
              <h4 className="text-[13px] font-black italic uppercase tracking-tighter text-white/90 truncate" title={torrent.name}>
                {torrent.name}
              </h4>
            </div>
            
            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-white/30 uppercase tracking-tight">
              <span className="flex items-center gap-1">
                {prettyBytes(torrent.size)}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <Badge variant="outline" className={cn(
                "text-[9px] font-black italic border-none h-4 px-1.5",
                STATE_COLORS[torrent.state] || 'text-white/20 bg-white/5'
              )}>
                {torrent.state.replace('DL', '').replace('UP', '')}
              </Badge>
              {torrent.eta < 8640000 && torrent.eta > 0 && (
                <>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1 italic">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(Date.now() + torrent.eta * 1000))}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 hover:bg-white/5 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                isPaused ? onResume(torrent.hash) : onPause(torrent.hash);
              }}
            >
              {isPaused ? <Play className="h-3 w-3 fill-status-ok text-status-ok" /> : <Pause className="h-3 w-3 fill-status-warn text-status-warn" />}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(torrent.hash);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black italic uppercase tracking-tighter">
            <span className="text-white/60">{(torrent.progress * 100).toFixed(1)}%</span>
            <div className="flex items-center gap-3">
              {torrent.dlspeed > 0 && (
                <span className="text-accent flex items-center gap-0.5">
                  <ArrowDown className="h-3 w-3" />
                  {prettyBytes(torrent.dlspeed)}/s
                </span>
              )}
              {torrent.upspeed > 0 && (
                <span className="text-status-ok flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3" />
                  {prettyBytes(torrent.upspeed)}/s
                </span>
              )}
            </div>
          </div>
          <Progress 
            value={torrent.progress * 100} 
            className="h-1 bg-white/[0.02]" 
            indicatorClassName={cn(
              "transition-all duration-700 ease-out",
              torrent.progress === 1 ? "bg-status-ok" : "bg-accent"
            )} 
          />
        </div>
      </div>
    </Card>
  );
}
