import { Card, CardContent } from '../ui/card';
import { clsx } from 'clsx';
import { Badge } from '../ui/badge';
import { Monitor, HardDrive, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import React from 'react';

interface MediaCardProps {
  item: any;
  service: 'sonarr' | 'radarr';
  onClick?: () => void;
  // Selection
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: (id: number) => void;
}

export function MediaCard({ 
  item, 
  service, 
  onClick,
  isSelected,
  isSelectionMode,
  onToggleSelection
}: MediaCardProps) {
  const isMissing = service === 'sonarr' 
    ? item.statistics?.percentOfEpisodes < 100 
    : !item.hasFile;

  const isMonitored = item.monitored;
  
  // Find poster image
  const poster = item.images?.find((i: any) => i.coverType === 'poster')?.remoteUrl || 
                 item.images?.find((i: any) => i.coverType === 'poster')?.url;

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelection?.(item.id);
    } else {
      onClick?.();
    }
  };

  return (
    <Card 
      className={cn(
        "p-0 overflow-hidden bg-[#0B0C0E]/50 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer group relative",
        isSelected ? "ring-2 ring-accent border-accent/50 shadow-[0_0_20px_rgba(0,188,255,0.2)]" : "",
        isSelectionMode && !isSelected ? "opacity-30 grayscale-[0.5] scale-[0.98]" : "opacity-100"
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
          {poster ? (
            <img 
              src={poster} 
              alt={item.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                // Fallback for failed images
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/141414/a1a1aa?text=No+Poster';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black italic text-[10px] tracking-tighter">
              No Poster
            </div>
          )}

          {/* Selection Indicator */}
          {isSelectionMode && (
            <div className={cn(
              "absolute top-3 left-3 z-20 w-5 h-5 rounded border-2 transition-all duration-200",
              isSelected 
                ? "bg-accent border-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,188,255,0.5)]" 
                : "bg-black/50 border-white/20"
            )}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in-50 duration-300" />}
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {!isMonitored && (
              <Badge variant="outline" className="bg-black/80 font-black italic uppercase tracking-tighter text-[9px] backdrop-blur text-white/50 border-white/10">
                Unmonitored
              </Badge>
            )}
            {isMissing && (
              <Badge variant="destructive" className="font-black italic uppercase tracking-tighter text-[9px] border-none shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                Missing
              </Badge>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
             <div className="flex items-center gap-2 text-[10px] text-white font-bold italic uppercase tracking-tight">
                <Monitor className={cn("h-3 w-3", service === 'sonarr' ? "text-sonarr" : "text-radarr")} />
                <span>{service === 'sonarr' ? `${item.statistics?.episodeCount} Episodes` : item.qualityProfileName || item.movieFile?.quality?.quality?.name}</span>
             </div>
          </div>
        </div>
        
        <CardContent className="p-3 bg-white/[0.01] border-t border-white/5">
          <h3 className="font-black italic text-xs truncate uppercase tracking-tighter text-white/90" title={item.title}>
            {item.title}
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mt-1">{item.year}</p>
          
          {service === 'sonarr' && item.statistics && (
            <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
               <div 
                 className={clsx(
                   "h-full transition-all duration-700 ease-out",
                   item.statistics.percentOfEpisodes === 100 ? "bg-green-500" : "bg-sonarr"
                 )}
                 style={{ width: `${item.statistics.percentOfEpisodes}%` }}
               />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
