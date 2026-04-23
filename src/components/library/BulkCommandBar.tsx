import { useState } from "react";
import { Button } from "../ui/button";
import { Play, Pause, Trash2, X, ShieldAlert, Layers } from "lucide-react";
import { cn } from "../../lib/utils";

interface BulkCommandBarProps {
  count: number;
  onClear: () => void;
  onMonitor: (monitored: boolean) => void;
  onDelete: () => void;
  onProfileChange?: (profileId: number) => void;
  profiles?: Array<{ id: number; name: string }>;
  isUpdating?: boolean;
}

export function BulkCommandBar({
  count,
  onClear,
  onMonitor,
  onDelete,
  onProfileChange,
  profiles,
  isUpdating,
}: BulkCommandBarProps) {
  const [deleteArmed, setDeleteArmed] = useState(false);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
      <div className="bg-card/90 backdrop-blur-2xl border border-foreground/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] px-6 py-4 flex items-center gap-8 min-w-[600px]">
        {/* Count Indicator */}
        <div className="flex flex-col border-r border-foreground/5 pr-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 italic">
            Fleet Selected
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black italic text-foreground tracking-tighter leading-none">
              {count}
            </span>
            <span className="text-[11px] font-bold text-accent italic uppercase">
              Units
            </span>
          </div>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-4 flex-1">
          {/* Monitor Toggle */}
          <div className="flex bg-foreground/5 p-1 rounded-xl gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMonitor(true)}
              disabled={isUpdating}
              className="h-9 px-4 hover:bg-foreground/5 text-foreground/60 hover:text-foreground font-black italic uppercase tracking-tighter text-[11px] gap-2"
            >
              <Play className="h-3 w-3 fill-current" />
              Monitor
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMonitor(false)}
              disabled={isUpdating}
              className="h-9 px-4 hover:bg-foreground/5 text-foreground/60 hover:text-foreground font-black italic uppercase tracking-tighter text-[11px] gap-2"
            >
              <Pause className="h-3 w-3 fill-current" />
              Unmonitor
            </Button>
          </div>

          {/* Profile Selector (Simplified for now) */}
          {profiles && onProfileChange && (
            <div className="flex-1 max-w-[150px]">
              <Button
                size="sm"
                variant="outline"
                className="w-full border-foreground/5 bg-foreground/5 text-foreground/60 font-black italic uppercase tracking-tighter text-[11px] gap-2 justify-between"
                disabled={isUpdating}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  Profile
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="flex items-center gap-4 border-l border-foreground/5 pl-8">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (deleteArmed) {
                onDelete();
                setDeleteArmed(false);
              } else {
                setDeleteArmed(true);
                setTimeout(() => setDeleteArmed(false), 3000);
              }
            }}
            disabled={isUpdating}
            className={cn(
              "h-10 px-6 font-black italic uppercase tracking-tighter text-[11px] gap-2 transition-all duration-300 rounded-xl",
              deleteArmed
                ? "bg-destructive text-foreground hover:bg-destructive/90 animate-pulse"
                : "bg-foreground/5 text-status-error hover:bg-status-error/10",
            )}
          >
            {deleteArmed ? (
              <>
                <ShieldAlert className="h-3 w-3" />
                Confirm Delete
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3" />
                Delete Fleet
              </>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClear}
            className="h-10 w-10 text-foreground/20 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
