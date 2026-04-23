import { useState } from "react";
import { Button } from "../ui/button";
import {
  Play,
  Pause,
  Trash2,
  X,
  ShieldAlert,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Switch } from "../ui/switch";

interface TransferCommandBarProps {
  count: number;
  onClear: () => void;
  onMonitor: (monitored: boolean) => void;
  onDelete: (deleteFiles: boolean) => void;
  onReannounce?: () => void;
  isUpdating?: boolean;
}

export function TransferCommandBar({
  count,
  onClear,
  onMonitor,
  onDelete,
  onReannounce,
  isUpdating,
}: TransferCommandBarProps) {
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
      <div className="bg-card/90 backdrop-blur-2xl border border-foreground/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] px-6 py-4 flex items-center gap-8 min-w-[700px]">
        {/* Count Indicator */}
        <div className="flex flex-col border-r border-foreground/5 pr-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 italic">
            Target Log
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic text-accent tracking-tighter leading-none">
              {count}
            </span>
            <span className="text-[11px] font-bold text-foreground/40 italic uppercase tracking-tighter">
              Hashes
            </span>
          </div>
        </div>

        {/* Swarm Actions */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex bg-foreground/5 p-1 rounded-xl gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMonitor(true)}
              disabled={isUpdating}
              className="h-9 px-4 hover:bg-foreground/5 text-foreground/60 hover:text-foreground font-black italic uppercase tracking-tighter text-[11px] gap-2 transition-all"
            >
              <Play className="h-3 w-3 fill-status-ok text-status-ok" />
              Resume
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMonitor(false)}
              disabled={isUpdating}
              className="h-9 px-4 hover:bg-foreground/5 text-foreground/60 hover:text-foreground font-black italic uppercase tracking-tighter text-[11px] gap-2 transition-all"
            >
              <Pause className="h-3 w-3 fill-status-warn text-status-warn" />
              Pause
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onReannounce}
            disabled={isUpdating}
            className="h-9 border-foreground/5 bg-foreground/5 text-foreground/60 hover:text-foreground font-black italic uppercase tracking-tighter text-[11px] gap-2 px-4 rounded-xl"
          >
            <RefreshCw
              className={cn("h-3 w-3", isUpdating && "animate-spin")}
            />
            Reannounce
          </Button>
        </div>

        {/* Purge Module */}
        <div className="flex items-center gap-6 border-l border-foreground/5 pl-8">
          {/* Disk Purge Toggle */}
          <div className="flex items-center gap-3 bg-foreground/5 p-2 px-3 rounded-xl border border-foreground/5">
            <div
              className={cn(
                "p-1 rounded transition-colors",
                deleteFiles ? "text-status-error" : "text-foreground/20",
              )}
            >
              <HardDrive className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-tighter text-foreground/40 leading-none mb-1">
                Disk Wipe
              </span>
              <Switch
                checked={deleteFiles}
                onCheckedChange={setDeleteFiles}
                disabled={isUpdating}
                className="data-[state=checked]:bg-status-error/50"
              />
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (deleteArmed) {
                onDelete(deleteFiles);
                setDeleteArmed(false);
              } else {
                setDeleteArmed(true);
                setTimeout(() => setDeleteArmed(false), 3000);
              }
            }}
            disabled={isUpdating}
            className={cn(
              "h-11 px-6 font-black italic uppercase tracking-tighter text-[11px] gap-2 transition-all duration-300 rounded-xl",
              deleteArmed
                ? "bg-destructive text-foreground hover:bg-destructive/90 animate-pulse"
                : "bg-foreground/5 text-status-error hover:bg-status-error/10",
            )}
          >
            {deleteArmed ? (
              <>
                <ShieldAlert className="h-3 w-3" />
                Confirm Purge
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3" />
                Purge Swarm
              </>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClear}
            className="h-11 w-11 text-foreground/20 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
